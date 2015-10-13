'use strict';
angular.module('mean.icu.ui.modaldeletetasksbyentity', [])
    .directive('icuOpenModal', function ($modal) {

        function link(scope, elem, attrs) {
            console.log(scope,attrs)


            elem.bind('click', function() {

                if(scope.isTasks) {
                    buildModal();
                } else
                    scope.deleteFn();

            });

            function buildModal() {
                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-directive/modal.html',
                    controller: controller,
                    resolve: {
                        entity: function () {
                            return attrs.icuOpenModal;
                        }
                    }

                });

                modalInstance.result.then(function () {
                    scope.deleteFn();
                }, function () {
                    console.log('Modal dismissed');
                });
            }
        }


        ;

        return {
            restrict: 'A',
            scope: {
                isTasks: "=",
                deleteFn: '&'
            },
            link: link
        };
    });

function controller($scope, $modalInstance, entity) {
    console.log(entity,'entity')

    $scope.entity = {type: entity};

    $scope.ok = function () {
        if($scope.entity.textDelete && $scope.entity.textDelete == 'DELETE')
            $modalInstance.close();
        else
            $scope.cancel();

    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
}
