'use strict';

var options = {
  includes: 'watchers assign creator',
  defaults: {
    watchers: [],
    assign: undefined
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var discussionController = crud('discussions', options);

var utils = require('./utils'),
  mongoose = require('mongoose'),
  Task = require('../models/task.js'),
  Discussion = mongoose.model('Discussion'),
  TaskArchive = mongoose.model('task_archive'),
  User = require('../models/user.js'),
  _ = require('lodash'),
  mailService = require('../services/mail'),
  elasticsearch = require('./elasticsearch.js');

  var Order = require('../models/order');

Object.keys(discussionController).forEach(function(methodName) {
  if (methodName !== 'destroy') {
    exports[methodName] = discussionController[methodName];
  }
});

exports.destroy = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var discussion = req.locals.result;

  var query = req.acl.mongoQuery('Task');
  query.find({
    discussions: req.params.id,
  }).then(function(tasks) {
    //FIXME: do it with mongo aggregate
    var groupedTasks = _.groupBy(tasks, function(task) {
      return task.project || task.discussions.length > 1 ? 'release' : 'remove';
    });

    groupedTasks.remove = groupedTasks.remove || [];
    groupedTasks.release = groupedTasks.release || [];

    Task.update({
      _id: {
        $in: groupedTasks.release
      }
    }, {
      $pull: {
        discussions: discussion._id
      }
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

    discussionController.destroy(req, res, next);
  });
};

exports.schedule = function(req, res, next) {
  if (req.locals.error) {
    next();
  }

  var discussion = req.locals.result;

  if (!((discussion.startDate&&discussion.allDay)||(discussion.startDate && discussion.endDate
    && discussion.startTime && discussion.endTime))) {
    req.locals.error = {
      message: 'problem with dates'
    };
    return next();
  }

  if (!discussion.assign) {
    req.locals.error = {
      message: 'Assignee cannot be empty'
    };
    return next();
  }

  if (!discussion.location) {
    req.locals.error = {
      message: 'location cannot be empty'
    };
    return next();
  }

  var allowedStatuses = ['new', 'scheduled', 'cancelled'];
  if (allowedStatuses.indexOf(discussion.status) === -1) {
    req.locals.error = {
      message: 'Cannot be scheduled for this status'
    };
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  query.find({
    discussions: discussion._id,
  }).then(function(tasks) {
    var groupedTasks = _.groupBy(tasks, function(task) {
      return _.contains(task.tags, 'Agenda');
    });

    var options = [{
        path: 'watchers',
        model: 'User',
        select: 'name email'
    }, {
        path: 'assign',
        model: 'User',
        select: 'name email'
    }, {
        path: 'creator',
        model: 'User',
        select: 'name email'
    }, {
        path: 'members',
        model: 'User',
        select: 'name email'
    }];

	Discussion.populate(discussion, options, function(err, doc) {
        if (err || !doc) return next();
        mailService.send('discussionSchedule', {
	      discussion: doc,
	      agendaTasks: groupedTasks['true'] || [],
	      additionalTasks: groupedTasks['false'] || []
	    }).then(function() {
	      req.locals.data.body = discussion;
	      req.locals.data.body.status = 'scheduled';
	      next();
	    });
    });
  });
};

exports.summary = function(req, res, next) {
  if (req.locals.error) {
    next();
  }

  var discussion = req.locals.result;

  var allowedStatuses = ['scheduled'];
  if (allowedStatuses.indexOf(discussion.status) === -1) {
    utils.checkAndHandleError(true, 'Cannot send summary for this status', next);
    req.locals.error = {
      message: 'Cannot send summary for this status'
    };
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  query.find({
    discussions: discussion._id,
  }).populate('discussions')
    .then(function(tasks) {
      var projects = _.chain(tasks).pluck('project').compact().value();
      _.each(projects, function(project) {
        project.tasks = _.select(tasks, function(task) {
          return task.project === project;
        });
      });

      var additionalTasks = _.select(tasks, function(task) {
        return !task.project;
      });

      var options = [{
        path: 'watchers',
        model: 'User',
        select: 'name email'
    }, {
        path: 'assign',
        model: 'User',
        select: 'name email'
    }, {
        path: 'creator',
        model: 'User',
        select: 'name email'
    }, {
        path: 'members',
        model: 'User',
        select: 'name email'
    }];

	Discussion.populate(discussion, options, function(err, doc) {
        if (err || !doc) return next();
	      mailService.send('discussionSummary', {
	        discussion: discussion,
	        projects: projects,
	        additionalTasks: additionalTasks
	      }).then(function() {
	        var taskIds = _.reduce(tasks, function(memo, task) {
	          var containsAgenda = !_.any(task.discussions, function(d) {
	            return d.id !== discussion.id && (d.status === 'new' || d.status === 'scheduled');
	          });

	          var shouldRemoveTag = task.tags.indexOf('Agenda') !== -1 && containsAgenda;

	          if (shouldRemoveTag) {
	            memo.push(task._id);
	          }

	          return memo;
	        }, []);

	        Task.update({
	          _id: {
	            $in: taskIds
	          }
	        }, {
	          $pull: {
	            tags: 'Agenda'
	          }
	        }, {
	          multi: true
	        }).exec();

	        req.locals.data.body = discussion;
	        req.locals.data.body.status = 'done';
	        next();
	      });

	    });
    });
};

exports.cancele = function(req, res, next) {
  if (req.locals.error) {
    next();
  }

  var discussion = req.locals.result;

  var allowedStatuses = ['canceled'];
  if (allowedStatuses.indexOf(discussion.status) === -1) {
    utils.checkAndHandleError(true, 'Cannot send cancele for this status', next);
    req.locals.error = {
      message: 'Cannot send cancele for this status'
    };
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  query.find({
    discussions: discussion._id,
  }).populate('discussions')
    .then(function(tasks) {
      var projects = _.chain(tasks).pluck('project').compact().value();
      _.each(projects, function(project) {
        project.tasks = _.select(tasks, function(task) {
          return task.project === project;
        });
      });

      var additionalTasks = _.select(tasks, function(task) {
        return !task.project;
      });

      var options = [{
        path: 'watchers',
        model: 'User',
        select: 'name email'
    }, {
        path: 'assign',
        model: 'User',
        select: 'name email'
    }, {
        path: 'creator',
        model: 'User',
        select: 'name email'
    }, {
        path: 'members',
        model: 'User',
        select: 'name email'
    }];

	Discussion.populate(discussion, options, function(err, doc) {
        if (err || !doc) return next();
	      mailService.send('discussionCancele', {
	        discussion: discussion,
	        projects: projects,
	        additionalTasks: additionalTasks
	      }).then(function() {
	        var taskIds = _.reduce(tasks, function(memo, task) {
	          var containsAgenda = !_.any(task.discussions, function(d) {
	            return d.id !== discussion.id && (d.status === 'new' || d.status === 'canceled');
	          });

	          var shouldRemoveTag = task.tags.indexOf('Agenda') !== -1 && containsAgenda;

	          if (shouldRemoveTag) {
	            memo.push(task._id);
	          }

	          return memo;
	        }, []);

	        Task.update({
	          _id: {
	            $in: taskIds
	          }
	        }, {
	          $pull: {
	            tags: 'Agenda'
	          }
	        }, {
	          multi: true
	        }).exec();

	        req.locals.data.body = discussion;
	        req.locals.data.body.status = 'canceled';
	        next();
	      });

	    });
    });
};

exports.tagsList = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Discussion');
  query.distinct('tags', function(error, tags) {
    if (error) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    } else {
      req.locals.result = tags || [];
    }

    next();
  });
};

exports.getByEntity = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var entities = {
    users: 'creator',
    _id: '_id',
    projects: 'project'
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
  var query = req.acl.mongoQuery('Discussion');

  query.find(entityQuery);

  query.populate(options.includes);

  Discussion.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, discussions) {
      if (err) {
        req.locals.error = {
          message: 'Can\'t get discussions'
        };
      } else {
        if (starredOnly) {
          discussions.forEach(function(discussion) {
            discussion.star = true;
          });
        }
              if(pagination.sort == "custom"){
        var temp = new Array(discussions.length) ;
        var discussionTemp = discussions;
        Order.find({name: "Discussion", project:discussions[0].project}, function(err, data){
            data.forEach(function(element) {
              for (var index = 0; index < discussionTemp.length; index++) {
                if(JSON.stringify(discussionTemp[index]._id) === JSON.stringify(element.ref)){
                    temp[element.order - 1] = discussions[index];
                }
                
              }
            });
             discussions = temp;
            req.locals.result = discussions;
            next();
        })
      }
      else{

        req.locals.result = discussions;
        next();
      }
      }
    });

  });
};

exports.getByProject = function(req, res, next) {
  var entities = {
    projects: 'project'
  },
    entityQuery = {
      discussions: {
        $not: {
          $size: 0
        }
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

  entityQuery[entities[req.params.entity]] = req.params.id;
  var Query = Task.find(entityQuery, {
    discussions: 1,
    _id: 0
  });
  Query.populate('discussions');

  var pagination = req.locals.data.pagination;
  if (pagination && pagination.type && pagination.type === 'page') {
    Query.sort(pagination.sort)
      .skip(pagination.start)
      .limit(pagination.limit);
  }

  Query.exec(function(err, discussions) {
    if (err) {
      req.locals.error = {
        message: 'Can\'t get projects'
      };
    } else {
      //remove duplicates
      discussions = _.reduce(discussions, function(flattened, other) {
        return flattened.concat(other.discussions);
      }, []);

      discussions = _.uniq(discussions, '_id');

      if (starredOnly) {
        discussions.forEach(function(discussion) {
          discussion.star = true;
        });
      }

      req.locals.result = discussions;

      next();
    }
  });
};
