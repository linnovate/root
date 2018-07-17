const httpError = require('http-errors');
var q = require('q');

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
    tags,
    status,
    due,
    assign
  } = update;

  watchers = watchers || [];
  tags = tags || [];

  Model.find({ _id: { $in: ids } })
  .then(docs => checkBoldedPermissions(docs) ? true : next("perms Err"))
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);
    return Model.update({
      _id: { $in: ids }
    }, {
      $addToSet: {
        watchers: { $each: watchers },
        tags: { $each: tags }
      },
      $set: {
        status: status,
        due: due,
        assign: assign
      },
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

function checkBoldedPermissions(docs) {


  console.log("checkBoldedPermissions", docs) ;
  if(docs.length) {
    return false ;
  }
  
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

function remove(req, res, next) {
  //delete method cannot transfer any data in req.body, Avraham you need to remove this maybe
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
