
'use strict';
var assert = require('assert');
var utils = require('./utils');

function parseSuspendedPaymentExecution(tx) {
  assert(tx.TransactionType === 'SuspendedPaymentFinish');

  return utils.removeUndefined({
    memos: utils.parseMemos(tx),
    owner: tx.Owner,
    suspensionSequence: tx.OfferSequence,
    method: tx.Method,
    digest: tx.Digest,
    proof: tx.Proof ? utils.hexToString(tx.Proof) : undefined
  });
}

module.exports = parseSuspendedPaymentExecution;