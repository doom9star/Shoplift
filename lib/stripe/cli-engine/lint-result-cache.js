nce of all accounts
 *     const res = await Users.aggregate([
 *       { $group: { _id: null, maxBalance: { $max: '$balance' }}},
 *       { $project: { _id: 0, maxBalance: 1 }}
 *     ]);
 *
 *     console.log(res); // [ { maxBalance: 98000 } ]
 *
 *     // Or use the aggregation pipeline builder.
 *     const res = await Users.aggregate().
 *       group({ _id: null, maxBalance: { $max: '$balance' } }).
 *       project('-id maxBalance').
 *       exec();
 *     console.log(res); // [ { maxBalance: 98 } ]
 *
 * ####NOTE:
 *
 * - Mongoose does **not** cast aggregation pipelines to the model's schema because `$project` and `$group` operators allow redefining the "shape" of the documents at any stage of the pipeline, which may leave documents in an incompatible format. You can use the [mongoose-cast-aggregation plugin](https://github.com/AbdelrahmanHafez/mongoose-cast-aggregation) to enable minimal casting for aggregation pipelines.
 * - The documents returned are plain javascript objects, not mongoose documents (since any shape of document can be returned).
 *
 * #### More About Aggregations:
 *
 * - [Mongoose `Aggregate`](/docs/api/aggregate.html)
 * - [An Introduction to Mongoose Aggregate](https://masteringjs.io/tutorials/mongoose/aggregate)
 * - [MongoDB Aggregation docs](http://docs.mongodb.org/manual/applications/aggregation/)
 *
 * @see Aggregate #aggregate_Aggregate
 * @see MongoDB http://docs.mongodb.org/manual/applications/aggregation/
 * @param {Array} [pipeline] aggregation pipeline as an array of objects
 * @param {Object} [options] aggregation options
 * @param {Function} [callback]
 * @return {Aggregate}
 * @api public
 */

Model.aggregate = function aggregate(pipeline, options, callback) {
  _checkContext(this, 'aggregate');

  if (arguments.length > 3 || get(pipeline, 'constructor.name') === 'Object') {
    throw new MongooseError('Mongoose 5.x disallows passing a spread of operators ' +
      'to `Model.aggregate()`. Instead of ' +
      '`Model.aggregate({ $match }, { $skip })`, do ' +
      '`Model.aggregate([{ $match }, { $skip }])`');
  }

  if (typeof pipeline === 'function') {
    callback = pipeline;
    pipeline = [];
  }

  if (typeof options === 'function') {
    callback = options;
    options = null;
  }

  const aggregate = new Aggregate(pipeline || []);
  aggregate.model(this);

  if (options != null) {
    aggregate.option(options);
  }

  if (typeof callback === 'undefined') {
    return aggregate;
  }

  callback = this.$handleCallbackError(callback);
  callback = this.$wrapCallback(callback);

  aggregate.exec(callback);
  return aggregate;
};

/**
 * Casts and validates the given object against this model's schema, passing the
 * given `context` to custom validators.
 *
 * ####Example:
 *
 *     const Model = mongoose.model('Test', Schema({
 *       name: { type: String, required: true },
 *       age: { type: Number, required: true }
 *     });
 *
 *     try {
 *       await Model.validate({ name: null }, ['name'])
 *     } catch (err) {
 *       err instanceof mongoose.Error.ValidationError; // true
 *       Object.keys(err.errors); // ['name']
 *     }
 *
 * @param {Object} obj
 * @param {Array} pathsToValidate
 * @param {Object} [context]
 * @param {Function} [callback]
 * @return {Promise|undefined}
 * @api public
 */

Model.validate = function validate(obj, pathsToValidate, context, callback) {
  if ((arguments.length < 3) || (arguments.length === 3 && typeof arguments[2] === 'function')) {
    // For convenience, if we're validating a document or an object, make `context` default to
    // the model so users don't have to always pass `context`, re: gh-10132, gh-10346
    context = obj;
  }

  return this.db.base._promiseOrCallback(callback, cb => {
    const schema = this.schema;
    let paths = Object.keys(schema.paths);

    if (pathsToValidate != null) {
      const _pathsToValidate = new Set(pathsToValidate);
      paths = paths.filter(p => {
        const pieces = p.split('.');
        let cur = pieces[0];

        for (const piece of pieces) {
          if (_pathsToValidate.has(cur)) {
            return true;
          }
          cur += '.' + piece;
        }

        return _pathsToValidate.has(p);
      });
    }

    for (const path of paths) {
      const schemaType = schema.path(path);
      if (!schemaType || !schemaType.$isMongooseArray) {
        continue;
      }

      const val = get(obj, path);
      pushNestedArrayPaths(val, path);
    }

    let remaining = paths.length;
    let error = null;

    for (const path of paths) {
      const schemaType = schema.path(path);
      if (schemaType == null) {
        _checkDone();
        continue;
      }

      const pieces = path.split('.');
      let cur = obj;
      for (let i = 0; i < pieces.length - 1; ++i) {
        cur = cur[pieces[i]];
      }

      let val = get(obj, path, void 0);

      if (val != null) {
        try {
          val = schemaType.cast(val);
          cur[pieces[pieces.length - 1]] = val;
        } catch (err) {
          error = error || new ValidationError();
          error.addError(path, err);

          _checkDone();
          continue;
        }
      }

      schemaType.doValidate(val, err => {
        if (err) {
          error = error || new ValidationError();
          if (err instanceof ValidationError) {
            for (const _err of Object.keys(err.errors)) {
              error.addError(`${path}.${err.errors[_err].path}`, _err);
            }
          } else {
            error.addError(err.path, err);
          }
        }
        _checkDone();
      }, context, { path: path });
    }

    function pushNestedArrayPaths(nestedArray, path) {
      if (nestedArray == null) {
        return;
      }

      for (let i = 0; i < nestedArray.length; ++i) {
        if (Array.isArray(nestedArray[i])) {
          pushNestedArrayPaths(nestedArray[i], path + '.' + i);
        } else {
          paths.push(path + '.' + i);
        }
      }
    }

    function _checkDone() {
      if (--remaining <= 0) {
        return cb(error);
      }
    }
  });
};

/**
 * Populates document references.
 *
 * Changed in Mongoose 6: the model you call `populate()` on should be the
 * "local field" model, **not** the "foreign field" model.
 *
 * ####Available top-level options:
 *
 * - path: space delimited path(s) to populate
 * - select: optional fields to select
 * - match: optional query conditions to match
 * - model: optional name of the model to use for population
 * - options: optional query options like sort, limit, etc
 * - justOne: optional boolean, if true Mongoose will always set `path` to an array. Inferred from schema by default.
 * - strictPopulate: optional boolean, set to `false` to allow populating paths that aren't in the schema.
 *
 * ####Examples:
 *
 *     const Dog = mongoose.