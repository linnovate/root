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
  let {
    ids,
    update,
    remove
  } = req.body;

  Model.find({ _id: { $in: ids } })
  .then(docs => {
    if(!docs.length) throw new httpError(404);
    if(!checkBoldedPermissions(docs, req.user)) throw new Error("Permission Denied");
    return docs;
  })
  .then(function(docs) {
    docs = docs.map(doc => {

      if(update) {

        let {
          status,
          due,
          assign,
          watchers,
          tags,
          permissions
        } = update;

        if(status) doc.status = status;
        if(due){
          if(checkIncludesDueFields(due)){
            Object.assign(doc, due);
          } else {
            doc.due = due;
          }
        }
        if(assign) {
          doc.assign = assign;

          // Give commenter permissions for assignee
          if(assign !== doc.creator.toString()) {
            watchers = [assign];
            permissions = [{
              id: assign,
              level: 'commenter'
            }]
          }
        }

        if(watchers && watchers.length) {
          doc.watchers = _.union(doc.watchers.map(v => v.toString()), watchers);
        }
        if(tags && tags.length) {
          doc.tags = _.union(doc.tags, tags);
        }
        if(permissions && permissions.length) {
          doc.permissions = unionArraysBy(doc.permissions, permissions, 'id');
        }

      }

      if(remove) {
        let {
          watchers,
          tags
        } = remove;
        if(tags && tags.length) {
          doc.tags = _.difference(doc.tags, tags);
        }
        if(watchers && watchers.length) {
          doc.watchers = _.difference(doc.watchers.map(v => v.toString()), watchers);
          watchers.forEach(watcher => {
            let permIndex = doc.permissions.findIndex(p => p.id.toString() === watcher);
            if(permIndex !== -1) doc.permissions.splice(permIndex, 1);
          })
        }
      }

      return doc.save();
    });

    return Promise.all(docs)
  })
  .then(function(docs) {
    return Model.populate(docs, { path: 'watchers' });
  })
  .then(docs => {
    res.json(docs);
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

    let promises = [];
    docs.forEach(element => {
        console.log("saving elastic");
        element.watchers = [];
        promises.push(elasticsearch.save(element, entity));
    });

    return Promise.all(promises).then(() => {
      return docs;
    });
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

// Emulates https://lodash.com/docs/4.17.10#unionBy
// IMPORTANT: For arrays of objects or strings only
function unionArraysBy(orig, override, key) {
  let object = {};
  orig.forEach(el => {
    object[el[key]] = el;
  })
  override.forEach(el => {
    object[el[key]] = el;
  })
  return Object.values(object);
}

function checkIncludesDueFields({startDate, endDate, startTime, endTime, allDay}){
  return !!((startDate && endDate && startTime && endTime) || (startDate && allDay));
}
