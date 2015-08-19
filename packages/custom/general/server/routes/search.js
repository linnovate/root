'use strict';

var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
  request = require('request');

module.exports = function(General, app, auth, database) {
  app.get('/api/search', function(req, res) {
    var index = req.query.index ? ('&index=' + req.query.index) : '';

    var objReq = {
      uri: apiUri + '/api/search/?' + 'term=' + req.query.term + index,
      method: 'GET',
      headers: res.headers
    };

    request(objReq, function(error, response, body) {
      if (!error && response.statusCode === 200 && response.body.length)
        return res.json(JSON.parse(response.body));
      if(response)
        return res.status(response.statusCode).send(response.body);

    });
  });
};
