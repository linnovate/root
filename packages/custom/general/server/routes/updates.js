'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(updates, app, auth, database) {

  var UpdateC = require('../providers/crud.js').Update,
      Update = new UpdateC('/api/updates');

  app.route('/api/updates')
      .post(function(req, res) {
          Update.create({
          data: req.body,
          headers: req.headers
        }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
        });
      })
      .get(function(req, res) {
          Update.all({
              data: req.body,
              headers: req.headers
          }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
          });
      });


  app.route('/api/updates/:updateId')
      .get(function(req, res) {
          Update.get({
              param: req.params.updateId,
              headers: req.headers
          }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
          });
      })
      .put(function(req, res) {
          Update.update({
              data: req.body,
              param: req.params.updateId,
              headers: req.headers
          }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
        });
      })

      .delete(function(req, res) {
        Update.delete({
          param: req.params.updateId,
          headers: req.headers
        }, function(data, statusCode) {
            if(statusCode && statusCode != 200)
                res.status(statusCode);
            res.send(data);
        });
      });
};