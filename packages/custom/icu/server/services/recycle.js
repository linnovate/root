'use strict';

var _ = require('lodash');

var TaskModel = require('../models/task.js');
var ProjectModel = require('../models/project.js');
var DiscussionModel = require('../models/discussion.js');
var OfficeDocumentsModel = require('../models/document.js');


var entityNameMap = {
    'tasks': {
      mainModel: TaskModel,
//      archiveModel: TaskArchiveModel,
      name: 'task'
    },
    'projects': {
      mainModel: ProjectModel,
//      archiveModel: ProjectArchiveModel,
      name: 'project'
    },
    'discussions': {
      mainModel: DiscussionModel,
//      archiveModel: DiscussionArchiveModel,
      name: 'discussion'
    },
    'officeDocuments': {
      mainModel: OfficeDocumentsModel,
//      archiveModel: OfficeDocumentsArchiveModel,
      name: 'officeDocument'
    },
};

function recycleEntity(entityType, id) {
    var Model = entityNameMap[entityType].mainModel;
    var promise = Model.update({'_id':id},{$set:{'recycled': Date.now()}}).exec();  
    return promise ;  
}


function recycleRestoreEntity(entityType, id) {    
        var Model = entityNameMap[entityType].mainModel;
        var promise = Model.update({'_id':id},{$unset:{'recycled': Date.now()}}).exec();  
        return promise ;  
}

function recycleGetBin(entityType) {    
  var request = [];
  return new Promise(function (fulfill, reject) {
    for(let key in entityNameMap) {
      let Model = entityNameMap[key].mainModel ;
      request.push(new Promise(function (resolve, error) {
        Model.find({recycled: { $exists: true }}).exec(function (err, entities) {            
          if (err) {
            console.log("recycleGetBin err")
            error('error');
          }

          // add type entity support for recycle bin
          let typedEntities = entities.map(function(entity) {
            var json=JSON.stringify(entity);
            let typedEntity = JSON.parse(json);
            typedEntity['type'] = entityNameMap[key].name ;
            return typedEntity ;
          });
          resolve(typedEntities);            
        });
      }));
  }
  Promise.all(request).then(function (result) {
    fulfill(result);
  }).catch(function (reason) {
    console.log("recycleGetBin promise all reject") ;
    reject('reject');
  });
});
}

    
module.exports = {
    recycleEntity: recycleEntity,
    recycleRestoreEntity: recycleRestoreEntity,
    recycleGetBin, recycleGetBin
};
      