'use strict';

require('../models/office');

var options = {
  includes: 'assign watchers',
  defaults: {
    watchers: []
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var officeController = crud('offices', options);
var config = require('meanio').loadConfig();

var mongoose = require('mongoose'),
  Office = mongoose.model('Office'),
  TemplateDoc = mongoose.model('TemplateDoc'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User'),
  Folder = mongoose.model('Folder'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');

var Order = require('../models/order')
var logger = require('../services/logger')

Object.keys(officeController).forEach(function (methodName) {
  if (methodName !== 'destroy') {
    exports[methodName] = officeController[methodName];
  }
});

exports.destroy = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }

  Task.find({
    office: req.params.id,
    currentUser: req.user
  }).then(function (tasks) {
    //FIXME: do it with mongo aggregate
    var groupedTasks = _.groupBy(tasks, function (task) {
      return task.discussions.length > 0 ? 'release' : 'remove';
    });

    groupedTasks.remove = groupedTasks.remove || [];
    groupedTasks.release = groupedTasks.release || [];

    Task.update({
      _id: {
        $in: groupedTasks.release
      }
    }, {
        office: null
      }).exec();

    Task.remove({
      _id: {
        $in: groupedTasks.remove
      }
    }).then(function () {
      //FIXME: needs to be optimized to one query
      groupedTasks.remove.forEach(function (task) {
        elasticsearch.delete(task, 'task', null, next);
      });

      var removeTaskIds = _(groupedTasks.remove)
        .pluck('_id')
        .map(function (i) {
          return i.toString();
        })
        .value();

      User.update({
        'profile.starredTasks': {
          $in: removeTaskIds
        }
      }, {
          $pull: {
            'profile.starredTasks': {
              $in: removeTaskIds
            }
          }
        }).exec();
    });

    officeController.destroy(req, res, next);

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



function updateAllTemplates(officeId, watcher, action) {
  return new Promise(function (fullfil, reject) {
    Office.find({ '_id': officeId }, function (err1, office) {
      TemplateDoc.find({ 'office': officeId }, function (err2, templates) {
        var paths = [];
        var officeWatchers = office[0]._doc.watchers;
        templates.forEach(function (template) {
          if (template.spPath) {
            paths.push(template.spPath);
          }
        });
        var zeroReq = [];
        var usersReq = [];
        if (action == 'added') {
          zeroReq = [];
          officeWatchers.forEach(function(w){
            usersReq.push({'UserId':w});
          });
        }
        else {
          zeroReq = [{ 'UserId': watcher }];
          officeWatchers.forEach(function(w){
            if(w.toString()!=watcher.toString()){
              usersReq.push({'UserId':w});
            }
            
          });
        }
        var creators = [];
        
        
        getUsers(zeroReq).then(function (zeroResult) {
          getUsers(usersReq).then(function (result) {
            var users = [];
            var zero =[];
            usersReq.forEach(function (u) {
              users.push(u.UserId);
            });
            zeroReq.forEach(function (u) {
              zero.push(u.UserId);
            });
              var json = {
                'siteUrl': config.SPHelper.SPSiteUrl,
                'paths': paths,
                'users': users,
                'creators': creators,
                'zero': zero
              };
              console.log("HI");
              request({
                'url': config.SPHelper.uri + "/api/share",
                'method': 'POST',
                'json': json
              }, function (error, resp, body) {
                if (error) {
                  logger.log('error', '%s updateAllTemplates, %s', req.user.name, ' request', {error: error.stack});
                  reject(error);
                }
                else {
                  fullfil('ok');
                }
              });
            });
          });
        });

      });
    });
}

exports.update = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }
  console.log('************************************watcher action********************************************')
  console.log(req.body)
  console.log(JSON.stringify(req.body));
  console.log(req.body.watcherAction);
  console.log(req.body.watcherId);
  if (req.body.watcherAction) {
    if (req.body.watcherAction == 'added') {
      Folder.update(
        {
          office: req.body._id
        }, {
          $push: { watchers: req.body.watcherId }
        }, { multi: true }).exec();
      TemplateDoc.update(
        {
          office: req.body._id
        }, {
          $push: { watchers: req.body.watcherId }
        }, { multi: true }).exec(function () {
          if(config.SPHelper.isWorking){
          updateAllTemplates(req.body._id, req.body.watcherId, req.body.watcherAction).then(function (result) {
          
          });
        }

        });

    } else {
      Folder.update(
        {
          office: req.body._id
        }, {
          $pull: { watchers: req.body.watcherId }
        }, { multi: true }).exec();
      TemplateDoc.update(
        {
          office: req.body._id
        }, {
          $pull: { watchers: req.body.watcherId }
        }, { multi: true }).exec(function(){
          if(config.SPHelper.isWorking){
            
          updateAllTemplates(req.body._id, req.body.watcherId, req.body.watcherAction).then(function (result) {
            
                      });
                    }
        });
    }


  }

  officeController.update(req, res, next);
};

exports.getByEntity = function (req, res, next) {
  if (req.locals.error) {
    logger.log('error', '%s getByEntity, %s', req.user.name, ' req.locals.error', {error: req.locals.error});
    return next();
  }

  var entities = {
    users: 'creator',
    _id: '_id',
    discussions: 'discussion'
  },
    entityQuery = {};

  entityQuery[entities[req.params.entity]] = req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if (ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var query = req.acl.mongoQuery('Office');

  query.find(entityQuery);

  query.populate(options.includes);

  Office.find(entityQuery).count({}, function (err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function (err, offices) {
      if (err) {
        logger.log('error', '%s getByEntity, %s', req.user.name, ' query.exec()', {error: err.message});
        req.locals.error = {
          message: 'Can\'t get offices'
        };
      } else {
        if (starredOnly) {
          offices.forEach(function (office) {
            office.star = true;
          });
        }
        if (pagination.sort == "custom") {
          var temp = new Array(offices.length);
          var officeTemp = offices;
          Order.find({ name: "Office", discussion: offices[0].discussion }, function (err, data) {
            data.forEach(function (element) {
              for (var index = 0; index < officeTemp.length; index++) {
                if (JSON.stringify(officeTemp[index]._id) === JSON.stringify(element.ref)) {
                  temp[element.order - 1] = offices[index];
                }

              }
            });
            offices = temp;
            req.locals.result = offices;
            next();
          })
        }
        else {

          req.locals.result = offices;
          next();
        }
      }
    });

  });


};

exports.getByDiscussion = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }

  if (req.params.entity !== 'discussions') return next();

  var entityQuery = {
    discussions: req.params.id,
    office: {
      $ne: null,
      $exists: true
    }
  };

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if (ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var Query = Task.find(entityQuery, {
    office: 1,
    _id: 0
  });
  Query.populate('office');

  Query.exec(function (err, offices) {
    if (err) {
      logger.log('error', '%s getByDiscussion, %s', req.user.name, ' query.exec()', {error: err.message});
      req.locals.error = {
        message: 'Can\'t get offices'
      };
    } else {
      offices = _.uniq(offices, 'office._id');
      offices = _.map(offices, function (item) {
        return item.office;
      });

      if (starredOnly) {
        offices.forEach(function (office) {
          office.star = true;
        });
      }

      req.locals.result = offices;

      next();
    }
  });
};