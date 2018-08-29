'use strict';

angular.module('mean.icu.ui.detailspane', [])
.directive('icuDetailspane', function ($uibModal) {
    function controller($scope, NotifyingService, MultipleSelectService) {
        NotifyingService.subscribe('multipleDisableDetailsPaneCheck', function () {
            $scope.disabled = !!MultipleSelectService.getSelected().length;
        }, $scope);
    }

    function link($scope, $element, $attr) {
        var changeHeight = function (event) {
            var description = $element.find('.description');
            var tabContent = $element.find('.tab-content');

            var target = angular.element(event.target);

            if (target.parents('.tabs').length
                || target.hasClass('tabs')) {
                return;
            }

            var height = target.parents('.tab-content').length
            || target.hasClass('tab-content')
                ? '30%'
                : '65%';

            description.height(height);
            tabContent.height('calc(100% - ' + height + ' - 135px)');
        };
    }

    return {
        restrict: 'A',
        scope: {
            me: '=',
            projects: '=',
            discussions: '=',
            officeDocuments: '=',
            offices: '=',
            templateDocs: '=',
            folders: '=',
        },
        controller: controller,
        link: link,
        templateUrl: '/icu/components/detailspane/detailspane.html'
    };
});

angular.module('mean.icu.ui.detailspane')
    .directive('detailsView', function () {
        function controller($scope, $state, BoldedService) {
            $scope.actionType = 'view';
            BoldedService.boldedUpdate($scope.item, $scope.entityType, $scope.actionType)
              .then((result) => {
                  $scope.item.bolded = result.bolded;
              })
              .catch(err => console.log(err));
        }

        return {
            restrict: 'E',
            scope: {
                item: '=',
                entityType: '=',
            },
            controller: controller,
        };
    });

angular.module('mean.icu').controller('DetailsPaneModalInstanceCtrl', function ($uibModalInstance) {

  function ok () {
    $uibModalInstance.close();
  };

  function cancel () {
    $uibModalInstance.dismiss('cancel');
  };
});
