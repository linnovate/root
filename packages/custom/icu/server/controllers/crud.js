'use strict';

var _ = require('lodash');
var crudService = require('../services/crud.js');

module.exports = function(entityName, options) {
  var entityService = crudService(entityName, options);

  var success = function(req, next) {
    return function(data) {
      if (_.isEmpty(data)) {
        req.locals.error = {
          status: 404,
          message: 'Entity not found'
        };

        return next();
      }

      req.locals.result = data;
      next();
    };
  };

  var error = function(req, next) {
    return function(err) {

      req.locals.error = { message: err.toString() };

      return next();
    };
  };

  function all(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    entityService
      .all(req.locals.data.pagination, req.user, req.acl)
      .then(success(req, next), error(req, next));
  }

  function read(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    entityService
      .read(req.params.id, req.user, req.acl)
      .then(success(req, next), error(req, next));
  }

  function create(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    var entity = req.locals.data.body || req.body.data || req.body;
   
    entityService
      .create(entity, { user: req.user }, req.acl)
      .then(success(req, next), error(req, next));
  }

  function update(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    if (req.locals.result.description !== req.body.desciption) {
      req.locals.data.shouldCreateUpdate = true;
    }
    
    // Made By OHAD
    if (req.body.room !== undefined) {
      req.locals.data.shouldCreateUpdate = true;
      
      req.locals.result.room = req.body.room;
    }
    // END Made By OHAD

    var entity = req.locals.data.body || req.body;
    
    entityService
      .update(req.locals.result, entity, { user: req.user }, req.acl)
      .then(success(req, next), error(req, next));
  }

  function destroy(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    entityService
      .destroy(req.locals.result, { user: req.user })
      .then(success(req, next), error(req, next));
  }

  function readHistory(req, res, next) {
    if (req.locals.error) {
      return next();
    }

    entityService
      .readHistory(req.params.id)
      .then(success(req, next), error(req, next));
  }

  return {
    all: all,
    create: create,
    read: read,
    update: update,
    destroy: destroy,
    readHistory: readHistory
  };
};