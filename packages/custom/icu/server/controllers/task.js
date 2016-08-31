'use strict';

var _ = require('lodash');
// var q = require('q');
var async = require('async');

var options = {
  includes: 'assign watchers project subTasks',
  defaults: {
    project: undefined,
    assign: undefined,
    discussions: [],
    watchers: [],
    circles: {}
  },
  conditions: {
    tType: {
      $ne: 'template'
    },
    $or: [{
      parent: null
    }, {
      parent: {
        $exists: false
      }
    }]
  }
};

exports.defaultOptions = options;

var crud = require('../controllers/crud.js');
var task = crud('tasks', options);

var Task = require('../models/task'),
  mean = require('meanio');

Object.keys(task).forEach(function(methodName) {
  if (methodName !== 'create' || methodName !== 'update') {
    exports[methodName] = task[methodName];
  }
});

Date.prototype.getThisDay = function() {
  var date = new Date();
  // return [date.setHours(0,0,0,0), date.setHours(23,59,59,999)];
  return [Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)]
}

Date.prototype.getWeek = function() {
  var today = new Date(this.setHours(0, 0, 0, 0));
  var date = today.getDate() - today.getDay();

  var StartDate = new Date(today.setDate(date));
  var EndDate = new Date(today.setDate(StartDate.getDate() + 6));
  // EndDate.setHours(23,59,59,999);
  // return [StartDate, EndDate];
  return [Date.UTC(StartDate.getFullYear(), StartDate.getMonth(), StartDate.getDate(), 0, 0, 0, 0),
    Date.UTC(EndDate.getFullYear(), EndDate.getMonth(), EndDate.getDate(), 23, 59, 59, 999)]
}

exports.create = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  req.body.discussions = [];
  if (req.body.discussion) {
    req.body.discussions = [req.body.discussion];
    req.body.tags = ['Agenda'];
  }

  task.create(req, res, next);
};

exports.update = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  if (req.body.discussion) {
    var alreadyAdded = _(req.locals.result.discussions).any(function(d) {
      return d.toString() === req.body.discussion;
    });

    if (!alreadyAdded) {
      req.body.discussions = req.locals.result.discussions;
      req.body.discussions.push(req.body.discussion);
    }
  }

  task.update(req, res, next);
};

exports.tagsList = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var query = {
    'query': {
      'query_string': {
        'query': '*'
      }
    },
    'facets': {
      'tags': {
        'terms': {
          'field': 'tags'
        }
      }
    }
  };

  mean.elasticsearch.search({
    index: 'task',
    'body': query,
    size: 3000
  }, function(err, response) {
    if (err) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    } else {
      req.locals.result = response.facets ? response.facets.tags.terms : [];
    }

    next();
  });
};

exports.getByEntity = function(req, res, next) {

  if (req.locals.error) {
    return next();
  }

  var entities = {
    projects: 'project',
    users: 'assign',
    discussions: 'discussions',
    tags: 'tags'
  },
    entityQuery = {};
  entityQuery[entities[req.params.entity]] = (req.params.id instanceof Array) ? {
    $in: req.params.id
  } : req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if (ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var query = req.acl.query('Task');

  query.find(entityQuery);
  query.populate(options.includes);

  Task.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;


    var pagination = req.locals.data.pagination;
    if (pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, tasks) {
      if (err) {
        req.locals.error = {
          message: 'Can\'t get tags'
        };
      } else {
        if (starredOnly) {
          tasks.forEach(function(task) {
            task.star = true;
          });
        }
      }
      req.locals.result = tasks;

      next();
    });
  });


};

exports.getZombieTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var Query = Task.find({
    project: {
      $eq: null
    },
    discussions: {
      $size: 0
    },
    currentUser: req.user
  });
  Query.populate(options.includes);

  Query.exec(function(err, tasks) {
    if (err) {
      req.locals.error = {
        message: 'Can\'t get zombie tasks'
      };
    } else {
      req.locals.result = tasks;
    }

    next();
  });
};

var byAssign = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  Task.find({
    assign: req.user._id,
    status: {
      $nin: ['rejected', 'done']
    }
  })
    .populate('project')
    .exec(function(err, tasks) {
      if (err) {
        req.locals.error = {
          message: 'Can\'t get my tasks'
        };
      } else {
        req.locals.result = tasks;
      }

      next();
    });
}



  function getTasksDueTodayQuery(req, callback) {
    var dates = new Date().getThisDay();
    var query = {
      "query": {
        "bool": {
          "must": [{
            "range": {
              "due": {
                "gte": dates[0], //Date.parse(start),
                "lte": dates[1] //Date.parse(end)
              }
            }
          }, {
            "term": {
              "assign": req.user._id
            }
          }],
          "must_not": [{
            "terms": {
              "status": ['rejected', 'done'] //,
              //"execution" : "and"
            }
          }]
        }
      }
    }
    tasksFromElastic(query, 'TasksDueToday', callback);
  };



