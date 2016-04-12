
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var validate = utils.common.validate;

function createSuspendedPaymentCancellationTransaction(account, payment) {
  var txJSON = {
    TransactionType: 'SuspendedPaymentCancel',
    Account: account,
    Owner: payment.owner,
    OfferSequence: payment.suspensionSequence
  };
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareSuspendedPaymentCancellation(address, suspendedPaymentCancellation) {
  var instructions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  validate.prepareSuspendedPaymentCancellation({ address: address, suspendedPaymentCancellation: suspendedPaymentCancellation, instructions: instructions });
  var txJSON = createSuspendedPaymentCancellationTransaction(address, suspendedPaymentCancellation);
  return utils.prepareTransaction(txJSON, this, instructions);
}

module.exports = prepareSuspendedPaymentCancellation;