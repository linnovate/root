'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(General, app, auth, database) {

  app.get('/general/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/general/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/general/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/general/example/render', function(req, res, next) {
    General.render('index', {
      package: 'general'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
