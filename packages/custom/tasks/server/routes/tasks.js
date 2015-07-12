'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(tasks, app, auth, database) {

  var TaskC = require('../../../general/server/providers/crud.js').Task,
      Task = new TaskC('/api/tasks');

  app.route('/api/tasks')

      .post(function(req, res) {
          Task.create({
          data: req.body,
          headers: req.headers
        }, function(data) {
          res.send(data);
        });
      })
      .get(function(req, res) {
          Task.all({
              data: req.body,
              headers: req.headers
          }, function(data) {
              res.send(data);
          });
      });


  app.route('/api/tasks/:taskId')
      .get(function(req, res) {
          Task.get({
              param: req.params.projectId,
              headers: req.headers
          }, function(data) {
              res.send(data);
          });
      })
      .put(function(req, res) {
          Task.update({
              data: req.body,
              param: req.params.taskId,
              headers: req.headers
            }, function(data) {
          res.send(data);
        });
      })

      .delete(function(req, res) {
        Task.delete({
          param: req.params.taskId,
          headers: req.headers
        }, function(data) {
          res.send(data);
        });
      });
};