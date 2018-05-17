'use strict';

angular.module('mean.icu.ui.officedocumentlist', [])
    .controller('OfficeDocumentListController', function ($scope,
                                                           $state,
                                                            officeDocuments,
                                                            //firstTime,
                                                            OfficeDocumentsService,
                                                            context,
                                                            $filter,
                                                            $stateParams,
                                                            EntityService) {
        $scope.officeDocuments = officeDocuments.data || officeDocuments;
        $scope.loadNext = officeDocuments.next;
        $scope.loadPrev = officeDocuments.prev;
        //$scope.firstTime = firstTime;
        $scope.print = function () {
            $window.print()
        }

    $scope.starred = $stateParams.starred;

    $scope.sorting = {
        field: $stateParams.sort || 'created',
        order: 1
    };


    // activeToggle
    $scope.activeToggleList = EntityService.activeToggleList;
    var activeToggle;
    if(EntityService.getActiveStatusFilterValue()&&EntityService.getActiveStatusFilterValue()!="default" ){
        activeToggle = EntityService.getActiveStatusFilterValue();
    }
    else{
        activeToggle ="active"; 
    }
    $scope.activeToggle = {
        field: !EntityService.isActiveStatusAvailable() ? 'all' : activeToggle || 'active',
        disabled: !EntityService.isActiveStatusAvailable()
    };
    /*---*/

    $scope.isCurrentState = function (id) {
        return $state.current.name.indexOf('main.officeDocuments.byentity') === 0 && $state.current.name.indexOf('details') === -1;
    };

    $scope.changeOrder = function () {
        if($scope.sorting.field == EntityService.getSortFilterValue().field){
            $scope.sorting.order = -1*EntityService.getSortFilterValue().order;
        }
          EntityService.setSortFilterValue({field:$scope.sorting.field,order:$scope.sorting.order});
          OfficeDocumentsService.getAll(0,25,$scope.sorting.field,
                                             $scope.sorting.order,
                                             $scope.activeToggle.field,
                                            EntityService.getEntityFolderValue().id).then(function (docs) {
             $scope.officeDocuments = docs;
             $state.go($state.current.name, { sort: $scope.sorting.field,  activeToggle: $scope.activeToggle.field, officeDocuments: $scope.officeDocuments });
        });
      };
    //     if ($scope.sorting.field != "custom") {
    //         $scope.sorting.isReverse = !$scope.sorting.isReverse;
    //     }

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
            if(!officeDocument) return ;

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

    $scope.filterActive = function () {
        EntityService.setActiveStatusFilterValue($scope.activeToggle.field);
        OfficeDocumentsService.getAll(0,25,$scope.sorting.field, $scope.sorting.order, $scope.activeToggle.field, EntityService.getEntityFolderValue().id).then(function (docs) {
            $scope.officeDocuments = docs;
             $state.go($state.current.name, { activeToggle: $scope.activeToggle.field, officeDocuments: $scope.officeDocuments });
        });
       
    };

        let possibleNavigate = $scope.officeDocuments.filter(function(t) {
            return t.recycled == null ; 
        })
    
        if (possibleNavigate.length) {
            if ($state.current.name === 'main.officeDocuments.all' ||
                $state.current.name === 'main.officeDocuments.byentity' ||
                $state.current.name === 'main.officeDocuments.all.details.activities'||
                $state.current.name === 'main.officeDocuments.byentity.details.activities') {
                var date = new Date();
                var lastIndex = possibleNavigate.length-1;
                var docDate = new Date(possibleNavigate[lastIndex].created);
                var diff = date.getTime() - docDate.getTime();
                if(possibleNavigate[lastIndex].title=='' && diff <= 2500) {
                    navigateToDetails(possibleNavigate[lastIndex]);
                }
                else {
                    navigateToDetails(possibleNavigate[0]);
                }                    
            }
        }
        else {
            if ($state.current.name === 'main.officeDocuments.all') {
                return;
            }
            // if (
            //     $state.current.name !== 'main.officeDocuments.byentity.activities' &&
            //     $state.current.name !== 'main.officeDocuments.byentity.details.activities') {
            //     $state.go('.activities');
            // }
            if($state.current.name == 'main.officeDocuments.all.details.activities'){
                $state.go('main.officeDocuments.all');
            }
        }

    });
