'use strict';

var _ = require('lodash');
var q = require('q');

var options = {
  includes: 'assign watchers project',
  defaults: {
    project: undefined,
    assign: undefined,
    discussions: [],
    watchers: []
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

exports.tagsList = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var query = {
    'query': {'query_string': {'query': '*'}},
    'facets': {
      'tags': {'terms': {'field': 'tags'}}
    }
  };
  
  mean.elasticsearch.search({index: 'task', 'body': query, size: 3000}, function (err, response) {
      if (err) {
        req.locals.error = { message: 'Can\'t get tags' };
    } else {
      req.locals.result = response.facets ? response.facets.tags.terms : [];
    }

    next();
  });
};

exports.getByEntity = function (req, res, next) {
          
      console.log("CHECK================");    
      
  if (req.locals.error) {
    return next();
  }

  var entities = {projects: 'project', users: 'assign', discussions: 'discussions', tags: 'tags'},
    entityQuery = {};
  entityQuery[entities[req.params.entity]] = (req.params.id instanceof Array) ? {$in: req.params.id} : req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if (ids && ids.length) {
    entityQuery._id = { $in: ids };
    starredOnly = true;
  }
  var Query = Task.find(entityQuery);
  Query.populate(options.includes);

  Task.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;


    var pagination = req.locals.data.pagination;
	  if (pagination && pagination.type && pagination.type === 'page') {
	    Query.sort(pagination.sort)
	      .skip(pagination.start)
	      .limit(pagination.limit);
	  }

	  Query.exec(function (err, tasks) {
	    if (err) {
	      req.locals.error = { message: 'Can\'t get tags' };
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

exports.getZombieTasks = function (req, res, next) {
  if (req.locals.error) {
    return next();
  }

  var Query = Task.find({project: {$eq: null}, discussions: {$size: 0}});
  Query.populate(options.includes);

  Query.exec(function (err, tasks) {
    if (err) {
      req.locals.error = { message: 'Can\'t get zombie tasks' };
    } else {
      req.locals.result = tasks;
    }

    next();
  });
};
