'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Projects, app, auth, database) {

  var ProjectC = require('../../../general/server/providers/crud.js').Project,
      Project = new ProjectC('/api/projects'),
      Notification = require('../../../general/server/providers/notify.js').Notification,
      icapi = require('../../../general/server/providers/icapi.js'),
      config = require('meanio').loadConfig(),
      apiUri = config.api.uri,
      request = require('request'),
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

  app.get('/api/projects/starred', function (req, res) {
    var objReq = {
      uri: apiUri + '/api/projects/starred',
      method: 'GET',
      headers: req.headers
    };

    request(objReq, function (error, response, body) {
      if (!error && response.statusCode === 200 && response.body.length) {
        return res.json(JSON.parse(response.body));
      }
      if (response && response.statusCode !== 200)
        res.status(response.statusCode);
      var data = error ? error : JSON.parse(response.body);
      return res.json(data);
    });
  });

  app.patch('/api/projects/:id/star', function (req, res) {
      var options = {
          method: 'PATCH',
          headers: req.headers,
          cmd: '/api/projects/' + req.params.id + '/star'
      };

      icapi.talkToApi(options, function(data, statusCode){
          if(statusCode && statusCode != 200)
              res.status(statusCode);
          res.send(data);
      });
  });
};
