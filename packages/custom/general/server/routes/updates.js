'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(updates, app, auth, database) {

    var UpdateC = require('../providers/crud.js').Update,
        Update = new UpdateC('/api/updates'),
        Notification = require('../providers/notify.js').Notification,
        Notify = new Notification();

    app.route('/api/updates')
        .post(function(req, res) {
            Update.create({
                data: req.body.data,
                headers: req.headers
            }, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
                if(req.body.context.room) {
                    req.body.context.user = req.user.name;
                    Notify.sendMessage({
                        headers: req.headers,
                        room: req.body.context.room,
                        context: req.body.context
                    }, function(result) {
                    });
                }
            });
        })
        .get(function(req, res) {
            Update.all({
                data: req.body,
                headers: req.headers
            }, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        });


    app.route('/api/updates/:updateId')
        .get(function(req, res) {
            Update.get({
                param: req.params.updateId,
                headers: req.headers
            }, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        })
        .put(function(req, res) {
            Update.update({
                data: req.body,
                param: req.params.updateId,
                headers: req.headers
            }, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        })

        .delete(function(req, res) {
            Update.delete({
                param: req.params.updateId,
                headers: req.headers
            }, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                res.send(data);
            });
        });
};