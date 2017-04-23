'use strict';

angular.module('mean.elasticsearch').factory('Elasticsearch', ['$resource',
	function($resource) {
		return $resource('elasticsearch', {
			query: {
				method: 'GET'
			},
			create: {
				method: 'POST'
			}
		});
	}
]);
