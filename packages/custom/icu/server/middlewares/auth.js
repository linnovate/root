'use strict';

module.exports = function(req, res, next) {
    console.log('current user');
    console.log(JSON.stringify(req.user));
  if (!req.user) {
    req.locals.error = {
      status: 403,
      message: 'User is not authorized'
    };
  }

  next();
}
