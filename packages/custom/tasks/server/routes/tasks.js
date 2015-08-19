'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(tasks, app, auth, database) {

    var TaskC = require('../../../general/server/providers/crud.js').Task,
        Task = new TaskC('/api/tasks'),
        config = require('meanio').loadConfig(),
        apiUri = config.api.uri,
        request = require('request');

    app.route('/api/tasks')

        .post(function (req, res) {
            Task.create({
                data: req.body,
                headers: req.headers
            }, function (data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        })
        .get(function (req, res) {
            Task.all({
                data: req.body,
                headers: req.headers
            }, function (data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        });


    app.route('/api/tasks/:taskId')
        .get(function (req, res) {
            Task.get({
                param: req.params.taskId,
                headers: req.headers
            }, function (data,  statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        })
        .put(function (req, res) {
            Task.update({
                data: req.body,
                param: req.params.taskId,
                headers: req.headers
            }, function (data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        })

        .delete(function (req, res) {
            Task.delete({
                param:
                    req.params.taskId,
                headers: req.headers
            }, function (data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            })
        })

        .patch(function (req, res) {
            Task.patch({
                data: req.body,
                param: req.params.taskId,
                headers: req.headers
            }, function (data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            })
        });

    app.get('/api/tasks/starred', function (req, res) {
        var objReq = {
          uri: apiUri + '/api/tasks/starred',
          method: 'GET',
          headers: req.headers
        };

        request(objReq, function(error, response, body) {
            if (!error && response.statusCode === 200 && response.body.length) {
                return res.json(JSON.parse(response.body));
            }
            if(response && response.statusCode != 200)
                res.status(response.statusCode);
            var data = error ? error : JSON.parse(response.body);
            return res.json(data);
        });
    });

    app.patch('/api/tasks/:id/star', function (req, res) {
        var objReq = {
          uri: apiUri + '/api/tasks/' + req.params.id + '/star',
          method: 'PATCH',
          headers: req.headers
        };

        request(objReq, function(error, response, body) {
          if (!error && response.statusCode === 200 && response.body.length) {
            return res.json(JSON.parse(response.body));
          }
            if(response && response.statusCode != 200)
                res.status(response.statusCode);
            var data = error ? error : JSON.parse(response.body);
            return res.json(data);
        });
    });
}

