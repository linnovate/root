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

var mongoose = require('mongoose'),
  Office = mongoose.model('Office'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User'),
  Folder = mongoose.model('Folder'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');

var Order = require('../models/order')

Object.keys(officeController).forEach(function(methodName) {
  if (methodName !== 'destroy') {
    exports[methodName] = officeController[methodName];
  }
});

exports.destroy = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  Task.find({
    office: req.params.id,
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
      office: null
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

    officeController.destroy(req, res, next);

  });
};

exports.update = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  if (req.body.watcherAction) {
    if (req.body.watcherAction == 'added') {
      Folder.update(
        {
          office: req.body._id
        }, {
          $push: { watchers: watcherId }
      }).exec();
    } else {
      Folder.update(
        {
          office: req.body._id
        }, {
          $pull: { watchers: watcherId }
      }).exec();
    }
  }

  officeController.update(req, res, next);
};

exports.getByEntity = function(req, res, next) {
  if (req.locals.error) {
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

  Office.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, offices) {
      if (err) {
        req.locals.error = {
          message: 'Can\'t get offices'
        };
      } else {
        if (starredOnly) {
          offices.forEach(function(office) {
            office.star = true;
          });
        }
        if(pagination.sort == "custom"){
        var temp = new Array(offices.length) ;
        var officeTemp = offices;
        Order.find({name: "Office", discussion:offices[0].discussion}, function(err, data){
            data.forEach(function(element) {
              for (var index = 0; index < officeTemp.length; index++) {
                if(JSON.stringify(officeTemp[index]._id) === JSON.stringify(element.ref)){
                    temp[element.order - 1] = offices[index];
                }
                
              }
            });
             offices = temp;
            req.locals.result = offices;
            next();
        })
      }
      else{
       
        req.locals.result = offices;
         next();
      }
      }
    });
    
  });


};

exports.getByDiscussion = function(req, res, next) {
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

  Query.exec(function(err, offices) {
    if (err) {
      req.locals.error = {
        message: 'Can\'t get offices'
      };
    } else {
      offices = _.uniq(offices, 'office._id');
      offices = _.map(offices, function(item) {
        return item.office;
      });

      if (starredOnly) {
        offices.forEach(function(office) {
          office.star = true;
        });
      }

      req.locals.result = offices;

      next();
    }
  });
};