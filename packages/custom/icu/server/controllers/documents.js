var httpError = require('http-errors');
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
var config = require('meanio').loadConfig();
var permissions = require('../controllers/permissions.js');
var logger = require('../services/logger');
var serials = require('../controllers/serials.js');

var moment = require('moment');

var ftp = require('../services/ftp');

var excel = require('../services/excel');
var options = {
  includes: 'assign watchers folder task',
  defaults: {watchers: []},
  conditions: {$or: [ {officemmah: {$exists: false}}]}
};
var document = crud('officeDocuments', options);
Object.keys(document).forEach(function(methodName) {
  if(methodName !== 'destroy') {
    exports[methodName] = document[methodName];
  }
});

exports.defaultOptions = options;

function getDocuments(entity, id) {
  var result = [];
  return new Promise(function(fulfill, reject) {
    Document.find({
      entity: entity,
      entityId: id
    }, function(err, docs) {
      if(err) {

        reject(err);
      }
      else {
        for(var i = 0; i < docx.length; i++) {
          result.push(docx[i]._doc.path);
        }
        fulfill(result);
      }
    });
  });
}


var formatDate = function(date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();
  return yyyy + '/' + (mm[1] ? mm : '0' + mm[0]) + '/' + (dd[1] ? dd : '0' + dd[0]);
};


