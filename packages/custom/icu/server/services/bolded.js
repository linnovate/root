'use strict';

var _ = require('lodash');

var task = require('../models/task');
var project = require('../models/project');
var discussion = require('../models/discussion');
var office = require('../models/office');
var folder = require('../models/folder');
var document = require('../models/document');

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
    controller: document,
  }
};

function boldUpdate(req, res, next) {
  console.log('boldUpdate');

  let {entity_id, user_id, entity_type, action} = req.body;
  let entityController = entityNameMap[entity_type].controller;
  console.log('PROBLEM entity_id: ', entity_id);

  entityController
    .findOne({
      _id: entity_id
    })
    .exec(function (err, entity) {
      if (err) return next(err);
      console.log('PROBLEM entity: ', entity);

      switch (action) {
        case 'viewed':
          console.log('action: ', action);

          entity = goOverBoldedArray(entity, action, user_id);
          break;

        case 'updated':
          console.log('updated: ', action);
          syncBoldUsers(
            {
              body: entity,
              controller: entityController,
              actionType: 'update'
            }, res, next);
          entity = goOverBoldedArray(entity, action, user_id);
          break;
      }
      next();
    });
}

function syncBoldUsers(req, res, next) {
  console.log('syncBoldUsers');
  let data;

  let entity = req.locals ? req.locals.result : req.body;

  if(!entity){
    next();
  }
  let entityController = req.controller || entityNameMap[req.locals.data.entityName].controller;

  let actionType = req.actionType || req.locals.action;

  // console.log('req.locals: ', req.locals);
  console.log('actionType: ', actionType);
  // console.log('req.body: ', req.body);
  switch (actionType) {



    case 'create':
      console.log('actionType: ', actionType);
      console.log('entity: ', entity);
      console.log('entity._id: ', entity._id);
      // console.log('req.body: ',req.body);

      entity.bolded = [];
      entity.bolded.push(createBoldedObject(entity.creator));
      console.log('createBoldedObject(entity.creator): ', createBoldedObject(entity.creator));
      console.log('entity.bolded: ', entity.bolded);

      data = {$set: {bolded: entity.bolded}};
      saveEntity(entityController, entity, data);

      break;

    case 'update':
      console.log(entity);
      // console.log(entity.watcher);
      if(typeof entity.watchers[0] === 'string'){
        entityController.find({_id:{$in: [entity.watchers]}}).exec(function(err, watchers) {
          if (err) {
            req.locals.error = err;
            console.log('ERROR');
          } else {
            console.log('exec');

            console.log('watchers: ', watchers);

            entity.watchers = watchers;
            data = {$set: {bolded: compareBoldedAndWatchers(entity)}};
            saveEntity(entityController, entity, data);
          }
        });
      } else {
        console.log('actionType: ', actionType);

        data = {$set: {bolded: compareBoldedAndWatchers(entity)}};

        console.log('entityController: ',entityController);
        console.log('data: ',data);

        saveEntity(entityController, entity, data);
      }
      break;
  }
  res.json(entity);
}

function saveEntity(entityController, entity, data){
  console.log('saveEntity');
  console.log('find id: ',entity._id);
  entityController.findOneAndUpdate({_id: entity._id}, data,
    function (err, updatedEntity) {
      if (err) {
        req.locals.error = err;
      }
      console.log('updatedEntity: ', updatedEntity);
    });
}

function goOverBoldedArray(entity, action, user_id) {
  console.log('goOverBoldedArray');
  console.log('entity: ', entity);
  console.log('user_id: ', user_id);

  for (let i = 0; i < entity.bolded.length; i++) {
    if (action === 'updated') {
      console.log('action: ', action);
      entity.bolded[i].bolded = true;
    }
    console.log('bolded: ', entity.bolded[i].id);
    console.log('user_id: ', user_id);
    if (entity.bolded[i].id == user_id) {
      entity.bolded[i] = changeBolded(entity.bolded[i], false)
    }
  }
  console.log('entity: ', entity);

  return entity;
}

function compareBoldedAndWatchers(entity) {
  console.log('compareBoldedAndWatchers');
console.log(entity);
console.log(entity.watchers);
  for (let i = 0; i < entity.watchers.length; i++) {
    let bolded = entity.bolded.findIndex((bolded) => {
      let watcherId = entity.watchers[i]._id || entity.watchers[i];

      console.log('***COMPARE***');
      console.log("'" + entity.watchers[i]._id + "'");
      console.log("'" + bolded.id + "'");
      console.log(entity.watchers[i]._id == bolded.id);

      return bolded.id.toString() == watcherId.toString();
    });
    console.log('***COMPARE_RESULT***', bolded);

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
  console.log('changeBolded');
  console.log('boldedObject: ',boldedObject);

  boldedObject.bolded = type;
  boldedObject.lastViewed = Date.now();
  console.log('boldedObject: ',boldedObject);

  return boldedObject;
}

function createBoldedObject(userId) {
  console.log('createBoldedObject');

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
