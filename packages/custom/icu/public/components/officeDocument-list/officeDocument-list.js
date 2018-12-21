'use strict';

function OfficeDocumentListController($scope, $state, BoldedService, NotifyingService, officeDocuments, OfficeDocumentsService, TasksService, MultipleSelectService, context, $stateParams, EntityService) {

    $scope.items = officeDocuments.data || officeDocuments;

    $scope.entityName = 'officeDocuments';
    $scope.entityRowTpl = '/icu/components/officeDocument-list/officeDocument-row.html';

    $scope.update = function(item) {
        return OfficeDocumentsService.update(item);
    };

    $scope.getBoldedClass = function(entity){
      return BoldedService.getBoldedClass(entity, 'officeDocuments');
    };

    $scope.create = function(parent) {
        var newItem = {};
        if(parent){
            newItem[parent.type] = parent.id;
        }
        return OfficeDocumentsService.createDocument(newItem).then(function(result) {
            result.created = new Date(result.created);
            $scope.items.push(result);
            return result;
        })
        .then(item => {
            if(parent && parent.type === 'task'){
                TasksService.getById(context.entityId)
                    .then(parentEntity => {
                        parentEntity.officeDocuments = parentEntity.tasks || [];
                        parentEntity.officeDocuments.push(item._id);
                        TasksService.update(parentEntity._id, parentEntity);
                    })
            }
            return item;
        })
    };

    $scope.order = {
        field: $stateParams.sort || 'created',
        order: 1
    };

    var creatingStatuses = {
      NotCreated: 0,
      Creating: 1,
      Created: 2
    };

    $scope.loadNext = officeDocuments.next;
    $scope.loadPrev = officeDocuments.prev;

    $scope.loadMore = function (start, LIMIT, sort) {
      var sCallerName;
      {
        let re = /([^(]+)@|at ([^(]+) \(/g;
        let aRegexResult = re.exec(new Error().stack);
        sCallerName = aRegexResult[1] || aRegexResult[2];
      }
      console.log(sCallerName);


      return new Promise((resolve) => {
        if (!$scope.isLoading && $scope.loadNext) {
          $scope.isLoading = true;
          return $scope.loadNext()
            .then(function (items) {
              _(items.data).each(function (p) {
                p.__state = creatingStatuses.Created;
              });

              var offset = $scope.displayOnly ? 0 : 1;

              if (items.data.length) {
                var index = $scope.items.length - offset;
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

    // $scope.loadMore = function() {
    //     var LIMIT = 25 ;
    //     var start = $scope.items.length;
    //     var sort = $scope.order.field;
    //     return loadNext(start, LIMIT, sort);
    // };

    function loadNext(start, LIMIT, sort){
        return OfficeDocumentsService.getAll(start , LIMIT , sort)
            .then(function(docs){
                $scope.items = $scope.items.concat(docs.data);
                $scope.items = _.uniq($scope.items, _.property('_id'));
                return docs.data;
            });
    }
}

angular.module('mean.icu.ui.officedocumentlist', []).controller('OfficeDocumentListController', OfficeDocumentListController);
