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
    default:
      queryString[`customData.${key}`] = req.query[key];
      break;
    }
  });
  console.log('queryString');
  console.log(JSON.stringify(queryString));
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
  console.log('11111');
  if(req.locals.error) {
    return next();
  }

  var query = req.acl.mongoQuery('Task');

  query.findOne({customId: Buffer.from(req.params.id, 'base64').toString()})
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
