'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Elasticsearch, app, auth, database) {

  app.get('/elasticsearch/ping', auth.requiresAdmin, function(req, res, next) {
    Elasticsearch.ping(function(err, result) {
      if (err) return res.json(500, result);
      res.json(200, result);
    });
  });

  app.get('/elasticsearch/config', auth.requiresAdmin, function(req, res, next) {
    Elasticsearch.settings(function(err,config) {
        if (err) return res.json(500);
        res.json(200,config?config.settings:{});
    });
  });

  app.post('/elasticsearch/config', auth.requiresAdmin, function(req, res, next) {
    Elasticsearch.settings(req.body, function(err,config) {
        if (err) return res.json(500);
        Elasticsearch.connect();
        res.json(200,config?config.settings:{});
    });
  });

  app.get('/elasticsearch', auth.requiresAdmin, function(req, res, next) {
    Elasticsearch.search(req.query, function(err, result) {
      if (err) return res.json(500, result);
      res.json(200, result);
    });
  });

  app.post('/elasticsearch', auth.requiresAdmin, function(req, res, next) {
      Elasticsearch.create(req.body, function(err, result) {
      if (err) return res.json(500, result);
      res.json(200, result);
    });
  });

};
