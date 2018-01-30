var crud = require('../controllers/crud.js');
var Task = require('../models/task'), Attachment = require('../models/attachment');
var Document = require('../models/document');
var mean = require('meanio'), path = require('path'), fs = require('fs'),
  mkdirp = require('mkdirp'), config = require('meanio').loadConfig(), Busboy = require('busboy'),
  q = require('q'), request = require('request');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Update = require('../models/update');
var ObjectId = require('mongoose').Types.ObjectId;
var TemplateDoc = require('../models/templateDoc');
var Office = require('../models/office')



var options = {
  includes: 'creator office watchers',
  defaults: { watchers: [] }
};
var templateDocs = crud('templateDocs', options);

Object.keys(templateDocs).forEach(function (methodName) {
  if (methodName !== 'create' && methodName !== 'update') {
    exports[methodName] = templateDocs[methodName];
  }
});

function getTemplates(entity, id) {
  var result = [];
  return new Promise(function (fulfill, reject) {
    TemplateDoc.find({
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



exports.createNew = function (req, res, next) {
  var template = {
    'created': new Date(),
    'title': '',
    'path': undefined,
    'spPath': undefined,
    'description': '', //important
    'templateType': '',
    'office': undefined,
    'assign': req.user._id,
    'size': 0,
    'circles': undefined,
    'watchers': [req.user._id]
  };
  var obj = new TemplateDoc(template);
  obj.save(function (error, result) {
    if (error) {
      res.send(error);
    }
    else {
      res.send(result);
    }
  });
};
/**
*	req.params contains entity,id (mongoDB _id of entity)
*
*
*
*/
exports.sendTemplateList = function (req, res, next) {
  var entity = req.params.entity;
  var entityId = req.params.id;
  var userId = req.user._iwatchersd;
  var entities = {
    project: 'Project',
    task: 'Task',
    discussion: 'Discussion'
  };
  var query = mongoose.model(entities[entity]);
  query.findOne({
    _id: entityId
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
    var flag = false;
    if (entity) {
      if (entity.assign) {
        if (entity.assign == userId) {
          flag = true; watchers
        }
      }
      entity.watchers.forEach(function (watcher) {
        if (Watcher == userId) {
          flag = true;
        }
      });
      if (flag) {
        var json = {
          'siteUrl': config.SPHelper.SPSiteUrl,
          'libraryName': config.SPHelper.libraryName,
          'folderName': req.params.entity + "/" + entityId
        };
        request({
          'url': config.SPHelper + "/api/filesList",
          'method': 'GET',
          'json': json
        }, function (error, resp, body) {
          res.send(body);
        });
      }
    }
  });
};

function getUsers(users) {
  var request = [];
  return new Promise(function (fulfill, reject) {
    users.forEach(function (u) {
      if (u.isCreator == undefined) {
        request.push(new Promise(function (resolve, error) {
          User.findOne({ '_id': u.UserId }).exec(function (err, user) {
            if (!err) {
              u.UserId = user.username
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
* req.params.id will consist mongoDB _id of the user
*/
exports.getAll = function (req, res, next) {
  TemplateDoc.find({
    $or: [{ watchers: { $elemMatch: { $eq: req.user._id } } }, { creator: req.user._id }]
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


/**
* req.params.id will consist mongoDB _id of the document
*/
exports.getById = function (req, res, next) {
  TemplateDoc.find({
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
  TemplateDoc.find({
    $or: [{ watchers: { $elemMatch: { $eq: req.params.id } } }, { creator: req.params.id }]
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


//req.body.folder.office contains id of office
exports.getByOfficeId = function (req, res, next) {

  console.log("hi");
  TemplateDoc.find({
    'office': req.body.folder.office
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
exports.getByEntity = function (req, res, next) {
  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    updates: 'update',
    offices: 'office',
    folders: 'folder'
  },
    entity = entities[req.params.entity];
  TemplateDoc.find({
    entity: entity,
    entityId: req.params.id
  },
    function (err, data) {
      if (err) {
        req.locals.error = err;
      } else {
        req.locals.result = data
      }
      res.send(data);
      //next();
    });
};




exports.uploadTemplate = function (req, res, next) {
  req.locals.data = {};
  req.locals.data.body = {};
  var d = formatDate(new Date());
  var busboy = new Busboy({
    headers: req.headers
  });
  var hasFile = false;
  busboy.on('file', function (fieldname, file, filename) {
    console.log("I got a file  " + filename);
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
    var user = req.user.email.substring(0, req.user.email.indexOf('@'));
    var path = req.locals.data.body.path.substring(req.locals.data.body.path.indexOf("/files"), req.locals.data.body.path.length);
    var fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    req.locals.data.body.path = config.SPHelper.SPSiteUrl + "/" + config.SPHelper.libraryName + "/" + user + "/" + req.locals.data.body.name;
    var result = fs.readFile("." + path, function (err, result) {
      result = JSON.parse(JSON.stringify(result));
      var coreOptions = {
        "siteUrl": config.SPHelper.SPSiteUrl
      };
      var creds = {
        "username": config.SPHelper.username,
        "password": config.SPHelper.password
      }
      var folder = config.SPHelper.libraryName + "/" + user;
      var fileOptions = {
        "folder": folder,
        "fileName": 'Template_' + fileName,
        "fileContent": result
      };
      var documentId = req.locals.data.body['id'];
      TemplateDoc.findOne({
        _id: documentId
      }).populate('office').exec(function (err, result) {
        if (err) {
          req.locals.error = err;
        }
        if (!result) {
          req.locals.error = {
            status: 404,
            message: 'Entity not found'
          };
        }
        if (result) {
          var office = result.office;
          var officeWatchers=[];
          if(office){
            officeWatchers = office.watchers;
          }
          else{
            officeWatchers = [];
          }
          var users = [];
          users.push({
            '__metadata': { 'type': 'SP.Sharing.UserRoleAssignment' },
            'Role': 3,
            'UserId': user,
            'isCreator': true
          });
          result.watchers.forEach(function (watcher) {
            if (watcher != req.user._id) {
              users.push({
                '__metadata': { 'type': 'SP.Sharing.UserRoleAssignment' },
                'Role': 2,
                'UserId': watcher
              });
            }
          });
          if (office && officeWatchers) {
            officeWatchers.forEach(function (watcher) {
              if (watcher != req.user._id) {
                users.push({
                  '__metadata': { 'type': 'SP.Sharing.UserRoleAssignment' },
                  'Role': 2,
                  'UserId': watcher
                });
              }
            });
          }
          getUsers(users).then(function (result) {
            if (result == 'success') {
              var json = {
                'coreOptions': coreOptions,
                'creds': creds,
                'fileOptions': fileOptions,
                'permissions': users,
                'isTemplate': false,
                'entity': 'folder',
                'entityId': office? (office._id ? office._id.toString() : undefined):undefined
              };
              request({
                'url': config.SPHelper.uri + "/api/upload",
                'method': 'POST',
                'json': json
              }, function (error, resp, body) {
                var path = req.locals.data.body.originalPath;
                var fileType = path.substring(path.lastIndexOf('.') + 1, path.length);
                if (error) {
                  var set = { 'path': req.locals.data.body.originalPath, 'title': req.locals.data.body.name, 'templateType': fileType };
                  TemplateDoc.update({ '_id': documentId }, { $set: set }, function (error, result) {
                    if (error) {
                      res.send(error);
                    }
                    else {
                      res.send(set);
                    }
                  });
                }
                else {
                  var spPath = body.path;
                  var set = { 'path': req.locals.data.body.originalPath, 'spPath': spPath, 'title': req.locals.data.body.name, 'templateType': fileType };
                  TemplateDoc.update({ '_id': documentId }, { $set: set }, function (error, result) {
                    if (error) {
                      res.send(error);
                    }
                    else {
                      res.send(set);
                    }
                  });
                }
              });
            }
            else {
              res.send('error');
            }
          });
        }
      });
    });
  });
  return req.pipe(busboy);
};




var formatDate = function (date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();
  return yyyy + '/' + (mm[1] ? mm : '0' + mm[0]) + '/' + (dd[1] ? dd : '0' + dd[0]);
};

/**
*
* req.params.id contains templateDoc mongo id to delete
*
*/
exports.deleteTemplate = function (req, res) {
  TemplateDoc.find({ _id: req.params.id }, function (err, file) {

    if (err) {
      console.log(err);
    }
    else {
      var spPath = file[0]._doc.spPath;
      if (spPath) {
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
            'domain': config.SPHelper.domain
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

    TemplateDoc.remove({ _id: req.params.id }, function (err) {
      if (err) {
        console.log(err);
      }
      else {
        res.sendStatus(200);
      }
    });
  })
};

exports.update2 = function (req, res, next) {
  var json = {};
  json['' + req.body.name] = req.body.newVal;


  if (req.body.name == 'office') {
    if(!req.body.newVal){
      TemplateDoc.update({ "_id": req.params.id }, {$unset:{'office':1}}).then(function (err, result) {
      res.send('ok');
      });
    }

    else{
    TemplateDoc.findOne({ "_id": req.params.id }).populate('office').exec(function (err, result) {
      var oldWatchersList;
      if(result.office){
        oldWatchersList = result.office.watchers;
      }
      else{
        oldWatchersList = result.watchers
      }
      var zeroReq = [];
      var spPath = result.spPath;
      oldWatchersList.forEach(function (watcher) {
        zeroReq.push({ 'UserId': watcher });
      });
      Office.findOne({ _id: req.body.newVal }, function (err, result) {
        if (result) {
          var watchersReq = [];
          result.watchers.forEach(function (watcher) {
            watchersReq.push({
              UserId: watcher
            });
          });
          json["watchers"] = result.watchers;
          TemplateDoc.update({ "_id": req.params.id }, json).then(function (err, result) {
            if (spPath) {
              getUsers(watchersReq).then(function (result) {
                getUsers(zeroReq).then(function (result) {
                  var watch = [], zero = [];
                  watchersReq.forEach(function (watcher) {
                    watch.push(watcher.UserId);
                  });
                  zeroReq.forEach(function (watcher) {
                    zero.push(watcher.UserId);
                  });
                  var paths = [spPath];
                  var jsonReq = {
                    'siteUrl': config.SPHelper.SPSiteUrl,
                    'paths': paths,
                    'users': watch,
                    'creators': [],
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
                      res.send('ok');
                    }
                  });
                });
              });
            }
            else {
              res.send('ok');
            }

          });

        } else {
          console.log(err)
          res.send(err);
        }
        
      });


    });
  }
  }
  else {
    TemplateDoc.update({ "_id": req.params.id }, json).then(function (err, result) {
      console.log("Err=" + err + " result=" + result);
      res.send('ok');
    });
  }
};

/**
* req.body.zero contains ids of watchers before change
* req.body.newTemplate contains : name,description,classification,watchers
*	req.params.id contains templateDoc id to update
*  
*
*/
exports.update = function (req, res, next) {
  TemplateDoc.findOne({ "_id": req.params.id }, function (err, template) {
    var creator = template.creator;
    var zero = template.watchers;
    var zeroReq = [];
    for (var i = 0; i < zero; i++) {
      zeroReq.push({ 'UserId': req.body.zero[i] });
    }
    TemplateDoc.update({
      "_id": req.params.id
    }, {
        "description": req.body.updated.description,
        "watchers": req.body.updated.watchers,
        "name": req.body.updated.name,
        "classification": req.body.updated.classification
      }, function (err, numAffected) {
        var watchReq = [];
        for (var i = 0; i < req.body.updated.watchers.length; i++) {
          if (req.body.updated.watchers[i] != undefined) {
            var str = req.body.updated.watchers[i].toString();
            watchReq.push({ 'UserId': str });
          }
        }
        var creatorReq = [];
        creatorReq.push({ 'UserId': creator });
        getUsers(zeroReq).then(function (res) {
          getUsers(watchReq).then(function (res) {
            getUsers(creatorReq).then(function (res) {
              var zero = [];
              var watch = [];
              var creator = [];
              zeroReq.forEach(function (x) { zero.push(x.UserId) });
              watchReq.forEach(function (x) { watch.push(x.UserId) });
              creatorReq.forEach(function (x) { creator.push(x.UserId) });
              var paths = [template.path];
              var json = {
                'siteUrl': config.SPHelper.SPSiteUrl,
                'paths': paths,
                'users': watchReq,
                'creators': creator,
                'zero': zero
              };
              request({
                'url': config.SPHelper.uri + "/api/share",
                'method': 'POST',
                'json': json
              }, function (error, resp, body) {
                res.send("ok");
              });
            });
          });
        });

      });
  });
};

