'use strict';

var starService = require('../services/star.js');

function _changeStar(value, req, res, next) {
  if(req.locals.error) {
    return next();
  }

  if(['star', 'unstar', 'toggle'].indexOf(value) === -1) {
    req.locals.error = {message: 'Inappropriate operation'};
    return next();
  }

  if(req.locals.error) {
    return next();
  }

  var entityName = req.params.entity || req.locals.data.entityName;
  var entityService = starService(entityName, {user: req.user});

  return entityService.starEntity(req.params.id, value).then(function(starred) {
    req.locals.result = {star: starred};
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
  findStarred(req).then(function(starred) {
    req.locals.result = starred;
    next();
  })
}

function filterByStarred(req, res, next) {
  let { starred } = req.params;
  if(!req.locals.result || req.locals.result.length === 0 || !starred )return next();
  req.params.entity = 'tasks';

  findStarred(req).then(function(starred) {
    if(starred)req.locals.result = starred.filter(starred =>
      req.locals.result.find(entity => entity._id.toString() === starred._id.toString()));
    next();
  })
}

function findStarred(req){
  if(!req.locals || req.locals.error) {
    return next();
  }
  const entityName = req.params.type === 'byAssign'
    ? {name: req.params.entity || req.locals.data.entityName, assign: true}
    : req.params.entity || req.locals.data.entityName,
    entityService = starService(entityName, {user: req.user});

  return entityService.getStarred()
}

function getStarredIds(entity) {
  return function(req, res, next) {
    if(req.locals.error) {
      return next();
    }
    var entityService = starService(entity, {user: req.user});

    entityService.getStarredIds().then(function(starred) {
      req.locals.data.ids = starred;
      next();
    });
  };
}

function isStarred(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var entityName = req.params.entity || req.locals.data.entityName;
  var entityService = starService(entityName, {user: req.user});

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
  filterByStarred,
  isStarred: isStarred
};
