'use strict';
angular.module('mean.icu.ui.modaldeletetasksbyentity', [])
    .directive('icuOpenModal', function ($modal) {

        function link(scope, elem, attrs) {

            elem.bind('click', function() {

                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-directive/modal.html',
                    controller: controller,
                    resolve: {
                        entity: function () {
                            return scope.entity;
                        }
                    }

                });

                modalInstance.result.then(function () {
                    scope.deleteFn();
                }, function () {
                    console.log('Modal dismissed');
                });
            });

        }


        function controller($scope, $modalInstance, entity) {

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

        return {
            restrict: 'A',
            scope: {
                entity: "@",
                deleteFn: '&'
            },
            link: link
        };
    });
