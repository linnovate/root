'use strict';

// User routes use users controller
var config = require('meanio').loadConfig(),
  apiUri = config.api.uri,
  request = require('request');

module.exports = function(MeanUser, app, auth, database) {

  var UserC = require('../providers/crud.js').User,
    User = new UserC('/api/users');

  app.route('/api/signout')
    .get(function(req, res) {
      var objReq = {
        uri: apiUri + '/api/logout',
        method: 'GET',
        headers: {
          connection: req.headers.connection,
          accept: req.headers.accept,
          'user-agent': req.headers['user-agent'],
          authorization: req.headers.authorization,
          'accept-language': req.headers['accept-language'],
          cookie: req.headers.cookie,
          'if-none-match': req.headers['if-none-match']
        }
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length)
          return res.redirect('/');
        if (response)
          return res.status(response.statusCode).send(response.body);

      });
    });

  // Setting up the users api
  app.route('/api/signup')
    .post(function(req, res) {

      var objReq = {
        uri: apiUri + '/api/register',
        method: 'POST',
        form: req.body
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length)
          return res.json(JSON.parse(response.body));
        if(response)
          return res.status(response.statusCode).send(response.body);
      });
    });

  // Setting the local strategy route
  app.route('/api/signin')
    .post(function(req, res) {

      var objReq = {
        uri: apiUri + '/api/login',
        method: 'POST',
        form: req.body
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length)
          return res.json(JSON.parse(response.body));
        if(response)
          return res.status(response.statusCode).send(response.body);

      });
    });

  app.route('/api/users')
    .get(function(req, res) {
      User.all({
        data: req.body,
        headers: req.headers
      }, function(data, statusCode) {
          res.status(statusCode);
          return res.send(data);
      });
    });


  app.route('/api/users/:id')
    .get(function(req, res) {
      User.get({
        param: req.params.id,
        headers: req.headers
      }, function(data, statusCode) {
          res.status(statusCode);
          return res.send(data);
      });
    })
    .put(function(req, res) {
      User.update({
        data: req.body,
        param: req.params.id,
        headers: req.headers
      }, function(data, statusCode) {
          res.status(statusCode);
          return res.send(data);
      });
    })
    .delete(function(req, res) {
      User.delete({
        param: req.params.id,
        headers: req.headers
      }, function(data, statusCode) {
          res.status(statusCode);
          return res.send(data);
      });
    });

  app.route('/api/avatar')
    .post(function(req, res) {

      var objReq = {
        uri: apiUri + '/api/avatar',
        method: 'post',
        headers: req.headers,
        gzip: true
      };

      req.pipe(
        request(objReq, function(error, response, body) {
          if (!error && response.statusCode === 200 && response.body.length)
            return res.json(JSON.parse(response.body));
          if(response)
            return res.status(response.statusCode).send(response.body);

        })
      );
    });

  app.route('/api/profile')
    .get(function(req, res) {
      var objReq = {
        uri: apiUri + '/api/profi',
        method: 'get',
        headers: req.headers
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200 && response.body.length)
          return res.json(JSON.parse(response.body));
        if(response)
          return res.status(response.statusCode).send(response.body);
      });
    });

  app.route('/api/profile')
    .put(function(req, res) {
      var objReq = {
        uri: apiUri + '/api/profile',
        method: 'put',
        headers: req.headers,
        json: req.body
      };

      request(objReq, function(error, response, body) {
        if (!error && response.statusCode === 200)
          return res.json(body);
        if(response)
          return res.status(response.statusCode).send(response.body);
      });
    });
};
