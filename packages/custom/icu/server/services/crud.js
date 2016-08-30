'use strict';

var _ = require('lodash');
var q = require('q');

var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

var TaskModel = require('../models/task.js');
var TaskArchiveModel = mongoose.model('task_archive');

var ProjectModel = require('../models/project.js');
var ProjectArchiveModel = mongoose.model('project_archive');

var DiscussionModel = require('../models/discussion.js');
var DiscussionArchiveModel = mongoose.model('discussion_archive');

var UpdateModel = require('../models/update.js');
var UpdateArchiveModel = mongoose.model('update_archive');

var UserModel = require('../models/user.js');

var AttachementModel = require('../models/attachment.js');
var AttachementArchiveModel = mongoose.model('attachment_archive');

var configPath = process.cwd() + '/config/actionSettings';

var actionSettings = require(configPath) || {};


var entityNameMap = {
  'tasks': {
    mainModel: TaskModel,
    archiveModel: TaskArchiveModel,
    name: 'Task'
  },
  'projects': {
    mainModel: ProjectModel,
    archiveModel: ProjectArchiveModel,
    name: 'Project'
  },
  'discussions': {
    mainModel: DiscussionModel,
    archiveModel: DiscussionArchiveModel,
    name: 'Discussion'
  },
  'updates': {
    mainModel: UpdateModel,
    archiveModel: UpdateArchiveModel,
    name: 'Update'
  },
  'users': {
    mainModel: UserModel,
    name: 'User'
  },
  'attachments': {
    mainModel: AttachementModel,
    archiveModel: AttachementArchiveModel,
    name: 'Attachement'
  },
  'templates': {
    mainModel: TaskModel,
    archiveModel: TaskArchiveModel,
    name: 'Task'
  }

};

var defaults = {
  defaults: {},
  includes: ''
};

module.exports = function(entityName, options) {
  var findByUser = ['tasks', 'projects', 'discussions', 'templates'];
  if (findByUser.indexOf(entityName) > -1)
    var currentUser = true;

  var Model = entityNameMap[entityName].mainModel;
  var ArchiveModel = entityNameMap[entityName].archiveModel;

  if (_.isEmpty(options)) {
    options = {};
  }

  options = _.defaults(options, defaults);

  function all(pagination, user, acl) {
    var deffered = q.defer();

    var countQuery;
    var mergedPromise;

    var query;
    var conditions = options.conditions || {};

    if (currentUser) {
      query = acl.query(entityNameMap[entityName].name);
      countQuery = acl.query(entityNameMap[entityName].name).count(conditions);
    } else {
      query = Model.find(conditions);
      countQuery = Model.find(conditions).count();
    }

    if (pagination && pagination.type) {
      if (pagination.type === 'page') {
        query.find(conditions)
          .sort(pagination.sort)
          .skip(pagination.start)
          .limit(pagination.limit);

        query.populate(options.includes);
        query.hint({
          _id: 1
        });

        mergedPromise = q.all([query, countQuery]).then(function(results) {
          pagination.count = results[1];
          return results[0];
        });

        deffered.resolve(mergedPromise);
      }
    } else {
      query.find(conditions);
      query.populate(options.includes);
      query.hint({
        _id: 1
      });

      deffered.resolve(query);
    }

    return deffered.promise;
  }

  function read(id, user, acl) {
    var query;
    if (currentUser) {
      query = acl.query(entityNameMap[entityName].name);
    } else {
      query = Model.find();

    }

    query.where({
      _id: id
    });

    query.populate(options.includes);

    return query.then(function(results) {
      if (!results.length) {
        throw new Error('Entity not found');
      }

      return results[0];
    });
  }

  function checkPermissions(circles, acl, callback) {
    var circleTypes = actionSettings.circleTypes;

    if (!circles) return callback(null);
    for (var type in circleTypes) {
      if (circles[type] && !(circles[type] instanceof Array)) return callback('invalid circles permissions');
      if (circles[type] && circles[type].length) {
        if (circleTypes[type].max && (circles[type].length > circleTypes[type].max)) return callback('invalid circles permissions');
        if (circleTypes[type].requiredAllowed) {
          var allowed = acl.user.allowed[type].map(function(a) {
            return a._id;
          })
          for (var i = 0; i < circles[type].length; i++) {
            if (allowed.indexOf(circles[type][i]) < 0) {
              return callback('permissions denied');
            }
          }
        }
        if (circleTypes[type].requires) {
          for (var i = 0; i < circleTypes[type].requires.length; i++) {
            if (!circles[circleTypes[type].requires[i]] || !circles[circleTypes[type].requires[i]].length)
              return callback('missing requires permissions ' + circleTypes[type].requires[i]);
          }
        }
      }
    }

    return callback(null);
  };

  function checkSource(sources, acl, callback) {
    var sourcesCircles = {},
      source,
      circleTypes = actionSettings.circleTypes;

    for (var type in circleTypes) {
      if (circleTypes[type].sources) {
        sourcesCircles[type] = [];
      }
    }
    if (!sources || !sources.length) return callback(null, sourcesCircles);
    var mySources = {};
    for (var i = 0; i < acl.user.sources.length; i++) {
      mySources[acl.user.sources[i]._id.toString()] = acl.user.sources[i];
    }

    for (var i = 0; i < sources.length; i++) {

      source = mySources[sources[i].toString()]
      if (!source) return callback('permissions denied');
      if (!sourcesCircles[source.circleType]) sourcesCircles[source.circleType] = [];
      sourcesCircles[source.circleType].push(source.circle);
    }

    return callback(null, sourcesCircles);
  };

  function create(entity, user, acl) {
    var deffered = q.defer();

    checkSource(entity.sources, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        entity.created = new Date();
        entity.updated = new Date();
        entity.creator = user.user._id;
        if (entity.watchers instanceof Array && !entity.watchers.length) entity.watchers = [user.user._id];
        if (!entity.circles) entity.circles = {};
        entity.circles = _.extend(entity.circles, circles);
        checkPermissions(entity.circles, acl, function(error) {
          if (error) deffered.reject(error);
          else {
            deffered.resolve(new Model(entity).save(user).then(function(e) {
              return Model.populate(e, options.includes);
            }));
          }
        });
      }
    });

    return deffered.promise;
  }

  function update(oldE, newE, user, acl) {
    var entityWithDefaults = _.defaults(newE, options.defaults);

    oldE = _.extend(oldE, entityWithDefaults);

    var deffered = q.defer();

    checkSource(oldE.sources, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        oldE.updated = new Date();
        oldE.updater = user.user._id;
        if (!oldE.circles) oldE.circles = {};
        oldE.circles = _.extend(oldE.circles, circles);
        oldE.markModified('circles');
        checkPermissions(oldE.circles, acl, function(error) {
          if (error) deffered.reject(error);
          else {
            deffered.resolve(oldE.save(user).then(function(e) {
              return Model.populate(e, options.includes);
            }));
          }
        });
      }
    });

    return deffered.promise;
  }


  function destroy(entity, user) {
    return entity.remove(user);
  }

  function readHistory(id) {
    var Query = ArchiveModel.find({
      'c._id': new ObjectId(id)
    });

    Query.populate('u');

    return Query.exec();
  }

  var methods = {
    all: all,
    create: create,
    read: read,
    update: update,
    destroy: destroy
  };

  if (ArchiveModel) {
    methods.readHistory = readHistory;
  }

  return methods;
};