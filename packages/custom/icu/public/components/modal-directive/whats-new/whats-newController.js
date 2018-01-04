function controllerwhatsNew($scope, $uibModalInstance, $filter) {
    
    $scope.whatsNew = window.config.whatsNew;

    $scope.ok = function (sendingForm) {
        localStorage.setItem("icuVersion", window.config.version);
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

}