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

var SourceModel = require('../../../circles/server/models/source.js');

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
  }

};

var defaults = {
  defaults: {},
  includes: ''
};

module.exports = function(entityName, options) {
  var findByUser = ['tasks', 'projects', 'discussions'];
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

    var countQuery = Model.find().count();
    var mergedPromise;

    var query;
    if (currentUser) {
      query = acl.query(entityNameMap[entityName].name);
      query.find({
        $or: [{
          watchers: {
            $in: [user._id]
          }
        }, {
          watchers: {
            $size: 0
          }
        }, {
          watchers: {
            $exists: false
          }
        }]
      });
    } else
      query = Model.find();

    if (pagination && pagination.type) {
      if (pagination.type === 'page') {
        query.find({})
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

      query.find({});
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
    } else
      query = Model.find();
    query.find({
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
          for (var i = 0; i < circles[type].length; i++) {
            if (acl.user.allowed[type].indexOf(circles[type][i]) < 0) {
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

  function checkSource(sources, circles, acl, callback) {
    if (!sources || !sources.length) return callback(null, circles);
    SourceModel.find({
      _id: {
        $in: sources
      }
    }).exec(function(err, sources) {
      var sourcesCircles = {};
      if (err || sources.length !== sources.length) return callback('invalid sources permissions');
      for (var i = 0; i < sources.length; i++) {
        if (acl.user.allowed[sources[i].circleType].indexOf(sources[i].circleName) < 0) return callback('permissions denied');
        if (!sourcesCircles[sources[i].circleType]) sourcesCircles[sources[i].circleType] = [];
        sourcesCircles[sources[i].circleType].push(sources[i].circleName);
      }
      if (!circles) circles = {};
      circles = _.extend(circles, sourcesCircles);
      return callback(null, circles);
    });
  };

  function create(entity, user, acl) {
    var deffered = q.defer();

    checkSource(entity.sources, entity.circles, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        entity.created = new Date();
        entity.updated = new Date();
        entity.creator = user.user._id;
        entity.circles = circles;
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

    checkSource(oldE.sources, oldE.circles, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        oldE.updated = new Date();
        oldE.updater = user.user._id;
        oldE.circles = circles;
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