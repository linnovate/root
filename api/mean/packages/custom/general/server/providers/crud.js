'use strict';

var mongoose = require('mongoose'),
	_ = require('lodash'),
	ActionsC = require('../../../actions/server/providers/actions').Actions,
	Actions = new ActionsC(),
	models = {
		'Project': mongoose.model('Project')
	};

class Crud {

	constructor(model) {
		this.entity = model;
		this.Model = models[model];
	}

	create(data, callback) {
		var model = new this.Model(data.data);
		model.save(function(err, doc) {
			if (!err)
				Actions.save('action', 'create', this.entity , doc);
			callback({err: err, doc: doc});
		});
	}

	update(data, callback) {

		this.Model.findOne({_id: data.param}).exec(function(err, doc) {
			var updatedDoc = _.extend(doc, data.data);
			updatedDoc.save(function(err, doc) {
				if (!err)
					Actions.save('action', 'update', this.entity , doc);
				callback({err: err, doc: doc});
			});
		});
	}

	delete(data, callback) {
		this.Model.remove({_id: data.param}).exec(function(err, doc) {
			if (!err) {
				Actions.save('action', 'delete', this.entity , {doc: data.param});
			}
			callback({err: err, doc: doc});
		});
	}

}

class Project extends Crud {

	constructor(cmd) {
		super(cmd);
	}

}




exports.Crud = Crud;
exports.Project = Project;
