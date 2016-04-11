/* @flow */
'use strict';
const utils = require('./utils');
var commonutils = require('../common/utils.js');
const {validate} = utils.common;
import type {Connection} from '../common/connection.js';
import type {TrustlinesOptions, Trustline} from './trustlines-types.js';


type Balance = {
  value: string,
  currency: string,
  counterparty?: string
}

type GetBalances = Array<Balance>

function getTrustlineBalanceAmount(trustline: Trustline) {
  return {
    currency: trustline.specification.currency,
    counterparty: trustline.specification.counterparty,
    value: trustline.state.balance,
    currencyname:trustline.specification.currency_name,
	currencysymbol:trustline.specification.currency_symbol
  };
}

function formatBalances(options, balances) {
  const result = balances.trustlines.map(getTrustlineBalanceAmount);
  if (!(options.counterparty ||
       (options.currency && options.currency !== 'XRP')
  )) {
    const xrpBalance = {
      currency: 'XRP',
      value: balances.xrp,
      realneme:balances.clientname,
      addressbook:balances.address
    };
    result.unshift(xrpBalance);
  }
  if (options.limit && result.length > options.limit) {
    const toRemove = result.length - options.limit;
    result.splice(-toRemove, toRemove);
  }
  return result;
}

function getLedgerVersionHelper(connection: Connection, optionValue?: number
): Promise<number> {
  if (optionValue !== undefined && optionValue !== null) {
    return Promise.resolve(optionValue);
  }
  return connection.getLedgerVersion();
}

function getBalances(address: string, options: TrustlinesOptions = {}
): Promise<GetBalances> {
 var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
  var realname;
  var addressbook;
	
  validate.getTrustlines({ address: address, options: options });

  return _Promise.all([getLedgerVersionHelper(this.connection, options.ledgerVersion).then(function (ledgerVersion) {
    return utils.getXRPModifyBalance(_this.connection, address, ledgerVersion)
		.then(function(data){
		realname = data.account_data.RealName;
		addressbook = data.account_data.AddressBook;
	    return commonutils.dropsToXrp(data.account_data.Balance);
	})}), this.getTrustlines(address, options)]).then(function (results) {
    return formatBalances(options, { xrp: results[0], trustlines: results[1] ,clientname:realname,address:addressbook});
  });
}

module.exports = getBalances;
