'use strict';

var icapi = require('./icapi.js');

class Crud {

	constructor(cmd) {
		this.cmd = cmd;
	}

	create(data, callback) {
		var options = {
			method: 'POST',
			form: data.data,
			headers: data.headers,
            cmd: this.cmd
		};

        icapi.talkToApi(options, callback);

	}

	all(data, callback) {
		var options = {
			method: 'GET',
			query: data.data,
			headers: data.headers,
            cmd: this.cmd
		};
        icapi.talkToApi(options, callback);
	}

	get(data, callback) {
		var options = {
			method: 'GET',
			param: data.param,
			headers: data.headers,
            cmd: this.cmd
		};

        icapi.talkToApi(options, callback);

	}

	update(data, callback) {

		var options = {
			method: 'PUT',
			form: data.data,
			param: data.param,
			headers: data.headers,
            cmd: this.cmd
		};

        icapi.talkToApi(options, callback);

	}

	delete(data, callback) {

		var options = {
			method: 'DELETE',
			param: data.param,
			headers: data.headers,
            cmd: this.cmd
		};

        icapi.talkToApi(options, callback);
	}

	patch(data, callback) {
		var options = {
			method: 'PATCH',
			form: data.data,
			param: data.param,
			headers: data.headers,
            cmd: this.cmd
		};

		icapi.talkToApi(options, callback);
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

class Discussion extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}

class User extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}

class Update extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}

class Office extends Crud {
	constructor(cmd) {
		super(cmd);
	}
}

exports.Crud = Crud;
exports.Project = Project;
exports.Task = Task;
exports.Discussion = Discussion;
exports.User = User;
exports.Update = Update;
exports.Office = Office;
