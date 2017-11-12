var crud = require('../controllers/crud.js');
var Task = require('../models/task'), Attachment = require('../models/attachment');
var Document = require('../models/document');
var mean = require('meanio'), path = require('path'), fs = require('fs'),
  mkdirp = require('mkdirp'), config = require('meanio').loadConfig(), Busboy = require('busboy'),
  q = require('q'), request = require('request');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Update = require('../models/update');
var Folder = require('../models/folder');
var ObjectId = require('mongoose').Types.ObjectId;
var _ = require('lodash');



var options = {
  includes: 'assign watchers',
  defaults: { watchers: [] }
};

exports.defaultOptions = options;

function getDocuments(entity, id) {
  var result = [];
  return new Promise(function (fulfill, reject) {
    Document.find({
      'entity': entity,
      'entityId': id
    }, function (err, docs) {
      if (err) {
        reject('error');
      }
      else {
        for (var i = 0; i < docx.length; i++) {
          result.push(docx[i]._doc.path);
        }
        fulfill(result);
      }
    });
  });
}


var formatDate = function (date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();
  return yyyy + '/' + (mm[1] ? mm : '0' + mm[0]) + '/' + (dd[1] ? dd : '0' + dd[0]);
};


function getCreators(paths) {
  var assigns = [];
  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    var path2 = path.substring(0, path.lastIndexOf('/'));
    var folderName = path2.substring(path2.lastIndexOf('/') + 1, path2.length);
    assigns.push(folderName);
  }
  return assigns;
}



function getUsers(users) {
  var request = [];
  return new Promise(function (fulfill, reject) {
    users.forEach(function (u) {
      if (u.isCreator == undefined) {
        request.push(new Promise(function (resolve, error) {
          User.findOne({ '_id': u.UserId }).exec(function (err, user) {
            if (!err) {
              u.UserId = user.id.substring(0, user.id.indexOf('@'))+"@aman";
              u.UserId=u.UserId.toLowerCase();
              resolve(user);
            }
            else {
              error('error');
            }
          });
        }));
      }
      else {
        delete u.isCreator;
      }
    });
    Promise.all(request).then(function (dataAll) {
      fulfill('success');
    }).catch(function (reason) {
      reject('reject');
    });
  });
}

/**
exports.uploadEmpty = function(req,res,next){
  var user = req.user.email.substring(0,req.user.email.indexOf('@')).toLowerCase();
  var users = [];
  var watchers = req.body.watchers;
  if(watchers){
    watchers.forEach(function(w){
      if(w!=req.user._id){
      users.push({'UserId':w});
    }
    });
  };

  var forNotice = req.body.forNotice;
  if(forNotice){
    forNotice.forEach(function(w){
      if(w!=req.user._id){
      users.push({'UserId':w});
    }
    });
  };

  var doneBy = req.body.doneBy;
  if(doneBy){
    doneBy.forEach(function(w){
      if(w!=req.user._id){
        users.push({'UserId':w});
      }
    });
  };
  var assign = req.body.assign;
  if(assign && assign!=req.user._id){
    users.push({'UserId':assign});
  }

  getUsers(users).then(function(result){
    var perm=[];
    users.forEach(function(u){
      perm.push(u.UserId.substring(0,u.UserId.indexOf('@')).toUpperCase());
    });
    if(result=='success'){
      var json = {
        'siteUrl':config.SPHelper.SPSiteUrl,
        'library':config.SPHelper.libraryName,
        'user':user.toUpperCase(),
        'watchers':perm,
        'fileType':'docx'
      };
      console.log("===UPLOAD EMPTY JSON===");
      console.dir(json);
      request({
        'url':config.SPHelper.uri+"/api/uploadEmpty",
        'method':'POST',
        'json':json
      },function(error,resp,body){
        if(error){
          res.send(error);
        }
        else{
          console.log('Return value:');
          console.dir(body);
          var fileName = body.path.substring(body.path.lastIndexOf('/')+1,body.path.length);
          var fileType = body.path.substring(body.path.lastIndexOf('.')+1,body.path.length);
          var set = {'spPath':body.path,'serial':body.serial,'documentType':fileType,'title':fileName}
          Document.update({'_id':req.body._id},{$set:set},function(error,result){
            if(error){
              res.send(error);
            }
            else{
              res.send(set);
            }
          });
        }
      });
    }
  });

};

*/

exports.addSerialTitle = function(req,res,next){
  var json = {
    'siteUrl':config.SPHelper.SPSiteUrl,
    'fileUrl':req.body.spPath
  };
  console.log("===UPLOAD EMPTY JSON===");
  console.dir(json);
  request({
    'url':config.SPHelper.uri+"/api/addSerialTitle",
    'method':'POST',
    'json':json
  },function(error,resp,body){
        if(error){
          res.send(error);
        }
        else{
          var set = {'serial':body.serial};
          Document.update({'_id':req.body._id},{$set:set},function(error,result){
            if(error){
              res.send(error);
            }
            else{
              res.send(set);
            }
          });
        }
      });
};
 


