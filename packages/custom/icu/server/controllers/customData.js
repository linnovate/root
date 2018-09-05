exports.find = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery('Task');
  var queryString = {};
  Object.keys(req.query).forEach(function(key) {
    switch (key) {
    case 'uid':
      break;
    case 'type':
      queryString['custom.type'] = req.query.type;
      break;
    default:
      queryString[`custom.data.${key}`] = req.query[key];
      break;
    }
  });
  query.find(queryString)
    .exec(function(err, tasks) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get my tasks'
        };
      } else {
        req.locals.result = tasks;
      }
      next();
    });
};

exports.findByCustomId = function(req, res, next) {
  if(req.locals.error) {
    return next();
  }
  var query = req.acl.mongoQuery('Task');

  query.findOne({'custom.id': req.params.id})
    .exec(function(err, tasks) {
      if(err) {
        req.locals.error = {
          message: 'Can\'t get my tasks'
        };
      } else {
        req.locals.result = tasks;
      }
      next();
    });
};
