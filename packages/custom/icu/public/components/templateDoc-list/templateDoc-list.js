'use strict';

function TemplateDocListController($scope,
                                   $state,
                                   templateDocs,
                                   TemplateDocsService,
                                   context,
                                   $filter,
                                   $stateParams,
                                   EntityService) {

    $scope.items = templateDocs.data || templateDocs;

    $scope.entityName = 'templateDocs';
    $scope.entityRowTpl = '/icu/components/templateDoc-list/templateDoc-row.html';

    $scope.templateDocs = templateDocs.data || templateDocs;
    $scope.loadNext = templateDocs.next;
    $scope.loadPrev = templateDocs.prev;

    $scope.starred = $stateParams.starred;

    $scope.isCurrentState = function (id) {
        return $state.current.name.indexOf('main.templateDocs.byentity') === 0 &&
            $state.current.name.indexOf('details') === -1;
    };


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

    $scope.reverse = true;

    $scope.changeOrder = function () {
        $scope.reverse = !$scope.reverse;

        if($scope.sorting.field != "custom"){
            $scope.sorting.isReverse = !$scope.sorting.isReverse;
        }

        /*Made By OHAD - Needed for reversing sort*/
        $state.go($state.current.name, { sort: $scope.sorting.field });
    };

    $scope.sorting = {
        field: $stateParams.sort || 'created',
        isReverse: false
    };

    $scope.sortingList = [
        {
            title: 'title',
            value: 'title'
        }, {
            title: 'status',
            value: 'status'
        }, {
            title: 'created',
            value: 'created'
        }
    ];

     if(context.entityName != "all"){
        $scope.sortingList.push({
            title: 'custom',
            value: 'custom'
        });
    };

    $scope.loadMore = function(start, LIMIT, sort) {
        return TemplateDocsService.getAll(start, LIMIT, sort).then(function(docs) {
            $scope.items.concat(docs);
            return $scope.items;
        });
    }

    function navigateToDetails(templateDoc) {
        $scope.detailsState = context.entityName === 'all' ?
            'main.templateDocs.all.details' : 'main.templateDocs.byentity.details';

        $state.go($scope.detailsState, {
            id: templateDoc._id,
            entity: $scope.currentContext.entityName,
            entityId: $scope.currentContext.entityId,
        });
    }

    $scope.toggleStarred = function () {
        $state.go($state.current.name, { starred: !$stateParams.starred });
    };

    if ($scope.templateDocs.length) {
        if ($state.current.name === 'main.templateDocs.all' ||
            $state.current.name === 'main.templateDocs.byentity') {
            navigateToDetails($scope.templateDocs[0]);
        }
    }
    else {
        if ($state.current.name === 'main.templateDocs.all') {
            return;
        }
        if (
            $state.current.name !== 'main.templateDocs.byentity.activities' &&
            $state.current.name !== 'main.templateDocs.byentity.details.activities') {
            $state.go('.activities');
        }
    }
};

angular.module('mean.icu.ui.templateDoclist', []).controller('TemplateDocListController', TemplateDocListController);
