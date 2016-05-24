'use strict';

module.exports = function(entityName) {
  return function(req, res, next) {
  	if (req.body.watchers) {
	    req.body.watchers = req.body.watchers.filter(function(watcher){
			return watcher.type != 'group';
	    });
	}
    req.locals.data.entityName = entityName;
    next();
  };
};
