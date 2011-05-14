/*!
 * DNode - Smoothie Charts
 * Copyright(c) 2011 Chris Partridge <chrisp@dynamicmethods.com.au>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */
require('dnode-smoothiecharts/smoothie');

/**
 * Initialize a new `DNodeSmoothieBrowser` object.
 *
 * @param {Array} charts
 * @api public
 */

var document = window.document;

exports = module.exports = DNodeSmoothieBrowser;

function DNodeSmoothieBrowser(config) {
	this.config = config;
	this.timeSeries = {};
}

DNodeSmoothieBrowser.prototype.middleware = function() {
	var self = this;
	return function(server, conn) {
		this.createCharts = function(charts, cb) {
			self.createCharts(charts, cb);
		}
		this.updateTimeSeries = function(id, value) {
			self.updateTimeSeries(id, value);
		}
	}
}

DNodeSmoothieBrowser.prototype.createCharts = function(charts, cb) {
	var self = this,
      el = document.getElementById(self.config.el);

	charts.forEach(function(chart) {

    var smoothieChart = new SmoothieChart({grid: chart.gridStyle, labels: chart.labelStyle}),
        highestInterval=0;

    chart.timeSeries.forEach(function(ts, index) {
      if(ts.updateInterval>highestInterval) highestInterval = ts.updateInterval;

      if(Array.isArray(ts.name)) {
      	var tsInstances = [],
            style = ts.style || [];

        ts.name.forEach(function(tsName, nameIndex) {
          var tsInstance = new TimeSeries(),
              instanceStyle = style[nameIndex] || {};

          tsInstances.push(tsInstance);
          smoothieChart.addTimeSeries(tsInstance, instanceStyle);
        });

        self.timeSeries[ts.id] = tsInstances;
      } else {
        var tsInstance = new TimeSeries();
        smoothieChart.addTimeSeries(tsInstance, ts.style);
        self.timeSeries[ts.id] = tsInstance;
      }
    });

    if(el && chart) {
      self.renderChart(el, chart, function(err, canvas) {
        smoothieChart.streamTo(canvas, highestInterval*1000);
      });
    }

	});

	cb();
}

DNodeSmoothieBrowser.prototype.renderChart = function(el, chart, cb) {
  var container = document.createElement('div'),
      header = document.createElement('h1'),
      textNode = document.createTextNode(chart.name),
      canvas = document.createElement('canvas');

      canvas.setAttribute('width', chart.size[0]);
      canvas.setAttribute('height', chart.size[1]);

      header.appendChild(textNode);
      container.appendChild(header);
      container.appendChild(canvas);

      el.appendChild(container);
    
      cb(null, canvas);
}

DNodeSmoothieBrowser.prototype.updateTimeSeries = function(id, value) {
	var ts;

  if(ts = this.timeSeries[id]) {
    if(Array.isArray(ts) && Array.isArray(value)) {
      ts.forEach(function(tsInstance, index) {
        tsInstance.append(new Date().getTime(), value[index]);
      });
    } else {
      ts.append(new Date().getTime(), value);
    }
  }
}
