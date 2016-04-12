
'use strict';
var assert = require('assert');
var utils = require('./utils');

function parseSuspendedPaymentCancellation(tx) {
  assert(tx.TransactionType === 'SuspendedPaymentCancel');

  return utils.removeUndefined({
    memos: utils.parseMemos(tx),
    owner: tx.Owner,
    suspensionSequence: tx.OfferSequence
  });
}

module.exports = parseSuspendedPaymentCancellation;