'use strict';

var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
    icapi = require('../providers/icapi.js'),
    request = require('request');

module.exports = function(General, app, auth, database) {
  app.get('/api/search', function(req, res) {
    var index = req.query.index ? ('&index=' + req.query.index) : '';

    var options = {
      cmd: '/api/search/?' + 'term=' + encodeURI(req.query.term) + index,
      method: 'GET',
      gzip: true,
      headers: req.headers
    };

    icapi.talkToApi(options, function(data, statusCode){
      if(statusCode && statusCode != 200)
        res.status(statusCode);
      res.send(data);
    });
  });
};
