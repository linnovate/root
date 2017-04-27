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

var circleSettings = require(process.cwd() + '/config/circleSettings') || {};
var circlesAcl = require('circles-npm')(null, null, circleSettings);

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
  includes: '',
  conditions: {}
};

module.exports = function(entityName, options) {
  var findByUser = ['tasks', 'projects', 'discussions', 'attachments', 'templates'];
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

    if (currentUser) {
      query = acl.mongoQuery(entityNameMap[entityName].name);
      countQuery = acl.mongoQuery(entityNameMap[entityName].name).count(options.conditions);
    } else {
      query = Model.find(options.conditions);
      countQuery = Model.find(options.conditions).count();
    }

    if (pagination && pagination.type) {
      if (pagination.type === 'page') {
        query.find(options.conditions)
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
      query.find(options.conditions);
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
      query = acl.mongoQuery(entityNameMap[entityName].name);
    } else {
      query = Model.find();

    }

    query.where({
      _id: id
    });
    // query.where(options.conditions);

    query.populate(options.includes);

    return query.then(function(results) {
      if (!results.length) {
        // console.log('2222222')
        // throw new Error('Entity not found');
        return {};
      }
      return results[0];
    });
  }

  function create(entity, user, acl) {
    var deffered = q.defer();
    if (!entity.circles) entity.circles = {};
    circlesAcl.sign('mongoose', entity.sources, entity.circles, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        entity.circles = circles;
        if (entity.watchers instanceof Array && !entity.watchers.length) entity.watchers = [user.user._id];
        entity.created = new Date();
        entity.updated = new Date();
        entity.creator = user.user._id;
        deffered.resolve(new Model(entity).save(user).then(function(e) {
          return Model.populate(e, options.includes);
        }));
      }
    });

    return deffered.promise;
  }

  function update(oldE, newE, user, acl) {
    var entityWithDefaults = _.defaults(newE, options.defaults);

    oldE = _.extend(oldE, entityWithDefaults);
    if (!oldE.circles) oldE.circles = {};
    var deffered = q.defer();

    circlesAcl.sign('mongoose', oldE.sources, oldE.circles, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        oldE.updated = new Date();
        oldE.updater = user.user._id;
        oldE.circles = _.extend(oldE.circles, circles);
        oldE.markModified('circles');
        deffered.resolve(oldE.save(user).then(function(e) {
          return Model.populate(e, options.includes);
        }));
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
