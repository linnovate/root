function bulkOperationsController($scope, $uibModalInstance, selectedItems, activityType, MultipleSelectService) {

    $scope.selectedItems = selectedItems;
    $scope.activityType = activityType;
// debugger

    $scope.bulkUpdate = function(){
        MultipleSelectService
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}
