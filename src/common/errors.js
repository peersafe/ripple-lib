'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var util = require('util');

var RippleError = (function (_Error) {
  _inherits(RippleError, _Error);

  function RippleError(message, data) {
    _classCallCheck(this, RippleError);

    _get(Object.getPrototypeOf(RippleError.prototype), 'constructor', this).call(this, message);
    this.name = this.constructor.name;
    this.message = message;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor.name);
    }
  }

  _createClass(RippleError, [{
    key: 'toString',
    value: function toString() {
      var result = '[' + this.name + '(' + this.message;
      if (this.data) {
        result += ', ' + util.inspect(this.data);
      }
      result += ')]';
      return result;
    }

    /* console.log in node uses util.inspect on object, and util.inspect allows
    us to cutomize its output:
    https://nodejs.org/api/util.html#util_custom_inspect_function_on_objects */
  }, {
    key: 'inspect',
    value: function inspect() {
      return this.toString();
    }
  }]);

  return RippleError;
})(Error);

var RippledError = (function (_RippleError) {
  _inherits(RippledError, _RippleError);

  function RippledError() {
    _classCallCheck(this, RippledError);

    _get(Object.getPrototypeOf(RippledError.prototype), 'constructor', this).apply(this, arguments);
  }

  return RippledError;
})(RippleError);

var UnexpectedError = (function (_RippleError2) {
  _inherits(UnexpectedError, _RippleError2);

  function UnexpectedError() {
    _classCallCheck(this, UnexpectedError);

    _get(Object.getPrototypeOf(UnexpectedError.prototype), 'constructor', this).apply(this, arguments);
  }

  return UnexpectedError;
})(RippleError);

var LedgerVersionError = (function (_RippleError3) {
  _inherits(LedgerVersionError, _RippleError3);

  function LedgerVersionError() {
    _classCallCheck(this, LedgerVersionError);

    _get(Object.getPrototypeOf(LedgerVersionError.prototype), 'constructor', this).apply(this, arguments);
  }

  return LedgerVersionError;
})(RippleError);

var ConnectionError = (function (_RippleError4) {
  _inherits(ConnectionError, _RippleError4);

  function ConnectionError() {
    _classCallCheck(this, ConnectionError);

    _get(Object.getPrototypeOf(ConnectionError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ConnectionError;
})(RippleError);

var NotConnectedError = (function (_ConnectionError) {
  _inherits(NotConnectedError, _ConnectionError);

  function NotConnectedError() {
    _classCallCheck(this, NotConnectedError);

    _get(Object.getPrototypeOf(NotConnectedError.prototype), 'constructor', this).apply(this, arguments);
  }

  return NotConnectedError;
})(ConnectionError);

var DisconnectedError = (function (_ConnectionError2) {
  _inherits(DisconnectedError, _ConnectionError2);

  function DisconnectedError() {
    _classCallCheck(this, DisconnectedError);

    _get(Object.getPrototypeOf(DisconnectedError.prototype), 'constructor', this).apply(this, arguments);
  }

  return DisconnectedError;
})(ConnectionError);

var TimeoutError = (function (_ConnectionError3) {
  _inherits(TimeoutError, _ConnectionError3);

  function TimeoutError() {
    _classCallCheck(this, TimeoutError);

    _get(Object.getPrototypeOf(TimeoutError.prototype), 'constructor', this).apply(this, arguments);
  }

  return TimeoutError;
})(ConnectionError);

var ResponseFormatError = (function (_ConnectionError4) {
  _inherits(ResponseFormatError, _ConnectionError4);

  function ResponseFormatError() {
    _classCallCheck(this, ResponseFormatError);

    _get(Object.getPrototypeOf(ResponseFormatError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ResponseFormatError;
})(ConnectionError);

var ValidationError = (function (_RippleError5) {
  _inherits(ValidationError, _RippleError5);

  function ValidationError() {
    _classCallCheck(this, ValidationError);

    _get(Object.getPrototypeOf(ValidationError.prototype), 'constructor', this).apply(this, arguments);
  }

  return ValidationError;
})(RippleError);

var NotFoundError = (function (_RippleError6) {
  _inherits(NotFoundError, _RippleError6);

  function NotFoundError(message) {
    _classCallCheck(this, NotFoundError);

    _get(Object.getPrototypeOf(NotFoundError.prototype), 'constructor', this).call(this, message || 'Not found');
  }

  return NotFoundError;
})(RippleError);

var MissingLedgerHistoryError = (function (_RippleError7) {
  _inherits(MissingLedgerHistoryError, _RippleError7);

  function MissingLedgerHistoryError(message) {
    _classCallCheck(this, MissingLedgerHistoryError);

    _get(Object.getPrototypeOf(MissingLedgerHistoryError.prototype), 'constructor', this).call(this, message || 'Server is missing ledger history in the specified range');
  }

  return MissingLedgerHistoryError;
})(RippleError);

var PendingLedgerVersionError = (function (_RippleError8) {
  _inherits(PendingLedgerVersionError, _RippleError8);

  function PendingLedgerVersionError(message) {
    _classCallCheck(this, PendingLedgerVersionError);

    _get(Object.getPrototypeOf(PendingLedgerVersionError.prototype), 'constructor', this).call(this, message || 'maxLedgerVersion is greater than server\'s' + ' most recent validated ledger');
  }

  return PendingLedgerVersionError;
})(RippleError);

module.exports = {
  RippleError: RippleError,
  UnexpectedError: UnexpectedError,
  ConnectionError: ConnectionError,
  RippledError: RippledError,
  NotConnectedError: NotConnectedError,
  DisconnectedError: DisconnectedError,
  TimeoutError: TimeoutError,
  ResponseFormatError: ResponseFormatError,
  ValidationError: ValidationError,
  NotFoundError: NotFoundError,
  PendingLedgerVersionError: PendingLedgerVersionError,
  MissingLedgerHistoryError: MissingLedgerHistoryError,
  LedgerVersionError: LedgerVersionError
};