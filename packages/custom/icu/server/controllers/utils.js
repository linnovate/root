'use strict';

var inspect = require('util').inspect;

exports.errorHandler = function(err, req, res, next) {
  next(err);
};
