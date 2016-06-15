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

  function all(pagination, acl) {
    var deffered = q.defer();

    var countQuery = Model.find().count();
    var mergedPromise;
    var query = acl.query(entityNameMap[entityName].name);

    if (pagination && pagination.type) {
      if (pagination.type === 'page') {
        query.find({})
          .sort(pagination.sort)
          .skip(pagination.start)
          .limit(pagination.limit);

        query.populate(options.includes);
        if (currentUser) {
      		query.deepPopulate('circles.sources');
      	}
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
      if (currentUser) {
      	query.deepPopulate('circles.sources');
      }
      query.hint({
        _id: 1
      });

      deffered.resolve(query);
    }

    return deffered.promise;
  }

  function read(id, acl) {
    var groups = ['c19nGroups1', 'c19nGroups2', 'c19n'];

    var conditions = {
      _id: id,
      $and: []
    };
    if (currentUser) {
       for (var i in groups) {
        var obj1 = {},
            obj2 = {},
            obj3 = {};
        obj1['circles.'+groups[i]] = {$in: acl.user.allowed[groups[i]]}; 
        obj2['circles.'+groups[i]] = {$size: 0};
        obj3['circles.'+groups[i]] = {$exists: false};
        conditions.$and.push({'$or': [obj1, obj2, obj3]});
      }
    }
    var query = Model.find(conditions);
    query.populate(options.includes);
    if (currentUser)
      query.deepPopulate('circles.sources');

    return query.then(function(results) {
      if (!results.length) {
        throw new Error('Entity not found');
      }

      return results[0];
    });
  }
  
  function checkPermissions(entity, acl, callback) {
    var groups = ['c19nGroups1', 'c19nGroups2'];

    if (!entity.circles) return callback(null);
    for (var i in groups) {
      if (entity.circles[groups[i]] && entity.circles[groups[i]].length) {
        if (entity.circles[groups[i]].length > 1) return callback('invalid sources permissions');
        if (acl.user.allowed[groups[i]].indexOf(entity.circles[groups[i]][0]) < 0) {
            return callback('permissions denied');
          } 
      }
    }
    if (entity.circles.sources && entity.circles.sources.length) {     //sources(c19n)
      if (entity.circles.sources.length > 1) return callback('invalid sources permissions--'); 
    }
     
    return callback(null);
  };
  
  function checkSource(entity, acl, callback) {
    if (!entity.circles || !entity.circles.sources || !entity.circles.sources.length) return callback(null);
    SourceModel.findOne({_id: entity.circles.sources[0]}).exec(function(err, source) {
      if (err || !source) return callback('invalid sources permissions');
      if (acl.user.allowed.c19n.indexOf(source.circleName) < 0) return callback('permissions denied');
      return callback(null, source.circleName)
    });
  };
    
  function create(entity, user, acl) {
    var deffered = q.defer();
    checkPermissions(entity, acl, function(error){
      if (error) deffered.reject(error);
      else {
        checkSource(entity, acl, function(error, circleName){
          if (error) deffered.reject(error);
          else {
            entity.created = new Date();
            entity.updated = new Date();
            entity.creator = user.user._id;
            if (circleName) entity.circles.c19n = [circleName];
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
    checkPermissions(oldE, acl, function(error){
      if (error) deffered.reject(error);
      else {
        checkSource(oldE, acl, function(error, circleName){
          if (error) deffered.reject(error);
          else {
            oldE.updated = new Date();
            oldE.updater = user.user._id;
            if(circleName) oldE.circles.c19n = [circleName];
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