function getCreators(paths) {
  var assigns = [];
  for(var i = 0; i < paths.length; i++) {
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
  return new Promise(function(fulfill, reject) {
    users.forEach(function(u) {
      if(u.isCreator == undefined) {
        request.push(new Promise(function(resolve, error) {
          User.findOne({_id: u.UserId}).exec(function(err, user) {
            if(!err) {
              u.UserId = user.username;
              u.UserId = u.UserId.toLowerCase();
              resolve(user);
            }
            else {
              error(err);
            }
          });
        }));
      }
      else {
        delete u.isCreator;
      }
    });
    Promise.all(request).then(function(dataAll) {
      fulfill('success');
    }).catch(function(reason) {
      reject(reason);
    });
  });
}


exports.uploadEmpty = function(req, res, next) {
  var user = req.user.email.substring(0, req.user.email.indexOf('@')).toLowerCase();
  var users = [];
  var watchers = req.body.watchers;
  if(watchers) {
    watchers.forEach(function(w) {
      if(w != req.user._id) {
        users.push({UserId: w});
      }
    });
  }

  var forNotice = req.body.forNotice;
  if(forNotice) {
    forNotice.forEach(function(w) {
      if(w != req.user._id) {
        users.push({UserId: w});
      }
    });
  }

  var doneBy = req.body.doneBy;
  if(doneBy) {
    doneBy.forEach(function(w) {
      if(w != req.user._id) {
        users.push({UserId: w});
      }
    });
  }
  var assign = req.body.assign;
  if(assign && assign != req.user._id) {
    users.push({UserId: assign});
  }

  getUsers(users).then(function(result) {
    var perm = [];
    users.forEach(function(u) {
      perm.push(u.UserId.substring(0, u.UserId.indexOf('@')).toUpperCase());
    });
    if(result == 'success') {
      var json = {
        siteUrl: config.SPHelper.SPSiteUrl,
        library: config.SPHelper.libraryName,
        user: user.toUpperCase(),
        watchers: perm,
        fileType: 'docx'
      };
      request({
        url: config.SPHelper.uri + '/api/uploadEmpty',
        method: 'POST',
        json: json
      }, function(error, resp, body) {
        if(error) {
          logger.log('error', '%s uploadEmpty, %s', req.user.name, ' request', {error: error.stack});
          res.send(error);
        }
        else {

          var fileName = body.path.substring(body.path.lastIndexOf('/') + 1, body.path.length);
          var fileType = body.path.substring(body.path.lastIndexOf('.') + 1, body.path.length);
          var set = {spPath: body.path, serial: body.serial, documentType: fileType, title: fileName};
          Document.update({_id: req.body._id}, {$set: set}, function(error, result) {
            if(err) {
              logger.log('error', '%s uploadEmpty, %s', req.user.name, ' Document.update', {error: err.message});
              res.send(error);
            }
            else {
              res.send(set);
            }
          });
        }
      });
    }
  }).catch(function(err) {
    logger.log('error', '%s uploadEmpty, %s', req.user.name, ' getUsers(users)', {error: err.message});
  });

};



/**
 *
 *
 * @param {*} to date in iso format to get documents up to
 * @returns mapping of folder(id) to number of documents up to "to" in that folder
 */
function getFolderIndexMapUpToDate(to){
  let agg = [
    {$addFields:{
      upTo:
      {
        $cond: [ { $lt: [ "$created", moment(to).toDate() ] }, 1 , 0 ]
      }
    }
  },
    {$group:{_id:"$folder",count:{$sum:"$upTo"} }}
  ];

   return Document.aggregate(agg)
   .exec(function(err,indexMapper){
    if(err)console.log(err);
    return indexMapper;
  })
}


/**
 *
 *
 * @param {*} office ID of an office to get documens from
 * @param {*} from Date in ISO Format, specifies the Date that documents rerieved will after
 * @param {*} to Date in ISO Format, specifies the Date that documents rerieved will before
 * @returns All Documents from the given office s.t. they were created in the Date range of [from,to]
 */
function getDocumentsByOfficeIdAndDateRange(office,from,to){
  return Document.find({"created":{
    $gte:from,
    $lte:to
  }}).populate({
    path:'folder',
    match:{'office':office}
  })
  .sort({'folder':1,'created':1})
  .exec(function(err,docs){
    if(err)console.log(err);
    return docs;
  })
}



/**
 *
 *
 * @param {*} docs documents returned from the mongoose query
 * @param {*} indexMapper
 * @returns
 */
function documentsQueryToExcelServiceFormat(docs,indexMapper){
  var index = 1;
  var folderId;
  let filteredDocs = _.filter(docs,doc=>doc.folder);
  let mapper = {}
  indexMapper.forEach(aggRow => {
    mapper[aggRow._id] = aggRow.count;
  });
  let docArray = _.map(filteredDocs,(doc)=>{
    let curFolderId = doc.folder._id;
    if(curFolderId!==folderId){
      index = 1;
      folderId = curFolderId;
    }
    let row = [(index+mapper[folderId])+"",doc.folder.title,doc.title,doc.serial+""];
    index++;
    return row;
  });
return excel.json2workbook({"rows":docArray,"columns":["אינדקס","תקייה","כותרת מסמך","סימוכין"],"columnsBold":true});
}


//expects:
//from to = dates in iso format
//office = id of the office to get the documents from
exports.getExcelSummary = function(req,res,next){
  let from = req.body.from;
  let to = req.body.to;
  let office = req.body.office;
  //setting mime type as excel
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  //setting the name of the file to be downloaded
  res.attachment("Summary.xlsx");

  getDocumentsByOfficeIdAndDateRange(office,from,to).then((docs)=>{
    getFolderIndexMapUpToDate(from).then((indexMapper)=>{
      documentsQueryToExcelServiceFormat(docs,indexMapper).then(summary=>{
        res.send(summary);
      });
    });
  });
}

exports.signOnDocx = function(req, res, next) {
  var doc = req.body.officeDocuments;
  var signature = JSON.parse(req.body.signature);

  Document.find({_id: doc._id})
    .populate('folder')
    .populate('creator')
    .populate('updater')
    .populate('sender')
    .populate('sendingAs')
    .populate('assign')
    .populate('relatedDocuments')
    .populate('forNotice')
    .populate('watchers')
    .populate('doneBy')
    .populate('signBy')
    .exec(function(err, data) {
      if(err) {
        logger.log('error', '%s signOnDocx, %s', req.user.name, 'Document.find()', {error: err.message});
      }
      else {

        doc = data[0];
        var user = req.user.email.substring(0, req.user.email.indexOf('@')).toLowerCase();
        var spPath = doc.spPath ? doc.spPath : 'spPath';
        var fileName = spPath.substring(spPath.lastIndexOf('/') + 1, spPath.length);
        fileName = fileName ? fileName : 'hi';

        var coreOptions = {
          siteUrl: config.SPHelper.SPSiteUrl
        };
        var creds = {
          username: config.SPHelper.username,
          password: config.SPHelper.password
        };
        var folder = config.SPHelper.libraryName + '/' + user.toUpperCase();
        var fileOptions = {
          folder: folder,
          fileName: fileName,
          fileContent: undefined
        };
        var users = [];
        users.push({
          __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
          Role: 3,
          UserId: doc.creator.username.toLowerCase()
        });
        doc.watchers.forEach(function(watcher) {
          users.push({
            __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
            Role: 3,
            UserId: watcher.username.toLowerCase()
          });
        });

        var json = {
          siteUrl: config.SPHelper.SPSiteUrl,
          fileUrl: spPath,
          signature: signature,
          coreOptions: coreOptions,
          creds: creds,
          fileOptions: fileOptions,
          permissions: users,
          isTemplate: false
        };

        request({
          url: config.SPHelper.uri + '/api/signOnDocx',
          method: 'POST',
          json: json
        }, function(error, resp, body) {
          if(error) {
            res.send(error);
            logger.log('error', '%s signOnDocx, %s', req.user.name, 'POST:' + '\'' + config.SPHelper.uri + '/api/signOnDocx' + '\'', {error: error.stack});
          }
          else {

            var set = {spPath: body.path,
              signBy: signature};
            Document.findOne({
              _id: doc._id
            }, function(error, doc1) {
              doc1.spPath = body.path;
              doc1.signBy = signature._id;
              //doc1['id'] = req.body._id;
              doc1.save(function(err, result) {
                if(err) {
                  res.send(err);
                  logger.log('error', '%s signOnDocx, %s', req.user.name, 'doc.save()', {error: err.message});
                }
                else {
                  res.send(set);
                  logger.log('info', '%s signOnDocx, %s', req.user.name, 'success');
                }
              });
            });
          }
        });
      }
    });
};

  function getSerial(){
    return new Promise(function(fulfill,reject){
          serials.popFromAvailableSerials().then(function(serial){
            fulfill(serial);
          }).catch(function(code){
            serials.incrementSeq().then(function(serial){
              fulfill(serial);
            }).catch(function(code){
              reject(-1);
            });
          });

  })
  }

exports.addSerialTitle = function(req, res, next) {
  var doc = req.body;
  if(!doc.creator.username) {
    Document.find({_id: doc._id})
      .populate('folder')
      .populate('creator')
      .populate('updater')
      .populate('sender')
      .populate('sendingAs')
      .populate('assign')
      .populate('relatedDocuments')
      .populate('forNotice')
      .populate('watchers')
      .populate('doneBy')
      .populate('signBy')
      .exec(function(err, data) {
        if(err) {
        // req.locals.error = err;
        // req.status(400);
          logger.log('error', '%s addSerialTitle, %s', req.user.name, 'Document.find()', {error: err.message});
        }
        else {
          doc.creator = data[0].creator;
          doc.watchers = data[0].watchers;
          var user = req.user.email.substring(0, req.user.email.indexOf('@')).toLowerCase();
          var docFolder, docOffice, telOffice, unitOffice;
          if(req.body.folder) {
            docFolder = req.body.folder.title ? req.body.folder.title : 'noFolder';
            if(req.body.folder.office) {
              docOffice = req.body.folder.office.title ? req.body.folder.office.title : 'noOffice';
              if(req.body.folder.office.tel) {
                telOffice = req.body.folder.office.tel;
              }
              else {
                telOffice = 'noTel';
              }

              if(req.body.folder.office.unit) {
                unitOffice = req.body.folder.office.unit;
              }
              else {
                unitOffice = 'noUnit';
              }

            }
            else {
              docOffice = 'noOffice';
              unitOffice = 'noUnit';
              docFolder = 'noFolder';
              telOffice = 'noTel';
            }
          }
          else {
            unitOffice = 'noUnit';
            docFolder = 'noFolder';
            docOffice = 'noOffice';
            telOffice = 'noTel';
          }
          var spPath = doc.spPath;
          if(spPath == undefined) {
            logger.log('error', '%s uploadEmpty, %s', req.user.name, ' doc.spPath', {error: 'spPath is undefined'});
            res.send('error');
            return;
          }
          var fileName = spPath.substring(spPath.lastIndexOf('/') + 1, spPath.length);
          var coreOptions = {
            siteUrl: config.SPHelper.SPSiteUrl
          };
          var creds = {
            username: config.SPHelper.username,
            password: config.SPHelper.password
          };
          var folder = config.SPHelper.libraryName + '/' + user.toUpperCase();
          var fileOptions = {
            folder: folder,
            fileName: fileName,
            fileContent: undefined
          };
          var users = [];
          users.push({
            __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
            Role: 3,
            UserId: doc.creator.username.toLowerCase()
          });
          doc.watchers.forEach(function(watcher) {
            users.push({
              __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
              Role: 3,
              UserId: watcher.username.toLowerCase()
            });
          });

      getSerial().then(function(ser){
        var json = {
          'siteUrl':config.SPHelper.SPSiteUrl,
          'fileUrl':spPath,
          'folder':docFolder,
          'office':docOffice,
          'telOffice':telOffice,
          'unitOffice':unitOffice,
          'coreOptions':coreOptions,
          'creds':creds,
          'fileOptions':fileOptions,
          'permissions':users,
          'isTemplate':false,
          'serial':ser
        };


        request({
          'url':config.SPHelper.uri+"/api/addSerialTitle",
          'method':'POST',
          'json':json
        },function(error,resp,body){
          if(error){
            serials.pushToAvailableSerials(ser).then(function(){
              logger.log('error', '%s addSerialTitle, %s', req.user.name, "POST:"+"'"+config.SPHelper.uri+"/api/addSerialTitle"+"'", {error: error.stack});
              res.send(error);
          });

          }
          else if(!body){
            serials.pushToAvailableSerials(ser).then(function(){
              logger.log('error', '%s addSerialTitle, %s', req.user.name, "POST:"+"'"+config.SPHelper.uri+"/api/addSerialTitle"+"'", {error: "!body"});
              res.send(error);
          });

          }
          else{
            if(body.serial == ser){
            var set = {'serial':body.serial,'spPath':body.path};
            Document.findOne({
              '_id':req.body._id
            },function(error,doc){
              if(error){
                logger.log('error', '%s addSerialTitle, %s', req.user.name,'doc.find()', {error: error.message});
                res.send(error);
              }
              else if(!doc){
                logger.log('error', '%s addSerialTitle, %s', req.user.name,'doc.find()', {error: "!doc"});
                res.send("error");
              }
              else{
              doc.serial = body.serial;
              doc.spPath = body.path;
              doc['id'] = req.body._id;
              doc.save(function(err,result){
                if(err){
                  res.send(err);
                  logger.log('error', '%s addSerialTitle, %s', req.user.name,'doc.save()', {error: err.message});
                }
                else{
                  res.send(set);
                  logger.log('info', '%s addSerialTitle, %s', req.user.name, 'success' );
                }
              });

            }
            });
          }
          else{
            serials.pushToAvailableSerials(ser).then(function(){
              //logger.log('error', '%s addSerialTitle, %s', req.user.name, 'body.serials == ser');
                  res.status(500).send();
          });

      }
          }
    })

      }).catch(function(err){
        //logger.log('error', '%s addSerialTitle, %s', req.user.name,'getSerial', {error: err.message});
        res.status(500).send();
      });
  }
})
  }
  else{
    var user = req.user.email.substring(0,req.user.email.indexOf('@')).toLowerCase();
    var docFolder,docOffice,telOffice,unitOffice;
    if(req.body.folder){
      docFolder=req.body.folder.title?req.body.folder.title:"noFolder";
      if(req.body.folder.office){
        docOffice = req.body.folder.office.title?req.body.folder.office.title:"noOffice";
        if(req.body.folder.office.tel){
          telOffice = req.body.folder.office.tel;
        }
        else {
          telOffice = 'noTel';
        }

        if(req.body.folder.office.unit) {
          unitOffice = req.body.folder.office.unit;
        }
        else {
          unitOffice = 'noUnit';
        }

      }
      else {
        docOffice = 'noOffice';
        unitOffice = 'noUnit';
        docFolder = 'noFolder';
        telOffice = 'noTel';
      }
    }
    else {
      unitOffice = 'noUnit';
      docFolder = 'noFolder';
      docOffice = 'noOffice';
      telOffice = 'noTel';
    }
    var spPath = doc.spPath;
    if(spPath == undefined) {
      logger.log('error', '%s uploadEmpty, %s', req.user.name, ' doc.spPath', {error: 'spPath is undefined'});
      res.send('error');
      return;
    }
    var fileName = spPath.substring(spPath.lastIndexOf('/') + 1, spPath.length);
    var coreOptions = {
      siteUrl: config.SPHelper.SPSiteUrl
    };
    var creds = {
      username: config.SPHelper.username,
      password: config.SPHelper.password
    };
    var folder = config.SPHelper.libraryName + '/' + user.toUpperCase();
    var fileOptions = {
      folder: folder,
      fileName: fileName,
      fileContent: undefined
    };
    var users = [];
    users.push({
      __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
      Role: 3,
      UserId: doc.creator.username.toLowerCase()
    });
    doc.watchers.forEach(function(watcher) {
      users.push({
        __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
        Role: 3,
        UserId: watcher.username.toLowerCase()
      });
    });

    getSerial().then(function(ser){
    var json = {
      'siteUrl':config.SPHelper.SPSiteUrl,
      'fileUrl':spPath,
      'folder':docFolder,
      'office':docOffice,
      'telOffice':telOffice,
      'unitOffice':unitOffice,
      'coreOptions':coreOptions,
      'creds':creds,
      'fileOptions':fileOptions,
      'permissions':users,
      'isTemplate':false,
      'serial':ser
    };

    request({
      'url':config.SPHelper.uri+"/api/addSerialTitle",
      'method':'POST',
      'json':json
    },function(error,resp,body){
          if(error||!body){
            var message = "error";
            if(error){
              message = error.stack;
            }
            serials.pushToAvailableSerials(ser).then(function(){
              logger.log('error', '%s addSerialTitle, %s', req.user.name, "POST:"+"'"+config.SPHelper.uri+"/api/addSerialTitle"+"'", {error: message});
              res.send(error);
          });

          }
      else{
        if(body.serial == ser){
        var set = {'serial':body.serial,'spPath':body.path};
        Document.findOne({
          '_id':req.body._id
        },function(error,doc){
          if(error){
            logger.log('error', '%s addSerialTitle, %s', req.user.name,'doc.findOne()', {error: error.message});
            res.send("Error");
          }
          else if(!doc){
            logger.log('error', '%s addSerialTitle, %s', req.user.name,'doc.findOne()', {error: "!doc"});
            res.send("Error");
          }
          else {
            doc.serial = body.serial;
            doc.spPath = body.path;
            doc['id'] = req.body._id;
            doc.save(function(err, result) {
              if(err) {

                logger.log('error', '%s addSerialTitle, %s', req.user.name, 'doc.save()', {error: err.message});
                res.send(err);
              }
              else {
                logger.log('info', '%s addSerialTitle, %s', req.user.name, 'success');
                res.send(set);

              }
            });

          }
        });
        }
        else{
            serials.pushToAvailableSerials(ser).then(function(){
              logger.log('error', '%s addSerialTitle, %s', req.user.name, 'body.serials == ser');
                  res.status(500).send();
          });

      }

      }
    });

    });

  }

};

exports.deleteDocumentFile = function(req, res, next) {
  var id = req.params.id;
  Document.update({_id: id}, {$unset: {path: 1, spPath: 1, serial: 1, signBy: 1}}, function(error, result) {
    if(error) {
      logger.log('error', '%s deleteDocumentFile, %s', req.user.name, 'doc.update()', {error: error.message});
      res.send(error);
    }
    else {
      logger.log('info', '%s deleteDocumentFile, %s', req.user.name, 'success');

      res.send('ok');
    }
  });
};



exports.uploadDocumentsFromTemplate = function(req, res, next) {
  var template = req.body.templateDoc;
  var officeDocument = req.body.officeDocument;
  if(template.spPath) {
    var fileName = template.spPath.substring(template.spPath.lastIndexOf('/') + 1, template.spPath.length);
    fileName = fileName.substring(fileName.indexOf('_') + 1, fileName.length);
    var user = req.user.email.substring(0, req.user.email.indexOf('@'));
    var username = req.user.username;
    var folder = config.SPHelper.libraryName + '/' + user;
    var templateUrl = template.spPath.substring(template.spPath.indexOf('/ICU'), template.spPath.length);
    var serverName = config.SPHelper.serverName;
    var coreOptions = {
      siteUrl: config.SPHelper.SPSiteUrl
    };
    var creds = {
      username: config.SPHelper.username,
      password: config.SPHelper.password
    };
    var folder = config.SPHelper.libraryName + '/' + user;
    var fileOptions = {
      folder: folder,
      fileName: fileName,
      fileContent: undefined
    };
    var users = [];
    users.push({
      __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
      Role: 3,
      UserId: username,
      isCreator: true
    });
    officeDocument.watchers.forEach(function(watcher) {
      if(watcher != req.user._id) {
        users.push({
          __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
          Role: 2,
          UserId: watcher
        });
      }
    });
    if(officeDocument.forNotice) {
      officeDocument.forNotice.forEach(function(notice) {
        if(notice != req.user._id) {
          users.push({
            __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
            Role: 2,
            UserId: notice
          });
        }
      });
    }
    if(officeDocument.doneBy) {
      officeDocument.doneBy.forEach(function(done) {
        if(done != req.user._id) {
          users.push({
            __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
            Role: 2,
            UserId: done
          });
        }
      });
    }
    if(officeDocument.assign) {
      users.push({
        __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
        Role: 2,
        UserId: officeDocument.assign
      });
    }

    getUsers(users).then(function(result) {
      if(result == 'success') {
        var json = {
          serverName: serverName,
          templateUrl: templateUrl,
          coreOptions: coreOptions,
          creds: creds,
          fileOptions: fileOptions,
          permissions: users,
          isTemplate: false,
          entity: 'folder',
          entityId: officeDocument.folder
        };
        request({
          url: config.SPHelper.uri + '/api/uploadTemplate',
          method: 'POST',
          json: json
        }, function(error, resp, body) {

          if(error) {
            var set = {path: template.path, title: template.title, documentType: template.templateType};
            Document.update({_id: officeDocument._id}, {$set: set}, function(error, result) {
              if(error) {
                logger.log('error', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'Document.update()', {error: error.message});

                res.send(error);
              }
              else {
                logger.log('info', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'success without sharepoint');

                res.send(set);
              }
            });

          }
          else {
            var set = {spPath: body.path, path: template.path, title: template.title, documentType: template.templateType};
            Document.update({_id: officeDocument._id}, {$set: set}, function(error, result) {
              if(error) {
                logger.log('error', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'Document.update()', {error: error.message});
                res.send(error);
              }
              else {
                logger.log('info', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'success with sharepoint');

                res.send(set);
              }
            });

          }
        });
      }
      else {
        res.send('error');
      }
    }).catch(function(err) {
      logger.log('error', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'getUsers()', {error: error.message});
      res.send('error');

    });

  }
  else {
    var set = {path: template.path, title: template.title, documentType: template.templateType};
    Document.update({_id: officeDocument._id}, {$set: set}, function(error, result) {
      if(error) {
        logger.log('error', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'Document.update()', {error: error.message});
        res.send(error);
      }
      else {
        logger.log('info', '%s uploadDocumentsFromTemplate, %s', req.user.name, 'success without sharepoint');

        res.send(set);
      }
    });
  }
};
/**
*
* request body includes entityName,fileType,entityId,watchers (As usernames)
*
*/

exports.uploadEmptyDocument = function(req, res, next) {
  var entityName = req.body.entityName;
  var fileType = req.body.fileType;
  var entityId = req.body.entityId;
  var watchers = req.bodt.watchers;
  var user = req.user.email.substring(0, req.user.email.indexOf('@'));
  var json = {
    user: user,
    watchers: watchers,
    fileType: fileType,
    siteUrl: config.SPHelper.SPSiteUrl,
    library: config.SPHelper.libraryName
  };
  request({
    url: config.SPHelper.uri + '/api/uploadEmpty',
    method: 'POST',
    json: json
  }, function(error, resp, body) {
    var path = body.path ? body.path : '/undefined';
    var fileName = path.substring(path.lastIndexOf('/') + 1, path.length);
    var upd = {
      created: new Date(),
      updated: new Date(),
      issueId: new ObjectId(entityId),
      issue: entityName,
      creator: new ObjectId(req.user._id),
      type: 'document'
    };
    var update = new Update(upd);
    update.save(function(err, result1) {
      var issueId = result1._id;
      var attach = {
        name: fileName,
        path: path,
        attachmentType: fileType,
        created: new Date(),
        creator: new ObjectId(req.user._id),
        entity: entityName,
        entityId: new ObjectId(entityId),
        issue: 'update',
        issueId: new ObjectId(issueId),
        updated: new Date()
      };
      var attachment = new Attachment(attach);
      attachment.save(function(err, result2) {
        var json = {
          update: result1,
          attachment: result2
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
  console.log("GET ALL !!!");
  var start=0,limit=25,sort="created",obj={'created':1};
  var qu = [
        {$or: [{ watchers: { $in: [req.user._id] } }, { assign: req.user._id }]}
    ]
    qu.push({recycled: {$exists:false}})
  if(req.query){
    start = parseInt(req.query.start);
    limit = parseInt(req.query.limit);
    sort = req.query.sort;
    sortOrder = parseInt(req.query.sortOrder);
    obj = {};
    obj[sort] = sortOrder || 1;
  }

  if(req.query.status){
    switch (req.query.status){
      case 'all':
      console.log("all");
        break;
      case 'active':
        qu.push({status:{$ne:"done"}});
        console.log("active");
        break;
      case 'default':
        qu.push({status:{$ne:"done"}});
        console.log("active");
        break;
      case 'nonactive':
        qu.push({status:"done"})
        console.log("unactive");
        break ;
      case 'new':
        qu.push({status:"new"})
        console.log("new");
        break ;
      case 'done':
        qu.push({status:"done"})
        console.log("done");
        break ;
      case 'received':
        qu.push({status:"received"})
        console.log("received");
        break ;
      case 'in-progress':
        qu.push({status:"in-progress"})
        console.log("in-progress");
        break ;
      case 'sent':
        qu.push({status:"sent"})
        console.log("sent");
        break ;

    }
  }
if(req.query.folderId){
   qu.push({folder: req.query.folderId})
}
 //console.dir(status)
  Document.find({
    $and:qu

  }).sort(obj).skip(start).limit(limit)
  .populate('folder')
  .populate('task')
  .populate('creator')
  .populate('updater')
  .populate('sender')
  .populate('sendingAs')
  .populate('assign')
  .populate('relatedDocuments')
  .populate('forNotice')
  .populate('watchers')
  .populate('doneBy')
  .populate('signBy')
  .exec(function(err,data){
      if (err) {
        logger.log('error', '%s getAll, %s', req.user.name,'Document.find', {error: err.message});
        res.locals.error = err;
        res.status(400);
      }
      else {
        res.locals.status = req.query.status
       // logger.log('info', '%s getAll, %s,', req.user.name, 'get all document success' );

        res.send(data);
      }
    });
};



/**
* req.params.id will consist mongoDB _id of the document
*/
exports.getById = function(req, res, next) {
  Document.find({
    _id: req.params.id
  }, function(err, data) {
    if(err) {
      logger.log('error', '%s getById, %s', req.user.name, 'Document.find', {error: err.message});
      req.locals.error = err;
      res.status(400);
    }
    else {
      logger.log('info', '%s getById, %s', req.user.name, 'success');


          if(data instanceof Array && data.length == 1){
              data = data[0];
          }
      req.locals.result = data
      res.send(data);
    }
  }).populate("folder")
  .populate('creator')
  .populate('updater')
  .populate('sender')
  .populate('sendingAs')
  .populate('assign')
  .populate('relatedDocuments')
  .populate('forNotice')
  .populate('watchers')
  .populate('doneBy')
  .populate('signBy');
}

/**
* req.params.id will consist mongoDB _id of the user
*/
exports.getByUserId = function(req, res, next) {
  Document.find({
    $or: [{watchers: {$elemMatch: {$eq: req.params.id}}}, {asign: req.params.id}]
  }, function(err, data) {
    if(err) {
      logger.log('error', '%s getByUserId, %s', req.user.name, 'Document.find', {error: err.message});
      req.locals.error = err;
      req.status(400);
    }
    else {
      logger.log('info', '%s getByUserId, %s', req.user.name, 'success');

      req.locals.result = data;
      res.send(data);
    }
  });
};

/*
*
*req.params.entity contains the entity {project,discussion,office,}
*req.params.id contains the entity mongoDB id
*/
// exports.getByFolder = function(req, res, next) {
//   Document.find({
//     folder: req.params.id
//   }).populate('folder')
//     .populate('creator')
//     .populate('updater')
//     .populate('sender')
//     .populate('sendingAs')
//     .populate('assign')
//     .populate('relatedDocuments')
//     .populate('forNotice')
//     .populate('signBy')
//     .populate('watchers').sort(req.locals.data.pagination.sort)
//     .skip(req.locals.data.pagination.start)
//     .limit(req.locals.data.pagination.limit).exec(function(err, data) {
//       if(err) {
//         logger.log('error', '%s getByFolder, %s', req.user.name, 'Document.find', {error: err.message});

//         req.locals.error = err;
//         req.status(400);
//       }
//       else {
//         logger.log('info', '%s getByFolder, %s', req.user.name, 'success');

//         req.locals.result = data;
//        // res.send(data);

//       next();
//       }
//     }).count({}, function (err, c) {
//       req.locals.data.pagination.count = c



//     });
// };

exports.checkOfficemmah = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }


  Folder.findById(req.params.id,  function(err, data) {
    if(data.officemmah == undefined)
    {
      req.locals.ismmah = false;
    }
    else
    {
      req.locals.ismmah = true;
    }

    next();
  });
};


exports.getByFolder = function(req, res, next) {
if(req.locals.error) {
  return next();
}

if(req.locals.ismmah)
{
  var entityQuery = {
    tType: {
      $ne: 'template'
    },
    $or: [
      {
        parent: null
      }, {
        parent: {
          $exists: false
        }
      }
    ]
  };
}
else
{
  var entityQuery = {
    tType: {
      $ne: 'template'
    },
    $or: [
      {
        parent: null
      }, {
        parent: {
          $exists: false
        }
      }
    ],
    $or: [{officemmah : {$exists : false}}]
  };
}

entityQuery["folder"] = req.params.id instanceof Array ? {
  $in: req.params.id
} : req.params.id;

var starredOnly = false;
var ids = req.locals.data.ids;
if(ids && ids.length) {
  entityQuery._id = {
    $in: ids
  };
  starredOnly = true;
}
if(req.locals.data.pagination.status){
  entityQuery.status = req.locals.data.pagination.status;

}
var query = req.acl.mongoQuery('Document');

query.find(entityQuery);
query.populate(options.includes);

Document.find(entityQuery).count({}, function (err, c) {
  req.locals.data.pagination.count = c;


  var pagination = req.locals.data.pagination;
  if(pagination && pagination.type && pagination.type === 'page') {
    query.sort(pagination.sort)
      .skip(pagination.start)
      .limit(pagination.limit);
  }
  query.exec(function(err, tasks) {
    if(err) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    }
    else if(starredOnly) {
      documents.forEach(function(document) {
        document.star = true;
      });
    }
    else {
      req.locals.result = tasks;

      next();
    }
  });
});
}

//NOT IN USE
exports.upload = function (req, res, next) {
  req.locals.data={};
  req.locals.data.body={};
  var d = formatDate(new Date());
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
        if(err){
          logger.log('error', '%s upload, %s', req.user.name,'mkdirp', {error: err.message});
        }
        var arr = hostFileLocation.split("/files");
        var pathFor = "./files" + arr[1];
        var stats = fs.statSync(pathFor);
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
            logger.log('error', '%s upload, %s', req.user.name,'Folder.findOne', {error: err.message});

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
                    if(error || !body){
                     res.status(500).send();
                    }
                    else{
                      console.log("\n\n\n\n\n\n I GOT BODY!!!");
                      console.dir(body);
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
                    }
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
            if(error || !body){
                      console.log("\n\n\n\n\n\n I GOT RESP!!!");
                      console.dir(resp);
                     res.status(500).send();
              }
            else{
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
            }
          });
        }
      });
      })

      return req.pipe(busboy);
};



