'use strict';

function FolderListController($scope, $state, folders, NotifyingService, BoldedService, FoldersService, context, $stateParams, OfficesService, MultipleSelectService) {

    $scope.items = folders.data || folders;

    $scope.entityName = 'folders';
    $scope.entityRowTpl = '/icu/components/folder-list/folder-row.html';

    $scope.loadNext = folders.next;
    $scope.loadPrev = folders.prev;

    var creatingStatuses = {
        NotCreated: 0,
        Creating: 1,
        Created: 2
    };

    $scope.update = function(item) {
        return FoldersService.update(item);
    };

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'folders');
    };

    $scope.create = function(parent) {
        var newItem = {
            title: '',
            color: '0097A7',
            watchers: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };
        if(parent){
            newItem.office = parent.id;
        }
        return FoldersService.create(newItem).then(function(result) {
            $scope.items.push(result);
            FoldersService.data.push(result);
            return result;
        });
    };

      $scope.loadMore = function(start, LIMIT, sort) {
        return new Promise((resolve) => {
          if (!$scope.isLoading && $scope.loadNext) {
            $scope.isLoading = true;

            return $scope.loadNext()
              .then(function(items) {
                _(items.data).each(function(p) {
                  p.__state = creatingStatuses.Created;
                });

                if (items.data.length) {
                  var index = $scope.items.length;
                  var args = [index, 0].concat(items.data);

                  [].splice.apply($scope.items, args);
                }

                $scope.loadNext = items.next;
                $scope.loadPrev = items.prev;
                $scope.isLoading = false;

                return resolve(items.data);
              });
          }
          return resolve([]);
        })
      };
}

angular.module('mean.icu.ui.folderlist', []).controller('FolderListController', FolderListController);
