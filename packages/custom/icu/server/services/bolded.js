'use strict';

var _ = require('lodash');

var task = require('../models/task');
var project = require('../models/project');
var discussion = require('../models/discussion');
var office = require('../models/office');
var folder = require('../models/folder');
var document = require('../models/document');

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

function boldUpdate(req, res, next) {
  console.log('boldUpdate');

  let {entity_id, user_id, entity_type, action} = req.body;
  let entityController = entityNameMap[entity_type].controller;

  entityController
    .findOne({
      _id: entity_id
    })
    .exec(function (err, entity) {
      if (err) return next(err);

      switch (action) {
        case 'viewed':
          console.log('action: ', action);

          goOverBoldedArray(entity, action, user_id);
          break;

        case 'updated':
          console.log('updated: ', action);

          syncBoldUsers(
            {
              body: entity,
              controller: entityController,
              actionType: 'update'
            });
          goOverBoldedArray(entity, action, user_id);
          break;
      }
      res.status(200).send(entity);
    });
}


function syncBoldUsers(req, res, next) {
  console.log('syncBoldUsers');

  let entity = req.body || req;
  let entityController = req.controller;
  let actionType = req.actionType || 'created';

  switch (actionType) {

    case 'created':
      console.log('created: ',actionType);
      console.log('entity: ',entity);
      console.log('req.body: ',req.body);

      entity.bolded = [].push(createBoldedObject(entity));
      next();
      break;

    case 'updated':
      console.log('updated: ',actionType);

      entityController
        .findById({id: entity._id}, function (err, oldEntity) {
          if (err) console.log(err);
          oldEntity.bolded = compareWatchers(entity);
          oldEntity.update(function (err, updatedEntity) {
            if (err) console.log(err);
            req.body = updatedEntity;
            next();
          });
        });

      break;
  }
}

function goOverBoldedArray(entity, action, user_id){
  console.log('goOverBoldedArray');

  for (let i = 0; i < entity.bolded.length; i++) {
    if(action === 'updated'){
      entity.bolded[i].bolded = true;
    }
    console.log('bolded: ',entity.bolded[i].id);
    console.log('user_id: ',user_id);
    if (entity.bolded[i].id == user_id) {
      entity.bolded[i] = changeBolded(entity.bolded[i], false)
    }
  }
}

function compareWatchers(entity){
  console.log('compareWatchers');

  for(let i = 0; i < entity.length; i ++){
    let bolded = entity.bolded.find((bolded)=>{
      return entity.watchers[i]._id === bolded.id;
    });
    if(!bolded){
      entity.bolded.push(createBoldedObject(entity.watchers[i]));
    }
  }
  return entity.bolded;
}

function changeBolded(boldedObject, type) {
  console.log('changeBolded');

  boldedObject.bolded = type;
  boldedObject.lastViewed = Date.now();
  return boldedObject;
}

function createBoldedObject(user) {
  console.log('createBoldedObject');

  return {
    id: user._id,
    bolded: false,
    lastViewed: Date.now(),
  }
}

module.exports = {
  boldUpdate: boldUpdate,
  syncBoldUsers: syncBoldUsers,
};