function getTasksDueWeekQuery(req, callback) {
  var dates = new Date().getWeek();
  var query = {
    "query": {
      "bool": {
        "must": [{
          "range": {
            "due": {
              "gte": dates[0],
              "lte": dates[1]
            }
          }
        }, {
          "term": {
            "assign": req.user._id
          }
        }],
        "must_not": [{
          "terms": {
            "status": ['rejected', 'done'] //,
            // "execution" : "and"
          }
        }]
      }
    }
  }
  tasksFromElastic(query, 'TasksDueWeek', callback);
}


function getOverDueTasksQuery(req, callback) {
  var dates = new Date().getThisDay();
  var query = {
    "query": {
      "bool": {
        "must": [{
          "range": {
            "due": {
              "lt": dates[0]
            }
          },
        }, {
          "term": {
            "assign": req.user._id
          }
        }],
        "must_not": [{
          "terms": {
            "status": ['rejected', 'done'] //,
            //"execution" : "and"
          }
        }]
      }
    }
  }
  tasksFromElastic(query, 'OverDueTasks', callback);
}

function getWatchedTasksQuery(req, callback) {
  var query = {
    "query": {
      "bool": {
        "must": {
          "term": {
            "watchers": req.user._id
          }
        },
        "must_not": [{
          "term": {
            "assign": req.user._id
          }
        }, {
          "terms": {
            "status": ['rejected', 'done'] //,
            //"execution" : "and"
          }
        }]
      }
    }
  }
  tasksFromElastic(query, 'WatchedTasks', callback);
}

function tasksFromElastic(query, name, callback) {
  mean.elasticsearch.search({
    index: 'task',
    'body': query,
  }, function(err, response) {
    if (err) {
      callback(err)
    } else {
      //   req.locals.result = response.hits.hits.map(function (item) {
      //     return item._source;
      // })
      callback(null, {
        key: name,
        value: response.hits.total
      });
    }
  });
}


function myTasksStatistics(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  async.parallel([

    function(callback) {
      getTasksDueTodayQuery(req, callback);
    },
    function(callback) {
      getTasksDueWeekQuery(req, callback);
    },
    function(callback) {
      getOverDueTasksQuery(req, callback);
    },
    function(callback) {
      getWatchedTasksQuery(req, callback);
    }
  ], function(err, result) {
    req.locals.result = result;
    req.locals.error = err
    next();
  });
}

exports.getWatchedTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  Task.find({
    "watchers": req.user._id,
    "assign": {
      $ne: req.user._id
    },
    "status": {
      $nin: ['rejected', 'done']
    },
  }, function(err, response) {
    if (err) {
      req.locals.error = err;
    } else {
      req.locals.result = response;
    }
    next();
  })
}

exports.getOverdueWatchedTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var dates = new Date().getThisDay();
  Task.find({
    "watchers": req.user._id,
    "assign": {
      $ne: req.user._id
    },
    "status": {
      $nin: ['rejected', 'done']
    },
    "due": {
      $lt: dates[0]
    }
  }, function(err, response) {
    if (err) {
      req.locals.error = err;
    } else {
      req.locals.result = response;
    }
    next();
  })
}

exports.getSubTasks = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var query = req.acl.query('Task');
  query.findOne({
    '_id': req.params.id
  }, {
    subTasks: 1
  })
    .populate('subTasks')
    .deepPopulate('subTasks.subTasks subTasks.watchers')
    .exec(function(err, task) {
      if (err) {
        req.locals.error = err;
      } else {
        if (task) {
          req.locals.result = task.subTasks;
        }
      }
      next();
    });
}

exports.updateParent = function(req, res, next) {
  if (req.locals.error || !req.body.parent) {
    return next();
  }
  var data = {
    $push: {
      subTasks: req.locals.result._id
    }
  };
  Task.findOneAndUpdate({
    '_id': req.body.parent
  }, data, function(err, task) {
    if (err) {
      req.locals.error = err;
    }
    next();
  });

}

exports.removeSubTask = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  Task.findOne({
    "_id": req.params.id
  }, function(err, subTask) {
    if (err) {
      req.locals.error = err;
    } else {
      Task.update({
        '_id': subTask.parent
      }, {
        $pull: {
          'subTasks': subTask._id
        }
      }, function(err, task) {
        if (err) {
          req.locals.error = err;
        }
        next();
      });
    }
  });
};

exports.byAssign = byAssign;
exports.myTasksStatistics = myTasksStatistics;