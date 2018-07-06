'use strict';

var _ = require('lodash');

var task = require('../models/task'),
    project = require('../models/project'),
    discussion = require('../models/discussion'),
    office = require('../models/office'),
    folder = require('../models/folder'),
    document = require('../models/document'),
    templateDoc = require('../models/templateDoc'),
    user = require('../models/user'),
    mongoose = require('mongoose');

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
  if (!entity_id) {
    res.status(400);
  }

  entityController
    .findOne({
      _id: entity_id
    })
    .populate('watchers')
    .exec(function (err, entity) {
      if (err || !entity) {
        console.log('Entity not found: ', entity_id);
        res.status(400);
        return;
      }

      switch (action) {
        case 'view':
          let ownBolded = entity.bolded.find((bolded)=>{
            return bolded.id.toString() === user_id;
          });
          ownBolded.bolded = false;

          let data = {$set: {bolded: entity.bolded}};
          saveEntity(entityController, entity, data);
          break;

        case 'update':
          entity = goOverBoldedArray(entity, action, user_id);
          entity = syncBoldUsers(
            {
              body: entity,
              entityType: entity_type,
              controller: entityController,
              actionType: 'update',
              boldedUpdate: true
            }, res, next);
          break;
      }
      res.status(200).send(entity);
    });
}

function syncBoldUsers(req, res, next) {
  let entity = req.locals ? req.locals.result : req.body;
  if (!entity) {
    res.status(404);
  }
  let data;
  let boldedUpdate = req.boldedUpdate;
  let entityType = req.locals ? req.locals.data.entityName : req.entityType;
  let entityController = req.controller || entityNameMap[entityType].controller;


  let actionType = req.actionType || 'create';

  switch (actionType) {

    case 'create':
      entity.bolded = [];
      entity.bolded.push(createBoldedObject(entity.creator, false));

      data = {$set: {bolded: entity.bolded}};
      saveEntity(entityController, entity, data);
      break;

    case 'update':
      data = {$set: {bolded: compareBoldedAndWatchers(entity)}};
      saveEntity(entityController, entity, data);
      break;
  }
  if (!boldedUpdate) {
    next();
  } else {
    return entity;
  }
}

function saveEntity(entityController, entity, data) {
  entityController.findOneAndUpdate({_id: entity._id}, data,
    function (err, entity) {
    });
}

function goOverBoldedArray(entity, action, user_id) {
  for (let i = 0; i < entity.bolded.length; i++) {
    if (action === 'update') {
      entity.bolded[i].bolded = true;
    }
    if (entity.bolded[i].id === user_id) {
      entity.bolded[i] = changeBolded(entity.bolded[i], false)
    }
  }

  return entity;
}

function compareBoldedAndWatchers(entity) {
  for (let i = 0; i < entity.watchers.length; i++) {
    let bolded = entity.bolded.find((bolded) => {
      return bolded.id.toString() === entity.watchers[i]._id.toString();
    });
    if (!bolded) {
      entity.bolded.push(createBoldedObject(entity.watchers[i]._id.toString(), true));
    }
  }

  for (let i = 0; i < entity.bolded.length; i++) {
    let watcher = entity.watchers.find((watcherObj) => {
      return watcherObj._id.toString() === entity.bolded[i].id.toString();
    });

    if (!watcher || !entity.bolded[i].id) {
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

function createBoldedObject(userId, status) {
  return {
    id: userId,
    bolded: status,
    lastViewed: Date.now(),
  }
}

module.exports = {
  boldUpdate: boldUpdate,
  syncBoldUsers: syncBoldUsers,
};
