
'use strict';
var assert = require('assert');
var utils = require('./utils');
var parsePayment = require('./payment');
var parseExpansion = require('./expansion');
var parseTransfer = require('./transfer');
var parseRegister = require('./register');
var parseTrustline = require('./trustline');
var parseOrder = require('./order');
var parseOrderCancellation = require('./cancellation');
var parseSettings = require('./settings');
var parseSuspendedPaymentCreation = require('./suspended-payment-creation');
var parseSuspendedPaymentExecution = require('./suspended-payment-execution');
var parseSuspendedPaymentCancellation = require('./suspended-payment-cancellation');

function parseTransactionType(type) {
  var mapping = {
    Payment: 'payment',
	Expansion:'expansion',
	Transfer:'transfer',
	Register:'register',
    TrustSet: 'trustline',
    OfferCreate: 'order',
    OfferCancel: 'orderCancellation',
    AccountSet: 'settings',
    SetRegularKey: 'settings',
    SuspendedPaymentCreate: 'suspendedPaymentCreation',
    SuspendedPaymentFinish: 'suspendedPaymentExecution',
    SuspendedPaymentCancel: 'suspendedPaymentCancellation',
    SignerListSet: 'settings'
  };
  return mapping[type] || null;
}

function parseTransaction(tx) {
  var type = parseTransactionType(tx.TransactionType);
  var mapping = {
    'payment': parsePayment,
	'expansion':parseExpansion,
	'transfer': parseTransfer,
	'register': parseRegister,
    'trustline': parseTrustline,
    'order': parseOrder,
    'orderCancellation': parseOrderCancellation,
    'settings': parseSettings,
    'suspendedPaymentCreation': parseSuspendedPaymentCreation,
    'suspendedPaymentExecution': parseSuspendedPaymentExecution,
    'suspendedPaymentCancellation': parseSuspendedPaymentCancellation
  };
  var parser = mapping[type];
  assert(parser !== undefined, 'Unrecognized transaction type');
  var specification = parser(tx);
  var outcome = utils.parseOutcome(tx);
  return utils.removeUndefined({
    type: type,
    address: tx.Account,
    sequence: tx.Sequence,
    id: tx.hash,
    krfe:tx.krfe,
    krhjg:tx.krhjg,
    krlc:tx.krlc,
    rzjr:tx.rzje,
    specification: utils.removeUndefined(specification),
    outcome: outcome ? utils.removeUndefined(outcome) : undefined
  });
}

module.exports = parseTransaction;