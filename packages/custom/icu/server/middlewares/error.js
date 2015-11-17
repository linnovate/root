'use strict';

module.exports = function(req, res, next) {
  if (req.locals.error) {
    res.status(req.locals.error.status || 400)
       .send(req.locals.error);
  } else {
    next();
  }
};
