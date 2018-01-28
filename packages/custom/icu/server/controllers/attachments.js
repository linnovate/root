'use strict';

var mean = require('meanio'),
  path = require('path'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  config = require('meanio').loadConfig(),
  Busboy = require('busboy'),
  q = require('q');

var options = {
  includes: 'creator updater'
};

var crud = require('../controllers/crud.js');
var attachment = crud('attachments', options);
var Task = require('../models/task'),
  Attachment = require('../models/attachment');


Object.keys(attachment).forEach(function (methodName) {
  exports[methodName] = attachment[methodName];
});

exports.getByEntity = function (req, res, next) {

  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    updates: 'update',
    offices: 'office',
    folders: 'folder',
    officeDocuments: 'officeDocuments'
  },
    entity = entities[req.params.entity];

  Attachment.find({
    entity: entity,
    entityId: req.params.id
  }, function (err, data) {
    if (err) {
      req.locals.error = err;
    } else {
      req.locals.result = data
    }
    next();
  });


  // var query = {
  //     "query": {
  //       "filtered" : { 
  //          "filter" : {
  //             "bool" : {
  //               "must" : [
  //                  { "term" : {"entity" : entity}}, 
  //                  { "term" : {"entityId" : req.params.id}} 
  //               ]

  //            }
  //          }
  //       }
  //   }
  //    	};


  //   mean.elasticsearch.search({index: 'attachment', 'body': query, size: 3000}, function (err, response) {
  //     if (err) {
  //       res.status(200).send([]);
  //     }
  //     else {
  //       res.send(response.hits.hits.map(function (item) {
  //         return item._source;
  //       }));
  //     }
  //   });
};

var formatDate = function (date) {
  var yyyy = date.getFullYear().toString();
  var mm = (date.getMonth() + 1).toString();
  var dd = date.getDate().toString();
  return yyyy + '/' + (mm[1] ? mm : '0' + mm[0]) + '/' + (dd[1] ? dd : '0' + dd[0]);
};

exports.upload = function (req, res, next) {
  var d = formatDate(new Date());

  req.locals.data.attachments = [];
  req.locals.data.body = {};

  var busboy = new Busboy({
    headers: req.headers
  });

  var hasFile = false;

  busboy.on('file', function (fieldname, file, filename) {
    var port = config.https && config.https.port ? config.https.port : config.http.port;
    var saveTo = path.join(config.attachmentDir, d, new Date().getTime() + '-' + path.basename(filename));
    var hostFileLocation = config.host + ':' + config.isPortNeeded ? port : '' + saveTo.substring(saveTo.indexOf('/files'));
    var fileType = path.extname(filename).substr(1).toLowerCase();

    mkdirp(path.join(config.attachmentDir, d), function () {
      file.pipe(fs.createWriteStream(saveTo)).on('close', function (err) {

        var arr = hostFileLocation.split("/files");
        var pathFor = "./files" + arr[1];

        var stats = fs.statSync(pathFor);
        //var stats = fs.statSync("." + saveTo.substring(saveTo.indexOf('/files')));
        console.log(pathFor + 'test path')

        var fileSizeInBytes = stats["size"];
        //Convert the file size to megabytes (optional)
        //var fileSizeInMegabytes = fileSizeInBytes;
        
        req.locals.data.body.size = fileSizeInBytes;

      });

      // });

      req.locals.data.body.name = filename;
      req.locals.data.body.path = hostFileLocation;
      req.locals.data.body.attachmentType = fileType;


      // var arr = hostFileLocation.split("/files");
      // var pathFor = "./files" + arr[1];

      // var stats = fs.statSync(pathFor);
      // var fileSizeInBytes = stats["size"];
      // //Convert the file size to megabytes (optional)
      // var fileSizeInMegabytes = fileSizeInBytes / 1000000.0;

      // req.locals.data.body.size = fileSizeInMegabytes;
     
      req.locals.data.body.size = file._readableState.length;
      
      hasFile = true;

      //});    
    });

  });

  busboy.on('field', function (fieldname, val) {
    req.locals.data.body[fieldname] = val;
  });

  busboy.on('finish', function () {
    if (!hasFile) {
      req.locals.error = {
        message: 'No file was attached'
      };
    }

    next();
  });

  return req.pipe(busboy);
};

