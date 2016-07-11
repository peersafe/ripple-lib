
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
    ckjg:trustline.specification.ckjg,
    cslc:trustline.specification.cslc,
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
      name : balances.name,
  	  id : balances.id,
  	  sex : balances.sex,
      entity : balances.entity,
      workplace : balances.workplace,
      contactphone : balances.contactphone,
      contactaddress : balances.contactaddress,
      trustlineaddress : balances.trustlineaddress,
      trustlineamount :  balances.trustlineamount,
      trustlinecurrencyname : balances.trustlinecurrencyname,
      trustlinecurrencyckjg : balances.trustlinecurrencyckjg,
	  xrpamount : balances.xrpamount,	
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

  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  var realname;
  var addressbook;

  var name;
  var id;
  var sex;
  var entity;
  var workplace;
  var contactphone;
  var contactaddress;
  var trustlineaddress;
  var trustlineamount;
  var trustlinecurrencyname;
  var trustlinecurrencyckjg;
  var xrpamount;
  
  var keypair = keypairs.deriveKeypair(secret);
  var secrekey = keypair.privateKey;
  
  validate.getTrustlines({ address: address, options: options });

  return _Promise.all([getLedgerVersionHelper(this.connection, options.ledgerVersion).then(function (ledgerVersion) {
    return utils.getXRPModifyBalance(_this.connection, address, ledgerVersion)
		.then(function(data){
		name = data.name;
  		id = data.id;
  		sex = data.sex;
        entity = data.entity;
        workplace = data.workplace;
        contactphone = data.contactphone;
        contactaddress = data.contactaddress;
        trustlineaddress = data.TrustlineAddress;
		trustlineamount =  data.TrustlineAmount;
		trustlinecurrencyname = data.TrustlineCurrencyName;
		trustlinecurrencyckjg = data.TrustlineCurrencyCkjg;
		xrpamount = data.XrpAmount;	
		
		//realname = data.account_data.RealName;
		//addressbook = data.account_data.AddressBook;
	    return commonutils.dropsToXrp(data.account_data.Balance);
	})}), this.getTrustlines(address, secrekey,options)]).then(function (results) {
    return formatBalances(options, { xrp: results[0], trustlines: results[1] ,clientname:realname,address:addressbook,name:name,id:id,sex:sex,entity:entity,workplace:workplace,contactphone:contactphone,contactaddress:contactaddress,trustlineaddress:trustlineaddress,trustlineamount:trustlineamount,trustlinecurrencyname:trustlinecurrencyname,trustlinecurrencyckjg:trustlinecurrencyckjg,xrpamount:xrpamount});
  });
}

module.exports = getBalances;
