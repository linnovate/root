'use strict';

var _ = require('lodash');

var options = {
  includes: 'assign watchers',
  defaults: {
    watchers: [],
    circles: {}
  }
};

exports.defaultOptions = options;


var crud = require('../controllers/crud.js');
var task = crud('tasks', options);
var document = crud('documents', options);

var mongoose = require('mongoose'),
  documentModel = mongoose.model('Document'),
  userModel = mongoose.model('User'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');




// Object.keys(document).forEach(function(methodName) {
//     exports[methodName] = document[methodName];
// });

Object.keys(document).forEach(function(methodName) {
  if(methodName !== 'create' && methodName !== 'update') {
    exports[methodName] = document[methodName];
  }
});


exports.create = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  console.log("document crud create") ;
  console.log(req.body) ;
  req.locals.result = req.body ;
  document.create(req, res, next);
};

exports.update = function(req, res, next) {
  console.log("document crud update") ;
  console.log(req.body) ;
  if(req.locals.error) {
    return next();
  }
  document.update(req, res, next);
};


exports.destroy = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
};

exports.tagsList = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Document');
  query.distinct('tags', function(error, tags) {
    if(error) {
      req.locals.error = {
        message: 'Can\'t get tags'
      };
    }
    else {
      req.locals.result = tags || [];
    }

    next();
  });
};

exports.getByEntity = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var entities = {
      users: 'creator',
      _id: '_id',
      discussions: 'discussion'
    },
    entityQuery = {};

  entityQuery[entities[req.params.entity]] = req.params.id;

  var starredOnly = false;
  var ids = req.locals.data.ids;
  if(ids && ids.length) {
    entityQuery._id = {
      $in: ids
    };
    starredOnly = true;
  }
  var query = req.acl.mongoQuery('Document');

  query.find(entityQuery);

  query.populate(options.includes);

  Document.find(entityQuery).count({}, function(err, c) {
    req.locals.data.pagination.count = c;

    var pagination = req.locals.data.pagination;
    if(pagination && pagination.type && pagination.type === 'page') {
      query.sort(pagination.sort)
        .skip(pagination.start)
        .limit(pagination.limit);
    }

    query.exec(function(err, documents) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get documents'
        };
      }
      else {
        if(starredOnly) {
          documents.forEach(function(document) {
            document.star = true;
          });
        }
        if(pagination.sort == 'custom') {
          var temp = new Array(documents.length);
          var documentTemp = documents;
          Order.find({name: 'Document', discussion: documents[0].discussion}, function(err, data) {
            data.forEach(function(element) {
              for(var index = 0; index < documentTemp.length; index++) {
                if(JSON.stringify(documentTemp[index]._id) === JSON.stringify(element.ref)) {
                  temp[element.order - 1] = documents[index];
                }

              }
            });
            documents = temp;
            req.locals.result = documents;
            next();
          });
        }
        else {

          req.locals.result = documents;
          next();
        }
      }
    });
  });
};