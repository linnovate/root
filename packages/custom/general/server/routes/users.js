'use strict';

// User routes use users controller
var config = require('meanio').loadConfig(),
  // apiUri = config.api.uri,
  apiUri = "http://localhost:3000",
  request = require('request');
  var users = require('../../../../core/users/server/controllers/users')
  var jwt = require('jsonwebtoken');
  

module.exports = function(MeanUser, app, auth, database,passport) {

  var UserC = require('../providers/crud.js').User,
    User = new UserC('/api/users');

  app.route('/api/signout')
    .get(users.signout);

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
  	.post(passport.authenticate('local', {
      failureFlash: false
    }), function(req, res) {      
      var payload = req.user;
      payload.redirect = req.body.redirect;
      var escaped = JSON.stringify(payload);      
      escaped = encodeURI(escaped);
      // We are sending the payload inside the token
      var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
      res.json({ token: token });
    });
    // .post(function(req, res) {

    //   var objReq = {
    //     uri: apiUri + '/api/login',
    //     method: 'POST',
    //     form: req.body
    //   };

    //   request(objReq, function(error, response, body) {
    //     if (!error && response.statusCode === 200 && response.body.length)
    //       return res.json(JSON.parse(response.body));
    //     if(response)
    //       return res.status(response.statusCode).send(response.body);

    //   });
    // });
};
