'use strict';

var projectController = require('../controllers/project');
var taskController = require('../controllers/task');
var userController = require('../controllers/user');

var permissionController = require('../controllers/permission');

module.exports = function(Icapi, app, auth, database) {

  app.route('/api/ic/projects/:id?')
    .all(permissionController.echo)
    //.post(permissionController.forceLogIn, projectController.create)     	//Create
    .post(projectController.create)     	//Create
    .get(projectController.read)        									//Read
    .put(projectController.update)      									//Update
    .delete(projectController.destroy); 									//Delete

  app.route('/api/ic/users/:entity/:id')
    .all(permissionController.echo)
    .get(userController.readByEntityId);

  app.route('/api/ic/users/:id?')
    .all(permissionController.echo)
    //.post(permissionController.forceLogIn, projectController.create)     	//Create
    .get(userController.read)        									//Read

  app.route('/api/ic/tasks/:entity/:id')
    .all(permissionController.echo)
    .get(taskController.readByEntityId);

  app.route('/api/ic/tasks/:id?')
    .all(permissionController.echo)
    //.post(permissionController.forceLogIn, taskController.create)
    .post(taskController.create)
    .get(taskController.read)
    .put(taskController.update)
    .delete(taskController.destroy);
};
