'use strict';

module.exports = function(entityName) {
  return function(req, res, next) {
    req.locals.data.entityName = entityName;
    next();
  };
};
