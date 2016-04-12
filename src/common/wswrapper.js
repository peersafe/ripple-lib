'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _require = require('events');

var EventEmitter = _require.EventEmitter;

function unsused() {}

/**
 * Provides `EventEmitter` interface for native browser `WebSocket`,
 * same, as `ws` package provides.
 */

var WSWrapper = (function (_EventEmitter) {
  _inherits(WSWrapper, _EventEmitter);

  function WSWrapper(url) {
    var _this = this;

    var protocols = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];
    var websocketOptions = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, WSWrapper);

    _get(Object.getPrototypeOf(WSWrapper.prototype), 'constructor', this).call(this);
    unsused(protocols);
    unsused(websocketOptions);
    this.setMaxListeners(Infinity);

    this._ws = new WebSocket(url);

    this._ws.onclose = function () {
      _this.emit('close');
    };

    this._ws.onopen = function () {
      _this.emit('open');
    };

    this._ws.onerror = function (error) {
      if (_this.listenerCount('error') > 0) {
        _this.emit('error', error);
      }
    };

    this._ws.onmessage = function (message) {
      _this.emit('message', message.data);
    };
  }

  _createClass(WSWrapper, [{
    key: 'close',
    value: function close() {
      if (this.readyState === 1) {
        this._ws.close();
      }
    }
  }, {
    key: 'send',
    value: function send(message) {
      this._ws.send(message);
    }
  }, {
    key: 'readyState',
    get: function get() {
      return this._ws.readyState;
    }
  }]);

  return WSWrapper;
})(EventEmitter);

WSWrapper.CONNECTING = 0;
WSWrapper.OPEN = 1;
WSWrapper.CLOSING = 2;
WSWrapper.CLOSED = 3;

module.exports = WSWrapper;