exports.getByPath = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  //var query = req.acl.mongoQuery('Document');
  var path = decodeURI(req.url).replace(/pdf$/, '');
  var conditions = {
    path: new RegExp(path)
  };
  Document.findOne(conditions).exec(function(err, attachment) {
    if(err) {
      logger.log('error', '%s getByPath, %s', req.user.name, 'Document.findOne', {error: err.message});

      req.locals.error = err;
    }
    if(!attachment) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if(!error && attachment) {
      logger.log('info', '%s getByPath, %s', req.user.name, 'success');

    }
    next();
  });
};



exports.uploadFileToDocument = function(req, res, next) {
  req.locals.data = {};
  req.locals.data.body = {};
  var d = formatDate(new Date());
  var busboy = new Busboy({
    headers: req.headers
  });
  var hasFile = false;
  busboy.on('file', function(fieldname, file, filename) {
    var port = config.https && config.https.port ? config.https.port : config.http.port;
    var saveTo = path.join(config.attachmentDir, d, new Date().getTime() + '-' + path.basename(filename));
    req.locals.data.body.saveTo = saveTo;
    var hostFileLocation = config.host + ':' + port + saveTo.substring(saveTo.indexOf('/files'));
    var fileType = path.extname(filename).substr(1).toLowerCase();
    mkdirp(path.join(config.attachmentDir, d), function() {
      file.pipe(fs.createWriteStream(saveTo)).on('close', function(err) {
        var arr = hostFileLocation.split('/files');
        var pathFor = './files' + arr[1];
        var stats = fs.statSync(pathFor);
        var fileSizeInBytes = stats['size'];
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

  busboy.on('field', function(fieldname, val) {
    req.locals.data.body[fieldname] = val;
  });

  busboy.on('finish', function () {
    ftp.uploadToFTP(req.locals.data.body.saveTo).then(function(){
    var user = req.user.email.substring(0,req.user.email.indexOf('@'));

    var username = req.user.username;
    var path = req.locals.data.body.path.substring(req.locals.data.body.path.indexOf("/files"),req.locals.data.body.path.length);
    var fileName = path.substring(path.lastIndexOf('/')+1,path.length);
    req.locals.data.body.path = config.SPHelper.SPSiteUrl+"/"+config.SPHelper.libraryName+"/"+user+"/"+req.locals.data.body.name;
    var result = fs.readFile("."+path,function(err,result){
        fs.unlink(req.locals.data.body.saveTo);
      if(err){
        logger.log('error', '%s uploadFileToDocument, %s', req.user.name,'fs.readFile', {error: err.message});

      }
      result = JSON.parse(JSON.stringify(result));
      var coreOptions = {
        siteUrl: config.SPHelper.SPSiteUrl
      };
      var creds = {
        username: config.SPHelper.username,
        password: config.SPHelper.password,
      };
      var folder = config.SPHelper.libraryName + '/' + user;
      var fileOptions = {
        folder: folder,
        fileName: fileName,
        fileContent: result
      };
      var documentId = req.locals.data.body['id'];
      Document.findOne({
        _id: documentId
      }).exec(function(err, result) {
        if(err) {
          logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'Document.findOne', {error: err.message});

          req.locals.error = err;
        }
        if(!result) {
          req.locals.error = {
            status: 404,
            message: 'Entity not found'
          };
        }
        if(result) {
          var folderId = result.folder;
          var users = [];
          users.push({
            __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
            Role: 3,
            UserId: username,
            isCreator: true
          });
          result.watchers.forEach(function(watcher) {
            if(watcher != req.user._id) {
              users.push({
                __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
                Role: 2,
                UserId: watcher
              });
            }
          });
          result.forNotice.forEach(function(notice) {
            if(notice != req.user._id) {
              users.push({
                __metadata: {type: 'SP.Sharing.UserRoleAssignment'},
                Role: 2,
                UserId: notice
              });
            }
          });
          getUsers(users).then(function(result) {
            if(result == 'success') {
              var json = {
                coreOptions: coreOptions,
                creds: creds,
                fileOptions: fileOptions,
                permissions: users,
                isTemplate: false,
                entity: 'folder',
                entityId: req.locals.data.body['folderId']
              };
              request({
                url: config.SPHelper.uri + '/api/upload',
                method: 'POST',
                json: json
              }, function(error, resp, body) {
                if(error) {
                  logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'request', {error: error.message});

                  var path = req.locals.data.body.originalPath;
                  var fileType = path.substring(path.lastIndexOf('.') + 1, path.length);
                  var set = {path: req.locals.data.body.originalPath, title: req.locals.data.body.name, documentType: fileType};
                  Document.findOne({_id: documentId}, function(err, doc) {
                    doc.path = req.locals.data.body.originalPath;
                    doc.title = req.locals.data.body.name;
                    doc.documentType = fileType;
                    doc.save(function(error, result) {
                      if(error) {
                        logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'doc.save', {error: error.message});

                        res.send(error);
                      }
                      else {
                        logger.log('info', '%s uploadFileToDocument, %s', req.user.name, 'success without Sharepoint');

                        res.send(set);
                      }
                    });
                  });
                }
                else {
                  var spPath = body.path;
                  var path = req.locals.data.body.originalPath;
                  var fileType = path.substring(path.lastIndexOf('.') + 1, path.length);
                  var set = {path: req.locals.data.body.originalPath, spPath: spPath, title: req.locals.data.body.name, documentType: fileType};
                  Document.findOne({_id: documentId}, function(err, doc) {
                    if(err) {
                      logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'Document.findOne', {error: err.message});

                    }
                    doc.path = req.locals.data.body.originalPath;
                    doc.spPath = spPath;
                    doc.title = req.locals.data.body.name;
                    doc.documentType = fileType;
                    doc.save(function(error, result) {
                      if(error) {
                        logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'doc.save', {error: error.message});

                        res.send(error);
                      }
                      else {
                        logger.log('info', '%s uploadFileToDocument, %s', req.user.name, 'success with Sharepoint');

                        res.send(set);
                      }
                    });
                  });
                }
              });
            }
            else {
              res.send('error');
            }
          }).catch(function(err) {
            logger.log('error', '%s uploadFileToDocument, %s', req.user.name, 'getUsers()', {error: err.message});

                });
              }
            });
          });
    });
        });


        return req.pipe(busboy);
      };








exports.create = function(req,res,next){
  console.log("exports.create") ;
  let folderId = req.body.folder;//contains folder Id
  let taskId = req.body.task;

  if(!folderId){
    var doc = {
      created: new Date(),
      updated: new Date(),
      title: '',
      status: 'new',
      path: undefined,
      spPath: undefined,
      description: '', //important
      serial: '',
      folder: undefined,
      task: new ObjectId(taskId),
      creator: new ObjectId(req.user._id),
      updater: new ObjectId(req.user._id),
      sender: new ObjectId(req.user._id),
      sendingAs: new ObjectId(),
      assign: new ObjectId(req.user._id),
      classification: '', //important
      size: 0,
      circles: [],
      relatedDocuments: [], //important
      watchers: [req.user._id], //important
      permissions: [{id: req.user._id, level: 'editor'}],
      doneBy: [],
      forNotice: [],
      documentType: ''
    };
    var obj = new Document(doc);
    obj.save(function(error, result) {
      if(error) {
        logger.log('error', '%s create, %s', req.user.name, ' obj.save()', {error: error.message});

        res.send(error);
      }
      else {
        logger.log('info', '%s create, %s', req.user.name, 'success without folder');
          User.findOne({_id: result.creator}).exec(function(err, creator) {
            result.creator = creator;
            // res.send(result);
            req.locals.result = result;
            next();
          })
      }
    });
  }
  else {
    Folder.findOne({_id: folderId}).exec(function(err, folderObj) {
      if(err) {
        logger.log('error', '%s create, %s', req.user.name, ' Folder.findOne', {error: err.message});

        res.send(err);
      }
      else {
        var doc = {
          created: new Date(),
          updated: new Date(),
          title: '',
          status: 'new',
          path: undefined,
          description: '', //important
          serial: '',
          folder: new ObjectId(folderId),
          task: new ObjectId(taskId),
          creator: new ObjectId(req.user._id),
          updater: new ObjectId(req.user._id),
          sender: new ObjectId(req.user._id),
          sendingAs: new ObjectId(),
          assign: new ObjectId(req.user._id),
          classification: '', //important
          size: 0,
          circles: [],
          relatedDocuments: [], //important
          watchers: folderObj.watchers, //important
          permissions: [{id: req.user._id, level: 'editor'}],
          documentType: '',
        };
        var obj = new Document(doc);
        obj.folder = folderObj;
        obj.save(function(error, result) {
          if(error) {
            logger.log('error', '%s create, %s', req.user.name, ' obj.save', {error: error.message});

            res.send(error);
          }
          else {
            logger.log('info', '%s create, %s', req.user.name, 'success with folder');
              User.findOne({_id: result.creator}).exec(function(err, creator) {
                  result.creator = creator;
                  // res.send(result);
                  req.locals.result = result;
                  next();
              })
          }
        });
      }
    });
  }
};



/**
*
* req.params.id contains document mongo id to delete
*
*/
exports.deleteDocument = function(req, res) {
  Document.find({_id: req.params.id}, function(err, file) {
    if(err) {
      logger.log('error', '%s deleteDocument, %s', req.user.name, ' Document.find', {error: err.message});
    }
    else {
      var spPath = file[0]._doc.spPath;
      if(spPath) {
        var fileName = spPath.substring(spPath.lastIndexOf('/') + 1, spPath.length);
        var spPath2 = spPath.substring(0, spPath.lastIndexOf('/'));
        var folderName = spPath.substring(spPath2.lastIndexOf('/') + 1, spPath2.length);
        var spPath2 = spPath2.substring(0, spPath2.lastIndexOf('/'));
        var libraryName = spPath2.substring(spPath2.lastIndexOf('/') + 1, spPath2.length);
        var user = req.user.email.substring(0, req.user.email.indexOf('@'));
        var context = {
          siteUrl: config.SPHelper.SPSiteUrl,
          creds: {
            username: config.SPHelper.username,
            password: config.SPHelper.password,
            domain: config.SPHelper.domain
          }
        };
        var options = {
          folder: '/' + libraryName + '/' + folderName,
          filePath: '/' + fileName
        };

        var json = {
          context: context,
          options: options
        };
        request({
          url: config.SPHelper.uri + '/api/delete',
          method: 'POST',
          json: json
        }, function(error, resp, body) {
          if(error) {
            logger.log('error', '%s deleteDocument, %s', req.user.name, ' request', {error: error.message});

          }
          else {
            logger.log('info', '%s deleteDocument, %s', req.user.name, 'success with SP');

            res.sendStatus(200);

          }
          //   var creator = folderName;
          //   if (creator == user) {
          //  }
        });


      }
    }

    Document.remove({_id: req.params.id}, function(err) {
      if(err) {
        logger.log('error', '%s deleteDocument, %s', req.user.name, ' Document.remove', {error: err.message});
      }
      else {
        logger.log('info', '%s deleteDocument, %s', req.user.name, 'success without SP');

        res.sendStatus(200);
      }
    });
  });

};

/**
* req.body contains zero permission array,entityName,entityId,description,name,assign,classification,relatedDocuments
*
*
*
*
*/
exports.update2 = function(req, res, next) {
  var zeroReq = [];
  for(var i = 0; i < req.locals.result.zero.length; i++) {
    zeroReq.push({UserId: req.body.zero[i]});
  }
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
  getDocuments(entity, id).then(function(documents) {
    var watchArray = req.body.watchers;
    watchArray.push(req.body.assign);
    Document.update({
      _id: id,
    }, {
      watchers: watchArray,
      description: req.body.description,
      updated: new Date(),
      name: req.body.name,
      assign: req.body.assign,
      classification: req.body.classification,
      relatedDocuments: relatedDocuments,
    }, {
      multi: true
    }, function(err, numAffected) {
      if(err) {
        logger.log('error', '%s update2, %s', req.user.name, ' Document.update', {error: err.message});

      }
      else {
        logger.log('info', '%s update2, %s', req.user.name, 'DB update success');

        if(documents != null && documents != undefined && documents.length > 0) {
          var watchReq = [];
          for(var i = 0; i < watchArray.length; i++) {
            if(watchArray[i] != undefined) {
              var str = watchArray[i].toString();
              watchReq.push({UserId: str});
            }
          }
          getUsers(watchReq).then(function(res) {
            var users = [];
            for(var i = 0; i < watchReq.length; i++) {
              users.push(watchReq[i].UserId);
            }
            var creators = getCreators(documents);
            getUsers(zeroReq).then(function(result) {
              var zero = [];
              for(var i = 0; i < zeroReq.length; i++) {
                zero.push(zeroReq[i].UserId);
              }
              var json = {
                siteUrl: config.SPHelper.SPSiteUrl,
                paths: documents,
                users: users,
                creators: creators,
                zero: zero
              };
              request({
                url: config.SPHelper.uri + '/api/share',
                method: 'POST',
                json: json
              }, function(error, resp, body) {
                if(error) {
                  logger.log('error', '%s update2, %s', req.user.name, ' request', {error: error.message});

                  res.send('error');
                }
                else {
                  logger.log('info', '%s update2, %s', req.user.name, 'success with SP');

                  res.send('OK');
                }
              });
            }).catch(function(err) {
              logger.log('error', '%s update2, %s', req.user.name, ' getUsers', {error: err.message});

            });
          }).catch(function(err) {
            logger.log('error', '%s update2, %s', req.user.name, ' getUsers', {error: err.message});

            res.send('error');

          });
        }
      }


    });
    next();
  }).catch(function(err) {
    logger.log('error', '%s update2, %s', req.user.name, ' getUsers', {error: err.message});

  });

};



exports.update = function(req, res, next) {
  console.log('document exports.update>>>>>>>>>');
  var docToUpdate;
  if(req.body.name) {
    if(req.body.name == 'watchers' || req.body.watchers) {
      var watchers = req.body.name == 'watchers' ? req.body.newVal : req.body.watchers.map(function(w) {
        return w._id;
      });
      Document.findOne({_id: req.params.id}, function(err, doc) {
        if(err) {
          logger.log('error', '%s update, %s', req.user.name, ' Document.findOne', {error: err.message});

        }
        docToUpdate = doc;
        var oldWatchers = [];
        doc.watchers.forEach(function(w) {
          oldWatchers.push(w.toString());
        });
        var spPath = doc.spPath;
        if(spPath) {
          var watchersReq = [], oldWatchersReq = [];
          oldWatchers.forEach(function(w) {
            oldWatchersReq.push({
              type: 'SP.Sharing.UserRoleAssignment',
              Role: 2,
              UserId: w,
            });
          });
          watchers.forEach(function(w) {
            watchersReq.push({
              type: 'SP.Sharing.UserRoleAssignment',
              Role: 2,
              UserId: w,
            });
          });
          var creator = [];
          if(doc.assign) {
            creator = [
              {
                type: 'SP.Sharing.UserRoleAssignment',
                Role: 2,
                UserId: doc.assign.toString(),
              }
            ];
          }

          getUsers(creator).then(function() {
            getUsers(watchersReq).then(function() {
              getUsers(oldWatchersReq).then(function() {
                var users = [], zero = [];
                watchersReq.forEach(function(w) {
                  users.push(w.UserId);
                });
                oldWatchersReq.forEach(function(w) {
                  zero.push(w.UserId);
                });
                var json = {
                  siteUrl: config.SPHelper.SPSiteUrl,
                  paths: [spPath],
                  users: users,
                  creators: [creator[0].UserId],
                  zero: zero
                };
                request({
                  url: config.SPHelper.uri + '/api/share',
                  method: 'POST',
                  json: json
                }, function(error, resp, body) {
                  if(error) {
                    logger.log('error', '%s update, %s', req.user.name, ' request', {error: error.message});

                  }
                  else {
                    logger.log('info', '%s update, %s', req.user.name, 'success with SP');

                  }
                });
              }).catch(function(err) {
                logger.log('error', '%s update, %s', req.user.name, ' getUsers', {error: err.message});

              });
            }).catch(function(err) {
              logger.log('error', '%s update, %s', req.user.name, ' getUsers', {error: err.message});

            });

          }).catch(function(err) {
            logger.log('error', '%s update, %s', req.user.name, ' getUsers', {error: err.message});

          });

        }
      });
    }
    else if(req.body.name == 'assign') {
      Document.findOne({_id: req.params.id}, function(err, doc) {
        if(err) {
          logger.log('error', '%s update, %s', req.user.name, ' Document.findOne', {error: err.message});

        }
        var spPath = doc.spPath;
        if(spPath) {
          var oldAssign = doc.assign;
          var assignReq = [
            {
              UserId: req.body.newVal
            }
          ];
          var oldAssignReq = [
            {
              UserId: oldAssign
            }
          ];
          getUsers(assignReq).then(function() {
            getUsers(oldAssignReq).then(function() {
              var json = {
                siteUrl: config.SPHelper.SPSiteUrl,
                paths: [spPath],
                users: [],
                creators: [assignReq[0].UserId],
                zero: [oldAssignReq[0].UserId]
              };
              request({
                url: config.SPHelper.uri + '/api/share',
                method: 'POST',
                json: json
              }, function(error, resp, body) {
                if(error) {
                  logger.log('error', '%s update, %s', req.user.name, ' request', {error: error.message});

                }
                else {
                  logger.log('info', '%s update, %s', req.user.name, 'success with SP');

                }
              });

            }).catch(function(err) {
              logger.log('error', '%s update, %s', req.user.name, ' getUsers', {error: err.message});

            });
          }).catch(function(err) {
            logger.log('error', '%s update, %s', req.user.name, ' getUsers', {error: err.message});

          });
        }
      });
    }

    Document.findOne({_id: req.params.id}, function(err, docToUpdate) {
      if(err) {
        logger.log('error', '%s update, %s', req.user.name, ' Document.findOne', {error: err.message});

      }
      docToUpdate['' + req.body.name] = req.body.newVal;
      docToUpdate['id'] = docToUpdate._id;

      if(req.body.watchers) {
        docToUpdate['watchers'] = req.body.watchers;
      }
      docToUpdate.save(function(err, result) {
        if(err) {
          logger.log('error', '%s update, %s', req.user.name, ' docToUpdate.save', {error: err.message});

          res.send(err);
        }
        else {
          result.populate('watchers', function(err, result) {
            if(err) {
              logger.log('error', '%s update, %s', req.user.name, ' result.populate', {error: err.message});

              res.send(err);
            }
            else {
              logger.log('info', '%s update, %s', req.user.name, 'DB update success');

              if(req.body.name == 'due') {
                Document.findOne({_id: req.params.id}, function(err, doc) {
                  if(err)logger.log('error', '%s update, %s', req.user.name, ' Document.findOne', {error: err.message});
                  doc.due = req.body.value;
                  doc.save();
                  res.send(doc);
                });
              }else{
                res.send(result);
              }
            }
          });

        }
      });

    });
  }
  else {
    res.send('OK');
  }

};


/**
* req.body.watchers
* req.body.
*
*
*
*/
exports.sign = function(req, res, next) {
  var zeroReq = [];
  for(var i = 0; i < req.locals.result.zero.length; i++) {
    zeroReq.push({UserId: req.locals.result.zero[i]});
  }
  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    offices: 'office',
    folders: 'folder',
  };
  var entity = entities[req.locals.data.entityName];
  var id = req.params.id;
  getDocuments(entity, id).then(function(documents) {
    var watchArray = req.body.watchers;
    watchArray.push(req.body.assign);
    Document.update({
      entity: entity,
      entityId: id
    }, {
      circles: req.body.circles,
      watchers: watchArray
    }, {
      multi: true
    }, function(err, numAffected) {
      if(documents != null && documents != undefined && documents.length > 0) {
        var watchReq = [];
        for(var i = 0; i < watchArray.length; i++) {
          if(watchArray[i] != undefined) {
            var str = watchArray[i].toString();
            watchReq.push({UserId: str});
          }
        }
        getUsers(watchReq).then(function(res) {
          var users = [];
          for(var i = 0; i < watchReq.length; i++) {
            users.push(watchReq[i].UserId);
          }
          var creators = getCreators(documents);
          getUsers(zeroReq).then(function(result) {
            var zero = [];
            for(var i = 0; i < zeroReq.length; i++) {
              zero.push(zeroReq[i].UserId);
            }
            var json = {
              siteUrl: config.SPHelper.SPSiteUrl,
              paths: documents,
              users: users,
              creators: creators,
              zero: zero
            };
            request({
              url: config.SPHelper.uri + '/api/share',
              method: 'POST',
              json: json
            }, function(error, resp, body) {
              if(error) {
                logger.log('error', '%s sign, %s', req.user.name, ' request', {error: error.message});

              }
              else {
                logger.log('info', '%s sign, %s', req.user.name, 'success with SP');

              }



            });
          });
        });
      }
    });
    next();
  });
};

