'use strict';

require('../models/folder');

var options = {
  includes: 'assign watchers office folder',
  defaults: {
    watchers: [],
    office: undefined
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var folderController = crud('folders', options);

var mongoose = require('mongoose'),
  Folder = mongoose.model('Folder'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User'),
  Document = mongoose.model('Document'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');

var Order = require('../models/order');

Object.keys(folderController).forEach(function(methodName) {
  if(methodName !== 'destroy') {
    exports[methodName] = folderController[methodName];
  }
});

exports.destroy = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  Task.find({
    folder: req.params.id,
    currentUser: req.user
  }).then(function(tasks) {
    //FIXME: do it with mongo aggregate
    var groupedTasks = _.groupBy(tasks, function(task) {
      return task.discussions.length > 0 ? 'release' : 'remove';
    });

    groupedTasks.remove = groupedTasks.remove || [];
    groupedTasks.release = groupedTasks.release || [];

    Task.update({
      _id: {
        $in: groupedTasks.release
      }
    }, {
      folder: null
    }).exec();

    Task.remove({
      _id: {
        $in: groupedTasks.remove
      }
    }).then(function() {
      //FIXME: needs to be optimized to one query
      groupedTasks.remove.forEach(function(task) {
        elasticsearch.delete(task, 'task', null, next);
      });

      var removeTaskIds = _(groupedTasks.remove)
        .pluck('_id')
        .map(function(i) {
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

    folderController.destroy(req, res, next);

  });
};

exports.update = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  if(req.body.watcherAction) {
    if(req.body.watcherAction == 'added') {
      Document.update(
        {
          folder: req.body._id
        }, {
          $push: {watchers: req.body.watcherId}
        }, {multi: true}).exec();
    }
    else {
      Document.update(
        {
          folder: req.body._id
        }, {
          $pull: {watchers: req.body.watcherId}
        }, {multi: true}).exec();
    }
  }

  folderController.update(req, res, next);
};

exports.getByEntity = function(req, res, next) {

  if(req.locals.error) {
    return next();
  }

  var entities = {
      offices: 'office',
      users: 'assign',
      discussions: 'discussions',
      tags: 'tags'
    },
    entityQuery = {
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
  entityQuery[entities[req.params.entity]] = req.params.id instanceof Array ? {
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
  var query = req.acl.mongoQuery('Folder');

  query.find(entityQuery);
  query.populate(options.includes);

  Folder.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;


    var pagination = req.locals.data.pagination;
    if(pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }
    //if(pagination.sort == "custom"){
    // Task.aggregate([
    //   {$unwind: '$ref'},
    //    {
    //      $lookup:{
    //              from: 'Ordertasks',
    //              localField: '_id',
    //              foreignField: 'ref',
    //              as: 'tasks'}
    //      },
    //       {$sort: {'tasks.order':1 }}
    //  ]).exec(function(err, tasks) {
    //  });
    // query.exec(function(err, tasks) {
    //       tasks.forEach(function(element){
    //           Order.find({ref:element._id},function(doc){

    //           })
    //       })
    //     })
    //}
    query.exec(function(err, folders) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get tags'
        };
      }
      else if(starredOnly) {
        folders.forEach(function(folder) {
          folder.star = true;
        });
      }
      if(pagination.sort == 'custom') {
        var temp = new Array(tasks.length);
        var tasksTemp = tasks;
        Order.find({name: 'Task', project: tasks[0].project}, function(err, data) {
          data.forEach(function(element) {
            for(var index = 0; index < tasksTemp.length; index++) {
              if(JSON.stringify(tasksTemp[index]._id) === JSON.stringify(element.ref)) {
                temp[element.order - 1] = tasks[index];
              }

            }
          });
          tasks = temp;
          req.locals.result = tasks;
          next();
        });
      }
      else {
        req.locals.result = folders;

        next();
      }
    });
  });


};

// exports.getByEntity = function(req, res, next) {
//   if (req.locals.error) {
//     return next();
//   }

//   var entities = {
//     users: 'creator',
//     _id: '_id',
//     discussions: 'discussion'
//   },
//     entityQuery = {};

//   entityQuery[entities[req.params.entity]] = req.params.id;

//   var starredOnly = false;
//   var ids = req.locals.data.ids;
//   if (ids && ids.length) {
//     entityQuery._id = {
//       $in: ids
//     };
//     starredOnly = true;
//   }
//   var query = req.acl.mongoQuery('Folder');

//   query.find(entityQuery);

//   query.populate(options.includes);

//   Folder.find(entityQuery).count({}, function(err, c) {
//     req.locals.data.pagination.count = c;

//     var pagination = req.locals.data.pagination;
//     if (pagination && pagination.type && pagination.type === 'page') {
//       query.sort(pagination.sort)
//         .skip(pagination.start)
//         .limit(pagination.limit);
//     }

//     query.exec(function(err, folders) {
//       if (err) {
//         req.locals.error = {
//           message: 'Can\'t get folders'
//         };
//       } else {
//         if (starredOnly) {
//           folders.forEach(function(folder) {
//             folder.star = true;
//           });
//         }
//         if(pagination.sort == "custom"){
//         var temp = new Array(folders.length) ;
//         var folderTemp = folders;
//         Order.find({name: "Folder", discussion:folders[0].discussion}, function(err, data){
//             data.forEach(function(element) {
//               for (var index = 0; index < folderTemp.length; index++) {
//                 if(JSON.stringify(folderTemp[index]._id) === JSON.stringify(element.ref)){
//                     temp[element.order - 1] = folders[index];
//                 }

//               }
//             });
//              folders = temp;
//             req.locals.result = folders;
//             next();
//         })
//       }
//       else{

//         req.locals.result = folders;
//          next();
//       }
//       }
//     });

//   });


// };

exports.tagsList = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Folder');
  query.distinct('tags', function(error, tags) {
    if(error) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    }
    else {
      req.locals.result = tags || [];
    }

    next();
  });
};

exports.getByDiscussion = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  if(req.params.entity !== 'discussions') return next();

  var entityQuery = {
    discussions: req.params.id,
    folder: {
      $ne: null,
      $exists: true
    }
  };

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if(ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var Query = Task.find(entityQuery, {
    folder: 1,
    _id: 0
  });
  Query.populate('folder');

  Query.exec(function(err, folders) {
    if(err) {
      req.locals.error = {
        message: 'Can\'t get folders'
      };
    }
    else {
      folders = _.uniq(folders, 'folder._id');
      folders = _.map(folders, function(item) {
        return item.folder;
      });

      if(starredOnly) {
        folders.forEach(function(folder) {
          folder.star = true;
        });
      }

      req.locals.result = folders;

      next();
    }
  });
};
