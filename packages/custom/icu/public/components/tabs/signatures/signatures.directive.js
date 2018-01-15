'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsSignatures', function ($state, $filter, SignaturesService) {
        function controller($scope) {

            $scope.signature = '';
            $scope.showButton = false;

            $scope.submit = function () {
                $scope.signature['office']=$state.current.params.id;
                $scope.signature['message']="בברכה,";
                SignaturesService.create($scope.signature).then(function(result){
                    $scope.signature = '';
                    $scope.signatures.push(result)
                }).catch(function(error){

                });
            }
            $scope.delete = function(signature){
                SignaturesService.remove(signature._id).then(function(result){
                    $scope.signatures.pop(result)
                }).catch(function(error){

                })
            }
        }

        return {
            restrict: 'A',
            scope: {
                signatures: '=',
                entityName: '@',
                entity: '='
            },
            controller: controller,
            replace: true,
            templateUrl: '/icu/components/tabs/signatures/signatures.html'
        };
    });

