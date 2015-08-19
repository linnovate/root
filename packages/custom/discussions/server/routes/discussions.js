'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(discussions, app, auth, database) {

  var DiscussionC = require('../../../general/server/providers/crud.js').Discussion,
      Discussion = new DiscussionC('/api/discussions');

  app.route('/api/discussions')
      .post(function(req, res) {
          Discussion.create({
          data: req.body,
          headers: req.headers
        }, function(data, statusCode) {
          if(statusCode && statusCode != 200)
            res.status(statusCode);
          res.send(data);
        });
      })
      .get(function(req, res) {
          Discussion.all({
              data: req.body,
              headers: req.headers
          }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
          });
      });


  app.route('/api/discussions/:discussionId')
      .get(function(req, res) {
          Discussion.get({
              param: req.params.discussionId,
              headers: req.headers
          }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
          });
      })
      .put(function(req, res) {
          Discussion.update({
              data: req.body,
              param: req.params.discussionId,
              headers: req.headers
            }, function(data, statusCode) {
              if(statusCode && statusCode != 200)
                  res.status(statusCode);
              res.send(data);
            });
      })

      .delete(function(req, res) {
        Discussion.delete({
          param: req.params.discussionId,
          headers: req.headers
        }, function(data, statusCode) {
            if(statusCode && statusCode != 200)
                res.status(statusCode);
            res.send(data);
        });
      });
};