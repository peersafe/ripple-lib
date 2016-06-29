
'use strict';

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _ = require('lodash');
var utils = require('./utils');
var validate = utils.common.validate;

var parseAccountOrder = require('./parse/account-order');
var parseAllOrder = require('./parse/AllOrder');
function requestAccountOffers(connection,ledgerVersion, marker, limit) {
  return connection.request({
    command: 'offers',
    marker: marker,
    limit: utils.clamp(limit, 10, 400),
    ledger_index: ledgerVersion
  }).then(function (data) {
    return {
      marker: data.marker,
      results: data.offers   //results: data.offers.map(_.partial(parseALlOrder))
    };
  });
}

function queryAllOrders() {
  var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  //validate.getOrders({ address: address, options: options });

  return utils.ensureLedgerVersion.call(this, options).then(function (_options) {
    var getter = _.partial(requestAccountOffers, _this.connection,_options.ledgerVersion);
    return utils.getRecursive(getter, _options.limit).then(function (orders) {
		//console.log(orders);
		return orders;
        /*return _.sortBy(orders, function (order) {
        return order.properties.sequence;
      });*/
    });
  });
}

module.exports = queryAllOrders;