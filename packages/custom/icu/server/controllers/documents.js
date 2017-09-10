var Document = require('../models/document');
/**
* req.params.id will consist mongoDB _id of the user
*/
exports.getByUserId = function(req,res,next){
  Document.find({
    $or:[ {watchers:{$elemMatch:{$eq:req.params.id}}} , {asign: req.params.id} ]
  }, function (err, data) {
    if (err) {
      req.locals.error = err;
      req.status(400);
    } else {
      req.locals.result = data
      res.send(data);
    }
});
}

exports.getByEntity = function(req,res,next){
  Document.find({
    $or:[ {watchers:{$elemMatch:{$eq:req.params.id}}} , {asign: req.params.id} ]
  }, function (err, data) {
    if (err) {
      req.locals.error = err;
      req.status(404);
    } else {
      req.locals.result = data
      res.send(data);
    }
});


};

exports.upload = function(req,res,next){

};