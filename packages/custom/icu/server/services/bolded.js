'use strict';

var _ = require('lodash');

var task = require('../controllers/task');
var project = require('../controllers/project');
var discussion = require('../controllers/discussion');
var office = require('../controllers/office');
var folder = require('../controllers/folder');
var documents = require('../controllers/documents');
var users = require('../controllers/users');

var entityNameMap = {
  tasks: {
    controller: task,
  },
  projects: {
    controller: project,
  },
  discussions: {
    controller: discussion,
  },
  offices: {
    controller: office,
  },
  folders: {
    controller: folder,
  },
  officeDocuments: {
    controller: documents,
  }
};

exports.boldUpdate = function(req, res, next){
  console.log('*********BOLDED_RUN*********');
  let {entity_id, user_id, entity_type, action} = req.body.boldedObject;
  let entityController = entityNameMap[entity_type].controller;
  entityController
    .findOne({
      _id: entity_id
    })
    .exec(function(err, entity) {
      if (err) return next(err);
      entity.bolded.find((bolded)=>{
        if(bolded.id === user_id){

          if(action === 'viewed'){
            // just needed to change bolded and last view
          } else if (action === 'updated') {
            for(let i = 0; i < entity.bolded.length; i++){
              entity.bolded.bolded = true;
            }
          }
          bolded.bolded = false;
          bolded.lastViewed = Date.now();

          return true;
        }
      });

      console.log('*********BOLDED_END*********');
      next();
    });
};