exports.signNew = function(req, res, next) {
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
  }).exec(function(err, entity) {
    if(err) {
      logger.log('error', '%s signNew, %s', req.user.name, ' query', {error: error.message});

      req.locals.error = err;
    }
    if(!entity) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if(entity) {
      req.locals.data.body.watchers = entity.watchers;
      req.locals.data.body.watchers.push(entity.assign);
      req.locals.data.body.circles = entity.circles;
    }
    next();
  });
};

exports.signNew = function(req, res, next) {
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
  }).exec(function(err, entity) {
    if(err) {
      logger.log('error', '%s signNew, %s', req.user.name, ' query', {error: error.message});

      req.locals.error = err;
    }
    if(!entity) {
      req.locals.error = {
        status: 404,
        message: 'Entity not found'
      };
    }
    if(entity) {
      req.locals.data.body.watchers = entity.watchers;
      req.locals.data.body.watchers.push(entity.assign);
      req.locals.data.body.circles = entity.circles;
    }
    next();
  });
};


// update user document received.
exports.receiveDocument = function(req, res, next) {
  officeDocument  = req.body.officeDocument;
  var id = req.params.id;
  Document.update({_id: officeDocument.ref}, {$push: {readBy: {date: Date.now(), user: req.user._id}}}, function(error, result) {
    if(error) {
      //TBD
      logger.log('error', '%s receiveDocument, %s', req.user.name, '  Document.update', {error: error.message});
    }
    else {
      logger.log('info', '%s receiveDocument, %s', req.user.name, 'success');
    }
  });

  Document.update({_id: id}, {$set: {viewed: true}}, function(error, result) {
    if(error) {
      logger.log('error', '%s receiveDocument, %s', req.user.name, '  Document.update', {error: error.message});

      res.send(error);
    }
    else {
      logger.log('info', '%s receiveDocument, %s', req.user.name, 'success');

      res.send('ok');
    }
  });
};


