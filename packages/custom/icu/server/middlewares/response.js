'use strict';

module.exports = function(req, res, next) {
  
  console.log(req.locals.result)
  console.log(req.locals.error)
  if (req.locals.result && (!req.locals.error || req.locals.error.status === 204)) {
    // var err = (req.acl.error && req.acl.error.error) ? req.acl.error.error : req.acl.error ;
   if (req.acl) {
      var err = req.acl.error;
      try{
        err = JSON.parse(err);
        err = err.error;
      }
      catch(err) {}

      // res.set('Warning', '{"circles":"'+ err +'"}');
   }
    
    res.status(200);
    res.send(req.locals.result);
  } else {
    next();
  }
}