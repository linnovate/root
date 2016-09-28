'use strict';

module.exports = function(req, res, next) {
  if (req.locals.result && (!req.locals.error || req.locals.error.status === 204)) {
    console.log("END");
    console.log(JSON.stringify(req.locals.result));
    res.status(200);
    res.send(req.locals.result);
  } else {
    next();
  }
}