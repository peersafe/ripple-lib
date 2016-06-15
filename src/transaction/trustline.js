
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var validate = utils.common.validate;
var trustlineFlags = utils.common.txFlags.TrustSet;
var BigNumber = require('bignumber.js');

function convertQuality(quality) {
  return new BigNumber(quality).shift(9).truncated().toNumber();
}

function createTrustlineTransaction(account, trustline) {
  var limit = {
    currency: trustline.currency,
    issuer: trustline.counterparty,
    value: trustline.limit
  };
  var str = "hello";
  var txJSON = {
    TransactionType: 'TrustSet',
    Account: account,
    LimitAmount: limit,
    Flags: 0,
  }; 
 
  if (trustline.qualityIn !== undefined) {
    txJSON.QualityIn = convertQuality(trustline.qualityIn);
  }
  if (trustline.qualityOut !== undefined) {
    txJSON.QualityOut = convertQuality(trustline.qualityOut);
  }
  if (trustline.authorized === true) {
    txJSON.Flags |= trustlineFlags.SetAuth;
  }
  if (trustline.ripplingDisabled !== undefined) {
    txJSON.Flags |= trustline.ripplingDisabled ? trustlineFlags.NoRipple : trustlineFlags.ClearNoRipple;
  }
  if (trustline.frozen !== undefined) {
    txJSON.Flags |= trustline.frozen ? trustlineFlags.SetFreeze : trustlineFlags.ClearFreeze;
  }
  debugger;
  if (trustline.memos !== undefined) {
    txJSON.Memos = _.map(trustline.memos, utils.convertMemo);
  }
  debugger;
  //txJSON.TestOuts = _.map(str,utils.convertTestOut);

  //console.log('------------txJSON.TestOuts-----------------');
  //console.log(txJSON.TestOuts);
  return txJSON;
}

function prepareTrustline(address, trustline) {
  var instructions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
  validate.prepareTrustline({ address: address, trustline: trustline, instructions: instructions });
  var txJSON = createTrustlineTransaction(address, trustline);
  return utils.prepareTransaction(txJSON, this, instructions);
}

module.exports = prepareTrustline;