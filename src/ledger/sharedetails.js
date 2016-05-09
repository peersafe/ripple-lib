'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');


function getAssetaccountInfo(connection, code, ledgerVersion, options, marker, limit) {
  var request = {
    command: 'asset_accountinfo',
    code: code,
    ledger_index: ledgerVersion,
    marker: marker,
    limit: utils.clamp(limit, 10, 400),
    peer: options.counterparty
  };
  return connection.request(request).then(_.partial(formatResponse, options));
}


function getSharedetails(code) {
  var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return this.getLedgerVersion().then(function (ledgerVersion) {
    var getter = _.partial(getAccountLines, _this.connection, code, options.ledgerVersion || ledgerVersion, options);
    return utils.getRecursive(getter, options.limit);
  });
}

module.exports = getSharedetails;