exports.deleteFile = function (req, res) {
  Attachment.find({ _id: req.params.id },
    function (err, file) {
      if (err) {
        console.log(err)
      } else {
        Attachment.count({path:file[0]._doc.path},function(err,c){
          Attachment.remove({ _id: req.params.id }, function (err) {
            if (err) {
              console.log(err)
            } else {
              if(!err && c<=1){
                var strUrl = file[0]._doc.path;
                var index = strUrl.indexOf('/files');
                var pathFile = '.' + strUrl.substring(index);
                fs.stat(pathFile, function (err, stats) {
                  if (err) {
                    console.log(JSON.stringify(err))
                  } else {
                    if (stats.isFile()) {
                      fs.unlink(pathFile, function (err) {
                        if (err) {
                          console.log(JSON.stringify(err));
                        } else {
                          Attachment.remove({ _id: req.params.id }, function (err) {
                            if (err) {
                              console.log(err)
                            } else {
                               res.sendStatus(200);
                            };
                          });
                        }
                      })
                    }
                  }
                });
              }
              else{
                res.sendStatus(200);
              }
               

            };
          });
          
        });
      
      }
    });
    return res;
};


function MyTasks(req) {
  var deffered = q.defer();

  Task.find({
    assign: req.user._id
  }, function (err, tasks) {
    if (err) {
      deffered.reject(err);
    } else {
      deffered.resolve(tasks.map(function (t) {
        return t._id
      }));
    }
  })
  return deffered.promise

}

exports.getMyTasks = function (req, res, next) {
  // if (req.locals.error) {
  //    	return next();
  //  	}

  MyTasks(req).then(function (data) {
    /*var query = {
		    "query": {
		      "filtered" : { 
		         "filter" : {
		            "bool" : {
		              "must" : [
		                 { "term" : {"entity" : 'task'}}, 
		                 { "terms" : {"entityId" : data}} 
		              ]
		        
		           }
		         }
		      }
		  	}
	   	};

		  mean.elasticsearch.search({index: 'attachment', 'body': query, size: 3000}, function (err, response) {
		    if (err) {
		      req.locals.error = err;
		    }
		    else {
		      req.locals.result = response.hits.hits.map(function (item) {
		        return item._source;
		      });
		    }
		  });*/

    Attachment.find({
      entity: 'task',
      entityId: {
        $in: data
      }
    }, function (err, data) {
      if (err) {
        req.locals.error = err;
      } else {
        req.locals.result = data
      }
      next();
    })
  }, function (err) {
    req.locals.error = err;
    next();
  })

}

exports.getByPath = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Attachment');
  var path = decodeURI(req.url).replace(/pdf$/, '');
  var conditions = {
    path: new RegExp(path)
  };
  query.findOne(conditions).exec(function (err, attachment) {
    if (err || !attachment ) {
      var query = req.acl.mongoQuery('Document');
      query.findOne(conditions).exec(function (err, attachment) {
        if (err || !attachment ) {
          var query = req.acl.mongoQuery('TemplateDoc');
          query.findOne(conditions).exec(function (err, attachment) {
          if (err || !attachment ) {
            req.locals.error = {
              status: 404,
              message: 'Entity not found'
            };
            next();
          }
          else{
            next();
          }
      });
        }
        else{
          next();
        }
        
      });
    }
    else{
      next();
    }
    
  });
};



exports.sign = function (req, res, next) {
  var watchArray = req.body.watchers;
  watchArray.push(req.body.assign);
  var entities = {
    projects: 'project',
    tasks: 'task',
    discussions: 'discussion',
    offices: 'office',
    folders: 'folder'
  };
  Attachment.update({
    entity: entities[req.locals.data.entityName],
    entityId: req.params.id
  }, {
      circles: req.body.circles,
      watchers: watchArray
    }, {
      multi: true
    }, function (err, numAffected) {
      next();
    });
}

exports.signNew = function (req, res, next) {
  var entities = {
    project: 'Project',
    task: 'Task',
    discussion: 'Discussion',
    office: 'Office',
    folder: 'Folder',
    officeDocuments: 'Document'
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

