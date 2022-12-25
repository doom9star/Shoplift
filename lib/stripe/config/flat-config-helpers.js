cret',
  'auth_token',
  'cdn_subdomain',
  'cloud_name',
  'cname',
  'format',
  'long_url_signature',
  'private_cdn',
  'resource_type',
  'secure',
  'secure_cdn_subdomain',
  'secure_distribution',
  'shorten',
  'sign_url',
  'ssl_detected',
  'type',
  'url_suffix',
  'use_root_path',
  'version'
];

/**
 * Create a new object with only URL parameters
 * @param {object} options The source object
 * @return {Object} An object containing only URL parameters
 */

function extractUrlParams(options) {
  return pickOnlyExistingValues(options, ...URL_KEYS);
}

/**
 * Create a new object with only transformation parameters
 * @param {object} options The source object
 * @return {Object} An object containing only transformation parameters
 */

function extractTransformationParams(options) {
  return pickOnlyExistingValues(options, ...TRANSFORMATION_PARAMS);
}

/**
 * Handle the format parameter for fetch urls
 * @private
 * @param options url and transformation options. This argument may be changed by the function!
 */

function patchFetchFormat(options = {}) {
  if (options.type === "fetch") {
    if (options.fetch_format == null) {
      options.fetch_format = consumeOption(options, "format");
    }
  }
}

function url(public_id, options = {}) {
  let signature, source_to_sign;
  utils.patchFetchFormat(options);
  let type = consumeOption(options, "type", null);
  let transformation = utils.generate_transformation_string(options);

  let resource_type = consumeOption(options, "resource_type", "image");
  let version = consumeOption(options, "version");
  let force_version = consumeOption(options, "force_version", config().force_version);
  if (force_version == null) {
    force_version = true;
  }
  let long_url_signature = !!consumeOption(options, "long_url_signature", config().lo