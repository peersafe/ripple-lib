
'use strict';
var _ = require('lodash');
var transactionParser = require('ripple-lib-transactionparser');
var utils = require('../utils');
var BigNumber = require('bignumber.js');

function adjustQualityForXRP(quality, takerGetsCurrency, takerPaysCurrency) {
  // quality = takerPays.value/takerGets.value
  // using drops (1e-6 XRP) for XRP values
  var numeratorShift = takerPaysCurrency === 'XRP' ? -6 : 0;
  var denominatorShift = takerGetsCurrency === 'XRP' ? -6 : 0;
  var shift = numeratorShift - denominatorShift;
  return shift === 0 ? quality : new BigNumber(quality).shift(shift).toString();
}

function parseQuality(quality) {
  if (typeof quality === 'number') {
    return new BigNumber(quality).shift(-9).toNumber();
  }
  return undefined;
}

function parseTimestamp(rippleTime) {
  return rippleTime ? utils.common.rippleTimeToISO8601(rippleTime) : undefined;
}

function removeEmptyCounterparty(amount) {
  if (amount.counterparty === '') {
    delete amount.counterparty;
  }
}

function removeEmptyCounterpartyInBalanceChanges(balanceChanges) {
  _.forEach(balanceChanges, function (changes) {
    _.forEach(changes, removeEmptyCounterparty);
  });
}

function removeEmptyCounterpartyInOrderbookChanges(orderbookChanges) {
  _.forEach(orderbookChanges, function (changes) {
    _.forEach(changes, function (change) {
      _.forEach(change, removeEmptyCounterparty);
    });
  });
}

function parseOutcome(tx) {
  var metadata = tx.meta || tx.metaData;
  if (!metadata) {
    return undefined;
  }
  var balanceChanges = transactionParser.parseBalanceChanges(metadata);
  var orderbookChanges = transactionParser.parseOrderbookChanges(metadata);
  removeEmptyCounterpartyInBalanceChanges(balanceChanges);
  removeEmptyCounterpartyInOrderbookChanges(orderbookChanges);

  return {
    result: tx.meta.TransactionResult,
    timestamp: parseTimestamp(tx.date),
    fee: utils.common.dropsToXrp(tx.Fee),
    balanceChanges: balanceChanges,
    orderbookChanges: orderbookChanges,
    ledgerVersion: tx.ledger_index,
    indexInLedger: tx.meta.TransactionIndex
  };
}

function hexToString(hex) {
  return hex ? new Buffer(hex, 'hex').toString('utf-8') : undefined;
}

function parseMemos(tx) {
  if (!Array.isArray(tx.Memos) || tx.Memos.length === 0) {
    return undefined;
  }
  return tx.Memos.map(function (m) {
    return utils.common.removeUndefined({
      type: m.Memo.parsed_memo_type || hexToString(m.Memo.MemoType),
      format: m.Memo.parsed_memo_format || hexToString(m.Memo.MemoFormat),
      data: m.Memo.parsed_memo_data || hexToString(m.Memo.MemoData)
    });
  });
}

module.exports = {
  parseQuality: parseQuality,
  parseOutcome: parseOutcome,
  parseMemos: parseMemos,
  hexToString: hexToString,
  parseTimestamp: parseTimestamp,
  adjustQualityForXRP: adjustQualityForXRP,
  dropsToXrp: utils.common.dropsToXrp,
  constants: utils.common.constants,
  txFlags: utils.common.txFlags,
  removeUndefined: utils.common.removeUndefined,
  rippleTimeToISO8601: utils.common.rippleTimeToISO8601
};