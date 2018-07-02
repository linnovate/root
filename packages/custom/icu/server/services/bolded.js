'use strict';

var _ = require('lodash');

var task = require('../models/task');
var project = require('../models/project');
var discussion = require('../models/discussion');
var office = require('../models/office');
var folder = require('../models/folder');
var document = require('../models/document');
var user = require('../models/user');

var entityNameMap = {
  task: {
    controller: task,
  },
  project: {
    controller: project,
  },
  discussion: {
    controller: discussion,
  },
  office: {
    controller: office,
  },
  folder: {
    controller: folder,
  },
  officeDocument: {
    controller: document,
  }
};

exports.boldUpdate = function(req, res, next){
  console.log('*********BOLDED_RUN*********');
  console.log('**********req.body: ', req.body);
  let {entity_id, user_id, entity_type, action} = req.body;
  let entityController = entityNameMap[entity_type].controller;
    console.log('**********entityController: ', entityController);

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
        res.status(200).send(entity);
    });
};
