var os = require('os'),
    express = require('express'),
    browserify = require('browserify'),
    dnode = require('dnode'),
    dnodeSmoothieCharts = require('dnode-smoothiecharts'),
    webServer;


var charts = [{
  name: 'Random',
  size: [500, 200],
  timeSeries: [{
    name: ['Line1', 'Line2'],
    updateInterval: 2, 
    updateHandler: function(cb) { 
      var rand1 = Math.random() * 100,
          rand2 = Math.random() * 100;

      cb([rand1, rand2]);
    }
  }]
},{
  name: 'Load Averages',
  size: [500,200],
  gridStyle: {
    strokeStyle:'rgb(125, 0, 0)',
    fillStyle:'rgb(60, 0, 0)',
    lineWidth: 1,
    millisPerLine: 250,
    verticalSections: 6,
  },
  labelStyle: { fillStyle:'#FFF' },
  timeSeries: [{
    name: ['Load 5', 'Load 10', 'Load 15'],
    style: [
      {strokeStyle: '#FF0033', lineWidth: 2}, 
      {strokeStyle: '#FF6600', lineWidth: 2}, 
      {strokeStyle: '#FFFF66', lineWidth: 2}
    ],
    updateHandler: function(cb) {
      cb(os.loadavg());
    },
    updateInterval: 5
  }]  
}];

webServer = express.createServer();
webServer.use(express.static(__dirname));
webServer.use(browserify({
  mount: '/dnode-smoothiecharts.js',
  require: ['dnode-smoothiecharts']
}));
dnode(new dnodeSmoothieCharts(charts).middleware()).listen(webServer);
webServer.listen(3000);
