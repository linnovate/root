'use strict';

module.exports = function(app, config) {
  var hi = require('./../hi/users')(config);
  app.route('/api/hi/login').post(hi.login);
};