exports.uploadDocumentsFromTemplate = function(req,res,next){
  var template = req.body.templateDoc;
  var officeDocument = req.body.officeDocument;
  if(template.spPath){
    var fileName = template.spPath.substring(template.spPath.lastIndexOf('/')+1,template.spPath.length);
    fileName=fileName.substring(fileName.indexOf('_')+1,fileName.length);
    var user = req.user.email.substring(0,req.user.email.indexOf('@'));
    var folder = config.SPHelper.libraryName+"/"+user;
    var templateUrl = template.spPath.substring(template.spPath.indexOf("/ICU"),template.spPath.length);
    var serverName = config.SPHelper.serverName;
    var coreOptions={
      "siteUrl":config.SPHelper.SPSiteUrl
    };
    var creds={
      "username":config.SPHelper.username,
      "password":config.SPHelper.password
    };
    var folder = config.SPHelper.libraryName+"/"+user;
    var fileOptions = {
      "folder":folder,
      "fileName":fileName,
      "fileContent":undefined
    };
    var users = [];
      users.push({
        '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
        'Role':3,
        'UserId':user+'@aman',
        'isCreator':true
      });
      officeDocument.watchers.forEach(function(watcher){
        if(watcher!=req.user._id){
          users.push({
            '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
            'Role':2,
            'UserId':watcher
          });
        }
      });
      if(officeDocument.forNotice){
        officeDocument.forNotice.forEach(function(notice){
          if(notice!=req.user._id){
            users.push({
              '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
              'Role':2,
              'UserId':notice
            });
          }
        });
      }
      if(officeDocument.doneBy){
        officeDocument.doneBy.forEach(function(done){
          if(done!=req.user._id){
            users.push({
              '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
              'Role':2,
              'UserId':done
            });
          }
        });
      }
      if(officeDocument.assign){
        users.push({
            '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
            'Role':2,
            'UserId':officeDocument.assign
          });
      }
     
      getUsers(users).then(function(result){
          if(result=='success'){
              var json = {
                'serverName':serverName,
                'templateUrl':templateUrl,
                'coreOptions':coreOptions,
                'creds':creds,
                'fileOptions':fileOptions,
                'permissions':users,
                'isTemplate':false,
                'entity':'folder',
                'entityId':officeDocument.folder
              };
              request({
                'url':config.SPHelper.uri+"/api/uploadTemplate",
                'method':'POST',
                'json':json
              },function(error,resp,body){

                if(error){
                  var set = {'path':template.path,'title':template.title,'documentType':template.templateType};
                  Document.update({'_id':officeDocument._id},{$set:set},function(error,result){
                    if(error){
                      res.send(error);
                    }
                    else{
                      res.send(set);
                    }
                  });

                }
                else{
                  var set = {'spPath':body.path,'path':template.path,'title':template.title,'documentType':template.templateType};
                  Document.update({'_id':officeDocument._id},{$set:set},function(error,result){
                    if(error){
                      res.send(error);
                    }
                    else{
                      res.send(set);
                    }
                  });

                }
          });
  }
    else{
      res.send('error');
    }
});

}
else{
    var set = {'path':template.path,'title':template.title,'documentType':template.templateType};
        Document.update({'_id':officeDocument._id},{$set:set},function(error,result){
            if(error){
                res.send(error);
            }
            else{
              res.send(set);
          }
        });
}
}
/**
*
* request body includes entityName,fileType,entityId,watchers (As usernames)
*
*/

exports.uploadEmptyDocument = function (req, res, next) {
  var entityName = req.body.entityName;
  var fileType = req.body.fileType;
  var entityId = req.body.entityId;
  var watchers = req.bodt.watchers;
  var user = req.user.email.substring(0, req.user.email.indexOf('@'));
  var json = {
    'user': user,
    'watchers': watchers,
    'fileType': fileType,
    'siteUrl': config.SPHelper.SPSiteUrl,
    'library': config.SPHelper.libraryName
  };
  request({
    'url': config.SPHelper.uri + "/api/uploadEmpty",
    'method': 'POST',
    'json': json
  }, function (error, resp, body) {
    var path = body.path ? body.path : "/undefined";
    var fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    var upd = {
      'created': new Date(),
      'updated': new Date(),
      'issueId': new ObjectId(entityId),
      'issue': entityName,
      'creator': new ObjectId(req.user._id),
      'type': 'document'
    };
    var update = new Update(upd);
    update.save(function (err, result1) {
      var issueId = result1._id;
      var attach = {
        'name': fileName,
        'path': path,
        'attachmentType': fileType,
        'created': new Date(),
        'creator': new ObjectId(req.user._id),
        'entity': entityName,
        'entityId': new ObjectId(entityId),
        'issue': 'update',
        'issueId': new ObjectId(issueId),
        'updated': new Date()
      };
      var attachment = new Attachment(attach);
      attachment.save(function (err, result2) {
        var json = {
          'update': result1,
          'attachment': result2
        };
        json.attachment.creator = req.user;
        json.update.creator = req.user;
        res.json(json);
      });
    });
  });
};


