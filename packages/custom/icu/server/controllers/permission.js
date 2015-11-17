exports.echo = function (req, res, next) {
  'use strict';

  console.log('general permissions');
  next();
};

exports.forceLogIn = function (req, res, next) {
  'use strict';

  if (!req.user) {
    return res.send(401, 'You must be logged in');
  }
  next();
};