// update user document distributed == viewed.
exports.distributedDocument = function(req, res, next) {
  officeDocument  = req.body.officeDocument;
  var id = req.params.id;
  Document.update({_id: id}, {$set: {status: 'viewed'}}, function(error, result) {
    if(error) {
      logger.log('error', '%s distributedDocument, %s', req.user.name, '  Document.update', {error: error.message});

      res.send(error);
    }
    else {
      logger.log('info', '%s distributedDocument, %s', req.user.name, 'success');

      res.send('ok');
    }
  });
};

// get user document distributed == viewed.
exports.readByDocument = function(req, res, next) {
  officeDocument  = req.body.officeDocument;
  var readBy = officeDocument.readBy;
  var readbyToId = [];
  readBy.forEach(function(element) {
    readbyToId.push(new mongoose.Types.ObjectId(element.user));
  });
  var id = req.params.id;
  User.find({
    _id: {$in: readbyToId}
  }, function(err, docs) {
    if(err) {
      logger.log('error', '%s readByDocument, %s', req.user.name, '   User.find', {error: err.message});

      res.send(error);
    }
    else {
      logger.log('info', '%s readByDocument, %s', req.user.name, 'success');

      res.send(docs);
    }
  });
};


// get users in document sentTo.
exports.sentToDocument = function(req, res, next) {
  officeDocument  = req.body.officeDocument;
  var sentTo = officeDocument.sentTo;
  var sentToId = [];
  sentTo.forEach(function(element) {
    sentToId.push(new mongoose.Types.ObjectId(element.user));
  });
  var id = req.params.id;
  User.find({
    _id: {$in: sentToId}
  }, function(err, docs) {
    if(err) {
      logger.log('error', '%s sentToDocument, %s', req.user.name, '   User.find', {error: err.message});

      res.send(error);
    }
    else {
      logger.log('info', '%s readByDocument, %s', req.user.name, 'success');

      res.send(docs);
    }
  });
};


