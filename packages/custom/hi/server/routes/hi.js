'use strict';

var hi = require('../controllers/hi');
    // applicationProvider = require('../../../applications/server/providers/applications');

module.exports = function(Hi, app, auth) {

    // app.route('/api/hi/*').all(applicationProvider.checkApp, hi.proxy);
    app.route('/api/hi/*').all(hi.proxy);

};
