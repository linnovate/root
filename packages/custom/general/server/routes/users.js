'use strict';

// User routes use users controller
var config = require('meanio').loadConfig(),
  //apiUri = config.api.uri,
  request = require('request'),
  users = require('../../../../core/users/server/controllers/users.js'),
  jwt = require('jsonwebtoken'); 
module.exports = function(MeanUser, app, auth, database,passport) {

  var UserC = require('../providers/crud.js').User,
    User = new UserC('/api/users');

/*  app.route('/api/signout')
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
    });*/
    
    app.route('/api/signout')
    .get(users.signout);

/*  // Setting up the users api
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
    });*/
    
    app.route('/api/signup')
    .post(users.create);
    

  // Setting the local strategy route
//   app.route('/api/signin')
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
};
