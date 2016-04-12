
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var validate = utils.common.validate;

function createSuspendedPaymentExecutionTransaction(account, payment) {
  var txJSON = {
    TransactionType: 'SuspendedPaymentFinish',
    Account: account,
    Owner: payment.owner,
    OfferSequence: payment.suspensionSequence
  };

  if (payment.method !== undefined) {
    txJSON.Method = payment.method;
  }
  if (payment.digest !== undefined) {
    txJSON.Digest = payment.digest;
  }
  if (payment.proof !== undefined) {
    txJSON.Proof = utils.convertStringToHex(payment.proof);
  }
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareSuspendedPaymentExecution(address, suspendedPaymentExecution) {
  var instructions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  validate.prepareSuspendedPaymentExecution({ address: address, suspendedPaymentExecution: suspendedPaymentExecution, instructions: instructions });
  var txJSON = createSuspendedPaymentExecutionTransaction(address, suspendedPaymentExecution);
  return utils.prepareTransaction(txJSON, this, instructions);
}

module.exports = prepareSuspendedPaymentExecution;