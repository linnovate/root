var crud = require('../controllers/crud.js');
var attachment = crud('attachments', options);
var Task = require('../models/task'),
  Attachment = require('../models/attachment');
var Document = require('../models/document');
var mean = require('meanio'),path = require('path'),fs = require('fs'),
  mkdirp = require('mkdirp'),config = require('meanio').loadConfig(),Busboy = require('busboy'),
  q = require('q'),request=require('request');
  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var Update = require('../models/update');
  var ObjectId = require(mongoose).Types.ObjectId;

function getUsers(users){
  var request = [];
  return new Promise(function(fulfill,reject){
    users.forEach(function(u){
      if(u.isCreator==undefined){
        request.push(new Promise(function(resolve,error){
          User.findOne({'_id':u.UserId}).exec(function(err,user){
            if(!err){
              u.UserId=user.id.substring(0,user.id.indexOf('@'));
              resolve(user);
            }
            else{
              error('error');
            }
          });
        }));
      }
      else{
        delete u.isCreator;
      }
    });
    Promise.all(request).then(function(dataAll){
      fulfill('success');
    }).catch(function(reason){
      reject('reject');
    });
  });
}
/**
*
* request includes entityName,fileType,entityId,watchers (As usernames)
*
*/

exports.uploadEmptyDocument = function(req , res){
  var entityNAme = req.body.entityName;
  var fileType = req.body.fileType;
  var entityId = req.body.entityId;
  var watchers = req.bodt.watchers;
  var user = req.user.email.substring(0,req.user.email.indexOf('@'));
  var json = {
    'user':user,
    'watchers':watchers,
    'fileType':fileType,
    'siteUrl':config.SPHelper.SPSiteUrl,
    'library':config.SPHelper.libraryName
  };
  request({
    'url':config.SPHelper.uri+"/api/uploadEmpty",
    'method':'POST',
    'json':json
  }, function(error,resp,body){
    var path = body.path;
    var fileName = path.substring(path.lastIndexOf('/')+1,path.length);
    var upd={
      'created':new Date(),
      'updated':new Date(),
      'issueId':new ObjectId(entityId),
      'issue':entityName,
      'creator':new ObjectId(req.user._id),
      'type':'document'
    };
    var update = new Update(upd);
    update.save(function(err,result1){
      var issueId = result1._id;
      var attach={
        'name':fileName,
        'path':path,
        'attachmentType':fileType,
        'created':new Date(),
        'creator':new ObjectId(req.user._id),
        'entity':entityName,
        'entityId':new ObjectId(entityId),
        'issue':'update',
        'issueId':issueId,
        'updated':new Date()
      };
      var attachment = new Attachment(attach);
      attachment.save(function(err,result2){
        var json = {
          'update':result1,
          'attachment':result2
        };
        json.attachment.creator=req.user;
        json.update.creator=req.user;
        res.json(json);
      });
    });
  });
};





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

/*
*
*req.params.entity contains the entity {project,discussion,office,}
*
*/
exports.getByEntity = function(req,res,next){
  Document.find({
    
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
  var d = formatDate(new Date());
    req.locals.data.documents = [];
    req.locals.data.body = {};
    var busboy = new Busboy({
      headers: req.headers
    });
    var hasFile = false;
    busboy.on('file', function (fieldname, file, filename) {
      var port = config.https && config.https.port ? config.https.port : config.http.port;
      var saveTo = path.join(config.attachmentDir, d, new Date().getTime() + '-' + path.basename(filename));
      var hostFileLocation = config.host + ':' + port + saveTo.substring(saveTo.indexOf('/files'));
      var fileType = path.extname(filename).substr(1).toLowerCase();
      mkdirp(path.join(config.attachmentDir, d), function () {
          file.pipe(fs.createWriteStream(saveTo)).on('close', function (err) {
            var arr = hostFileLocation.split("/files");
            var pathFor = "./files" + arr[1];
            var stats = fs.statSync(pathFor);
            console.log(pathFor + 'test path')
            var fileSizeInBytes = stats["size"];
            req.locals.data.body.size = fileSizeInBytes;
          });

        req.locals.data.body.name = filename;
          req.locals.data.body.path = hostFileLocation;
          req.locals.data.body.attachmentType = fileType;
          req.locals.data.body.size = file._readableState.length;
          hasFile = true;
      });
    });

    busboy.on('field', function (fieldname, val) {
      req.locals.data.body[fieldname] = val;
    });

    busboy.on('finish', function () {
      var user = req.user.email.substring(0,req.user.email.indexOf('@'));
      var path = req.locals.data.body.path.substring(req.locals.data.body.path.indexOf("/files"),req.locals.data.body.path.length);
      var fileName = path.substring(path.lastIndexOf('/')+1,path.length);

      req.locals.data.body.path = config.SPHelper.SPSiteUrl+"/"+config.SPHelper.libraryName+"/"+user+"/"+filename;
      var result = fs.readFile("."+path,function(err,result){
        result=JSON.parse(JSON.stringify(result));
        var coreOptions={
          "siteUrl":config.SPHelper.SPSiteUrl
        };
        var creds={
          "username":config.SPHelper.username,
          "password":config.SPHelper.password
        }
        var folder = config.SPHelper.libraryName+"/"+user;
        var fileOptions = {
          "folder":folder,
          "fileName":fileName,
          "fileContent":result
        };

        var entities={
          "project":"Project",
          "task":"Task",
          "discussion":"Discussion"
        };
        var query = req.acl.mongoQuery(entities[req.locals.data.body.entity]);
        query.findOne({
          _id:req.locals.data.body.entityId
        }).exec(function(err,entity){
          if(err){
            req.locals.error = err;
          }
          if(!entity){
            req.locals.error={
              status:404,
              message:'Entity not found'
            };
          }
          if(entity){
            var users = [];
            users.push({
              '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
              'Role':3,
              'UserId':user
            });
            entity.watchers.forEach(function(watcher){
              if(watcher!=req.user._id){
                users.push({
                  '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
                  'Role':2,
                  'UserId':watcher
                });
              }
            });
            getUsers(users).then(function(result){
              if(result=='success'){
                var json = {
                  'coreOptions':coreOptions,
                  'creds':creds,
                  'fileOptions':fileOptions,
                  'permissions':users,
                  'isTemplate':false,
                  'entity':req.locals.data.body.entity,
                  'entityId':req.locals.data.body.entityId
                };
                request({
                  'url':config.SPHelper.uri,
                  'method':'POST',
                  'json':json
                });
              }
              else{

              }
            });
          }
        });
      });
      if (!hasFile) {
          req.locals.error = {
            message: 'No file was attached'
          };
      }

      next();
    });

  return req.pipe(busboy);

};