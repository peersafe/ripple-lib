'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var RippleAPI = require('./api').RippleAPI;

var RippleAPIBroadcast = (function (_RippleAPI) {
  _inherits(RippleAPIBroadcast, _RippleAPI);

  function RippleAPIBroadcast(servers, options) {
    var _this = this;

    _classCallCheck(this, RippleAPIBroadcast);

    _get(Object.getPrototypeOf(RippleAPIBroadcast.prototype), 'constructor', this).call(this, options);
    this.ledgerVersion = 0;

    var apis = servers.map(function (server) {
      return new RippleAPI(_.assign({}, options, { server: server }));
    });

    // exposed for testing
    this._apis = apis;

    this.getMethodNames().forEach(function (name) {
      _this[name] = function () {
        var _arguments = arguments;
        // eslint-disable-line no-loop-func
        return _Promise.race(apis.map(function (api) {
          return api[name].apply(api, _arguments);
        }));
      };
    });

    // connection methods must be overridden to apply to all api instances
    this.connect = function () {
      return _Promise.all(apis.map(function (api) {
        return api.connect();
      }));
    };
    this.disconnect = function () {
      return _Promise.all(apis.map(function (api) {
        return api.disconnect();
      }));
    };
    this.isConnected = function () {
      return _.every(apis.map(function (api) {
        return api.isConnected();
      }));
    };

    // synchronous methods are all passed directly to the first api instance
    var defaultAPI = apis[0];
    var syncMethods = ['sign', 'generateAddress', 'computeLedgerHash'];
    syncMethods.forEach(function (name) {
      _this[name] = defaultAPI[name].bind(defaultAPI);
    });

    apis.forEach(function (api) {
      api.on('ledger', _this.onLedgerEvent.bind(_this));
      api.on('error', function (errorCode, errorMessage, data) {
        return _this.emit('error', errorCode, errorMessage, data);
      });
    });
  }

  _createClass(RippleAPIBroadcast, [{
    key: 'onLedgerEvent',
    value: function onLedgerEvent(ledger) {
      if (ledger.ledgerVersion > this.ledgerVersion) {
        this.ledgerVersion = ledger.ledgerVersion;
        this.emit('ledger', ledger);
      }
    }
  }, {
    key: 'getMethodNames',
    value: function getMethodNames() {
      var methodNames = [];
      for (var _name in RippleAPI.prototype) {
        if (RippleAPI.prototype.hasOwnProperty(_name)) {
          if (typeof RippleAPI.prototype[_name] === 'function') {
            methodNames.push(_name);
          }
        }
      }
      return methodNames;
    }
  }]);

  return RippleAPIBroadcast;
})(RippleAPI);

module.exports = {
  RippleAPIBroadcast: RippleAPIBroadcast
};