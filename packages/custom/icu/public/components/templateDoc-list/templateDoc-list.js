'use strict';

angular.module('mean.icu.ui.templateDoclist', [])
    .controller('TemplateDocListController', function ($scope,
                                                   $state,
                                                   templateDocs,
                                                   TemplateDocsService,
                                                   context,
                                                   $filter,
                                                   $stateParams) {
        $scope.templateDocs = templateDocs.data || templateDocs;
        $scope.loadNext = templateDocs.next;
        $scope.loadPrev = templateDocs.prev;

        $scope.starred = $stateParams.starred;
        // if ($scope.templateDocs.length > 0 && !$scope.templateDocs[$scope.templateDocs.length - 1].id) {
 		//     $scope.templateDocs = [$scope.templateDocs[0]];
 	    // }

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.templateDocs.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
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



        // $scope.$watch('sorting.field', function(newValue, oldValue) {
        //     if (newValue && newValue !== oldValue) {
        //         $state.go($state.current.name, { sort: $scope.sorting.field });
        //     }
        // });
        
        
       

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
    });
