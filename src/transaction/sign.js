
'use strict';
var utils = require('./utils');
var keypairs = require('ripple-keypairs');
var binary = require('ripple-binary-codec');

var _require = require('ripple-hashes');

var computeBinaryTransactionHash = _require.computeBinaryTransactionHash;

var validate = utils.common.validate;

function computeSignature(tx, privateKey, signAs) {
  var signingData = signAs ? binary.encodeForMultisigning(tx, signAs) : binary.encodeForSigning(tx);
  //console.log('**********signingData**************');
  //console.log(signingData);
  debugger;
  return keypairs.sign(signingData, privateKey);
}

function sign(txJSON, secret) {
	debugger;
  var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  validate.sign({ txJSON: txJSON, secret: secret });
  // we can't validate that the secret matches the account because
  // the secret could correspond to the regular key
debugger;
  var tx = JSON.parse(txJSON);
  //console.log("****************in sign********************");
  //console.log(tx);
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
  //console.log("****************in sign********************");
  //console.log(tx);
  var serialized = binary.encode(tx);
  var tmp = binary.decode(serialized);
  console.log("**********decode************");
  console.log(tmp);
  return {
    signedTransaction: serialized,
    id: computeBinaryTransactionHash(serialized)
  };
  
}

module.exports = sign;