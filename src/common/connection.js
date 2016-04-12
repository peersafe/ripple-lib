'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Number$isInteger = require('babel-runtime/core-js/number/is-integer')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _ = require('lodash');

var _require = require('events');

var EventEmitter = _require.EventEmitter;

var WebSocket = require('ws');
var parseURL = require('url').parse;
var RangeSet = require('./rangeset').RangeSet;

var _require2 = require('./errors');

var RippledError = _require2.RippledError;
var DisconnectedError = _require2.DisconnectedError;
var NotConnectedError = _require2.NotConnectedError;
var TimeoutError = _require2.TimeoutError;
var ResponseFormatError = _require2.ResponseFormatError;
var ConnectionError = _require2.ConnectionError;

function isStreamMessageType(type) {
  return type === 'ledgerClosed' || type === 'transaction' || type === 'path_find';
}

var Connection = (function (_EventEmitter) {
  _inherits(Connection, _EventEmitter);

  function Connection(url) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Connection);

    _get(Object.getPrototypeOf(Connection.prototype), 'constructor', this).call(this);
    this.setMaxListeners(Infinity);
    this._url = url;
    this._trace = options.trace;
    if (this._trace) {
      // for easier unit testing
      this._console = console;
    }
    this._proxyURL = options.proxy;
    this._proxyAuthorization = options.proxyAuthorization;
    this._authorization = options.authorization;
    this._trustedCertificates = options.trustedCertificates;
    this._key = options.key;
    this._passphrase = options.passphrase;
    this._certificate = options.certificate;
    this._timeout = options.timeout || 20 * 1000;
    this._isReady = false;
    this._ws = null;
    this._ledgerVersion = null;
    this._availableLedgerVersions = new RangeSet();
    this._nextRequestID = 1;
  }

  _createClass(Connection, [{
    key: '_updateLedgerVersions',
    value: function _updateLedgerVersions(data) {
    console.log("this._ledgerVersion"+Number(data.ledger_index));
      this._ledgerVersion = Number(data.ledger_index);
      if (data.validated_ledgers) {
        this._availableLedgerVersions.reset();
        this._availableLedgerVersions.parseAndAddRanges(data.validated_ledgers);
      } else {
        this._availableLedgerVersions.addValue(this._ledgerVersion);
      }
    }

    // return value is array of arguments to Connection.emit
  }, {
    key: '_parseMessage',
    value: function _parseMessage(message) {
      var data = JSON.parse(message);
      if (data.type === 'response') {
        if (!(_Number$isInteger(data.id) && data.id >= 0)) {
          throw new ResponseFormatError('valid id not found in response');
        }
        return [data.id.toString(), data];
      } else if (isStreamMessageType(data.type)) {
        if (data.type === 'ledgerClosed') {
	      console.log("ledgerClosed");
          this._updateLedgerVersions(data);
        }
        return [data.type, data];
      } else if (data.type === undefined && data.error) {
        return ['error', data.error, data.error_message, data]; // e.g. slowDown
      }
      throw new ResponseFormatError('unrecognized message type: ' + data.type);
    }
  }, {
    key: '_onMessage',
    value: function _onMessage(message) {
      var parameters = undefined;
      if (this._trace) {
        this._console.log(message);
      }
      try {
        parameters = this._parseMessage(message);
      } catch (error) {
        this.emit('error', 'badMessage', error.message, message);
        return;
      }
      // we don't want this inside the try/catch or exceptions in listener
      // will be caught
      this.emit.apply(this, parameters);
    }
  }, {
    key: 'isConnected',
    value: function isConnected() {
      return this._state === WebSocket.OPEN && this._isReady;
    }
  }, {
    key: '_onUnexpectedClose',
    value: function _onUnexpectedClose() {
      this._ws = null;
      this._isReady = false;
      this.connect().then();
    }
  }, {
    key: '_onOpen',
    value: function _onOpen() {
      var _this = this;

      var request = {
        command: 'subscribe',
        streams: ['ledger']
      };
	  debugger;
      return this.request(request).then(function (data) {
	  	console.log("request");
        _this._updateLedgerVersions(data);
        _this._isReady = true;
        _this.emit('connected');
      });
    }
  }, {
    key: '_createWebSocket',
    value: function _createWebSocket() {
      var options = {};
      if (this._proxyURL !== undefined) {
        var parsedURL = parseURL(this._url);
        var parsedProxyURL = parseURL(this._proxyURL);
        var proxyOverrides = _.omit({
          secureEndpoint: parsedURL.protocol === 'wss:',
          secureProxy: parsedProxyURL.protocol === 'https:',
          auth: this._proxyAuthorization,
          ca: this._trustedCertificates,
          key: this._key,
          passphrase: this._passphrase,
          cert: this._certificate
        }, _.isUndefined);
        var proxyOptions = _.assign({}, parsedProxyURL, proxyOverrides);
        var HttpsProxyAgent = undefined;
        try {
          HttpsProxyAgent = require('https-proxy-agent');
        } catch (error) {
          throw new Error('"proxy" option is not supported in the browser');
        }
        options.agent = new HttpsProxyAgent(proxyOptions);
      }
      if (this._authorization !== undefined) {
        var base64 = new Buffer(this._authorization).toString('base64');
        options.headers = { Authorization: 'Basic ' + base64 };
      }
      var optionsOverrides = _.omit({
        ca: this._trustedCertificates,
        key: this._key,
        passphrase: this._passphrase,
        cert: this._certificate
      }, _.isUndefined);
      var websocketOptions = _.assign({}, options, optionsOverrides);
      var websocket = new WebSocket(this._url, null, websocketOptions);
      // we will have a listener for each outstanding request,
      // so we have to raise the limit (the default is 10)
      if (typeof websocket.setMaxListeners === 'function') {
        websocket.setMaxListeners(Infinity);
      }
      return websocket;
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      return new _Promise(function (resolve, reject) {
        if (!_this2._url) {
          reject(new ConnectionError('Cannot connect because no server was specified'));
        }
        if (_this2._state === WebSocket.OPEN) {
          resolve();
        } else if (_this2._state === WebSocket.CONNECTING) {
          _this2._ws.once('open', resolve);
        } else {
          _this2._ws = _this2._createWebSocket();
          // when an error causes the connection to close, the close event
          // should still be emitted; the "ws" documentation says: "The close
          // event is also emitted when then underlying net.Socket closes the
          // connection (end or close)."
          _this2._ws.on('error', function (error) {
            return _this2.emit('error', 'websocket', error.messsage, error);
          });
          _this2._ws.on('message', _this2._onMessage.bind(_this2));
          _this2._onUnexpectedCloseBound = _this2._onUnexpectedClose.bind(_this2);
          _this2._ws.once('close', _this2._onUnexpectedCloseBound);
          _this2._ws.once('open', function () {
            return _this2._onOpen().then(resolve, reject);
          });
        }
      });
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      var _this3 = this;

      return new _Promise(function (resolve) {
        if (_this3._state === WebSocket.CLOSED) {
          resolve();
        } else if (_this3._state === WebSocket.CLOSING) {
          _this3._ws.once('close', resolve);
        } else {
          _this3._ws.removeListener('close', _this3._onUnexpectedCloseBound);
          _this3._ws.once('close', function () {
            _this3._ws = null;
            _this3._isReady = false;
            resolve();
          });
          _this3._ws.close();
        }
      });
    }
  }, {
    key: 'reconnect',
    value: function reconnect() {
      var _this4 = this;

      return this.disconnect().then(function () {
        return _this4.connect();
      });
    }
  }, {
    key: '_whenReady',
    value: function _whenReady(promise) {
      var _this5 = this;

      return new _Promise(function (resolve, reject) {
        if (!_this5._shouldBeConnected) {
          reject(new NotConnectedError());
        } else if (_this5._state === WebSocket.OPEN && _this5._isReady) {
          promise.then(resolve, reject);
        } else {
          _this5.once('connected', function () {
            return promise.then(resolve, reject);
          });
        }
      });
    }
  }, {
    key: 'getLedgerVersion',
    value: function getLedgerVersion() {
      return this._whenReady(_Promise.resolve(this._ledgerVersion));
    }
  }, {
    key: 'hasLedgerVersions',
    value: function hasLedgerVersions(lowLedgerVersion, highLedgerVersion) {
      return this._whenReady(_Promise.resolve(this._availableLedgerVersions.containsRange(lowLedgerVersion, highLedgerVersion || this._ledgerVersion)));
    }
  }, {
    key: 'hasLedgerVersion',
    value: function hasLedgerVersion(ledgerVersion) {
      return this.hasLedgerVersions(ledgerVersion, ledgerVersion);
    }
  }, {
    key: '_send',
    value: function _send(message) {
      var _this6 = this;

      if (this._trace) {
        this._console.log(message);
      }
      return new _Promise(function (resolve, reject) {
        _this6._ws.send(message, undefined, function (error, result) {
          if (error) {
            reject(new DisconnectedError(error.message));
          } else {
            resolve(result);
          }
        });
      });
    }
  }, {
    key: 'request',
    value: function request(_request, timeout) {
      var _this7 = this;

      return new _Promise(function (resolve, reject) {
        if (!_this7._shouldBeConnected) {
          reject(new NotConnectedError());
        }

        var timer = null;
        var self = _this7;
        var id = _this7._nextRequestID;
        _this7._nextRequestID += 1;
        var eventName = id.toString();

        function onDisconnect() {
          clearTimeout(timer);
          self.removeAllListeners(eventName);
          reject(new DisconnectedError());
        }

        function cleanup() {
          clearTimeout(timer);
          self.removeAllListeners(eventName);
          if (self._ws !== null) {
            self._ws.removeListener('close', onDisconnect);
          }
        }

        function _resolve(response) {
          cleanup();
          resolve(response);
        }

        function _reject(error) {
          cleanup();
          reject(error);
        }

        _this7.once(eventName, function (response) {
          if (response.status === 'error') {
            _reject(new RippledError(response.error));
          } else if (response.status === 'success') {
            _resolve(response.result);
          } else {
            _reject(new ResponseFormatError('unrecognized status: ' + response.status));
          }
        });

        _this7._ws.once('close', onDisconnect);

        // JSON.stringify automatically removes keys with value of 'undefined'
        var message = JSON.stringify(_Object$assign({}, _request, { id: id }));

        _this7._whenReady(_this7._send(message)).then(function () {
          var delay = timeout || _this7._timeout;
          timer = setTimeout(function () {
            return _reject(new TimeoutError());
          }, delay);
        })['catch'](_reject);
      });
    }
  }, {
    key: '_state',
    get: function get() {
      return this._ws ? this._ws.readyState : WebSocket.CLOSED;
    }
  }, {
    key: '_shouldBeConnected',
    get: function get() {
      return this._ws !== null;
    }
  }]);

  return Connection;
})(EventEmitter);

module.exports = Connection;