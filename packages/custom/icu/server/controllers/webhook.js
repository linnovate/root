var mongoose = require('mongoose'),
  User = mongoose.model('User');

var crud = require('../controllers/crud.js');

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
  entity.create(req, res, next);
};
