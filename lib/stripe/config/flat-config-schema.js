ptions.underlay;
  var crop = consumeOption(options, "crop");
  var angle = toArray(consumeOption(options, "angle")).join(".");
  var no_html_sizes = has_layer || utils.present(angle) || crop === "fit" || crop === "limit" || responsive_width;
  if (width && (width.toString().indexOf("auto") === 0 || no_html_sizes || parseFloat(width) < 1)) {
    delete options.width;
  }
  if (height && (no_html_sizes || parseFloat(height) < 1)) {
    delete options.height;
  }
  var background = consumeOption(options, "background");
  background = background && background.replace(/^#/, "rgb:");
  var color = consumeOption(options, "color");
  color = color && color.replace(/^#/, "rgb:");
  var base_transformations = toArray(consumeOption(options, "transformation", []));
  var named_transformation = [];
  if (base_transformations.some(isObject)) {
    base_transformations = base_transformations.map(function (tr) {
      return utils.generate_transformation_string(isObject(tr) ? clone(tr) : { transformation: tr });
    });
  } else {
    named_transformation = base_transformations.join(".");
    base_transformations = [];
  }
  var effect = consumeOption(options, "effect");
  if (isArray(effect)) {
    effect = effect.join(":");
  } else if (isObject(effect)) {
    effect = entries(effect).map(function (_ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
          key = _ref9[0],
          value = _ref9[1];

      return `${key}:${value}`;
    });
  }
  var border = consumeOption(options, "border");
  if (isObject(border)) {
    border = `${border.width != null ? border.width : 2}px_solid_${(border.color != null ? border.color : "black").replace(/^#/, 'rgb:')}`;
  } else if (/^\d+$/.exec(border)) {
    // fallback to html border attributes
    options.border = border;
    border = void 0;
  }
  var flags = toArray(consumeOption(options, "flags")).join(".");
  var dpr = consumeOption(options, "dpr", config().dpr);
  if (options.offset != null) {
    var _split_range = split_range(consumeOption(options, "offset"));

    var _split_range2 = _slicedToArray(_split_range, 2);

    options.start_offset = _split_range2[0];
    options.end_offset = _split_range2[1];
  }
  var overlay = process_layer(consumeOption(options, "overlay"));
  var radius = process_radius(consumeOption(options, "radius"));
  var underlay = process_layer(consumeOption(options, "underlay"));
  var ifValue = process_if(consumeOption(options, "if"));
  var custom_function = process_custom_function(consumeOption(options, "custom_function"));
  var custom_pre_function = process_custom_pre_function(consumeOption(options, "custom_pre_function"));
  var fps = consumeOption(options, 'fps');
  if (isArray(fps)) {
    fps = fps.join('-');
  }
  var params = {
    a: normalize_expression(angle),
    ar: normalize_expression(consumeOption(options, "aspect_ratio")),
    b: background,
    bo: border,
    c: crop,
    co: color,
    dpr: normalize_expression(dpr),
    e: normalize_expression(effect),
    fl: flags,
    fn: custom_function || custom_pre_function,
    fps: fps,
    h: normalize_expression(height),
    ki: normalize_expression(consumeOption(options, "keyframe_interval")),
    l: overlay,
    o: normalize_expression(consumeOption(options, "opacity")),
    q: normalize_expression(consumeOption(options, "quality")),
    r: radius,
    t: named_transformation,
    u: underlay,
    w: normalize_expression(width),
    x: normalize_expression(consumeOption(options, "x")),
    y: normalize_expression(consumeOption(options, "y")),
    z: normalize_expression(consumeOption(options, "zoom"))
  };

  SIMPLE_PARAMS.forEach(function (_ref10) {
    var _ref11 = _slicedToArray(_ref10, 2),
        name = _ref11[0],
        short = _ref11[1];

    var value = consumeOption(options, name);
    if (value !== undefined) {
      params[short] = value;
    }
  });
  if (params.vc != null) {
    params.vc = process_video_params(params.vc);
  }
  ["so", "eo", "du"].forEach(function (short) {
    if (params[short] !== undefined) {
      params[short] = norm_range_value(params[short]);
    }
  });

  var variablesParam = consumeOption(options, "variables", []);
  var variables = entries(options).filter(function (_ref12) {
    var _ref13 = _slicedToArray(_ref12, 2),
        key = _ref13[0],
        value = _ref13[1];

    return key.startsWith('$');
  }).map(function (_ref14) {
    var _ref15 = _slicedToArray(_ref14, 2),
        key = _ref15[0],
        value = _ref15[1];

    delete options[key];
    return `${key}_${normalize_expression(value)}`;
  }).sort().concat(variablesParam.map(function (_ref16) {
    var _ref17 = _slicedToArray(_ref16, 2),
        name = _ref17[0],
        value = _ref17[1];

    return `${name}_${normalize_expression(value)}`;
  })).join(',');

  var transformations = entries(params).filter(function (_ref18) {
    var _ref19 = _slicedToArray(_ref18, 2),
        key = _ref19[0],
        value = _ref19[1];

    return utils.present(value);
  }).map(function (_ref20) {
    var _ref21 = _slicedToArray(_ref20, 2),
        key = _ref21[0],
        value = _ref21[1];

    return key + '_' + value;
  }).sort().join(',');

  var raw_transformation = consumeOption(options, 'raw_transformation');
  transformations = compact([ifValue, variables, transformations, raw_transformation]).join(",");
  base_transformations.push(transformations);
  transformations = base_transformations;
  if (responsive_width) {
    var responsive_width_transformation = config().responsive_width_transformation || DEFAULT_RESPONSIVE_WIDTH_TRANSFORMATION;

    transformations.push(utils.generate_transformation_string(clone(responsive_width_transformation)));
  }
  if (String(width).startsWith("auto") || responsive_width) {
    options.responsive = true;
  }
  if (dpr === "auto") {
    options.hidpi = true;
  }
  return filter(transformations, utils.present).join("/");
}

function updateable_resource_params(options) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (options.access_control != null) {
    params.access_control = utils.jsonArrayParam(options.access_control);
  }
  if (options.auto_tagging != null) {
    params.auto_tagging = options.auto_tagging;
  }
  if (options.background_removal != null) {
    params.background_removal = options.background_removal;
  }
  if (options.categorization != null) {
    params.categorization = options.categorization;
  }
  if (options.context != null) {
    params.context = utils.encode_context(options.context);
  }
  if (options.metadata != null) {
    params.metadata = utils.encode_context(options.metadata);
  }
  if (options.custom_coordinates != null) {
    params.custom_coordinates = encodeDoubleArray(options.custom_coordinates);
  }
  if (options.detection != null) {
    params.detection = options.detection;
  }
  if (options.face_coordinates != null) {
    params.face_coordinates = encodeDoubleArray(options.face_coordinates);
  }
  if (options.headers != null) {
    params.headers = utils.build_custom_headers(options.headers);
  }
  if (options.notification_url != null) {
    params.notification_url = options.notification_url;
  }
  if (options.ocr != null) {
    params.ocr = options.ocr;
  }
  if (options.raw_convert != null) {
    params.raw_convert = options.raw_convert;
  }
  if (options.similarity_search != null) {
    params.similarity_search = options.similarity_search;
  }
  if (options.tags != null) {
    params.tags = toArray(options.tags).join(",");
  }
  if (options.quality_override != null) {
    params.quality_override = options.quality_override;
  }
  return params;
}

