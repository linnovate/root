var mongoose = require('mongoose');
var User = mongoose.model('User');
var _ = require('lodash');

var crud = require('../controllers/crud.js');
var crudService = require('../services/crud.js');

exports.create = function(req, res, next) {

  if(req.locals.error) {
    return next();
  }
  req.body.watchers = [req.user];
  req.body.assign = req.user;
  req.body.circles = {};
  req.body.entity = req.body.entity || req.query.entity || 'task';

  var options = {
    includes: 'assign watchers project subTasks discussions',
    defaults: {
      project: undefined,
      assign: undefined,
      discussions: [],
      watchers: [],
      circles: {}
    },
  };
  var entity = crud(req.body.entity.toLowerCase() + 's', options);
  if(req.body.customId) {
    var entityService = crudService(req.body.entity.toLowerCase() + 's', options);
    entityService
      .read(null, req.user, req.acl, {customId: req.body.customId})
      .then(function(e) {
        if(_.isEmpty(e)) {
          entity.create(req, res, next);
        } else {
          req.locals.result = req.locals.result || {};
          req.locals.result = e;
          entity.update(req, res, next);
        }

      })
      .catch(function(err) {
        next(err)
      });
  } else entity.create(req, res, next);
};
