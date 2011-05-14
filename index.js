/*!
 * DNode - Smoothie Charts
 * Copyright(c) 2011 Chris Partridge <chrisp@dynamicmethods.com.au>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
var async = require('async');

/**
 * Initialize a new `DNodeSmoothie` object.
 *
 * @param {Array} charts
 * @api public
 */
exports = module.exports = DNodeSmoothie;

function DNodeSmoothie(charts) {
  this.charts = [];
  this.clients = [];
  if(charts) charts.forEach(this.addChart, this);
}


/**
 * Add a chart configuration
 *
 * @param {Object} chart
 * @api public
 */
DNodeSmoothie.prototype.addChart = function(chart) {
  if(!chart)
    throw new Error('You must provide a Chart configuration.');
  
  if(!chart.name || !chart.timeSeries) 
    throw new Error('You must provide a name and atleast one TimeSeries for each Chart');
    
  if(!chart.id) chart.id = sequentialId.get('chart');
  chart.timeSeries.forEach(this.addTimeSeries, this);
  this.charts.push(chart);
}

/**
 * Add a time series configuration, and create update interval
 *
 * @param {Object} timeSeries
 * @api private
 */
DNodeSmoothie.prototype.addTimeSeries = function(timeSeries) {

  if(!timeSeries.updateInterval || !timeSeries.name || !timeSeries.updateHandler)
    throw new Error('You must provide an name, update interval and update handler for each TimeSeries.');    

  if(!timeSeries.id) timeSeries.id = sequentialId.get('ts');
  setInterval(this.updateClients(timeSeries.id, timeSeries.updateHandler), timeSeries.updateInterval*1000);
  delete timeSeries.updateHandler;
}

/**
 * Returns a callback which runs a handler and updates connected clients
 *
 * @param {String} id
 * @param {Function} updateHandler
 * @api private
 */
DNodeSmoothie.prototype.updateClients = function(id, updateHandler) {
  var clients = this.clients;

  return function runUpdateHandler() {
    updateHandler(function(result) {
      async.forEach(clients, function(client) {
        client.updateTimeSeries(id, result);      
      }, function(){});
    });
  }
}

/**
 * Return a function to be used as DNode middleware
 *
 * @api public
 */
DNodeSmoothie.prototype.middleware = function() {
  var clients = this.clients,
      charts = this.charts;

  return function createMiddleware(remote, connection) {
    connection.on('remote', function(client) {
      if(client.createCharts && client.updateTimeSeries) {
        client.createCharts(charts, function(err) {
          if(!err) clients.push(client);
        });
      }
    });    
  }

}

/**
 * Sequential ID generator with basic namespacing
 *
 * @api private
 */
var sequentialId = (function() {
  var ids = {};

  return {
    get: function(type) {
      if(!ids[type]) ids[type] = 0;
      ids[type]++;
      return type + '-' + ids[type];
    }
  };
})();
