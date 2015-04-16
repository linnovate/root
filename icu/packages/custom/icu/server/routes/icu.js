'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(ICU, app, auth, database) {

  app.get('/icu/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/icu/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/icu/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/icu/example/render', function(req, res, next) {
    ICU.render('index', {
      package: 'icu'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
