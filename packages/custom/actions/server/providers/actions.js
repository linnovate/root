'use strict';

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
	host: 'localhost:9200',
	log: 'trace'
});
class Actions {
	constructor() { //class constructor
	}

	save(type, action, name, data, cb) {
		var elData = {
			action: action,
			name: name,
			data: data
		};
		client.create({
			index: 'icu',
			type: type,
			body: elData
		}, function (error, response) {
			console.log('-------------------- ELASTIC RESPONSE ----------------');
			console.log('error: ', error );
			console.log('data: ', data);
			console.log('------------------------------------------------------');
		});

	}
}

exports.Actions = Actions;
