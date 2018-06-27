'use strict';

require('../models/project');

var options = {
  includes: 'assign watchers subProjects',
  defaults: {
    assign: undefined,
    watchers: []
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var task = crud('tasks', options);
var project = crud('projects', options);

var mongoose = require('mongoose'),
  Project = mongoose.model('Project'),
  projectModel = require('../models/project'),
  Task = mongoose.model('Task'),
  User = mongoose.model('User'),
  _ = require('lodash'),
  Discussion = require('./discussion.js'),
  discussion = require('../models/discussion'),
  elasticsearch = require('./elasticsearch.js');

var Order = require('../models/order');

Object.keys(project).forEach(function(methodName) {
  if(methodName !== 'destroy') {
    exports[methodName] = project[methodName];
  }
});

exports.create = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  req.body.discussions = [];
  if(req.body.discussion) {
    req.body.discussions = [req.body.discussion];
    req.body.tags = [];
    discussion.findById(req.body.discussion, function(err, discussion) {
      if(discussion && discussion.project) {
        req.body.project = discussion.project;
      }
      project.create(req, res, next);
    });
  }
  else project.create(req, res, next);
};

exports.update = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  if(req.body.discussion) {
    var alreadyAdded = _(req.locals.result.discussions).any(function(d) {
      return d.toString() === req.body.discussion;
    });

    if(!alreadyAdded) {
      req.body.discussions = req.locals.result.discussions;
      req.body.discussions.push(req.body.discussion);
    }
  }

  if(req.body.subProjects && req.body.subProjects.length && !req.body.subProjects[req.body.subProjects.length - 1]._id) {
    req.body.subProjects.pop();
  }

  project.update(req, res, next);
};

exports.destroy = function(req, res, next) {
  if(req.locals.error) {
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

    project.destroy(req, res, next);

  });
};

exports.tagsList = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Project');
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

exports.getByEntity = function(req, res, next) {
  if(req.locals.error) {
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
  if(ids && ids.length) {
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
    if(pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, projects) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get projects'
        };
      }
      else {
        if(starredOnly) {
          projects.forEach(function(project) {
            project.star = true;
          });
        }
        if(pagination.sort == 'custom') {
          var temp = new Array(projects.length);
          var projectTemp = projects;
          Order.find({name: 'Project', discussion: projects[0].discussion}, function(err, data) {
            data.forEach(function(element) {
              for(var index = 0; index < projectTemp.length; index++) {
                if(JSON.stringify(projectTemp[index]._id) === JSON.stringify(element.ref)) {
                  temp[element.order - 1] = projects[index];
                }

              }
            });
            projects = temp;
            req.locals.result = projects;
            next();
          });
        }
        else {

          req.locals.result = projects;
          next();
        }
      }
    });
  });
};

exports.getSubProjects = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery('Project');
  query.findOne({
    _id: req.params.id,
    tType: {$ne: 'template'}
  }, {
    subProjects: 1
  })
    .populate('subProjects')
    .deepPopulate('subProjects.subProjects subProjects.watchers')
    .exec(function(err, project) {
      if(err) {
        req.locals.error = err;
      }
      else if(project) {
        req.locals.result = project.subProjects;
      }
      next();
    });
};

exports.updateParent = function(req, res, next) {
  if(req.locals.error || !req.body.parent) {
    return next();
  }
  var data = {
    $push: {
      subProjects: req.locals.result._id
    }
  };
  projectModel.findOneAndUpdate({
    _id: req.body.parent
  }, data, function(err, project) {
    if(err) {
      req.locals.error = err;
    }
    next();
  });

};

exports.removeSubProject = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  projectModel.findOne({
    _id: req.params.id,
    tType: {$ne: 'template'}
  }, function(err, subProject) {
    if(err) {
      req.locals.error = err;
    }
    else {
      projectModel.update({
        _id: subProject.parent,
        tType: {$ne: 'template'}
      }, {
        $pull: {
          subProjects: subProject._id
        }
      }, function(err, project) {
        if(err) {
          req.locals.error = err;
        }
        next();
      });
    }
  });
};

exports.populateSubProjects = function(req, res, next) {
    req.locals.result = req.locals.result.filter((item)=>{
        return !item.parent;
    });
 projectModel.populate(req.locals.result, {
    path: 'subProjects.watchers',
    model: 'User'
  }, function(err, projects) {
    if(err) {
      req.locals.error = err;
    }
    else req.locals.result = projects;
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
    project: {
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
  var Query = Project.find(entityQuery, {
    project: 1,
    _id: 0
  });
  Query.populate('project');

  Query.exec(function(err, projects) {
    if(err) {
      req.locals.error = {
        message: 'Can\'t get projects'
      };
    }
    else {
      projects = _.uniq(projects, 'project._id');
      projects = _.map(projects, function(item) {
        return item.project;
      });

      if(starredOnly) {
        projects.forEach(function(project) {
          project.star = true;
        });
      }

      req.locals.result = projects;

      next();
    }
  });
};
