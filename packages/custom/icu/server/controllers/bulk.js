'use strict';

const httpError = require('http-errors');
const permissions = require('../controllers/permissions.js');
var elasticsearch = require('../controllers/elasticsearch');

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
  .then(docs => docs.length == 0 ? next() : docs )
  .then(docs => {
    if (checkBoldedPermissions(docs,req.user)) return docs ;
    else throw new Error("Permission Denied") ;
  })
  .then(function(docs) {
//    console.log("bulk res", docs) ;
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
  .then(function (results) {
      return Model.find({_id: {$in: ids}})
          .then(docs => {
              docs.forEach(element => {
                  console.log("saving elastic");
                  element.watchers = [];
                  elasticsearch.save(element, entity);
              })
              return docs;
          })
  })
  .then(function(docs) {
    if(!docs.length) throw new httpError(404);
    res.json(docs)
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

  if (permissionDenied) {
    return false ;
  }

  return true ;
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
    for (let propName in obj) {
        if (obj[propName] === null || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    return obj;
}

function remove(req, res, next) {
  //usused - remove this maybe
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
