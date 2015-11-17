'use strict';

module.exports = function(req, res, next) {
  if (!req.user) {
    req.locals.error = {
      status: 403,
      message: 'User is not authorized'
    };
  }

  next();
}
