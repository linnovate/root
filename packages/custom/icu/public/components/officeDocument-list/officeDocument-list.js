'use strict';

angular.module('mean.icu.ui.officedocumentlist', [])
    .controller('OfficeDocumentListController', function ($scope,
                                                           $state,
                                                            officeDocuments,
                                                            OfficeDocumentsService,
                                                            context,
                                                            $filter,
                                                            $stateParams) {
        $scope.officeDocuments = officeDocuments.data || officeDocuments;
        $scope.loadNext = officeDocuments.next;
        $scope.loadPrev = officeDocuments.prev;
        $scope.print = function () {
            $window.print()
        }

        $scope.starred = $stateParams.starred;
        if ($scope.officeDocuments.length > 0 && !$scope.officeDocuments[$scope.officeDocuments.length - 1].id) {
            $scope.officeDocuments = [$scope.officeDocuments[0]];
        }

        $scope.isCurrentState = function (id) {
            return $state.current.name.indexOf('main.officeDocuments.byentity') === 0 &&
                $state.current.name.indexOf('details') === -1;
        };

        $scope.changeOrder = function () {
            if ($scope.sorting.field != "custom") {
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

        if (context.entityName != "all") {
            $scope.sortingList.push({
                title: 'custom',
                value: 'custom'
            });
        };

        function navigateToDetails(officeDocument) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.officeDocuments.all.details' : 'main.officeDocuments.byentity.details';

            $state.go($scope.detailsState, {
                id: officeDocument._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
            });
        }

        $scope.toggleStarred = function () {
            $state.go($state.current.name, { starred: !$stateParams.starred });
        };

        if ($scope.officeDocuments.length) {
            if ($state.current.name === 'main.officeDocuments.all' ||
                $state.current.name === 'main.officeDocuments.byentity') {
                navigateToDetails($scope.officeDocuments[0]);
            }
        }
        else {
            if ($state.current.name === 'main.officeDocuments.all') {
                return;
            }
            if (
                $state.current.name !== 'main.officeDocuments.byentity.activities' &&
                $state.current.name !== 'main.officeDocuments.byentity.details.activities') {
                $state.go('.activities');
            }
        }

    });
