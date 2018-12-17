'use strict';

/**
 * @desc order directive that is specific to the order module at a company named Acme
 * @example <discussion-due></discussion-due>
 */
angular.module('mean.icu.ui.discussiondetails').directive('discussionDue', DiscussionDue);

function DiscussionDue() {

  return {
    scope: {
      item: "=",
      onChange: "=",
      inModal: "="
    },
    link: link,
    templateUrl: '/icu/components/discussion-details/discussion-due/discussion-due.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    castToDate();

    $scope.$on('updateDiscussionDue', () => {
      castToDate();
    });

    function castToDate(){
      if ($scope.item.startDate) {
        $scope.item.startDate = new Date($scope.item.startDate);
      }
      if ($scope.item.endDate) {
        $scope.item.endDate = new Date($scope.item.endDate);
      }
      if ($scope.item.startTime) {
        $scope.item.startTime = new Date($scope.item.startTime);
      }
      if ($scope.item.endTime) {
        $scope.item.endTime = new Date($scope.item.endTime);
      }
    }

    $scope.fade = false;
    $(document).ready(function() {
      let dueDiv = document.getElementById('dueDiv');
      if(!dueDiv)return;

      $scope.updateDatesString();
      $('uib-timepicker').datepicker();

      if ($scope.item.allDay) {
        dueDiv.style.height = '96px';
      } else {
        dueDiv.style.height = '370px';
      }
    });

    $(document).click(function(event) {
      if ((!$(event.target).closest('.dueDiv').length) && (!$(event.target).closest('.detail-due').length)) {
        if ($scope.fade) {
          $scope.dueClicked();
        }
      }
    });

    $scope.startDueOptions = {
      onSelect: function() {
        $scope.onChange($scope.item, 'startDue');
        $scope.updateDatesString();
        $scope.open();
      },
      onClose: function() {
        let datePicker = $scope.inModal ? $('#modalBulk').find('ui-datepicker-div') : $('ui-datepicker-div');

        if (!$scope.checkDate()) {
          datePicker.css( "display", "block" );
          $scope.open();
        } else {
          datePicker.css( "display", "none" );
          $scope.open();
        }
        datePicker.css( "z-index", "1051" )
      },
      dateFormat: 'dd/mm/yy'
    };
    $scope.endDueOptions = _.clone($scope.startDueOptions);

    $scope.updateDueTime = function(){
        $scope.onChange($scope.item, 'due');
        $scope.updateDatesString();
        $scope.open();
    }

    $scope.endDueOptions.onSelect = function() {
      $scope.onChange($scope.item, 'endDue');
      $scope.updateDatesString();
      $scope.open();
    }

    $scope.timeOptions = {
      minuteStep: 5,
      showInputs: false,
      disableFocus: true,
      showMeridian: false,
      defaultTime: '00:00'
    };

    $scope.checkDate = function() {
      var d = new Date()
      d.setHours(0, 0, 0, 0);
      if (d > $scope.item.startDate || d > $scope.item.endDate || $scope.item.endDate < $scope.item.startDate) {
        return false;
      }
      return true;
    }
    $scope.checkboxClick = function(item) {
      $scope.onChange(item);
      $scope.updateDatesString();
      if ($scope.item.allDay) {
        document.getElementById('dueDiv').style.height = '96px';
      } else {
        document.getElementById('dueDiv').style.height = '370px';
      }
    }

    $scope.open = function() {
      let d = new Date();
      let datePicker = document.getElementById('ui-datepicker-div');
      let before = document.getElementById('before').style;
      let past = document.getElementById('past').style;

      if (d > $scope.item.startDate || d > $scope.item.endDate) {
        before.display = 'none';
        past.display = datePicker.style.display;
        past.left = 0;//datePicker.style.left;
      } else if ($scope.item.endDate < $scope.item.startDate) {
        past.display = 'none';
        before.display = datePicker.style.display;
        before.left = 0;//datePicker.style.left;
      } else {
        past.display = 'none';
        before.display = 'none';
      }
      if($scope.inModal)datePicker.style.zIndex = 1051;
    };

    $scope.dueClicked = function() {
        let dueDiv = $scope.inModal ? $('#modalBulk').find('.dueDiv') : $('.dueDiv');
        if (!$scope.fade) {
            dueDiv.fadeIn(1000);
      } else {
            dueDiv.fadeOut(1000);
      }
      $scope.fade = !$scope.fade;
    }

    $scope.closeOldDateNotification = function() {
      document.getElementById('past').style.display = 'none';
    }
    $scope.closeBefore = function() {
      document.getElementById('before').style.display = 'none';
    }
    $scope.updateDatesString = function() {
      var val = $("#deleteDiscussion").html();
      var english = false;
      if (val == "מחק דיון") {
        english = false;
      } else {
        english = true;
      }
      if (!english) {
        $("#startTime").css("orientation", "auto left");
      }
      $scope.allDayTitle = english ? "All day long" : "כל היום";
      $scope.firstStr = 'deadline';
      $scope.secondStr = '';
      if ($scope.item.startDate) {
        var startStr = $scope.item.startDate.getDate() + "/" + ($scope.item.startDate.getMonth() + 1) + "/" + $scope.item.startDate.getFullYear();
        $scope.firstStr = startStr;
      }
      if ($scope.item.allDay) {
        $scope.secondStr = "All day long";
      } else {
        if ($scope.item.startTime) {
          var ho = $scope.item.startTime.getHours().toString().length == 1 ? "0" + $scope.item.startTime.getHours().toString() : $scope.item.startTime.getHours().toString();
          var min = $scope.item.startTime.getMinutes().toString().length == 1 ? "0" + $scope.item.startTime.getMinutes().toString() : $scope.item.startTime.getMinutes().toString();
          startStr = ho + ":" + min;
          $scope.firstStr = $scope.item.startDate ? $scope.firstStr + " " + startStr : '';
        }
        if ($scope.item.endDate) {
          if ($scope.firstStr != 'deadline') {
            $scope.firstStr = $scope.firstStr;
          } else {
            $scope.firstStr = "";
          }
          var endStr = $scope.item.endDate.getDate() + "/" + ($scope.item.endDate.getMonth() + 1) + "/" + $scope.item.endDate.getFullYear();
          $scope.secondStr = endStr;
          if ($scope.item.endTime) {
            var ho = $scope.item.endTime.getHours().toString().length == 1 ? "0" + $scope.item.endTime.getHours().toString() : $scope.item.endTime.getHours().toString();
            var min = $scope.item.endTime.getMinutes().toString().length == 1 ? "0" + $scope.item.endTime.getMinutes().toString() : $scope.item.endTime.getMinutes().toString();
            endStr = ho + ":" + min;
            $scope.secondStr = $scope.secondStr + " " + endStr;
          }
        }
      }
    }

    $scope.disableButton = function() {
      if (!$scope.item.location) {
        return true;
      }
      if ($scope.item.startDate && $scope.item.allDay) {
        return false;
      } else if ($scope.item.startDate && $scope.item.startTime && $scope.item.endDate && $scope.item.endTime) {
        return false;
      } else {
        return true;
      }
    }
  }
}
