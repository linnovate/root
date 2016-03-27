'use strict';

/* jshint -W098 */
angular.module('mean.elasticsearch').controller('ElasticsearchController', ['$scope', '$http', 'Global', 'Elasticsearch',
	function($scope, $http, Global, Elasticsearch) {
		$scope.elasticsearch = {settings:{}};



        this.runQuery = function() {
            console.log($scope.elasticsearch);

            switch ($scope.elasticsearch.operation) {
                case 'Search':
                    search($scope.elasticsearch.options);
                break;
                case 'Create':
                    create($scope.elasticsearch.options);
                    break;
            }

            //Elasticsearch.query($scope.elasticsearch.options, function(response) {
            //
            //    $scope.elasticsearch.response = response;
            //});
        };
        
        function ping() {
            $http.get('elasticsearch/ping').success(function(data, status, headers, config) {
                $scope.elasticsearch.status = data;
            }).error(function(data, status, headers, config) {
                    $scope.elasticsearch.status = data;
            });

        }

        function getSettings() {
            $http.get('elasticsearch/config').success(function(data, status, headers, config) {
                $scope.elasticsearch.settings = data;
            }).error(function(data, status, headers, config) {
                $scope.elasticsearch.response = data;
            });
        }

        function updateSettings() {
            $http.post('elasticsearch/config', $scope.elasticsearch.settings).success(function(data, status, headers, config) {
                $scope.elasticsearch.settings = data;
                ping();
            }).error(function(data, status, headers, config) {
                $scope.elasticsearch.response = data;
                ping();
            });
        }

        function search(options) {
            $http.get('elasticsearch', options).success(function(data, status, headers, config) {
                $scope.elasticsearch.response = JSON.stringify(data);
            }).error(function(data, status, headers, config) {
                $scope.elasticsearch.response = JSON.stringify(data);
            });
        }

        function create(options) {
            //{"index": "myindex","type":"mytype","id": "1","body": {"title": "Test 1","tags": ["y", "z"]}}
            $http.post('elasticsearch', options).success(function(data, status, headers, config) {
                $scope.elasticsearch.response = JSON.stringify(data);
            }).error(function(data, status, headers, config) {
                $scope.elasticsearch.response = JSON.stringify(data);
            });
        }

        this.getSettings = getSettings;
        this.updateSettings = updateSettings;
        getSettings();
        ping();
	}
]);

