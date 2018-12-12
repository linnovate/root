'use strict';

var _ = require('lodash');

var q = require('q');
var orderController = require('../controllers/order.js');

var permissions = require('../controllers/permissions.js');

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var ObjectId = mongoose.Types.ObjectId;

var TaskModel = require('../models/task.js');
var TaskArchiveModel = mongoose.model('task_archive');
var Order = require('../models/order.js');

var ProjectModel = require('../models/project.js');
var ProjectArchiveModel = mongoose.model('project_archive');

var DiscussionModel = require('../models/discussion.js');
var DiscussionArchiveModel = mongoose.model('discussion_archive');

var UpdateModel = require('../models/update.js');
var UpdateArchiveModel = mongoose.model('update_archive');

var UserModel = require('../models/user.js');

var AttachementModel = require('../models/attachment.js');
var AttachementArchiveModel = mongoose.model('attachment_archive');

var OfficeModel = require('../models/office.js');
var OfficeArchiveModel = mongoose.model('office_archive');

var FolderModel = require('../models/folder.js');
var FolderArchiveModel = mongoose.model('folder_archive');

var circleSettings = require(process.cwd() + '/config/circleSettings') || {};
var circlesAcl = require('circles-npm')(null, null, circleSettings);

var OfficeDocumentsModel = require('../models/document.js');
var OfficeDocumentsArchiveModel = mongoose.model('officeDocument_archive');

var TemplateDocsModel = require('../models/templateDoc.js');
var TemplateDocsArchiveModel = mongoose.model('templateDoc_archive');

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
  },
  'offices': {
    mainModel: OfficeModel,
    archiveModel: OfficeArchiveModel,
    name: 'Office'
  },
  'folders': {
    mainModel: FolderModel,
    archiveModel: FolderArchiveModel,
    name: 'Folder'
  },
  'officeDocuments': {
    mainModel: OfficeDocumentsModel,
    archiveModel: OfficeDocumentsArchiveModel,
    name: 'Document'
  },
  'templateDocs': {
    mainModel: TemplateDocsModel,
    archiveModel: TemplateDocsArchiveModel,
    name: 'TemplateDoc'
  }


};

var defaults = {
  defaults: {},
  includes: '',
  conditions: {}
};

module.exports = function(entityName, options) {
  var findByUser = ['tasks', 'projects', 'discussions', 'attachments', 'templates', 'offices', 'folders', 'officeDocuments', 'templateDocs'];
  if (findByUser.indexOf(entityName) > -1)
    var enabledOnlyForRelatedUsers = true;

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
    if(pagination && pagination.status){
      options.conditions = {status : pagination.status};
    }else{
      //options.conditions = {};
    }
    if (enabledOnlyForRelatedUsers && !user.isAdmin) {
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
        /*query.hint({
          _id: 1
        });*/

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


  function read(id, user, acl, query1) {
    var query;
    if(enabledOnlyForRelatedUsers && !user.isAdmin) {
      query = acl.mongoQuery(entityNameMap[entityName].name);
    } else {
      query = Model.find();
    }
    if(query1) {
      query.find(query1);
    } else {
      query.where({
        _id: id
      });
    }

    query.populate(options.includes);
    return query.then(function(results) {
      if(!results.length) {
        // throw new Error('Entity not found');
        return {};
      }
      return results[0];
    });
  }


  function throwError(err) {
    let deffered = q.defer();
    deffered.reject(err);
    return deffered.promise;
    // or
    // let p = new Promise() ;
    // return p.reject(new error("blaba")) ;
  }


  function create(entity, user, acl) {
    console.log("CRUD CREATE") ;

    //    check permsArray changes
    let allowed1 = permissions.syncPermsArray(user,entity) ;
    if(!allowed1 && !user.isAdmin) {
      // console.log("CRUD NOT ALLOWED") ;
      return throwError(permissions.permError.denied + ":" + permissions.permError.allowUpdateWatcher) ;
    }

    let deffered = q.defer();
    // check update permissions
    let allowed2 = permissions.createContent(user,{}, entity) ;
    allowed2.then(function(entity) {
      // in case we are not allowed - catch below!

      // possibly handle other permission situations for next then, or reject/throw.
      // console.log(JSON.stringify(allowed2)) ;

      // deffered.resolve(entity) ;
      // return deffered.promise;
    }).then(function(value) {
      let model = Model(entity) ;
      return permissions.cloneParentPermission(entity.parent,entityNameMap[model.collection.collectionName].name.toLowerCase()) ;
    }).then(function(clonedPerms) {

      // console.log("CRUD ALLOWED") ;
      // RE-HACK - if this is document update - don't do anything
      if(entity.officeDocuments=="officeDocuments" && entity.entity) {
        // officeDocs hacked crud - so that update operations are by create.
        // we override this behaviour in permissions for watchers addition.
        // console.log("officeDocuments return without create....");
        deffered.resolve(entity) ;
        return deffered.promise;
      }
      // resume normal crud operation
      if (!entity.circles) entity.circles = {};
      circlesAcl.sign('mongoose', entity.sources, entity.circles, acl, function(error, circles) {
        if (error) deffered.reject(error);
        else {
          entity.circles = circles;
          if (entity.watchers instanceof Array && !entity.watchers.length) {
            entity.watchers = [user.user._id];
          }
          if(clonedPerms.watchers) {
            entity.watchers = clonedPerms.watchers ;
          }
          entity.created = new Date();
          entity.updated = new Date();
          entity.creator = user.user._id;
          entity.permissions = (clonedPerms.permissions || [{id: String(user.user._id), level: 'editor'}]);
          deffered.resolve(new Model(entity).save(user).then(function(e) {
            orderController.addOrder(e, entity, Model);
            return Model.populate(e, options.includes);
          }));
        }
      });
  }).catch(function(error){
    console.log("CRUD CATCH ERROR (Reject Deferred)") ;
    console.trace() ;
    console.log(error);
    deffered.reject(error);
  });

  return deffered.promise;
  }


  function update(oldE, newE, user, acl) {

//    check permsArray changes
    console.log("CRUD UPDATE:") ;
    // console.log(JSON.stringify(oldE)) ;
    // console.log(JSON.stringify(newE)) ;
    var allowed = permissions.updatePermsArray(user,oldE, newE) ;
    if(!allowed) {
      return throwError(permissions.permError.denied + ":" + permissions.permError.allowUpdateWatcher) ;
    }

    var allowed2 = permissions.updateContent(user,oldE, newE) ;
    if(!allowed2 && !user.user.isAdmin) {
      return throwError(permissions.permError.denied + ":" + permissions.permError.allowUpdateContent) ;
    }

    var entityWithDefaults = _.defaults(newE, options.defaults);
    console.log(JSON.stringify(entityWithDefaults));

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
    options.entity = entity;
    return entity.remove(user, function(err){
      if(!err){
        orderController.deleteOrder(options.entity, Model);
      }
    });
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
