
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var utils = require('./utils');
var commonutils = require('../common/utils.js');
var validate = utils.common.validate;
var keypairs = require('ripple-keypairs');

function getTrustlineBalanceAmount(trustline) {
  return {
    currency: trustline.specification.currency,
    counterparty: trustline.specification.counterparty,
    value: trustline.state.balance,
    issuersecret:trustline.specification.issuersecret,
    zcze:trustline.specification.zcze,
    currencyname:trustline.specification.currencyname,
    currencysymbol:trustline.specification.currencysymbol,
  };
}

function formatBalances(options, balances) {
  var result = balances.trustlines.map(getTrustlineBalanceAmount); 
  if (!(options.counterparty || options.currency && options.currency !== 'XRP')) {
    var xrpBalance = {
      currency: 'XRP',
      value: balances.xrp,
      realneme:balances.clientname,
      addressbook:balances.address,
    };
    result.unshift(xrpBalance);
  }
  if (options.limit && result.length > options.limit) {
    var toRemove = result.length - options.limit;
    result.splice(-toRemove, toRemove);
  }

  return result;
}

function getLedgerVersionHelper(connection, optionValue) {
  if (optionValue !== undefined && optionValue !== null) {
    return _Promise.resolve(optionValue);
  }
  return connection.getLedgerVersion();
}




function getBalances(address,secret) {
  var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var realname;
  var addressbook;

  var keypair = keypairs.deriveKeypair(secret);
  var secrekey = keypair.privateKey;
  
  validate.getTrustlines({ address: address, options: options });

  return _Promise.all([getLedgerVersionHelper(this.connection, options.ledgerVersion).then(function (ledgerVersion) {
    return utils.getXRPModifyBalance(_this.connection, address, ledgerVersion)
		.then(function(data){
		realname = data.account_data.RealName;
		addressbook = data.account_data.AddressBook;
	    return commonutils.dropsToXrp(data.account_data.Balance);
	})}), this.getTrustlines(address, secrekey,options)]).then(function (results) {
    return formatBalances(options, { xrp: results[0], trustlines: results[1] ,clientname:realname,address:addressbook});
  });
}

module.exports = getBalances;
