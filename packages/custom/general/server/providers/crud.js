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

	talkToApi(options, callback) {
		var cmd_api = (options.param) ? this.cmd + '/' + options.param : this.cmd;
		var objReq = {
			uri: apiUri + cmd_api,
			method: options.method,
			headers: {},
			data: options.data
		};

		if (options.headers) {
			objReq.headers = {
				connection: options.headers.connection,
				accept: options.headers.accept,
				'user-agent': options.headers['user-agent'],
				authorization: options.headers.authorization,
				'accept-language': options.headers['accept-language'],
				cookie: options.headers.cookie,
				'if-none-match': options.headers['if-none-match']
			}

		}

		if (options.form) {
			objReq.form = options.form;
			objReq.headers['Content-Type'] = 'multipart/form-data';
			// objReq.headers['Content-Length'] = querystring.stringify(options.form).length;
		}
		request(objReq, function(error, response, body) {
			console.log('cb')
			if (!error && response.statusCode === 200 && response.body.length) {
				return callback(JSON.parse(body));
			}
			callback(error ? error : body, response);
		});
	}

	create(data, callback) {
		var options = {
			method: 'POST',
			form: data.data,
			headers: data.headers
		};

		this.talkToApi(options, callback);

	}

	all(data, callback) {
		var options = {
			method: 'GET',
			query: data.data,
			headers: data.headers
		};
		this.talkToApi(options, callback);
	}

	get(data, callback) {
		var options = {
			method: 'GET',
			param: data.param,
			headers: data.headers
		};

		this.talkToApi(options, callback);

	}

	update(data, callback) {

		var options = {
			method: 'PUT',
			form: data.data,
			param: data.param,
			headers: data.headers
		};

		this.talkToApi(options, callback);

	}

	delete(data, callback) {

		var options = {
			method: 'DELETE',
			param: data.param,
			headers: data.headers
		};

		this.talkToApi(options, callback);
	}

	patch(data, callback) {
		console.log('patch')
		var options = {
			method: 'PATCH',
			form: data.data,
			param: data.param,
			headers: data.headers
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
