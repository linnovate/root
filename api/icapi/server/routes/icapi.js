'use strict';

var projectController = require('../controllers/project');
var permissionController = require('../controllers/permission');

module.exports = function(Icapi, app, auth, database) {

  app.route('/icapi/projects/:id?')
    .all(permissionController.echo)
    .post(permissionController.forceLogIn, projectController.create)     //Create
    .get(projectController.read)        //Read
    .put(projectController.update)      //Update
    .delete(projectController.destroy); //Delete
};
