'use strict';

var mongoose = require('mongoose');
var User = mongoose.model('User');

var config = require('meanio').loadConfig();
var admins = config.admins.split(/\s/);


module.exports = {
  authenticate,
  isAdmin
};

function authenticate(req, res, next) {
  if(req.user) return next();
  if(!req.query.uid) {
    req.locals.error = {
      status: 403,
      message: 'User is not authorized'
    };
    return next();
  }

  User.findOne({
    uid: req.query.uid
  }, function(err, user) {
    if(err || !user) {
      req.locals.error = {
        status: 403,
        message: 'User is not authorized'
      };
      return next();
    }
    req.user = user;
    next();
  });
};

function isAdmin(req, res, next) {
  if(req.user && req.user.email) {
    req.user.isAdmin = admins.includes(req.user.email);
  }
  next()
}
