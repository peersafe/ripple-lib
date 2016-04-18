/* @flow */
'use strict';
const _ = require('lodash');
const utils = require('./utils');
const validate = utils.common.validate;
import type {Instructions, Prepare} from './types.js';
import type {Memo} from '../common/types.js';

type SuspendedPaymentExecution = {
  owner: string,
  suspensionSequence: number,
  memos?: Array<Memo>,
  method?: number,
  digest?: string,
  proof?: string
}

function createSuspendedPaymentExecutionTransaction(account: string,
      payment: SuspendedPaymentExecution
): Object {
  const txJSON: Object = {
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

function prepareSuspendedPaymentExecution(address: string,
  suspendedPaymentExecution: SuspendedPaymentExecution,
  instructions: Instructions = {}
): Promise<Prepare> {
  validate.prepareSuspendedPaymentExecution(
    {address, suspendedPaymentExecution, instructions});
  const txJSON = createSuspendedPaymentExecutionTransaction(
    address, suspendedPaymentExecution);
  return utils.prepareTransaction(txJSON, this, instructions);
}

module.exports = prepareSuspendedPaymentExecution;
