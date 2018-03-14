'use strict';

var _ = require('lodash');

var q = require('q');
var orderController = require('../controllers/order.js');

//var permissions = require('../controllers/permissions.js');

var mongoose = require('mongoose');
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
        // throw new Error('Entity not found');
        return {};
      }
      return results[0];
    });
  }

  function create(entity, user, acl) {
    console.log("CRUD CREATE!!!!!!!!!!!!!!!!") ;
    console.trace() ;
    var deffered = q.defer();
    if (!entity.circles) entity.circles = {};
    circlesAcl.sign('mongoose', entity.sources, entity.circles, acl, function(error, circles) {
      if (error) deffered.reject(error);
      else {
        entity.circles = circles;
//        if (entity.watchers instanceof Array && !entity.watchers.length) entity.watchers = [user.user._id];
        entity.created = new Date();
        entity.updated = new Date();
        entity.creator = user.user._id;
        entity.permissions = [{"id": user.user._id, "level":"editor"}];
        console.log(JSON.stringify(entity)) ;
        deffered.resolve(new Model(entity).save(user).then(function(e) {
          orderController.addOrder(e, entity, Model);
          return Model.populate(e, options.includes);
        }));all
      }
    });

    return deffered.promise;
  }

  // function leftIntersect(arr, a) {
  //   let filtered = arr.filter(function(i) {
  //     return a.indexOf(i) == -1 ? true : false;
  //   });
  //   return filtered;
  // }

  // function searchIdIndex(idVal, arr) {
  //   console.log("searchIdIndex") ;
  //   console.log(JSON.stringify(arr)) ;
  //   console.log(JSON.stringify(idVal)) ;
  //   console.log("searchIdIndex<<<") ;
  //   for (var i = 0; i < arr.length; i++) {
  //     if (arr[i].id === idVal) {
  //       return i;
  //     }
  //   }
  // }


  // function syncPerms(oldE, newE) {
  //   console.log("syncPerms") 

  //   let oldWatchers = oldE.watchers.map(function (item) {
  //     // console.log(JSON.stringify(item._doc)) ;
  //     // console.log(item._doc._id) ;
  //     return String(item._doc._id) ;
  //   }) ;

  //   let newWatchers = newE.watchers.map(function (item) {
  //     return String(item) ;
  //   }) ;

  //   // watcher added
  //   let watcherAdded = leftIntersect(newWatchers,oldWatchers) ;

  //   if(watcherAdded.length > 0) {      
  //     let watcherAddedPerms = {"id":String(watcherAdded[0]),"level":"viewer"} ; // default watcher perms
  //     newE.permissions.push(watcherAddedPerms);
  //   }

                       
  //     // console.log("old-->");
  //     // console.log(JSON.stringify(oldWatchers));
  //     // console.log("new-->");
  //     // console.log(JSON.stringify(newWatchers));
  //     // console.log("added ->>");
  //     // console.log(JSON.stringify(watcherAdded));

  //   // watcher removed
  //   let watcherRemoved = leftIntersect(oldWatchers,newWatchers) ;
  //     console.log("old-->");
  //     console.log(JSON.stringify(oldWatchers));
  //     console.log("new-->");
  //     console.log(JSON.stringify(newWatchers));
  //     console.log("removed ->>");
  //     console.log(JSON.stringify(watcherRemoved));


  //   if(watcherRemoved.length > 0) {      
  //     var index = searchIdIndex(watcherRemoved[0], newE.permissions) ;// remove from permissions array
  //     newE.permissions.splice(index,1);
  //   }
    
  //   return newE ;

  // }

  function throwError(err) {
    var deffered = q.defer();
    deffered.reject(err);
    return deffered.promise;

    // let p = new Promise() ;
    // return p.reject(new error("blaba")) ;
  }

  function update(oldE, newE, user, acl) {

    // check permsArray changes     
    // var permsArray = permissions.updatePermsArray(user,oldE, newE) ;
    // if(!permsArray) {
    //   return throwError(permissions.permError.denied + ":" + permissions.permError.allowUpdateWatcher) ;
    // }

    //    newE.permissions = permsArray ;

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
