'use strict';

angular.module('mean.icu.ui.tabs')
    .directive('icuTabsFolders', function ($state, $filter, FoldersService) {
        function controller($scope) {
            $scope.sorting = {
                field: 'created',
                isReverse: false
            };

            $scope.loadNext = $scope.folders.next;
            $scope.loadPrev = $scope.folders.prev;
            $scope.folders = $scope.folders.data || $scope.folders;
            FoldersService.tabData = $scope.folders;
            $scope.folderOrder = function(folder) {
                if (folder._id && $scope.sorting) {
                    var parts = $scope.sorting.field.split('.');
                    var result = folder;
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
                    return result + folder.title;
                }
            };

            function sort() {
                var result = $filter('orderBy')($scope.folders, $scope.folderOrder);
                Array.prototype.splice.apply($scope.folders, [0, $scope.folders.length].concat(result));
            }

            sort();

            $scope.manageFolders = function () {
                $state.go('main.folders.byentity.activities', {
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
                folders: '=',
                entityName: '@',
                entity: '='
            },
            controller: controller,
            replace: true,
            templateUrl: '/icu/components/tabs/folders/folders.html'
        };
    });