/**
 * A list of keys used by the url() function.
 * @private
 */
var URL_KEYS = ['api_secret', 'auth_token', 'cdn_subdomain', 'cloud_name', 'cname', 'format', 'long_url_signature', 'private_cdn', 'resource_type', 'secure', 'secure_cdn_subdomain', 'secure_distribution', 'shorten', 'sign_url', 'ssl_detected', 'type', 'url_suffix', 'use_root_path', 'version'];

/**
 * Create a new object with only URL parameters
 * @param {object} options The source object
 * @return {Object} An object containing only URL parameters
 */

function extractUrlParams(options) {
  return pickOnlyExistingValues.apply(undefined, [options].concat(URL_KEYS));
}

/**
 * Create a new object with only transformation parameters
 * @param {object} options The source object
 * @return {Object} An object containing only transformation parameters
 */

function extractTransformationParams(options) {
  return pickOnlyExistingValues.apply(undefined, [options].concat(_toConsumableArray(TRANSFORMATION_PARAMS)));
}

/**
 * Handle the format parameter for fetch urls
 * @private
 * @param options url and transformation options. This argument may be changed by the function!
 */

function patchFetchFormat() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (options.type === "fetch") {
    if (options.fetch_format == null) {
      options.fetch_format = consumeOption(options, "format");
    }
  }
}

