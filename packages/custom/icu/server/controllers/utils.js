'use strict';

var inspect = require('util').inspect;

exports.checkAndHandleError = function(err, defaultMessage, next) {
  if(err) {
    var errMesg = defaultMessage || err.errors || err.message || 'Oops...';
    next(new Error(errMesg));
  }
};

exports.errorHandler = function(err, req, res, next) {
  next(err);
};
