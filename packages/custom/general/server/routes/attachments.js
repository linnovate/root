'use strict';

var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
  request = require('request');

module.exports = function (General, app, auth, database) {
  app.get('/api/attachments/:id?', function (req, res) {
    var objReq = {
      uri: apiUri + '/api/attachments' + (req.params.id ? '/' + req.params.id : ''),
      method: 'GET',
      headers: req.headers,
      gzip: true
    };

    request(objReq, function (error, response, body) {
      if (!error && response.statusCode === 200 && response.body.length) {
        return res.json(JSON.parse(response.body));
      }

      return res.status(response.statusCode).send(response.body);
    });
  });

  app.post('/api/attachments', function (req, res) {
    var objReq = {
      uri: apiUri + '/api/attachments',
      method: 'POST',
      headers: req.headers
    };

    req.pipe(
      request(objReq, function (error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length) {
          return res.json(JSON.parse(response.body));
        }

        if (response) {
          return res.status(response.statusCode).send(response.body);
        }
      })
    );
  });
};
