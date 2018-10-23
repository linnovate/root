'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-tags></detail-tags>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailCategory', detailCategory);

function detailCategory(context, TasksService, ProjectsService, OfficesService, FoldersService, DiscussionsService) {

  return {
    scope: {
      placeholder: "=",
      value: "=",
      items: "=",
      onChange: "=",
      onCreate: "=",
      type: "="
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-category/detail-category.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    if (!$scope.items)
      $scope.items = [];

    $scope.items.push({
      'status': 'default',
      'title': '',
      'class': 'create-new',
      'color': 'rgb(0, 151, 167)'
    });

    $scope.setSelectText = function(value) {
      $scope.selectText = $('.ui-select-search.ng-valid-parse').val();
    }

    $scope.$watch('selectText', function(newValue, oldValue) {
      $scope.items[$scope.items.length - 1].title = newValue;
    });

    $scope.onSelectChange = function(value) {
      $scope.value = value;
      $scope.onChange(value);
    }

    $scope.create = function() {
      $scope.onCreate($scope.selectText);
      $scope.selectText = null;
    }

      let serviceMap = {
          tasks: ProjectsService,
          officeDocuments: FoldersService,
          folders: OfficesService,
          templateDocs: OfficesService,

          task: TasksService,
          discussion: DiscussionsService
      };

    $scope.updateEntityList = function () {
        let service = serviceMap[ $scope.type || context.main ];
        service.getAll(0, 0, 'created')
            .then(function (data) {
                $scope.items = data.data || data;
            })
    }

  }
}

angular.module('mean.icu.ui.detailsComponents').filter('searchfilter', function() {
  return function(input, query) {
    let r = RegExp('(' + query + ')');
    if (input !== undefined)
      return input.replace(r, '<span class="super-class">$1</span>');
  }
});
