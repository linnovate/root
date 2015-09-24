'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(discussions, app, auth, database) {

  var DiscussionC = require('../../../general/server/providers/crud.js').Discussion,
      icapi = require('../../../general/server/providers/icapi.js'),
      config = require('meanio').loadConfig(),
      apiUri = config.api.uri,
      request = require('request'),
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

  app.get('/api/discussions/starred', function (req, res) {
    var objReq = {
      uri: apiUri + '/api/discussions/starred',
      method: 'GET',
      headers: req.headers
    };

    request(objReq, function (error, response, body) {
      if (!error && response.statusCode === 200 && response.body.length) {
        return res.json(JSON.parse(response.body));
      }
      if (response && response.statusCode !== 200)
        res.status(response.statusCode);
      var data = error ? error : JSON.parse(response.body);
      return res.json(data);
    });
  });

  app.patch('/api/discussions/:id/star', function (req, res) {
      var options = {
          method: 'PATCH',
          headers: req.headers,
          cmd: '/api/discussions/' + req.params.id + '/star'
      };

      icapi.talkToApi(options, function(data, statusCode){
          if(statusCode && statusCode != 200)
              res.status(statusCode);
          res.send(data);
      });
  });
};