/**
* req.params.id will consist mongoDB _id of the user
*/
exports.getAll = function (req, res, next) {
  Document.find({
    $or: [{ watchers: { $in: [req.user._id] } }, { assign: req.user._id }]
  }).populate('folder')
  .populate('creator')
  .populate('updater')
  .populate('sender')
  .populate('sendingAs')
  .populate('assign')
  .populate('relatedDocuments')
  .populate('forNotice')
  .populate('watchers')
  .populate('doneBy')
  .exec(function(err,data){
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



/**
* req.params.id will consist mongoDB _id of the document
*/
exports.getById = function (req, res, next) {
  Document.find({
    _id: req.params.id
  }, function (err, data) {
    if (err) {
      req.locals.error = err;
      res.status(400);
    } else {
      req.locals.result = data
      res.send(data);
    }
  });
}

/**
* req.params.id will consist mongoDB _id of the user
*/
exports.getByUserId = function (req, res, next) {
  Document.find({
    $or: [{ watchers: { $elemMatch: { $eq: req.params.id } } }, { asign: req.params.id }]
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
*req.params.id contains the entity mongoDB id
*/
exports.getByFolder = function (req, res, next) {
  Document.find({
    folder: req.params.id
  }).populate('folder')
    .populate('creator')
    .populate('updater')
    .populate('sender')
    .populate('sendingAs')
    .populate('assign')
    .populate('relatedDocuments')
    .populate('forNotice')
    .populate('watchers').exec(function(err,data){
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




exports.upload = function (req, res, next) {
  req.locals.data={};
  req.locals.data.body={};
  var d = formatDate(new Date());
  var busboy = new Busboy({
    headers: req.headers
  });
  var hasFile = false;
  busboy.on('file', function (fieldname, file, filename) {
    console.log("I got a file  "+filename);
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
      req.locals.data.body.originalPath = hostFileLocation;
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
    req.locals.data.body.path = config.SPHelper.SPSiteUrl+"/"+config.SPHelper.libraryName+"/"+user+"/"+req.locals.data.body.name;
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

      if(req.locals.data.body['folderId']){
        var folderId = req.locals.data.body['folderId'];
        Folder.findOne({
          _id:folderId
        }).exec(function(err,folder){
          if(err){
            req.locals.error = err;
          }
          if(!folder){
            req.locals.error={
              status:404,
              message:'Entity not found'
            };
          }
          if(folder){
            var users = [];
              users.push({
                '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
                'Role':3,
                'UserId':user,
                'isCreator':true
              });
              folder.watchers.forEach(function(watcher){
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
                    'entity':'folder',
                    'entityId':folderId
                  };
                  request({
                    'url':config.SPHelper.uri+"/api/upload",
                    'method':'POST',
                    'json':json
                  },function(error,resp,body){
                   // if(error){
                   //   res.send(error);
                   // }
                    //else{
                      //var path = body.path;
                      var path = 'Path path path hahaha';
                      var doc = {
                        'created': new Date(),
                        'updated':new Date(),
                        'title':fileName.substring(fileName.indexOf('-')+1,fileName.length),
                        'status':'new',
                        'path':path,
                        'description':'', //important
                        'serial':'',
                        'folder':new ObjectId(folderId),
                        'creator':new ObjectId(req.user._id),
                        'updater':new ObjectId(req.user._id),
                        'sender':new ObjectId(req.user._id),
                        'sendingAs': new ObjectId(),
                        'assign': new ObjectId(req.user._id),
                        'classification':'',//important
                        'size':0,
                        'circles':[],
                        'relatedDocuments':[],//important
                        'watchers':folder.watchers,//important
                        'documentType':fileName.substring(fileName.indexOf('.')+1,fileName.length),     
                      };
                      var obj = new Document(doc);
                      obj.save(function(error,result){
                        if(error){
                          res.send(error);
                        }
                        else{
                          res.send(result);
                        }
                      });
                   // }
                  });
                }
                else{
                  res.send(error);
                }
              });
                    }
                  });
      }
      else{
        var users = [];
        users.push({
          '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
          'Role':3,
          'UserId':user,
          'isCreator':true
        });
        var json = {
          'coreOptions':coreOptions,
          'creds':creds,
          'fileOptions':fileOptions,
          'permissions':users,
          'isTemplate':false,
          'entity':'folder',
          'entityId':folderId
        };
        request({
          'url':config.SPHelper.uri+"/api/upload",
          'method':'POST',
          'json':json
        },function(error,resp,body){
           // if(error){
           //   res.send(error);
           // }
           // else{
           //   var path = body.path;
           var path=req.locals.data.body.originalPath;
              var doc = {
                'created': new Date(),
                'updated':new Date(),
                'title':fileName.substring(fileName.indexOf('-')+1,fileName.length),
                'status':'new',
                'path':path,
                'description':'', //important
                'serial':'',
                'folder':undefined,
                'creator':new ObjectId(req.user._id),
                'updater':new ObjectId(req.user._id),
                'sender':new ObjectId(req.user._id),
                'sendingAs': new ObjectId(),
                'assign': new ObjectId(req.user._id),
                'classification':'',//important
                'size':0,
                'circles':[],
                'relatedDocuments':[],//important
                'watchers':[req.user._id],//important
                'documentType':fileName.substring(fileName.indexOf('.')+1,fileName.length),     
              };
              var obj = new Document(doc);
              obj.save(function(error,result){
                if(error){
                  res.send(error);
                }
                else{
                  res.send(result);
                }
              });
           // }
          });
        }
      });
      })

      return req.pipe(busboy);
};


exports.getByPath = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }
  //var query = req.acl.mongoQuery('Document');
  var path = decodeURI(req.url).replace(/pdf$/, '');
  var conditions = {
    path: new RegExp(path)
  };
  Document.findOne(conditions).exec(function (err, attachment) {
    if (err) {
      req.locals.error = err;
    }
    if (!attachment) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    next();
  })
};



exports.uploadFileToDocument = function(req,res,next){
  req.locals.data={};
  req.locals.data.body={};
  var d = formatDate(new Date());
  var busboy = new Busboy({
    headers: req.headers
  });
  var hasFile = false;
  busboy.on('file', function (fieldname, file, filename) {
    console.log("I got a file  "+filename);
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
      req.locals.data.body.originalPath = hostFileLocation;
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
    req.locals.data.body.path = config.SPHelper.SPSiteUrl+"/"+config.SPHelper.libraryName+"/"+user+"/"+req.locals.data.body.name;
    var result = fs.readFile("."+path,function(err,result){
      result=JSON.parse(JSON.stringify(result));
      var coreOptions={
        "siteUrl":config.SPHelper.SPSiteUrl
      };
      var creds={
        "username":config.SPHelper.username,
        "password":config.SPHelper.password,
      }
      var folder = config.SPHelper.libraryName+"/"+user;
      var fileOptions = {
        "folder":folder,
        "fileName":fileName,
        "fileContent":result
      };
      var documentId = req.locals.data.body['id'];
      Document.findOne({
        _id:documentId
      }).exec(function(err,result){
      if(err){
        req.locals.error = err;
      }
      if(!result){
        req.locals.error={
          status:404,
          message:'Entity not found'
        };
      }
      if(result){
        var folderId = result.folder;
            var users = [];
              users.push({
                '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
                'Role':3,
                'UserId':user.toLowerCase()+'@aman',
                'isCreator':true
              });
              result.watchers.forEach(function(watcher){
                if(watcher!=req.user._id){
                  users.push({
                    '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
                    'Role':2,
                    'UserId':watcher
                  });
                }
              });
              result.forNotice.forEach(function(notice){
                if(notice!=req.user._id){
                  users.push({
                    '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
                    'Role':2,
                    'UserId':notice
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
                    'entity':'folder',
                    'entityId':req.locals.data.body['folderId']
                  };
                  console.log("\n\n\n\n\n\nJSON");
                  console.dir(json);
                  request({
                    'url':config.SPHelper.uri+"/api/upload",
                    'method':'POST',
                    'json':json
                  },function(error,resp,body){
                    if(error){
                      var path = req.locals.data.body.originalPath;
                      var fileType = path.substring(path.lastIndexOf('.')+1,path.length);
                      var set = {'path':req.locals.data.body.originalPath,'title':req.locals.data.body.name,'documentType':fileType};
                        Document.update({'_id':documentId},{$set:set},function(error,result){
                        if(error){
                          res.send(error);
                        }
                        else{
                          res.send(set);
                        }
                      });
                    }
                    else{
                      var spPath = body.path;
                      var path = req.locals.data.body.originalPath;
                      var fileType = path.substring(path.lastIndexOf('.')+1,path.length);
                      var set = {'path':req.locals.data.body.originalPath,'spPath':spPath,'title':req.locals.data.body.name,'documentType':fileType};
                      Document.update({'_id':documentId},{$set:set},function(error,result){
                        if(error){
                          res.send(error);
                        }
                        else{
                          res.send(set);
                        }
                      });
                    }
                    });
                  }
                  else{
                    res.send('error');
                  }
                });
              }
            });
          });
        });
        return req.pipe(busboy);
      };








exports.create = function(req,res,next){
  var folder = req.body.folder;//contains folder Id
  if(!folder){
    var doc = {
      'created': new Date(),
      'updated':new Date(),
      'title':'',
      'status':'new',
      'path':undefined,
      'spPath':undefined,
      'description':'', //important
      'serial':'',
      'folder':undefined,
      'creator':new ObjectId(req.user._id),
      'updater':new ObjectId(req.user._id),
      'sender':new ObjectId(req.user._id),
      'sendingAs': new ObjectId(),
      'assign': new ObjectId(req.user._id),
      'classification':'',//important
      'size':0,
      'circles':[],
      'relatedDocuments':[],//important
      'watchers':[req.user._id],//important
      'doneBy':[],
      'forNotice':[],
      'documentType':''  
    };
    var obj = new Document(doc);
    obj.save(function(error,result){
      if(error){
        res.send(error);
      }
      else{
        res.send(result);
      }
    });
  }
  else{
    Folder.findOne({'_id':folder}).exec(function(err,folderObj){
      if(err){
        res.send(err);
      }
      else{
        var doc = {
          'created': new Date(),
          'updated':new Date(),
          'title':'',
          'status':'new',
          'path':undefined,
          'description':'', //important
          'serial':'',
          'folder':new ObjectId(folder),
          'creator':new ObjectId(req.user._id),
          'updater':new ObjectId(req.user._id),
          'sender':new ObjectId(req.user._id),
          'sendingAs': new ObjectId(),
          'assign': new ObjectId(req.user._id),
          'classification':'',//important
          'size':0,
          'circles':[],
          'relatedDocuments':[],//important
          'watchers':folderObj.watchers,//important
          'documentType':'',     
        };
        var obj = new Document(doc);
        obj.save(function(error,result){
          if(error){
            res.send(error);
          }
          else{
            res.send(result);
          }
        });
    }
  });
}
};

/**
*
* Assumes req.body contains description,sendingAsId,classification,relatedDocuments array of documents ids
* and watchers
*
*
*
*/

// exports.upload = function(req,res,next){
//   var d = formatDate(new Date());
//   var busboy = new Busboy({
//     headers: req.headers
//   });
//   var hasFile = false;
//   busboy.on('file', function (fieldname, file, filename) {
//     var port = config.https && config.https.port ? config.https.port : config.http.port;
//     var saveTo = path.join(config.attachmentDir, d, new Date().getTime() + '-' + path.basename(filename));
//     var hostFileLocation = config.host + ':' + port + saveTo.substring(saveTo.indexOf('/files'));
//     var fileType = path.extname(filename).substr(1).toLowerCase();
//     mkdirp(path.join(config.attachmentDir, d), function () {
//         file.pipe(fs.createWriteStream(saveTo)).on('close', function (err) {
//           var arr = hostFileLocation.split("/files");
//           var pathFor = "./files" + arr[1];
//           var stats = fs.statSync(pathFor);
//           console.log(pathFor + 'test path')
//           var fileSizeInBytes = stats["size"];
//           req.locals.data.body.size = fileSizeInBytes;
//         });
//         req.locals.data.body.name = filename;
//         req.locals.data.body.path = hostFileLocation;
//         req.locals.data.body.attachmentType = fileType;
//         req.locals.data.body.size = file._readableState.length;
//         hasFile = true;
//     });
//   });

//   busboy.on('field', function (fieldname, val) {
//     req.locals.data.body[fieldname] = val;
//   });

//   busboy.on('finish', function () {
//     var user = req.user.email.substring(0,req.user.email.indexOf('@'));
//     var path = req.locals.data.body.path.substring(req.locals.data.body.path.indexOf("/files"),req.locals.data.body.path.length);
//     var fileName = path.substring(path.lastIndexOf('/')+1,path.length);
//     req.locals.data.body.path = config.SPHelper.SPSiteUrl+"/"+config.SPHelper.libraryName+"/"+user+"/"+filename;
//     var result = fs.readFile("."+path,function(err,result){
//       result=JSON.parse(JSON.stringify(result));
//       var coreOptions={
//         "siteUrl":config.SPHelper.SPSiteUrl
//       };
//       var creds={
//         "username":config.SPHelper.username,
//         "password":config.SPHelper.password
//       }
//       var folder = config.SPHelper.libraryName+"/"+user;
//       var fileOptions = {
//         "folder":folder,
//         "fileName":fileName,
//         "fileContent":result
//       };
//       var query = req.acl.mongoQuery("Folder");
//       query.findOne({
//         _id:req.locals.data.body["folderId"]
//       }).exec(function(err,entity){
//         if(err){
//           req.locals.error = err;
//         }
//         if(!entity){
//           req.locals.error={
//             status:404,
//             message:'Entity not found'
//           };
//         }
//         if(entity){
//           var users = [];
//           users.push({
//             '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
//             'Role':3,
//             'UserId':user
//           });
//           entity.watchers.forEach(function(watcher){
//             if(watcher!=req.user._id){
//               users.push({
//                 '__metadata':{'type':'SP.Sharing.UserRoleAssignment'},
//                 'Role':2,
//                 'UserId':watcher
//               });
//             }
//           });
//           getUsers(users).then(function(result){
//             if(result=='success'){
//               var json = {
//                 'coreOptions':coreOptions,
//                 'creds':creds,
//                 'fileOptions':fileOptions,
//                 'permissions':users,
//                 'isTemplate':false,
//                 'entity':req.locals.data.body.entity,
//                 'entityId':req.locals.data.body.entityId
//               };
//               request({
//                 'url':config.SPHelper.uri+"/api/upload",
//                 'method':'POST',
//                 'json':json
//               },function(error,resp,body){
//                 if(error){
//                   res.send(error);
//                 }
//                 else{
//                   var path = body.path;
//                   var doc = {
//                     'created': new Date(),
//                     'updated':new Date(),
//                     'name':fileName,
//                     'path':body.path,
//                     'description':req.body.description, //important
//                     'serial':body.serial,
//                     'documentType':fileName.substring(fileName.indexOf('.')+1,fileName.length),
//                     'entity': req.locals.data.body.entity,
//                     'entityId':req.locals.data.body.entityId,
//                     'creator':new ObjectId(req.user._id),
//                     'updater':new ObjectId(req.user._id),
//                     'sender':new ObjectId(req.user._id),
//                     'sendingAs':new ObjectId(req.body.sendingAsId), //important
//                     'assign': new ObjectId(req.user._id),
//                     'classification':req.body.classification,//important
//                     'relatedDocuments':req.body.relatedDocuments,//important
//                     'watchers':req.body.watchers//important
//                   };
//                   Document.save(doc,function(error,result){
//                     if(error){
//                       res.send(error);
//                     }
//                     else{
//                       res.send(result);
//                     }
//                   });
//                 }
//               });
//             }
//             else{
//               res.send(error);
//             }
//           });
//           }
//         });
//       });
//       if (!hasFile) {
//           req.locals.error = {
//             message: 'No file was attached'
//           };
//       }

//       next();
//     });

//   return req.pipe(busboy);

// };



/**
*
* req.params.id contains document mongo id to delete
*
*/
exports.deleteDocument = function (req, res) {
  Document.find({ _id: req.params.id }, function (err, file) {
    if (err) {
      console.log(err);
    }
    else {
      var spPath = file[0]._doc.spPath;
      if(spPath){
      var fileName = spPath.substring(spPath.lastIndexOf("/") + 1, spPath.length);
      var spPath2 = spPath.substring(0, spPath.lastIndexOf("/"));
      var folderName = spPath.substring(spPath2.lastIndexOf("/") + 1, spPath2.length);
      var spPath2 = spPath2.substring(0, spPath2.lastIndexOf("/"));
      var libraryName = spPath2.substring(spPath2.lastIndexOf("/") + 1, spPath2.length);
      var user = req.user.email.substring(0, req.user.email.indexOf('@'));
      var context = {
        'siteUrl': config.SPHelper.SPSiteUrl,
        'creds': {
          'username': config.SPHelper.username,
          'password': config.SPHelper.password,
          'domain':config.SPHelper.domain
        }
      };
      var options = {
        'folder': '/' + libraryName + '/' + folderName,
        'filePath': '/' + fileName
      };

      var json = {
        'context': context,
        'options': options
      };
      request({
        'url': config.SPHelper.uri + '/api/delete',
        'method': 'POST',
        'json': json
      }, function (error, resp, body) {
     //   var creator = folderName;
     //   if (creator == user) {
      //  }
      });


    }
    }

    Document.remove({ _id: req.params.id }, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        res.sendStatus(200);
      }
    });
  });
  
}

/**
* req.body contains zero permission array,entityName,entityId,description,name,assign,classification,relatedDocuments
*
*
*
*
*/
exports.update2 = function (req, res, next) {
  var zeroReq = [];
  for (var i = 0; i < req.locals.result.zero.length; i++) {
    zeroReq.push({ 'UserId': req.body.zero[i] });
  };
  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    offices: 'office',
    folders: 'folder'
  };
  var entity = entities[req.body.entityName];
  var entityId = req.body.entityId;
  var id = req.params.id;
  getDocuments(entity, id).then(function (documents) {
    var watchArray = req.body.watchers;
    watchArray.push(req.body.assign);
    Document.update({
      '_id': id,
    }, {
        'watchers': watchArray,
        'description': req.body.description,
        'updated': new Date(),
        'name': req.body.name,
        'assign': req.body.assign,
        'classification': req.body.classification,
        'relatedDocuments': relatedDocuments,
      }, {
        'multi': true
      }, function (err, numAffected) {
        if (documents != null && documents != undefined && (documents.length > 0)) {
          var watchReq = [];
          for (var i = 0; i < watchArray.length; i++) {
            if (watchArray[i] != undefined) {
              var str = watchArray[i].toString();
              watchReq.push({ 'UserId': str });
            }
          }
          getUsers(watchReq).then(function (res) {
            var users = [];
            for (var i = 0; i < watchReq.length; i++) {
              users.push(watchReq[i].UserId);
            }
            var creators = getCreators(documents);
            getUsers(zeroReq).then(function (result) {
              var zero = [];
              for (var i = 0; i < zeroReq.length; i++) {
                zero.push(zeroReq[i].UserId);
              }
              var json = {
                'siteUrl': config.SPHelper.SPSiteUrl,
                'paths': documents,
                'users': users,
                'creators': creators,
                'zero': zero
              };
              request({
                'url': config.SPHelper.uri + "/api/share",
                'method': 'POST',
                'json': json
              }, function (error, resp, body) {
                if (error) {
                  res.send('error');
                }
                else {
                  res.send('OK');
                }
              });
            });
          });
        }
      });
    next();
  });

};




exports.update = function (req, res, next) {
  var docToUpdate;
  if(req.body.name){
    if(req.body.name=='watchers'){
      var watchers = req.body.newVal;
      Document.findOne({'_id':req.params.id},function(err,doc){
        docToUpdate = doc;
        var oldWatchers=[];
        doc.watchers.forEach(function(w){
          oldWatchers.push(w.toString());
        });
        var spPath = doc.spPath;
        if(spPath){
          var watchersReq=[],oldWatchersReq=[];
          oldWatchers.forEach(function(w){
            oldWatchersReq.push({
              'type':'SP.Sharing.UserRoleAssignment',
              'Role':2,
              'UserId':w,
            });
          });
          watchers.forEach(function(w){
            watchersReq.push({
              'type':'SP.Sharing.UserRoleAssignment',
              'Role':2,
              'UserId':w,
            });
          });
          var creator = [{
              'type':'SP.Sharing.UserRoleAssignment',
              'Role':2,
              'UserId':doc.assign.toString(),
            }];
          getUsers(creator).then(function(){
            getUsers(watchersReq).then(function(){
              getUsers(oldWatchersReq).then(function(){
                var users = [],zero=[];
                watchersReq.forEach(function(w){
                  users.push(w.UserId);
                });
                oldWatchersReq.forEach(function(w){
                  zero.push(w.UserId);
                });
                var json={
                  "siteUrl":config.SPHelper.SPSiteUrl,
                  "paths":[spPath],
                  "users":users,
                  "creators":[creator[0].UserId],
                  "zero":zero
                };
                request({
                  "url":config.SPHelper.uri+"/api/share",
                  "method":"POST",
                  "json":json
                }, function(error,resp,body){
              });
            });
        });

          })
   
        }
    });
    }
    else if(req.body.name=='assign'){
      Document.findOne({'_id':req.params.id},function(err,doc){
        var spPath = doc.spPath;
        if(spPath){
        var oldAssign = doc.assign;
        var assignReq=[{
          'UserId':req.body.newVal
        }];
        var oldAssignReq=[{
          'UserId':oldAssign
        }];
        getUsers(assignReq).then(function(){
          getUsers(oldAssignReq).then(function(){
            var json={
              "siteUrl":config.SPHelper.SPSiteUrl,
              "paths":[spPath],
              "users":[],
              "creators":[assignReq[0].UserId],
              "zero":[oldAssignReq[0].UserId]
            };
            request({
              "url":config.SPHelper.uri+"/api/share",
              "method":"POST",
              "json":json
            }, function(error,resp,body){
              });

          });
        });
      }
});
    }

    Document.findOne({'_id':req.params.id},function(err,docToUpdate){
      var json = {};
      //json['' + req.body.name] = req.body.newVal;
      docToUpdate['' + req.body.name]=req.body.newVal;
      docToUpdate['id']=docToUpdate._id;
      docToUpdate.save(function(err,result){
        if(err){
          res.send(err);
        }
        else{
          result.populate('watchers', function (err, result) {
            if(err){
              res.send(err);
            }else{
              res.send(result);
            }
          });
          
        }
      });

    });
      /**
       *  Document.update({ "_id": req.params.id }, json).then(function (err, result) {
        console.log("Err=" + err + " result=" + result);
        if(err){
          res.send(err);
        }
        else{
          res.send(result);
        }
      });
       */
     

    }

else{
  res.send("OK");
}

};


/**
* req.body.watchers
* req.body.
*
*
*
*/
exports.sign = function (req, res, next) {
  var zeroReq = [];
  for (var i = 0; i < req.locals.result.zero.length; i++) {
    zeroReq.push({ 'UserId': req.locals.result.zero[i] });
  };
  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    offices: 'office',
    folders: 'folder',
  };
  var entity = entities[req.locals.data.entityName];
  var id = req.params.id;
  getDocuments(entity, id).then(function (documents) {
    var watchArray = req.body.watchers;
    watchArray.push(req.body.assign);
    Document.update({
      'entity': entity,
      'entityId': id
    }, {
        'circles': req.body.circles,
        'watchers': watchArray
      }, {
        'multi': true
      }, function (err, numAffected) {
        if (documents != null && documents != undefined && (documents.length > 0)) {
          var watchReq = [];
          for (var i = 0; i < watchArray.length; i++) {
            if (watchArray[i] != undefined) {
              var str = watchArray[i].toString();
              watchReq.push({ 'UserId': str });
            }
          }
          getUsers(watchReq).then(function (res) {
            var users = [];
            for (var i = 0; i < watchReq.length; i++) {
              users.push(watchReq[i].UserId);
            }
            var creators = getCreators(documents);
            getUsers(zeroReq).then(function (result) {
              var zero = [];
              for (var i = 0; i < zeroReq.length; i++) {
                zero.push(zeroReq[i].UserId);
              }
              var json = {
                'siteUrl': config.SPHelper.SPSiteUrl,
                'paths': documents,
                'users': users,
                'creators': creators,
                'zero': zero
              };
              request({
                'url': config.SPHelper.uri + "/api/share",
                'method': 'POST',
                'json': json
              }, function (error, resp, body) {



              })
            });
          });
        }
      });
    next();
  });
}

