'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(tasks, app, auth, database) {

  var taskC = require('../../../general/server/providers/crud.js').Task,
      task = new taskC('/tasks');
  console.dir(task)
  app.route('/api/tasks')

      .post(function(req, res) {
        console.log('here package tasks ');
        req.body.user = {_id: ''}
        task.create({
          data: req.body
        }, function(data) {
          res.send(data);
        });
      })
      .get(function(req, res) {
        console.log('get all')
        task.all( function(data) {
          res.send(data);
        });
      });


  app.route('/api/tasks/:taskId')

      .put(function(req, res) {
        task.update({
          data: req.body,
          param: req.params.taskId
        }, function(data) {
          res.send(data);
        });
      })

      .delete(function(req, res) {
        task.delete({
          param: req.params.taskId
        }, function(data) {
          res.send(data);
        });
      });
};