function url(public_id) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var signature = void 0,
      source_to_sign = void 0;
  utils.patchFetchFormat(options);
  var type = consumeOption(options, "type", null);
  var transformation = utils.generate_transformation_string(options);

  var resource_type = consumeOption(options, "resource_type", "image");
  var version = consumeOption(options, "version");
  var force_version = consumeOption(options, "force_version", config().force_version);
  if (force_version == null) {
    force_version = true;
  }
  var long_url_signature = !!consumeOption(options, "long_url_signature", config().long_url_signature);
  var format = consumeOption(options, "format");
  var cloud_name = consumeOption(options, "cloud_name", config().cloud_name);
  if (!cloud_name) {
    throw "Unknown cloud_name";
  }
  var private_cdn = consumeOption(options, "private_cdn", config().private_cdn);
  var secure_distribution = consumeOption(options, "secure_distribution", config().secure_distribution);
  var secure = consumeOption(options, "secure", null);
  var ssl_detected = consumeOption(options, "ssl_detected", config().ssl_detected);
  if (secure === null) {
    secure = ssl_detected || config().secure;
  }
  var cdn_subdomain = consumeOption(options, "cdn_subdomain", config().cdn_subdomain);
  var secure_cdn_subdomain = consumeOption(options, "secure_cdn_subdomain", config().secure_cdn_subdomain);
  var cname = consumeOption(options, "cname", config().cname);
  var shorten = consumeOption(options, "shorten", config().shorten);
  var sign_url = consumeOption(options, "sign_url", config().sign_url);
  var api_secret = consumeOption(options, "api_secret", config().api_secret);
  var url_suffix = consumeOption(options, "url_suffix");
  var use_root_path = consumeOption(options, "use_root_path", config().use_root_path);
  var signature_algorithm = consumeOption(options, "signature_algorithm", config().signature_algorithm || DEFAULT_SIGNATURE_ALGORITHM);
  if (long_url_signature) {
    signature_algorithm = 'sha256';
  }
  var auth_token = consumeOption(options, "auth_token");
  if (auth_token !== false) {
    auth_token = exports.merge(config().auth_token, auth_token);
  }
  var preloaded = /^(image|raw)\/([a-z0-9_]+)\/v(\d+)\/([^#]+)$/.exec(public_id);
  if (preloaded) {
    resource_type = preloaded[1];
    type = preloaded[2];
    version = preloaded[3];
    public_id = preloaded[4];
  }
  var original_source = public_id;
  if (public_id == null) {
    return original_source;
  }
  public_id = public_id.toString();
  if (type === null && public_id.match(/^https?:\//i)) {
    return original_source;
  }

  var _finalize_resource_ty = finalize_resource_type(resource_type, type, url_suffix, use_root_path, shorten);

  var _finalize_resource_ty2 = _slicedToArray(_finalize_resource_ty, 2);

  resource_type = _finalize_resource_ty2[0];
  type = _finalize_resource_ty2[1];

  var _finalize_source = finalize_source(public_id, format, url_suffix);

  var _finalize_source2 = _slicedToArray(_finalize_source, 2);

  public_id = _finalize_source2[0];
  source_to_sign = _finalize_source2[1];


  if (version == null && force_version && source_to_sign.indexOf("/") >= 0 && !source_to_sign.match(/^v[0-9]+/) && !source_to_sign.match(/^https?:\//)) {
    version = 1;
  }
  if (version != null) {
    version = `v${version}`;
  } else {
    version = null;
  }

  transformation = transformation.replace(/([^:])\/\//g, '$1/');
  if (sign_url && isEmpty(auth_token)) {
    var to_sign = [transformation, source_to_sign].filter(function (part) {
      return part != null && part !== '';
    }).join('/');
    try {
      for (var i = 0; to_sign !== decodeURIComponent(to_sign) && i < 10; i++) {
        to_sign = decodeURIComponent(to_sign);
      }
      // eslint-disable-next-line no-empty
    } catch (error) {}
    var hash = computeHash(to_sign + api_secret, signature_algorithm, 'base64');
    signature = hash.replace(/\//g, '_').replace(/\+/g, '-').substring(0, long_url_signature ? 32 : 8);
    signature = `s--${signature}--`;
  }
  var prefix = unsigned_url_prefix(public_id, cloud_name, private_cdn, cdn_subdomain, secure_cdn_subdomain, cname, secure, secure_distribution);
  var resultUrl = [prefix, resource_type, type, signature, transformation, version, public_id].filter(function (part) {
    return part != null && part !== '';
  }