exports.sendDocument = function(req, res, next) {
  var officeDocument = req.body.officeDocument;
  var sendingForm = req.body.sendingForm;
  var spPath = officeDocument.spPath;
  var assign = officeDocument.assign._id;
  var creators = officeDocument.creator ? [officeDocument.creator.username.toLowerCase()] : [];
  sendingForm['doneBy'] = sendingForm['doneBy'] ? sendingForm['doneBy'] : [];
  sendingForm['forNotice'] = sendingForm['forNotice'] ? sendingForm['forNotice'] : [];
  sendingForm['sendingAs'] = sendingForm['sendingAs'] ? sendingForm['sendingAs'] : null;
  sendingForm['ref'] = req.body.officeDocument._id;
  sendingForm['sender'] = req.user._id;
  var watchers = _.union(sendingForm['doneBy'], _.union(sendingForm['forNotice'], _.union([assign], [sendingForm['sendingAs']])));
  officeDocument.watchers.forEach(function(w) {
    watchers.push(w._id);
  });
  watchers = _.union(watchers, watchers);
  //watchers.filter(n => n).filter(n => true) ;
  watchers = watchers.filter(function(e) {
    return e;
  });
  sendingForm['status'] = 'sent';
  watchers.forEach(function(watcher) {
    var watcher = watcher._id ? watcher._id : watcher;
    if(watcher != sendingForm.sender) {
      var doc = {
        created: officeDocument.created,
        updated: officeDocument.created,
        title: sendingForm.title,
        status: 'received',
        path: officeDocument.path,
        spPath: officeDocument.spPath,
        description: officeDocument.description,
        serial: officeDocument.serial,
        creator: officeDocument.creator,
        updater: officeDocument.updater,
        classification: officeDocument.classification,
        tags: officeDocument.tags,
        forNotice: sendingForm['forNotice'],
        doneBy: sendingForm['doneBy'],
        watchers: [watcher],
        documentType: officeDocument.documentType,
        sender: sendingForm['sender'],
        sendingAs: sendingForm['sendingAs'],
        ref: sendingForm['ref']
      };
      var doc2 = new Document(doc);
      doc2.save(function(error, result) {
        if(error || !result) {
          logger.log('error', '%s sendDocument, %s', req.user.name, '    doc2.save', {error: err.message});
        }
        else if(sendingForm['sendWithAttachments']) {

          Attachment.find({entityId: officeDocument._id}).then(function(attachments) {
            attachments.forEach(function(oldAttachment) {


              var attachment = new Attachment({
                entity: 'officeDocuments',
                entityId: result._doc._id,
                issue: 'update',
                issueId: new ObjectId(),
                name: oldAttachment.name,
                path: oldAttachment.path,
                attachmentType: oldAttachment.attachmentType,
                size: oldAttachment.size,
                created: oldAttachment.created,
                updated: oldAttachment.updated,
                creator: oldAttachment.creator,
                watchers: [watcher],
              });
              attachment.save(function(error, result2) {
                if(error || !result2) {
                  logger.log('error', '%s sendDocument, %s', req.user.name, '    attachment.save', {error: 'error'});
                }
                else {
                  logger.log('info', '%s sendDocument, %s', req.user.name, 'success');

                }
              });
            });

          });
        }

      });
    }

  });

  Document.findOne({
    _id: officeDocument._id
  }, function(err, prevDoc) {
    var oldWatchers = [];
    prevDoc.watchers.forEach(function(w) {
      oldWatchers.push({UserId: w});
    });
    var watchersReq = [];
    watchers.forEach(function(w) {
      watchersReq.push({UserId: w});
    });

    // update the original document with who it was sent to + date.
    sentTo = [];
    watchers.forEach(function(watcher) {
      watcher != sendingForm.sender ? sentTo.push({date: Date.now(), user: watcher}) : '';
    });
    if(sentTo.length) {
      sendingForm = Object.assign({sentTo, sendingForm});
      sendingForm.status = 'sent';
      sendingForm.doneBy = req.body.sendingForm.doneBy;
      sendingForm.forNotice = req.body.sendingForm.forNotice;
      sendingForm.classification = req.body.sendingForm.classification;

    }
    Document.update({_id: officeDocument._id}, {$set: sendingForm}, function(error, result) {
      if(error || !result) {
        logger.log('error', '%s sendDocument, %s', req.user.name, '    Document.update', {error: 'error'});

        res.send(error);
      }
      else {
        getUsers(oldWatchers).then(function() {
          getUsers(watchersReq).then(function() {
            var zero = [];
            var users = [];
            oldWatchers.forEach(function(w) {
              zero.push(w.UserId);
            });
            watchersReq.forEach(function(w) {
              users.push(w.UserId);
            });
            var json = {
              siteUrl: config.SPHelper.SPSiteUrl,
              paths: [spPath],
              users: users,
              creators: creators,
              zero: zero
            };
            request({
              url: config.SPHelper.uri + '/api/share',
              method: 'POST',
              json: json
            }, function(error, resp, body) {
              if(error) {
                logger.log('error', '%s sendDocument, %s', req.user.name, '    request', {error: error.message});

              }
              else {
                logger.log('info', '%s sendDocument, %s', req.user.name, 'success');

              }
              res.send(sendingForm);
            }
            );
          });
        });
      }
    });
  });
};

