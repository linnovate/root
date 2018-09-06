'use strict';

angular.module('mean.icu.ui.searchlist', [])
.directive('icuSearchList', function (LayoutService) {
    function controller($rootScope, $scope, $state, SearchService, MultipleSelectService, NotifyingService) {

        SearchService.builtInSearchArray = false;

        if ($scope.results.length && $state.current.name === 'main.search') {
            var active  = $scope.results[0];

           // $state.go('.' + active._type, { id: active._id } );
        }
        $scope.rowClicked = function() {
            LayoutService.clicked();
        };

        $scope.initialize = function ($event, result) {
            $state.go(`main.search.${result.type ? result.type : result._type}`,
            {
                id: result.entityId ? result.entityId : result.id
            })
        };


        for(var i = 0;i<$scope.results.length;i++){
            $scope.results[i].id = $scope.results[i].id ? $scope.results[i].id:$scope.results[i]._id;
            $scope.results[i]._id = $scope.results[i].id;
        }

        //********Multiple Select Search*******//
        $scope.mouseOnMultiple = false;
        $scope.selectedItems = MultipleSelectService.refreshSelectedList();
        $scope.cornerState = MultipleSelectService.getCornerState();
        NotifyingService.notify('multipleDisableDetailsPaneCheck');

        $scope.showTick = function(item){ item.visible = true };
        $scope.hideTick = function(item){ item.visible = false };

        $scope.multipleSelectRefreshSelected = function (entity) {
            MultipleSelectService.refreshSelectedList(entity);
            multipleSelectRefreshState();
        };

        function multipleSelectRefreshState(){
            $scope.selectedItems = MultipleSelectService.getSelected();
            refreshActiveItemsInList();
            $scope.cornerState = MultipleSelectService.refreshCornerState($scope.results.length);

            if ($scope.selectedItems.length) {
                $scope.multipleSelectMode = true;
            } else {
                MultipleSelectService.refreshSelectedList();
            }

            multipleDisablingCheck();
            $scope.$broadcast('refreshBulkButtonsAccess');
            NotifyingService.notify('multipleDisableDetailsPaneCheck');
        }

        function refreshActiveItemsInList(){
            for(let selected of $scope.selectedItems){
                let entity = $scope.results.find( result => result._id === selected._id );
                selected.selected = !!entity;
            }
        }

        function multipleDisablingCheck(){
            if(!$scope.selectedItems.length && !$scope.mouseOnMultiple){
                $scope.multipleSelectMode = false;
            }
        }
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/search-list/search-list.directive.html',
        scope: {
            results: '=',
            multipleSelectMode: '='
        },
        controller: controller
    };
});
