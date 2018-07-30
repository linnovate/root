'use strict';

var _ = require('lodash');
const httpError = require('http-errors');
const permissions = require('./permissions.js');
var elasticsearch = require('./elasticsearch');

const models = {
  task: require('../models/task'),
  discussion: require('../models/discussion'),
  project: require('../models/project'),
  office: require('../models/office'),
  folder: require('../models/folder'),
  officeDocument: require('../models/document'),
  templateDoc: require('../models/templateDoc')
};

module.exports = {
  update,
  recycle,
  remove
}

function update(req, res, next) {
  let entity = req.params.entity;
  let Model = models[entity];
  let ids = req.body.ids;
  let update = req.body.update;

  let {
    watchers,
    tags
  } = update;

  let changeWholeParameter = {
      status: update.status,
      due: update.due,
      assign: update.assign,
  };

  watchers = watchers || [];
  tags = tags || [];

  let set = clean(Object.assign({}, changeWholeParameter));

  let addToEach = {};
  if(watchers.length) addToEach.watchers = { $each: watchers };
  if(tags.length) addToEach.tags = { $each: tags };

  let addedAttributes = {};
  if(!_.isEmpty(set)) addedAttributes.$set = set;
  if(!_.isEmpty(addToEach)) addedAttributes.$addToSet = addToEach;
  let findArrayIds = { _id: { $in: ids } };

    Model.find(findArrayIds)
  .then(docs => docs.length === 0 ? next() : docs )
  .then(docs => {
    if (checkBoldedPermissions(docs,req.user)) return docs ;
    else throw new Error("Permission Denied") ;
  })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);

    return Model.update(
        findArrayIds,
        addedAttributes,
        { multi: true })
  })
  .then(function (results) {
      return Model.find(findArrayIds)
          .populate('watchers');
  })
  .then(docs => {
    res.json(docs);
    if(!docs.length) throw new httpError(404);
    docs.forEach(element => {
        console.log("saving elastic");
        element.watchers = [];
        elasticsearch.save(element, entity);
    });
  })
  .catch(function(err) {
    next(err)
  })
}


function recycle(req, res, next) {
  let entity = req.params.entity;
  let Model = models[entity];
  let ids = req.body.ids;

  let findArrayIds = { _id: { $in: ids } };
  let recycledSet = { $set: { recycled: new Date } };

  Model.find(findArrayIds)
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);

    return Model.update(
        findArrayIds,
        recycledSet,
        { multi: true });
  })
  .then(function (results) {
    return Model.find(findArrayIds)
        .populate('creator');
  })
  .then(docs => {
    if(!docs.length) throw new httpError(404);
    docs.forEach(element => {
        console.log("saving elastic");
        element.watchers = [];
        elasticsearch.save(element, entity);
    })
    return docs;
  })
  .then(updatedItems=>{
      res.json(updatedItems)
  })
  .catch(function(err) {
      next(err)
  })
}

function clean(obj) {
    for (let propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

function remove(req, res, next) {
  let entity = req.params.entity;
  let Model = models[entity];
  let ids = req.body.ids;

  Model.find({ _id: { $in: ids } })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);
    return Model.remove({ _id: { $in: ids } })
  })
  .then(function(results) {
    res.end()
  })
  .catch(function(err) {
    next(err)
  })
}

function checkBoldedPermissions(docs,user) {
  let permissionDenied = docs.some((doc) => {
    let allowed = permissions.updateContent({user: user},doc, []) ;
    if(!allowed) {
      console.log("checkBoldedPermissions NOT ALLLOWED") ;
      return !allowed ;
    }
  }) ;

  return !permissionDenied;
}
