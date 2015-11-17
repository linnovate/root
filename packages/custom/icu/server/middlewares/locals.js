'use strict';

module.exports = function(req, res, next) {
  req.locals = {
    data: {}
  };
  next();
};
