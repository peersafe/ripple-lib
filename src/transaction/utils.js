
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var BigNumber = require('bignumber.js');
var common = require('../common');
var txFlags = common.txFlags;

function formatPrepareResponse(txJSON) {
  var instructions = {
    fee: common.dropsToXrp(txJSON.Fee),
    sequence: txJSON.Sequence,
    maxLedgerVersion: txJSON.LastLedgerSequence === undefined ? null : txJSON.LastLedgerSequence
  };
  return {
    txJSON: JSON.stringify(txJSON),
    instructions: _.omit(instructions, _.isUndefined)
  };
}

function setCanonicalFlag(txJSON) {
  txJSON.Flags |= txFlags.Universal.FullyCanonicalSig;

  // JavaScript converts operands to 32-bit signed ints before doing bitwise
  // operations. We need to convert it back to an unsigned int.
  txJSON.Flags = txJSON.Flags >>> 0;
}

function scaleValue(value, multiplier) {
  return new BigNumber(value).times(multiplier).toString();
}

function prepareTransaction(txJSON, api, instructions) {
  common.validate.instructions(instructions);

  var account = txJSON.Account;
  setCanonicalFlag(txJSON);

  function prepareMaxLedgerVersion() {
    if (instructions.maxLedgerVersion !== undefined) {
      if (instructions.maxLedgerVersion !== null) {
        txJSON.LastLedgerSequence = instructions.maxLedgerVersion;
      }
      return _Promise.resolve(txJSON);
    }
    var offset = instructions.maxLedgerVersionOffset !== undefined ? instructions.maxLedgerVersionOffset : 3;
    return api.connection.getLedgerVersion().then(function (ledgerVersion) {
      txJSON.LastLedgerSequence = ledgerVersion + offset;
      return txJSON;
    });
  }

  function prepareFee() {
    var multiplier = instructions.signersCount === undefined ? 1 : instructions.signersCount + 1;
    if (instructions.fee !== undefined) {
      txJSON.Fee = scaleValue(common.xrpToDrops(instructions.fee), multiplier);
      return _Promise.resolve(txJSON);
    }
    var cushion = api._feeCushion;
    return common.serverInfo.getFee(api.connection, cushion).then(function (fee) {
      var feeDrops = common.xrpToDrops(fee);
      if (instructions.maxFee !== undefined) {
        var maxFeeDrops = common.xrpToDrops(instructions.maxFee);
        var normalFee = BigNumber.min(feeDrops, maxFeeDrops).toString();
        txJSON.Fee = scaleValue(normalFee, multiplier);
      } else {
        txJSON.Fee = scaleValue(feeDrops, multiplier);
      }
      return txJSON;
    });
  }

  function prepareSequence() {
    if (instructions.sequence !== undefined) {
      txJSON.Sequence = instructions.sequence;
      return _Promise.resolve(txJSON);
    }
    var request = {
      command: 'account_info',
      account: account
    };
    return api.connection.request(request).then(function (response) {
      txJSON.Sequence = response.account_data.Sequence;
      return txJSON;
    });
  }
debugger;
  return _Promise.all([prepareMaxLedgerVersion(), prepareFee(), prepareSequence()]).then(function () {
debugger;
	return formatPrepareResponse(txJSON);
  });
}

function convertStringToHex(string) {
  return string ? new Buffer(string, 'utf8').toString('hex').toUpperCase() : undefined;
}

function convertMemo(memo) {
  return {
    Memo: common.removeUndefined({
      MemoData: convertStringToHex(memo.data),
      MemoType: convertStringToHex(memo.type),
      MemoFormat: convertStringToHex(memo.format)
    })
  };
}

function convertTestOut(Teststr) {
  return {
    TestOut:common.removeUndefined({
      TestData: convertStringToHex(Teststr)
    })
  };
}


module.exports = {
  convertStringToHex: convertStringToHex,
  convertMemo: convertMemo,
  prepareTransaction: prepareTransaction,
  convertTestOut:convertTestOut,
  common: common
};