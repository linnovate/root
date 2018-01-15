var Signature = require('../models/signature');


exports.createSignature = function(req,res,next){
    var signature = new Signature(req.body);
    signature.save(function(err,result){
        if(err){
            res.status(500).send(err);
        }
        else{
            res.status(200).send(result);
        }
    });
};


exports.removeSignature = function (req, res, next) {
    Signature.remove({
      _id : req.params.id
    }).then(function (result) {
        if (!result){
            res.status(500).send(error);
        }
        else{
            res.status(200).send("ok");
        }
      }); 
  };

exports.getByOffice = function (req, res, next) {
    Signature.find({
      office : req.params.id
    }).exec(function(err,data){
      if (err) {
        req.locals.error = err;
        req.status(400);
      }   
      else {
        req.locals.result = data
        res.send(data);
      } 
  });
  };