exports.signNew = function (req, res, next) {
  var entities = {
    project: 'Project',
    task: 'Task',
    discussion: 'Discussion',
    office: 'Office',
    folder: 'Folder'
  };
  var query = req.acl.mongoQuery(entities[req.locals.data.body.entity]);
  query.findOne({
    _id: req.locals.data.body.entityId
  }).exec(function (err, entity) {
    if (err) {
      req.locals.error = err;
    }
    if (!entity) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if (entity) {
      req.locals.data.body.watchers = entity.watchers;
      req.locals.data.body.watchers.push(entity.assign);
      req.locals.data.body.circles = entity.circles;
    }
    next();
  })
}

exports.signNew = function (req, res, next) {
  var entities = {
    project: 'Project',
    task: 'Task',
    discussion: 'Discussion',
    office: 'Office',
    folder: 'Folder'
  };
  var query = req.acl.mongoQuery(entities[req.locals.data.body.entity]);
  query.findOne({
    _id: req.locals.data.body.entityId
  }).exec(function (err, entity) {
    if (err) {
      req.locals.error = err;
    }
    if (!entity) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if (entity) {
      req.locals.data.body.watchers = entity.watchers;
      req.locals.data.body.watchers.push(entity.assign);
      req.locals.data.body.circles = entity.circles;
    }
    next();
  })
}


