'use strict';

module.exports = function(req, res, next) {
    console.log('sdsdsdsdsd');
    console.log(JSON.stringify(req.user));
    console.log('sdsdsdsdsd');
  if (!req.user) {
    req.locals.error = {
      status: 403,
      message: 'User is not authorized'
    };
  }

  next();
}
