'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');


function parseAssetInfo(trustline) {
  return trustline;
}

function currencyFilter(currency, trustline) {
  return trustline;
}

function formatResponse(options, data) {
 var arr = data.lines[0].map(parseAssetInfo).filter(_.partial(currencyFilter, options.currency || null));

  var arrdata = {};

  arr.forEach(function(item) {
   if (parseInt(item.balance) < 0) { 
     if (!arrdata[item.account]) {
       arrdata[item.account] = [];
       arrdata[item.account].push(item);
     } else {
       arrdata[item.account].push(item);
     }
   }
  });
   
  return {
    marker: data.marker,
    results: arrdata
  };
}

function getAssetaccountInfo(connection, code,ledgerVersion, options, marker, limit) {
  var request = {
    command: 'asset_info',
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
	return getAssetaccountInfo(_this.connection, code, options.ledgerVersion || ledgerVersion, options).then(function(data){
      return data.results;
	});
  });
}


module.exports = getSharedetails;

