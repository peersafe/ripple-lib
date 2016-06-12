
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var validate = utils.common.validate;

function isImmediateRejection(engineResult) {
  // note: "tel" errors mean the local server refused to process the
  // transaction *at that time*, but it could potentially buffer the
  // transaction and then process it at a later time, for example
  // if the required fee changes (this does not occur at the time of
  // this writing, but it could change in the future)
  // all other error classes can potentially result in transcation validation
  return _.startsWith(engineResult, 'tem') || _.startsWith(engineResult, 'tej');
}

function formatStoreResponse(response) {
  var data = {
    resultCode: response.engine_result,
    resultMessage: response.engine_result_message
  };
  if (isImmediateRejection(response.engine_result)) {
    throw new utils.common.errors.RippledError('getStore failed', data);
  }
  return data;
}

function storeaccountinfo(address ,secret ,info) {
  var request = {
    command: 'store_accountinfo',
	account:address,
	secret:secret,
    info:info
  };
  return this.connection.request(request).then(formatStoreResponse);
}

module.exports = storeaccountinfo;