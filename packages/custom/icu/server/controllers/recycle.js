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

module.exports = {
  recycleEntity: recycleEntity,
  recycleRestoreEntity: recycleRestoreEntity,
};
