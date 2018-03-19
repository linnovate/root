'use strict';

var entityService = require('../services/recycle.js');

function recycleEntity(req, res, next) {
  var entityType = req.params.entity || req.locals.data.entityName;
  var entityId = req.params.id ;
  let recycledPromise =  entityService.recycleEntity(entityType,req.params.id) ;
  
  recycledPromise.then(function(result) {    
    res.sendStatus(200); 
    next() ;
  });
}

function recycleRestoreEntity(req, res, next) {
  var entityType = req.params.entity || req.locals.data.entityName;
  var entityId = req.params.id ;
  let recycledPromise =  entityService.recycleRestoreEntity(entityType,req.params.id) ;
  
  recycledPromise.then(function(result) {    
    res.sendStatus(200); 
    next() ;
  });
}

function recycleGetBin(req, res, next) {
  var entityType = req.params.entity || req.locals.data.entityName;
  let recycledPromise = entityService.recycleGetBin(entityType) ;
  
  recycledPromise.then(function(result) {    
    req.locals.result = result; 
    res.send(result) ;
//    next() ;
  });
}

function searchAll(req, res, next) {
  var entityType = req.params.entity || req.locals.data.entityName;
  let recycledPromise = entityService.searchAll(entityType) ;
  
  recycledPromise.then(function(result) {    
    req.locals.result = result; 
    res.send(result) ;
//    next() ;
  });
}

module.exports = {
  recycleEntity: recycleEntity,
  recycleRestoreEntity: recycleRestoreEntity,
  recycleGetBin: recycleGetBin,
  searchAll: searchAll
};
