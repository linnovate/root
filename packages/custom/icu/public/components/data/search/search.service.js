'use strict';

angular.module('mean.icu.data.searchservice', [])
.service('SearchService', function($http, ApiUri, WarningsService) {

	var builtInSearchArray = false;
    var filteringResults = [];
    var results = []

    function find(query) {
        var _this = this;
        return $http.get(ApiUri + '/search?term=' + query).then(function(result) {
            WarningsService.setWarning(result.headers().warning);
            var results = [];
            for (var property in result.data) {
                result.data[property].forEach(function(entity) {
                    entity._type = property;
                    results.push(entity);
                });
            }
            _this.results = _this.filteringResults = results;
            return results;
        });
    }

    var filteringData = {
        issue: 'task',
        selectedEntities: {
            projects: {},
            discussions: {},
            folders: {},
            offices: {}
        },
        selectedWatchers: {},
        projects: [],
        discussions: [],
        folders: [],
        offices: [],
        watchers: []
    }

    var filterSearchByType = function(projects, discussions, folders, offices, people) {
        var filteredByType = []
        for (var i=0; i< this.results.length; i++) {
            if (this.results[i]._type == this.filteringData.issue) {
                filteredByType.push(this.results[i])
            }
        }
        this.filteringResults = filteredByType;
        
        /* getEntitiesAndWatchers */
        for (var i=0; i< this.filteringResults.length; i++) {
            if (this.filteringResults[i].project)
                this.filteringData.projects.push(this.filteringResults[i].project);
            if (this.filteringResults[i].discussions && this.filteringResults[i].discussions.length)
                this.filteringData.discussions.push(this.filteringResults[i].discussions[0]);                    
            if (this.filteringResults[i].folder)
                this.filteringData.folders.push(this.filteringResults[i].folder);
            if (this.filteringResults[i].office)
                this.filteringData.offices.push(this.filteringResults[i].office)
            if (this.filteringResults[i].watchers && this.filteringResults[i].watchers.length)
                this.filteringData.watchers = this.filteringData.watchers.concat(this.filteringResults[i].watchers)
        }

        var that = this;
        this.filteringData.projects = projects.filter(function(e) {
            return that.filteringData.projects.indexOf(e._id) > -1;
        });
        this.filteringData.discussions = discussions.filter(function(e) {
            return that.filteringData.discussions.indexOf(e._id) > -1;
        });
        this.filteringData.folders = folders.filter(function(e) {
            return that.filteringData.folders.indexOf(e._id) > -1;
        });
        this.filteringData.offices = offices.filter(function(e) {
            return that.filteringData.offices.indexOf(e._id) > -1;
        });
        this.filteringData.watchers = people.filter(function(e) {
            return that.filteringData.watchers.indexOf(e._id) > -1;
        });
        return this.filteringData;
    }

    return {
        find: find,
        builtInSearchArray: builtInSearchArray,
        filteringData: filteringData,
        filteringResults: filteringResults,
        filterSearchByType: filterSearchByType
    };
});



