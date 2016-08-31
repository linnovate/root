'use strict';

require('../models/project');

var options = {
  includes: 'assign watchers',
  defaults: {
    watchers: []
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var projectController = crud('projects', options);

var mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');

Object.keys(projectController).forEach(function(methodName) {
  if (methodName !== 'destroy') {
    exports[methodName] = projectController[methodName];
  }
});

exports.destroy = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  Task.find({
    project: req.params.id,
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
      project: null
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

    projectController.destroy(req, res, next);

  });
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
  var query = req.acl.mongoQuery('Project');
  
  query.find(entityQuery);

  query.populate(options.includes);

  Project.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, projects) {
      if (err) {
        req.locals.error = {
          message: 'Can\'t get projects'
        };
      } else {
        if (starredOnly) {
          projects.forEach(function(project) {
            project.star = true;
          });
        }

        req.locals.result = projects;
      }

      next();
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
    project: {
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
    project: 1,
    _id: 0
  });
  Query.populate('project');

  Query.exec(function(err, projects) {
    if (err) {
      req.locals.error = {
        message: 'Can\'t get projects'
      };
    } else {
      projects = _.uniq(projects, 'project._id');
      projects = _.map(projects, function(item) {
        return item.project;
      });

      if (starredOnly) {
        projects.forEach(function(project) {
          project.star = true;
        });
      }

      req.locals.result = projects;

      next();
    }
  });
};