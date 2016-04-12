
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var _utils$common = utils.common;
var validate = _utils$common.validate;
var iso8601ToRippleTime = _utils$common.iso8601ToRippleTime;
var toRippledAmount = _utils$common.toRippledAmount;

function createSuspendedPaymentCreationTransaction(account, payment) {
  var txJSON = {
    TransactionType: 'SuspendedPaymentCreate',
    Account: account,
    Destination: payment.destination.address,
    Amount: toRippledAmount(payment.destination.amount)
  };

  if (payment.digest !== undefined) {
    txJSON.Digest = payment.digest;
  }
  if (payment.allowCancelAfter !== undefined) {
    txJSON.CancelAfter = iso8601ToRippleTime(payment.allowCancelAfter);
  }
  if (payment.allowExecuteAfter !== undefined) {
    txJSON.FinishAfter = iso8601ToRippleTime(payment.allowExecuteAfter);
  }
  if (payment.source.tag !== undefined) {
    txJSON.SourceTag = payment.source.tag;
  }
  if (payment.destination.tag !== undefined) {
    txJSON.DestinationTag = payment.destination.tag;
  }
  if (payment.memos !== undefined) {
    txJSON.Memos = _.map(payment.memos, utils.convertMemo);
  }
  return txJSON;
}

function prepareSuspendedPaymentCreation(address, suspendedPaymentCreation) {
  var instructions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  validate.prepareSuspendedPaymentCreation({ address: address, suspendedPaymentCreation: suspendedPaymentCreation, instructions: instructions });
  var txJSON = createSuspendedPaymentCreationTransaction(address, suspendedPaymentCreation);
  return utils.prepareTransaction(txJSON, this, instructions);
}

module.exports = prepareSuspendedPaymentCreation;