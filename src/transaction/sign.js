
'use strict';
var utils = require('./utils');
var keypairs = require('ripple-keypairs');
var binary = require('ripple-binary-codec');

var _require = require('ripple-hashes');

var computeBinaryTransactionHash = _require.computeBinaryTransactionHash;

var validate = utils.common.validate;

function computeSignature(tx, privateKey, signAs) {
  var signingData = signAs ? binary.encodeForMultisigning(tx, signAs) : binary.encodeForSigning(tx);
  return keypairs.sign(signingData, privateKey);
}

function sign(txJSON, secret) {
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  console.log("*****************txJSON********************");
  console.log(txJSON);
  validate.sign({ txJSON: txJSON, secret: secret });
  // we can't validate that the secret matches the account because
  // the secret could correspond to the regular key

  var tx = JSON.parse(txJSON);
  console.log("*****************tx********************");
  console.log(tx);
  
  if (tx.TxnSignature || tx.Signers) {
    throw new utils.common.errors.ValidationError('txJSON must not contain "TxnSignature" or "Signers" properties');
  }

  var keypair = keypairs.deriveKeypair(secret);
  tx.SigningPubKey = options.signAs ? '' : keypair.publicKey;

  if (options.signAs) {
    var signer = {
      Account: options.signAs,
      SigningPubKey: keypair.publicKey,
      TxnSignature: computeSignature(tx, keypair.privateKey, options.signAs)
    };
    tx.Signers = [{ Signer: signer }];
  } else {
    tx.TxnSignature = computeSignature(tx, keypair.privateKey);
  }

  var serialized = binary.encode(tx);
  return {
    signedTransaction: serialized,
    id: computeBinaryTransactionHash(serialized)
  };
}

module.exports = sign;