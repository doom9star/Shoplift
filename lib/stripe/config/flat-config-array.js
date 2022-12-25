length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  return exports.upload(null, callback, extend({
    stream: true
  }, options));
};

exports.unsigned_upload = function unsigned_upload(file, upload_preset, callback) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  return exports.upload(file, callback, merge(options, {
    unsigned: true,
    upload_preset: upload_preset
  }));
};

exports.upload = function upload(file, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return call_api("upload", callback, options, function () {
    var params = build_upload_params(options);
    return isRemoteUrl(file) ? [params, { file: file }] : [params, {}, file];
  });
};

exports.upload_large = function upload_large(path, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (path != null && isRemoteUrl(path)) {
    // upload a remote file
    return exports.upload(path, callback, options);
  }
  if (path != null && !options.filename) {
    options.filename = path.split(/(\\|\/)/g).pop().replace(/\.[^/.]+$/, "");
  }
  return exports.upload_chunked(path, callback, extend({
    resource_type: 'raw'
  }, options));
};

exports.upload_chunked = function upload_chunked(path, callback, options) {
  var file_reader = fs.createReadStream(path);
  var out_stream = exports.upload_chunked_stream(callback, options);
  return file_reader.pipe(out_stream);
};

var Chunkable = function (_Writable) {
  _inherits(Chunkable, _Writable);

  function Chunkable(options) {
    _classCallCheck(this, Chunkable);

    var _this = _possibleConstructorReturn(this, (Chunkable.__proto__ || Object.getPrototypeOf(Chunkable)).call(this, options));

    _this.chunk_size = options.chunk_size != null ? options.chunk_size : 20000000;
    _this.buffer = Buffer.alloc(0);
    _this.active = true;
    _this.on('finish', function () {
      if (_this.active) {
        _this.emit('ready', _this.buffer, true, function () {});
      }
    });
    return _this;
  }

  _createClass(Chunkable, [{
    key: '_write',
    value: function _write(data, encoding, done) {
      var _this2 = this;

      if (!this.active) {
        done();
      }
      if (this.buffer.length + data.length <= this.chunk_size) {
        this.buffer = Buffer.concat([this.buffer, data], this.buffer.length + data.length);
        done();
      } else {
        var grab = this.chunk_size - this.buffer.length;
        this.buffer = Buffer.concat([this.buffer, data.slice(0, grab)], this.buffer.length + grab);
        this.emit('ready', this.buffer, false, function (active) {
          _this2.active = active;
          if (_this2.active) {
            _this2.buffer = data.slice(grab);
            done();
          }
        });
      }
    }
  }]);

  return Chunkable;
}(Writable);

exports.upload_large_stream = function upload_large_stream(_unused_, callback) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  return exports.upload_chunked_stream(callback, extend({
    resource_type: 'raw'
  }, options));
};

exports.upload_chunked_stream = function upload_chunked_stream(callback) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  options = extend({}, options, {
    stream: true
  });
  options.x_unique_upload_id = utils.random_public_id();
  var params = build_upload_params(options);
  var chunk_size = options.chunk_size != null ? options.chunk_size : options.part_size;
  var chunker = new Chunkable({
    chunk_size: chunk_size
  });
  var sent = 0;
  chunker.on('ready', function (buffer, is_last, done) {
    var chunk_start = sent;
    sent += buffer.length;
    options.content_range = `bytes ${chunk_start}-${sent - 1}/${is_last ? sent : -1}`;
    params.timestamp = utils.timestamp();
    var finished_part = function finished_part(result) {
      var errorOrLast = result.error != null || is_last;
      if (errorOrLast && typeof callback === "function") {
        callback(result);
      }
      return done(!errorOrLast);
    };
    var stream = call_api("upload", finished_part, options, function () {
      return [params, {}, buffer];
    });
    return stream.write(buffer, 'buffer', function () {
      return stream.end();
    });
  });