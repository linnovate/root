'use strict';

var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
  request = require('request');

module.exports = function(General, app, auth, database) {
  app.get('/api/:entity/:id/:issue', function(req, res) {
    var objReq = {
      uri: apiUri + '/api/' + req.params.entity + '/' + req.params.id + '/' +  req.params.issue,
      method: 'GET',
      headers: res.headers
    };

    request(objReq, function(error, response, body) {
      if (!error && response.statusCode === 200 && response.body.length)
        return res.json(JSON.parse(response.body));
      return res.status(response.statusCode).send(response.body);
    });
  });
};