exports.sendDocument = function (req, res, next) {
  var officeDocument = req.body.officeDocument;
  var sendingForm = req.body.sendingForm;
  var assign = officeDocument.assign._id;
  sendingForm['doneBy'] = sendingForm['doneBy']?sendingForm['doneBy']:[];
  sendingForm['forNotice'] = sendingForm['forNotice']?sendingForm['forNotice']:[];
  sendingForm['sendingAs'] = sendingForm['sendingAs']?sendingForm['sendingAs']:[];

  //if(sendingForm['classification']){
    //sendingForm['classification']=sendingForm['classification'].toLowerCase();
  //}
  sendingForm['sender']=req.user._id;
  var watchers =_.union(sendingForm['doneBy'],_.union(sendingForm['forNotice'],_.union([assign],[sendingForm['sendingAs']])));
  watchers=_.union(watchers,officeDocument.watchers);
  sendingForm['status']='sent';
  watchers.forEach(function(watcher){
    var watcher = watcher._id?watcher._id:watcher;
    if(watcher!=sendingForm.sender){
      var doc = {
        'created':officeDocument.created,
        'updated':officeDocument.created,
        'title':officeDocument.title,
        'status':'received',
        'path':officeDocument.path,
        'spPath':officeDocument.spPath,
        'description':officeDocument.description,
        'serial':officeDocument.serial,
        'creator':officeDocument.creator,
        'updater':officeDocument.updater,
        'classification':officeDocument.classification,
        'tags':officeDocument.tags,
        'forNotice':sendingForm['forNotice'],
        'doneBy':sendingForm['doneBy'],
        'watchers':[watcher],
        'documentType':officeDocument.documentType,
        'sender': sendingForm['sender'],
        'sendingAs':sendingForm['sendingAs']
      };
      var doc2 = new Document(doc);
      doc2.save(function(error,result){
        if(error||!result){
       
        }
        else{
          
        }
        
      });
    }

  });
  Document.update({'_id':officeDocument._id},{$set:sendingForm},function(error,result){
    if(error||!result){
      res.send(error);
    }
    else{
      res.send(sendingForm);
    }
    
  });
}





