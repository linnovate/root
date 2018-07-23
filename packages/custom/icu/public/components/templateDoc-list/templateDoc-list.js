'use strict';

function TemplateDocListController($scope, $state, templateDocs, NotifyingService, BoldedService, TemplateDocsService, MultipleSelectService, context, $stateParams, EntityService) {

    $scope.items = templateDocs.data || templateDocs;

    $scope.entityName = 'templateDocs';
    $scope.entityRowTpl = '/icu/components/templateDoc-list/templateDoc-row.html';

    $scope.loadNext = templateDocs.next;
    $scope.loadPrev = templateDocs.prev;

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'templateDocs');
    };

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

    $scope.refreshSelected = function (entity) {
        MultipleSelectService.refreshSelectedList(entity);
        NotifyingService.notify('refreshList');
    };

    $scope.$on('changeCornerState', function(event, cornerState){
        setAllSelected(cornerState === 'all');
    });

    function setAllSelected(status){
        for(let i = 0; i < $scope.items.length; i++){
            $scope.items[i].selected = status;
        }
        MultipleSelectService.changeAllSelectedLIst(MultipleSelectService.getNoneRecycledItems($scope.items));
    }

    $scope.loadMore = function(start, LIMIT, sort) {
        if (!$scope.isLoading && $scope.loadNext) {
            $scope.isLoading = true;
            $scope.loadNext().then(function(items) {

                _(items.data).each(function(p) {
                    p.__state = creatingStatuses.Created;
                });

                var offset = $scope.displayOnly ? 0 : 1;

                if (items.data.length) {
                    var index = $scope.items.length - offset;
                    var args = [index, 0].concat(items.data);

                    [].splice.apply($scope.items, args);
                }

                $scope.loadNext = items.next;
                $scope.loadPrev = items.prev;
                $scope.isLoading = false;
            });
        }
    }
}

angular.module('mean.icu.ui.templateDoclist', []).controller('TemplateDocListController', TemplateDocListController);
