'use strict';

var config = require('meanio').loadConfig(),
    apiUri = config.api.uri,
    icapi = require('../providers/icapi.js'),
    request = require('request');

module.exports = function(General, app, auth, database) {
    app.get('/api/:entity/:id/:issue', function(req, res) {
      req.pipe(request(apiUri + req.originalUrl)).pipe(res);
    });

    app.post('/api/:entity/:id/:issue', function (req, res) {
        var options = {
            method: 'POST',
            headers: req.headers,
            cmd: '/api/' + req.params.entity + '/' + req.params.id + '/' +  req.params.issue,
            gzip: true
        };

        icapi.talkToApi(options, function(data, statusCode){
            if(statusCode && statusCode != 200)
                res.status(statusCode);
            res.send(data);
        });
  });

};
