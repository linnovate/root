
'use strict';

var _ = require('lodash');
var  mean = require('meanio');

var TaskModel = require('../models/task.js');
var ProjectModel = require('../models/project.js');
var DiscussionModel = require('../models/discussion.js');
var OfficeDocumentsModel = require('../models/document.js');
var FolderModel = require('../models/folder');
var OfficeModel = require('../models/office');
var TemplateDocsModel = require('../models/templateDoc');
var SignatureModel = require('../models/signature');
var elasticsearch = require('../controllers/elasticsearch');


var entityNameMap = {
  tasks: {
    mainModel: TaskModel,
    //      archiveModel: TaskArchiveModel,
    name: 'task'
  },
  projects: {
    mainModel: ProjectModel,
    //      archiveModel: ProjectArchiveModel,
    name: 'project'
  },
  discussions: {
    mainModel: DiscussionModel,
    //      archiveModel: DiscussionArchiveModel,
    name: 'discussion'
  },
  officeDocuments: {
    mainModel: OfficeDocumentsModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'officeDocument'
  },
  folders: {
    mainModel: FolderModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'folder'
  },
  offices: {
    mainModel: OfficeModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'office'
  },
  templateDocs: {
    mainModel: TemplateDocsModel,
    //      archiveModel: OfficeDocumentsArchiveModel,
    name: 'templateDoc'
  },
  signatures: {
    mainModel: SignatureModel,
    name: 'signature'
  }
};

function recycleEntity(entityType, id) {
  var Model = entityNameMap[entityType].mainModel;
  var name = entityNameMap[entityType].name;

  switch(entityType) {
    case 'projects':
      updateEntityRelation('tasks', 'project', id);
      updateEntityRelation('discussions', 'project', id);
      break;
    case 'folders':
      updateEntityRelation('officeDocuments', 'folder', id);
      break;
    case "discussions":
      updateEntityRelation('folders', 'discussion', id);
      updateEntityRelation('projects', 'discussion', id);
      updateEntityRelationInArray('projects', 'discussions', id);
      updateEntityRelation('tasks', 'discussion', id);
      updateEntityRelationInArray('tasks', 'discussions', id);
      break;
    case 'offices':
      updateEntityRelation('folders', 'office', id);
      updateEntityRelation('signatures', 'office', id);
      updateEntityRelation('templateDocs', 'office', id);
      break;
    case 'documents':
      updateEntityRelationInArray('tasks', 'officeDocuments', id);
      updateEntityRelationInArray('documents', 'relatedDocuments', id);
      break;
  }

  return Model.findOne({
    _id: id
  }).exec(function(error, entity) {
    entity.recycled = Date.now();
    entity.save(function(err) {
      if(err) {
        console.log(err);
      } else {
        elasticsearch.save(entity, name);
      }
    });
  });
}


function updateEntityRelation(type,field,id){
  entityNameMap[type].mainModel.update({
    [field]: id
  }, {
    [field]: null
  }, {multi: true}).exec();

}
function updateEntityRelationInArray(type,field,id){
  entityNameMap[type].mainModel.update({
    [field]: id 
  }, {
    $pull: {[field]: id}
  }, {multi: true}).exec();

}



function recycleRestoreEntity(entityType, id) {
  var Model = entityNameMap[entityType].mainModel;
  var name = entityNameMap[entityType].name;
  let promise = Model.findOneAndUpdate(
    {_id: id},
    {$unset: {recycled: ''}},
    {new: true}, function(err, entity) {
      if(err) {
        console.log(err);
      }
      console.log('entity unrecycled');
      elasticsearch.save(entity, name);
    });
  return promise;
}

// function recycleRestoreEntity(entityType, id) {
//         var Model = entityNameMap[entityType].mainModel;
//         var name = entityNameMap[entityType].name;
//         var promise =
//           Model.findOne({
//             _id: id
//         }).exec(function (error, entity) {
//           entity.recycled = null
//           delete entity.recycled;
//           entity.update({ _id: id }, { $unset : { recycled : ""} })
//           .then(function(err) {
//             console.log("unrecycle entity.update")
//             console.log(err)
//             if (err) {
//               console.log(err);
//             }
//              else elasticsearch.save(entity, name);

//           });

//         });
//        return promise ;
// }


function recycleGetBin(entityType) {
  var request = [];
  return new Promise(function(fulfill, reject) {
    for(let key in entityNameMap) {
      let Model = entityNameMap[key].mainModel;
      request.push(new Promise(function(resolve, error) {
        Model.find({recycled: {$exists: true}}).exec(function(err, entities) {
          if(err) {
            error('error');
          }


          // add type entity support for recycle bin
          let typedEntities = entities.map(function(entity) {
            var json = JSON.stringify(entity);
            let typedEntity = JSON.parse(json);
            typedEntity['type'] = entityNameMap[key].name;
            return typedEntity;
          });
          resolve(typedEntities);
        });
      }));
    }
    Promise.all(request).then(function(result) {
      fulfill(result);
    }).catch(function(reason) {
      reject('reject');
    });
  });
}



module.exports = {
  recycleEntity: recycleEntity,
  recycleRestoreEntity: recycleRestoreEntity,
  recycleGetBin: recycleGetBin,
};
