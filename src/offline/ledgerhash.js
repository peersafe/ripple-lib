
'use strict';
var _ = require('lodash');
var common = require('../common');
var hashes = require('ripple-hashes');

function convertLedgerHeader(header) {
  return {
    account_hash: header.stateHash,
    close_time: common.iso8601ToRippleTime(header.closeTime),
    close_time_resolution: header.closeTimeResolution,
    close_flags: header.closeFlags,
    hash: header.ledgerHash,
    ledger_hash: header.ledgerHash,
    ledger_index: header.ledgerVersion.toString(),
    seqNum: header.ledgerVersion.toString(),
    parent_hash: header.parentLedgerHash,
    parent_close_time: common.iso8601ToRippleTime(header.parentCloseTime),
    total_coins: header.totalDrops,
    totalCoins: header.totalDrops,
    transaction_hash: header.transactionHash
  };
}

function hashLedgerHeader(ledgerHeader) {
  var header = convertLedgerHeader(ledgerHeader);
  return hashes.computeLedgerHash(header);
}

function computeTransactionHash(ledger) {
  if (ledger.rawTransactions === undefined) {
    return ledger.transactionHash;
  }
  var transactions = JSON.parse(ledger.rawTransactions);
  var txs = _.map(transactions, function (tx) {
    var mergeTx = _.assign({}, _.omit(tx, 'tx'), tx.tx || {});
    var renameMeta = _.assign({}, _.omit(mergeTx, 'meta'), tx.meta ? { metaData: tx.meta } : {});
    return renameMeta;
  });
  var transactionHash = hashes.computeTransactionTreeHash(txs);
  if (ledger.transactionHash !== undefined && ledger.transactionHash !== transactionHash) {
    throw new common.errors.ValidationError('transactionHash in header' + ' does not match computed hash of transactions');
  }
  return transactionHash;
}

function computeStateHash(ledger) {
  if (ledger.rawState === undefined) {
    return ledger.stateHash;
  }
  var state = JSON.parse(ledger.rawState);
  var stateHash = hashes.computeStateTreeHash(state);
  if (ledger.stateHash !== undefined && ledger.stateHash !== stateHash) {
    throw new common.errors.ValidationError('stateHash in header' + ' does not match computed hash of state');
  }
  return stateHash;
}

function computeLedgerHash(ledger) {
  var subhashes = {
    transactionHash: computeTransactionHash(ledger),
    stateHash: computeStateHash(ledger)
  };
  return hashLedgerHeader(_.assign({}, ledger, subhashes));
}

module.exports = computeLedgerHash;