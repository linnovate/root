"use strict";

module.exports = function(req, res, next) {
  if (
    req.locals.result &&
    (!req.locals.error || req.locals.error.status === 204)
  ) {
    // var err = (req.acl.error && req.acl.error.error) ? req.acl.error.error : req.acl.error ;
    var err = req.acl.error;
    try {
      err = JSON.parse(err);
      err = err.error;
    } catch (err) {}

    // res.set('Warning', '{"circles":"'+ err +'"}');
    res.status(200);
    res.send(req.locals.result);
  } else {
    next();
  }
};
