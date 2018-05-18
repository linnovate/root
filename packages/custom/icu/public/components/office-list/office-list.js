'use strict';

angular.module('mean.icu.ui.officelist', [])
    .controller('OfficeListController', function ($scope,
                                                   $state,
                                                   offices,
                                                   OfficesService,
                                                   context,
                                                   $filter,
                                                   $stateParams) {
        $scope.offices = offices.data || offices;
        $scope.loadNext = offices.next;
        $scope.loadPrev = offices.prev;

        $scope.starred = $stateParams.starred;
        if ($scope.offices.length > 0 && !$scope.offices[$scope.offices.length - 1].id) {
 		    $scope.offices = [$scope.offices[0]];
 	    }

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.offices.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

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

        function navigateToDetails(office) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.offices.all.details' : 'main.offices.byentity.details';

            $state.go($scope.detailsState, {
                id: office._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
            });
        }

        $scope.toggleStarred = function () {
            $state.go($state.current.name, { starred: !$stateParams.starred });
        };

        if ($scope.offices.length) {
            if ($state.current.name === 'main.offices.all' ||
                $state.current.name === 'main.offices.byentity') {
                navigateToDetails($scope.offices[0]);
            }
        }
        else {
            if ($state.current.name === 'main.offices.all') {
                return;
            }
            if (
                $state.current.name !== 'main.offices.byentity.activities' &&
                $state.current.name !== 'main.offices.byentity.details.activities') {
                $state.go('.activities');
            }
        }
    });
