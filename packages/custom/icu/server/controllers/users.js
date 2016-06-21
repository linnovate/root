'use strict';

/**
 * Module dependencies.
 */
var User = require('../models/user.js'),
  mongoose = require('../models/user.js'),
  utils = require('./utils.js'),
  _ = require('lodash');

var options = {
  includes: 'assign watchers project',
  defaults: {
    project: undefined,
    assign: undefined,
    watchers: []
  }
};

var crud = require('../controllers/crud.js');
var user = crud('users', options);

Object.keys(user).forEach(function(methodName) {
  exports[methodName] = user[methodName];
});

exports.filterProperties = function(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  req.body = _.pick(req.body, ['name', 'username', 'password', 'email', 'profile']);
  next();
}

exports.getByEntity = function(req, res, next) { //It is a temporary function. need to change this function to use elasticsearch!!!!
  res.status(200);
  return res.json([]);
  var query = {
    _id: req.params.id
  };
  var model = (req.params.entity.charAt(0).toUpperCase() + req.params.entity.slice(1)).substring(0, req.params.entity.length - 1);
  var Query = mongoose.model(model).findOne(query);
  Query.exec(function(err, project) {
    if (err || !project) utils.checkAndHandleError(err ? err : !project, 'Failed to load project with id: ' + req.params.id, next);
    else {
      var userIds = project.watchers;
      userIds.push(project.creator);
      User.find({
        _id: {
          $in: userIds
        }
      }).exec(function(err, users) {
        res.status(200);
        return res.json(users);
      });
    }
  });
};