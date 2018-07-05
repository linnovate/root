'use strict';

var _ = require('lodash');

var options = {
  includes: 'assign watchers',
  defaults: {watchers: []}
};

exports.defaultOptions = options;


var crud = require('../controllers/crud.js');
var task = crud('tasks', options);
var document = crud('documents', options);
var documentModel = require('../models/document');

var mongoose = require('mongoose'),
  userModel = mongoose.model('User'),
  _ = require('lodash'),
  elasticsearch = require('./elasticsearch.js');


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


/**
* req.params.id will consist mongoDB _id of the user
* should be a part of crud.all
*/
exports.getAll = function(req, res, next) {
  var start = 0, limit = 25, sort = 'created';
  if(req.query) {
    start = parseInt(req.query.start);
    limit = parseInt(req.query.limit);
    sort = req.query.sort;
  }
  documentModel.find({
    $or: [{watchers: {$in: [req.user._id]}}, {assign: req.user._id}]
  }).sort({sort: 1}).skip(start).limit(limit).populate('folder')
    .populate('creator')
    .populate('updater')
    .populate('sender')
    .populate('sendingAs')
    .populate('assign')
    .populate('relatedDocuments')
    .populate('forNotice')
    .populate('watchers')
    .populate('doneBy')
    .populate('signBy')
    .exec(function(err, data) {
      if(err) {
        logger.log('error', '%s getAll, %s', req.user.name, 'Document.find', {error: err.message});
        req.locals.error = err;
        req.status(400);
      }
      else {
        req.locals.result = data;
        res.send(data);
      }
    });
};
