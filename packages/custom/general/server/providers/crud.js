'use strict';

var mean = require('meanio'),
	config = mean.loadConfig(),
	apiUri = config.api.uri,
	querystring = require('querystring'),
	request = require('request');

class Crud {

	constructor(cmd) {
		this.cmd = cmd;
	}

	talkToApi(options , callback) {
		var cmd_api = (options.param)? this.cmd + '/' + options.param : this.cmd;
		var objReq = {
			uri: apiUri  + cmd_api,
			method: options.method,
			 headers: {
			 }
		};
		console.log('options')
		console.dir(options);

		if (options.form) {
			objReq.form = options.form;
			objReq.headers['Content-Type'] = 'multipart/form-data';
			objReq.headers['Content-Length'] = querystring.stringify(options.form).length;
		}

		console.dir(objReq);

		request(objReq, function(error, response, body) {
			if (!error && response.statusCode === 200 && response.body.length) {
				return callback(JSON.parse(body));
			}
			callback(error ? error : body, response);
		});
	}

	create(data, callback) {
console.log('crud create');
		console.dir(data);
		var options = {
			method: 'POST',
			form: data.data
		};

		this.talkToApi(options, callback);

	}

	all(callback) {
		var options = {
			method: 'GET'
		};
		this.talkToApi(options, callback);
	}

	get(data, callback) {
		console.log('crud get');
		console.dir(data);
		var options = {
			method: 'GET',
			param: data.param
		};

		this.talkToApi(options, callback);

	}

	update(data, callback) {

		var options = {
			method: 'PUT',
			form: data.data,
			param: data.param
		};

		this.talkToApi(options, callback);

	}

	delete(data, callback) {

		var options = {
			method: 'DELETE',
			param: data.param
		};

		this.talkToApi(options, callback);
	}

}

class Project extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}

class Task extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}



exports.Crud = Crud;
exports.Project = Project;
exports.Task = Task;
