'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');


function parseAssetInfo(trustline) {
console.log(trustline);
  return trustline;
}

function currencyFilter(currency, trustline) {
  return trustline;
}

function formatResponse(options, data) {
  return {
    marker: data.marker,
    results: data.lines.map(parseAssetInfo).filter(_.partial(currencyFilter, options.currency || null))
  };
}

function getAssetaccountInfo(connection, code, issueraddress,ledgerVersion, options, marker, limit) {
  var request = {
    command: 'asset_info',
    code: code,
    issueraddress:issueraddress,
    ledger_index: ledgerVersion,
    marker: marker,
    limit: utils.clamp(limit, 10, 400),
    peer: options.counterparty
  };
  return connection.request(request).then(_.partial(formatResponse, options));
}


function getSharedetails(code,issueraddress) {
  var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return this.getLedgerVersion().then(function (ledgerVersion) {
    var getter = _.partial(getAssetaccountInfo, _this.connection, code,issueraddress, options.ledgerVersion || ledgerVersion, options);
	return utils.getRecursive(getter, options.limit);
  });
}

module.exports = getSharedetails;

