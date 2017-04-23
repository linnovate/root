'use strict';

var starService = require('../services/star.js');

function _changeStar(value, req, res, next) {
  if (req.locals.error) {
    return next();
  }

  if (['star', 'unstar', 'toggle'].indexOf(value) === -1 ) {
    req.locals.error = { message: 'Inappropriate operation' };
    return next();
  }

  if (req.locals.error) {
    return next();
  }

  var entityName = req.params.entity || req.locals.data.entityName;
  var entityService = starService(entityName, { user: req.user });

  return entityService.starEntity(req.params.id, value).then(function(starred) {
    req.locals.result = { star: starred };
    next();
  });
}

function unstarEntity(req, res, next) {
  _changeStar('unstar', req, res, next);
}

function starEntity(req, res, next) {
  _changeStar('star', req, res, next);
}

function toggleStar(req, res, next) {
  _changeStar('toggle', req, res, next);
}

function getStarred(req, res, next) {
  if (req.locals.error) {
    return next();
  }
  var entityName = req.params.entity || req.locals.data.entityName;
  if(req.params.type === 'byAssign')
    var entityName = {name : req.params.entity || req.locals.data.entityName, assing : true};
  var entityService = starService(entityName, { user: req.user });

  entityService.getStarred().then(function(starred) {
    req.locals.result = starred;
    next();
  });
}


function getStarredIds(entity) {
  return function(req, res, next){
    if (req.locals.error) {
      return next();
    }
    var entityService = starService(entity, { user: req.user });

    entityService.getStarredIds().then(function(starred) {
      req.locals.data.ids = starred;
      next();
    });
  };
}

function isStarred(req, res, next)
 {
   if (req.locals.error) {
    return next();
  }

  var entityName = req.params.entity || req.locals.data.entityName;
  var entityService = starService(entityName, { user: req.user });

  entityService.isStarred(req.locals.result).then(function() {
    next();
  });
}

module.exports = {
  starEntity: starEntity,
  unstarEntity: unstarEntity,
  toggleStar: toggleStar,
  getStarred: getStarred,
  getStarredIds: getStarredIds,
  isStarred: isStarred
};
