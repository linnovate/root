'use strict';

angular.module('mean.icu.ui.searchlist', [])
.directive('icuSearchList', function (LayoutService) {
    function controller($rootScope, $scope, $state, $filter, SearchService, MultipleSelectService, NotifyingService) {

        SearchService.builtInSearchArray = false;

        if ($scope.results.length && $state.current.name === 'main.search') {
            var active  = $scope.results[0];

           // $state.go('.' + active._type, { id: active._id } );
        }
        $scope.rowClicked = function() {
            LayoutService.clicked();
        };

        $scope.initialize = function ($event, result) {
            if($scope.multipleSelectMode)return;

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

        function filterVisibleItems(){
            let visibleItems = $filter('searchResultsFilter')($scope.results);
            return $filter('filteringByUpdated')(visibleItems);
        }
        $scope.multipleSelectRefreshSelected = function (entity) {
            MultipleSelectService.refreshSelectedList(entity);
            multipleSelectRefreshState(filterVisibleItems());
        };

        function multipleSelectRefreshState(visibleItems){
            $scope.selectedItems = MultipleSelectService.getSelected();
            refreshActiveItemsInList();
            $scope.cornerState = MultipleSelectService.refreshCornerState(visibleItems.length);

            if ($scope.selectedItems.length) {
                $scope.multipleSelectMode = true;
            } else {
                MultipleSelectService.refreshSelectedList();
            }

            multipleDisablingCheck();
            $rootScope.$broadcast('refreshBulkButtonsAccess');
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
        $scope.changeMultipleMode = () => $scope.$broadcast('checkMultipleMode');
        $scope.$on('changeCornerState', (event, cornerState) => multipleSelectSetAllSelected(cornerState === 'all'));

        function multipleSelectSetAllSelected(status){
            let visibleItems = filterVisibleItems();
            for(let i = 0; i < visibleItems.length; i++){
                let rowSelectStatus = visibleItems[i];

                if(!rowSelectStatus.selected)MultipleSelectService.refreshSelectedList(visibleItems[i]);
                rowSelectStatus.selected = status;
            }
            if(status){
                let copy = _.map(visibleItems, _.clone);
                MultipleSelectService.setSelectedList(copy);
            } else {
                MultipleSelectService.refreshSelectedList();
            }
            multipleSelectRefreshState(visibleItems);
        }
    }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/search-list/search-list.directive.html',
        scope: {
            results: '=',
            multipleSelectMode: '=',
            changeMultipleMode: '='
        },
        controller: controller
    };
});
