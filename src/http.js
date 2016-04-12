/* eslint-disable new-cap */
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var assert = require('assert');
var _ = require('lodash');
var jayson = require('jayson');

var RippleAPI = require('./api').RippleAPI;

function createHTTPServer(options, httpPort) {
  var rippleAPI = new RippleAPI(options);

  var methodNames = _.filter(_.keys(RippleAPI.prototype), function (k) {
    return typeof RippleAPI.prototype[k] === 'function' && k !== 'connect' && k !== 'disconnect' && k !== 'constructor' && k !== 'RippleAPI';
  });

  function applyPromiseWithCallback(fnName, callback, args_) {
    try {
      var args = args_;
      if (!_.isArray(args_)) {
        var fnParameters = jayson.Utils.getParameterNames(rippleAPI[fnName]);
        args = fnParameters.map(function (name) {
          return args_[name];
        });
        var defaultArgs = _.omit(args_, fnParameters);
        assert(_.size(defaultArgs) <= 1, 'Function must have no more than one default argument');
        if (_.size(defaultArgs) > 0) {
          args.push(defaultArgs[_.keys(defaultArgs)[0]]);
        }
      }
      _Promise.resolve(rippleAPI[fnName].apply(rippleAPI, args)).then(function (res) {
        return callback(null, res);
      })['catch'](function (err) {
        callback({ code: 99, message: err.message, data: { name: err.name } });
      });
    } catch (err) {
      callback({ code: 99, message: err.message, data: { name: err.name } });
    }
  }

  var methods = {};
  _.forEach(methodNames, function (fn) {
    methods[fn] = jayson.Method(function (args, cb) {
      applyPromiseWithCallback(fn, cb, args);
    }, { collect: true });
  });

  var server = jayson.server(methods);
  var httpServer = null;

  return {
    server: server,
    start: function start() {
      if (httpServer !== null) {
        return _Promise.reject('Already started');
      }
      return new _Promise(function (resolve) {
        rippleAPI.connect().then(function () {
          httpServer = server.http();
          httpServer.listen(httpPort, resolve);
        });
      });
    },
    stop: function stop() {
      if (httpServer === null) {
        return _Promise.reject('Not started');
      }
      return new _Promise(function (resolve) {
        rippleAPI.disconnect();
        httpServer.close(function () {
          httpServer = null;
          resolve();
        });
      });
    }
  };
}

module.exports = {
  createHTTPServer: createHTTPServer
};