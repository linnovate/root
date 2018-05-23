'use strict';

function TemplateDocListController($scope, $state, templateDocs, TemplateDocsService, context, $stateParams, EntityService) {

    $scope.items = templateDocs.data || templateDocs;

    $scope.entityName = 'templateDocs';
    $scope.entityRowTpl = '/icu/components/templateDoc-list/templateDoc-row.html';

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    $scope.update = function(item) {
        var json = {
            'name': 'title',
            'newVal': item.title
        };
        return TemplateDocsService.updateTemplateDoc(item._id, json);
    }

    $scope.create = function(item) {
        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        return TemplateDocsService.create(newItem).then(function(result) {
            $scope.items.push(result);
            TemplateDocsService.data.push(result);
            return result;
        });
    }

    //     $scope.search = function(item) {
    //         return TemplateDocsService.search(term).then(function(searchResults) {
    //             _(searchResults).each(function(sr) {
    //                 var alreadyAdded = _($scope.items).any(function(p) {
    //                     return p._id === sr._id;
    //                 });

    //                 if (!alreadyAdded) {
    //                     return $scope.searchResults.push(sr);
    //                 }
    //             });
    //             $scope.selectedSuggestion = 0;
    //         });
    //     }

    $scope.loadMore = function(start, LIMIT, sort) {
        return TemplateDocsService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }
}

angular.module('mean.icu.ui.templateDoclist', []).controller('TemplateDocListController', TemplateDocListController);