var copyFile = function(file, dir2) {

  //gets file name and adds it to dir2
  // var f = path.basename(file);
  // var source = fs.createReadStream(file);
  // var dest = fs.createWriteStream(path.resolve("http://localhost:3002/files/2018/01/22/", f));

  // source.pipe(dest);
  // source.on('end', function() { console.log('Succesfully copied'); });
  // source.on('error', function(err) { console.log(err); });
  file = '/home/sraya/Desktop/ICU_25.12.17/root/files/2018/01/22/1516632480971-Combined.pdf';
  console.time('copying');
  fs.stat(file, function(err, stat) {
    // var filesize = stat.size
    // var bytesCopied = 0

    var readStream = fs.createReadStream(file);

    readStream.on('data', function(buffer) {
      //bytesCopied+= buffer.length
      //var porcentage = ((bytesCopied/filesize)*100).toFixed(2)
    });
    readStream.on('end', function() {
      console.timeEnd('copying');
    });
    readStream.pipe(fs.createWriteStream('/home/sraya/Desktop/ICU_25.12.17/root/files/2018/01/22/yyyy.pdf'));
  });
};

exports.indexInFolder = function(req, res, next) {
  let { id } = req.params;
  Document.findById(id)
  .then(function(doc) {
    if(!doc.folder) throw new httpError(400, 'Document not in a folder');
    if(doc.folderIndex) throw new httpError(400, 'Document already indexed');
    return doc;
  })
  .then(function(doc) {
    return Document.find({
      folder: doc.folder
    }, '_id')
    .then(function(docs) {
      let ids = docs.map(doc => String(doc._id));
      let index = ids.indexOf(id);
      index++;
      doc.folderIndex = index;
      return doc;
    })
  })
  .then(function(doc) {
    return doc.save();
  })
  .then(function(doc) {
    res.json(doc);
  })
  .catch(function(err) {
    next(err);
  })
}
