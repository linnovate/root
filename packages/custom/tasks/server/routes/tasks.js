'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(tasks, app, auth, database) {

  var TaskC = require('../../../general/server/providers/crud.js').Task,
      Task = new TaskC('/api/tasks');

  app.route('/api/tasks')

      .post(function(req, res) {
        req.body.user = {_id: '55755f55e7e0f6d3717444f3'}
          Task.create({
          data: req.body
        }, function(data) {
          res.send(data);
        });
      })
      .get(function(req, res) {
          req.body.user = {_id: '55755f55e7e0f6d3717444f3'}
          Task.all({
              data: req.body
          }, function(data) {
              res.send(data);
          });
      });


  app.route('/api/tasks/:taskId')
      .get(function(req, res) {
          Task.get({
              param: req.params.projectId
          }, function(data) {
              res.send(data);
          });
      })
      .put(function(req, res) {
          Task.update({
              data: req.body,
              param: req.params.taskId
            }, function(data) {
          res.send(data);
        });
      })

      .delete(function(req, res) {
        Task.delete({
          param: req.params.taskId
        }, function(data) {
          res.send(data);
        });
      });
};