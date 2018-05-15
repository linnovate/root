'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <detail-due></detail-due>
 */
angular.module('mean.icu.ui.detailsComponents').directive('detailDue', detailDue);

function detailDue() {

  return {
    scope: {
      value: "=",
      list: "=",
      onChange: "&"
    },
    link: link,
    templateUrl: '/icu/components/details-components/detail-due/detail-due.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    $scope.firstValue = $scope.value;

    //due start
    if ($scope.firstValue)
      $scope.firstValue = new Date($scope.firstValue);


    $scope.dueOptions = {
      onSelect: function() {
        $scope.onChange($scope.value);
      },
      onClose: function() {
        if ($scope.checkDate()) {
          document.getElementById('ui-datepicker-div').style.display = 'block';
          $scope.open();
        } else {
          document.getElementById('ui-datepicker-div').style.display = 'none';
          $scope.open();
        }
      },
      dateFormat: 'd.m.yy'
    };

    $scope.checkDate = function() {
      var d = new Date();
      d.setHours(0, 0, 0, 0);
      if (d > $scope.value) {
        return true;
      }
      return false;
    }

    $scope.open = function() {
      if ($scope.checkDate()) {
        document.getElementById('past').style.display = document.getElementById('ui-datepicker-div').style.display;
        document.getElementById('past').style.left = document.getElementById('ui-datepicker-div').style.left;
      } else {
        document.getElementById('past').style.display = 'none';
      }
    }

    $scope.closeOldDateNotification = function () {
      document.getElementById('past').style.display = 'none';
    }

  }
}
