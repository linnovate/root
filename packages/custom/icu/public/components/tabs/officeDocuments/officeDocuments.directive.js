'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsOfficedocuments', function ($state, $filter, OfficeDocumentsService, PermissionsService) {
        function controller($scope) {
            $scope.sorting = {
                field: 'created',
                isReverse: false
            };

            $scope.officeDocuments = $scope.$parent.$parent.officeDocuments;

            $scope.loadNext = $scope.officeDocuments.next;
            $scope.loadPrev = $scope.officeDocuments.prev;
            $scope.officeDocuments = $scope.officeDocuments.data || $scope.officeDocuments;
            OfficeDocumentsService.tabData = $scope.officeDocuments;
            $scope.officeDocumentOrder = function(officeDocument) {
                if (officeDocument._id && $scope.sorting) {
                    var parts = $scope.sorting.field.split('.');
                    var result = officeDocument;
                    for (var i = 0; i < parts.length; i+=1) {
                        if (result) {
                            result = result[parts[i]];
                        } else {
                            result = undefined;
                        }
                    }

                    //HACK: instead of using array of 2 values, this code concatenates
                    //2 values
                    //Reason: inconsistency in sorting results between sorting by one param
                    //and array of params
                    return result + officeDocument.title;
                }
            };

            function sort() {
                var result = $filter('orderBy')($scope.officeDocuments, $scope.officeDocumentOrder);
                Array.prototype.splice.apply($scope.officeDocuments, [0, $scope.officeDocuments.length].concat(result));
            }

            sort();

            $scope.havePermissions = function(type, enableRecycled) {
                enableRecycled = enableRecycled || !$scope.isRecycled;
                return (PermissionsService.havePermissions($scope.entity, type) && enableRecycled);
            }

            $scope.manageOfficeDocuments = function () {
                $state.go('main.officeDocuments.byentity.activities', {
                    entity: $scope.entityName,
                    id: $scope.entity._id,
                    entityId: $scope.entity._id
                },
                {
                    reload: true
                });
            };
        }

        return {
            restrict: 'A',
            scope: {
                officeDocuments: '=',
                entityName: '@',
                entity: '='
            },
            controller: controller,
            replace: true,
            templateUrl: '/icu/components/tabs/officeDocuments/officeDocuments.html'
        };
    });

