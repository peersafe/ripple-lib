
'use strict';

/* eslint-disable max-len */
// Enable core-js polyfills. This allows use of ES6/7 extensions listed here:
// https://github.com/zloirock/core-js/blob/fb0890f32dabe8d4d88a4350d1b268446127132e/shim.js#L1-L103
/* eslint-enable max-len */

// In node.js env, polyfill might be already loaded (from any npm package),
// that's why we do this check.

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

if (!global._babelPolyfill) {
  require('babel-polyfill');
}

var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var common = require('./common');
var server = require('./server/server');
var connect = server.connect;
var disconnect = server.disconnect;
var getServerInfo = server.getServerInfo;
var getFee = server.getFee;
var isConnected = server.isConnected;
var getLedgerVersion = server.getLedgerVersion;
var getTransaction = require('./ledger/transaction');
var getTransactions = require('./ledger/transactions');
var getTrustlines = require('./ledger/trustlines');
var getSharedetails = require('./ledger/sharedetails');
var getBalances = require('./ledger/balances');
var getBalanceSheet = require('./ledger/balance-sheet');
var getPaths = require('./ledger/pathfind');
var getOrders = require('./ledger/orders');
var queryAllOrders = require('./ledger/AllOrders');
var getOrderbook = require('./ledger/orderbook');
var getSettings = require('./ledger/settings');
var getAccountInfo = require('./ledger/accountinfo');
var preparePayment = require('./transaction/payment');
var prepareTrustline = require('./transaction/trustline');
var prepareOrder = require('./transaction/order');
var prepareOrderCancellation = require('./transaction/ordercancellation');
var prepareSuspendedPaymentCreation = require('./transaction/suspended-payment-creation');
var prepareSuspendedPaymentExecution = require('./transaction/suspended-payment-execution');
var prepareSuspendedPaymentCancellation = require('./transaction/suspended-payment-cancellation');
var prepareSettings = require('./transaction/settings');
var sign = require('./transaction/sign');
var combine = require('./transaction/combine');
var submit = require('./transaction/submit');
var errors = require('./common').errors;
var generateAddress = require('./offline/generate-address').generateAddressAPI;
var computeLedgerHash = require('./offline/ledgerhash');
var getLedger = require('./ledger/ledger');

// prevent access to non-validated ledger versions

var RestrictedConnection = (function (_common$Connection) {
  _inherits(RestrictedConnection, _common$Connection);

  function RestrictedConnection() {
    _classCallCheck(this, RestrictedConnection);

    _get(Object.getPrototypeOf(RestrictedConnection.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(RestrictedConnection, [{
    key: 'request',
    value: function request(_request, timeout) {
      var ledger_index = _request.ledger_index;
      if (ledger_index !== undefined && ledger_index !== 'validated') {
        if (!_.isNumber(ledger_index) || ledger_index > this._ledgerVersion) {
          return _Promise.reject(new errors.LedgerVersionError('ledgerVersion ' + ledger_index + ' is greater than server\'s ' + ('most recent validated ledger: ' + this._ledgerVersion)));
        }
      }
      return _get(Object.getPrototypeOf(RestrictedConnection.prototype), 'request', this).call(this, _request, timeout);
    }
  }]);

  return RestrictedConnection;
})(common.Connection);

var RippleAPI = (function (_EventEmitter) {
  _inherits(RippleAPI, _EventEmitter);

  function RippleAPI() {
    var _this = this;

    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    _classCallCheck(this, RippleAPI);

    common.validate.apiOptions(options);
    _get(Object.getPrototypeOf(RippleAPI.prototype), 'constructor', this).call(this);
    this._feeCushion = options.feeCushion || 1.2;
    var serverURL = options.server;
    if (serverURL !== undefined) {
      this.connection = new RestrictedConnection(serverURL, options);
      this.connection.on('ledgerClosed', function (message) {
        _this.emit('ledger', server.formatLedgerClose(message));
      });
      this.connection.on('error', function (errorCode, errorMessage, data) {
        _this.emit('error', errorCode, errorMessage, data);
      });
    } else {
      // use null object pattern to provide better error message if user
      // tries to call a method that requires a connection
      this.connection = new RestrictedConnection(null, options);
    }
  }

  return RippleAPI;
})(EventEmitter);

_.assign(RippleAPI.prototype, {
  connect: connect,
  disconnect: disconnect,
  isConnected: isConnected,
  getServerInfo: getServerInfo,
  getFee: getFee,
  getLedgerVersion: getLedgerVersion,

  getTransaction: getTransaction,
  getTransactions: getTransactions,
  getTrustlines: getTrustlines,
  getSharedetails:getSharedetails,
  getBalances: getBalances,
  getBalanceSheet: getBalanceSheet,
  getPaths: getPaths,
  getOrders: getOrders,
  queryAllOrders:queryAllOrders,
  getOrderbook: getOrderbook,
  getSettings: getSettings,
  getAccountInfo: getAccountInfo,
  getLedger: getLedger,

  preparePayment: preparePayment,
  prepareTrustline: prepareTrustline,
  prepareOrder: prepareOrder,
  prepareOrderCancellation: prepareOrderCancellation,
  prepareSuspendedPaymentCreation: prepareSuspendedPaymentCreation,
  prepareSuspendedPaymentExecution: prepareSuspendedPaymentExecution,
  prepareSuspendedPaymentCancellation: prepareSuspendedPaymentCancellation,
  prepareSettings: prepareSettings,
  sign: sign,
  combine: combine,
  submit: submit,

  generateAddress: generateAddress,
  computeLedgerHash: computeLedgerHash,
  errors: errors
});

// these are exposed only for use by unit tests; they are not part of the API
RippleAPI._PRIVATE = {
  validate: common.validate,
  RangeSet: require('./common/rangeset').RangeSet,
  ledgerUtils: require('./ledger/utils'),
  schemaValidator: require('./common/schema-validator')
};

module.exports = {
  RippleAPI: RippleAPI
};