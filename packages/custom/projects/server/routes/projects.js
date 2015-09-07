'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Projects, app, auth, database) {

	var ProjectC = require('../../../general/server/providers/crud.js').Project,
		Project = new ProjectC('/api/projects'),
        Notification = require('../../../general/server/providers/notify.js').Notification,
        Notify = new Notification();

	app.route('/api/projects')

		.post(function(req, res) {
			Project.create({
				data: req.body,
				headers: req.headers
			}, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
				res.send(data);
			});
		})
		.get(function(req, res) {
			Project.all({
				data: req.body,
				headers: req.headers
			}, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
				res.send(data);
			});
		});


	app.route('/api/projects/:projectId')
		.get(function(req, res) {
			Project.get({
				param: req.params.projectId,
				headers: req.headers
			}, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
				res.send(data);
			});
		})

		.put(function(req, res) {
			Project.update({
				data: req.body.project,
				param: req.params.projectId,
				headers: req.headers
			}, function(data, statusCode) {

                if(statusCode && statusCode != 200)
                    res.status(statusCode);
                if(data.title && !data.room){
                    Notify.createRoom({
                        headers: req.headers,
                        project: data
                    }, function(data) {
                        req.body.room = data.room;
                        Project.update({
                            data: req.body,
                            param: req.params.projectId,
                            headers: req.headers
                        }, function(data, statusCode) {

                            if (statusCode && statusCode != 200)
                                res.status(statusCode);

                            res.send(data);
                        });
                    });
                } else if(data.room) {
                    Notify.patch({
                        headers: req.headers,
                        project: data,
                        context: req.body.context
                    }, function(result) {
                        res.send(data);

                    });
                }
                else
                    res.send(data);
			});
		})

		.delete(function(req, res) {
			Project.delete({
				param: req.params.projectId,
				headers: req.headers
			}, function(data, statusCode) {
                if(statusCode && statusCode != 200)
                    res.status(statusCode);
				res.send(data);
			});
		});
};
