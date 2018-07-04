'use strict';

var _ = require('lodash');

var task = require('../models/task');
var project = require('../models/project');
var discussion = require('../models/discussion');
var office = require('../models/office');
var folder = require('../models/folder');
var document = require('../models/document');
var templateDoc = require('../models/templateDoc');

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
  officeDocuments: {
    controller: document,
  },
  offices: {
    controller: office,
  },
  folders: {
    controller: folder,
  },
  templateDocs: {
    controller: templateDoc,
  }
};

function boldUpdate(req, res, next) {
  let {entity_id, user_id, entity_type, action} = req.body;
  let entityController = entityNameMap[entity_type].controller;

  entityController
    .findOne({
      _id: entity_id
    })
    .exec(function (err, entity) {
      if (err) return next();

      switch (action) {
        case 'viewed':
          syncBoldUsers(
            {
              body: entity,
              controller: entityController,
              actionType: 'update',
              boldedUpdate: true
            }, res, next);
          entity = goOverBoldedArray(entity, action, user_id);
          let data = {$set: {bolded: entity.bolded}};
          saveEntity(entityController, entity, data);
          break;

        case 'updated':
          syncBoldUsers(
            {
              body: entity,
              entityType: entity_type,
              controller: entityController,
              actionType: 'update',
              boldedUpdate: true
            }, res, next);
          entity = goOverBoldedArray(entity, action, user_id);
          break;
      }
      res.status(200).send(entity);
    });
}

function syncBoldUsers(req, res, next) {
  let data;
  let boldedUpdate = req.boldedUpdate;
  let entity = req.locals ? req.locals.result : req.body;
  let entityType = req.locals? req.locals.data.entityName : req.entityType;

  if(!entity){
    next();
  }
  let entityController = req.controller || entityNameMap[entityType].controller;

  let actionType = req.actionType || 'create';

  switch (actionType) {

    case 'create':
      entity.bolded = [];
      entity.bolded.push(createBoldedObject(entity.creator));

      data = {$set: {bolded: entity.bolded}};
      saveEntity(entityController, entity, data);

      break;

    case 'update':
      if(typeof entity.watchers[0] === 'string'){
        entityController.find({_id:{$in: [entity.watchers]}}).exec(function(err, watchers) {
          if (err) {
            req.locals.error = err;
          } else {
            entity.watchers = watchers;
            data = {$set: {bolded: compareBoldedAndWatchers(entity)}};
            saveEntity(entityController, entity, data);
          }
        });
      } else {
        data = {$set: {bolded: compareBoldedAndWatchers(entity)}};
        saveEntity(entityController, entity, data);
      }
      break;
  }
  if(!boldedUpdate){
    res.json(entity);
  }
}

function saveEntity(entityController, entity, data) {
  console.log('saveEntity');
  entityController.findOneAndUpdate({_id: entity._id}, data,
    function (err, updatedEntity) {
      if (err) {
        req.locals.error = err;
        console.log('err: ',err);
      }
      console.log('entity1: ',entity);
      entity.bolded = data;
      console.log('entity2: ',updatedEntity);
    });
}

function goOverBoldedArray(entity, action, user_id) {
  for (let i = 0; i < entity.bolded.length; i++) {
    if (action === 'updated') {
      entity.bolded[i].bolded = true;
    }
    if (entity.bolded[i].id == user_id) {
      entity.bolded[i] = changeBolded(entity.bolded[i], false)
    }
  }

  return entity;
}

function compareBoldedAndWatchers(entity) {
  for (let i = 0; i < entity.watchers.length; i++) {
    let bolded = entity.bolded.findIndex((bolded) => {
      let watcherId = entity.watchers[i]._id || entity.watchers[i];


      return bolded.id.toString() == watcherId.toString();
    });

    if (bolded === -1) {
      entity.bolded.push(createBoldedObject(entity.watchers[i]._id || entity.watchers[i]));
    }
  }

  for (let i = 0; i < entity.bolded.length; i++) {
    let watcher = entity.watchers.findIndex((watcher) => {
      let watcherId = watcher._id || watcher;

      return watcherId.toString() == entity.bolded[i].id.toString();
    });

    if (watcher === -1) {
      entity.bolded.splice(i, 1);
    }
  }

  return entity.bolded;
}

function changeBolded(boldedObject, type) {

  boldedObject.bolded = type;
  boldedObject.lastViewed = Date.now();

  return boldedObject;
}

function createBoldedObject(userId) {

  return {
    id: userId,
    bolded: false,
    lastViewed: Date.now(),
  }
}

module.exports = {
  boldUpdate: boldUpdate,
  syncBoldUsers: syncBoldUsers,
};
