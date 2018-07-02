exports.echo = function(req, res, next) {
  'use strict';
  next();
};

exports.forceLogIn = function(req, res, next) {
  'use strict';

  if(!req.user) {
    return res.send(401, 'You must be logged in');
  }
  next();
};
