'use strict';

const httpError = require('http-errors');
const models = {
  task: require('../models/task'),
  discussion: require('../models/discussion'),
  project: require('../models/project'),
  office: require('../models/office'),
  folder: require('../models/folder'),
  document: require('../models/document'),
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

  Model.find({ _id: { $in: ids } })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);

    let set = clean(Object.assign({}, changeWholeParameter));
    return Model.update({
      _id: { $in: ids }
    }, {
      $addToSet: {
        watchers: { $each: watchers },
        tags: { $each: tags }
      },
      $set: set,
    }, {
      multi: true
    })
  })
  .then(function(results) {
    return Model.find({ _id: { $in: ids } })
  })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);
    res.json(docs)
  })
  .catch(function(err) {
    next(err)
  })
}

function recycle(req, res, next) {
  let entity = req.params.entity;
  let Model = models[entity];
  let ids = req.body.ids;

  Model.find({ _id: { $in: ids } })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);
    return Model.update({
      _id: { $in: ids }
    }, {
      $set: {
        recycled: new Date
      }
    }, {
      multi: true
    })
  })
  .then(function(results) {
      return Model.find({ _id: { $in: ids } })
  })
  .then(updatedItems=>{
      if(!updatedItems.length) throw new httpError(404);
      res.json(updatedItems)
  })
  .catch(function(err) {
      next(err)
  })
}

function clean(obj) {
    return Object.keys(obj).forEach((key) => (obj[key] === null) && delete obj[key]);
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
