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
      onChange: "="
    },
    link: link,
    templateUrl: '/icu/components/discussion-details/discussion-due/discussion-due.html',
    restrict: 'E'
  };

  function link($scope, element, attrs) {

    $scope.fade = false;
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

    $(document).ready(function() {
      $scope.updateDatesString();
      $('uib-timepicker').datepicker();
      if ($scope.item.allDay) {
        document.getElementById('dueDiv').style.height = '96px';
      } else {
        document.getElementById('dueDiv').style.height = '370px';
      }
    });

    $(document).click(function(event) {
      if ((!$(event.target).closest('.dueDiv').length) && (!$(event.target).closest('.detail-due').length)) {
        if ($scope.fade) {
          $scope.dueClicked();
        }
      }
    });

    $scope.dueClicked = function() {
      $scope.showDue = true;
    }
    $scope.dueBlur = function() {
      $scope.showDue = false;
    }

    $scope.startDueOptions = {
      onSelect: function() {
        $scope.onChange($scope.item, 'due');
        $scope.updateDatesString();
        $scope.open();
      },
      onClose: function() {
        if (!$scope.checkDate()) {
          document.getElementById('ui-datepicker-div').style.display = 'block';
          $scope.open();
        } else {
          document.getElementById('ui-datepicker-div').style.display = 'none';
          $scope.open();
        }
      },
      dateFormat: 'd.m.yy'
    };
    $scope.endDueOptions = _.clone($scope.startDueOptions);

    $scope.startDueOptions.onSelect = function() {
      $scope.onChange($scope.item, 'startDue');
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
      var d = new Date();
      if (d > $scope.item.startDate || d > $scope.item.endDate) {
        document.getElementById('before').style.display = 'none';
        document.getElementById('past').style.display = document.getElementById('ui-datepicker-div').style.display;
        document.getElementById('past').style.left = 0;//document.getElementById('ui-datepicker-div').style.left;
      } else if ($scope.item.endDate < $scope.item.startDate) {
        document.getElementById('past').style.display = 'none';
        document.getElementById('before').style.display = document.getElementById('ui-datepicker-div').style.display;
        document.getElementById('before').style.left = 0;//document.getElementById('ui-datepicker-div').style.left;
      } else {
        document.getElementById('past').style.display = 'none';
        document.getElementById('before').style.display = 'none';
      }
    }

    $scope.dueClicked = function() {
      if (!$scope.fade) {
        $('.dueDiv').fadeIn(1000);
      } else {
        $('.dueDiv').fadeOut(1000);
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
      var margin = english ? "-15px" : "-35px";
      var marginAllDay = english ? "-5px" : "-15px";
      var marginFirst = english ? "-5px" : "-35px";
      $scope.firstStr = 'deadline';
      $scope.secondStr = '';
      if ($scope.item.startDate) {
        var startStr = $scope.item.startDate.getDate() + "/" + ($scope.item.startDate.getMonth() + 1) + "/" + $scope.item.startDate.getFullYear();
        $scope.firstStr = startStr;
      }
      if ($scope.item.allDay) {
        $scope.secondStr = "All day long";
        $("#secondStr").css("margin-left", marginAllDay);
        $("#firstStr").css("margin-left", marginFirst);
      } else {
        if ($scope.item.startTime) {
          var ho = $scope.item.startTime.getHours().toString().length == 1 ? "0" + $scope.item.startTime.getHours().toString() : $scope.item.startTime.getHours().toString();
          var min = $scope.item.startTime.getMinutes().toString().length == 1 ? "0" + $scope.item.startTime.getMinutes().toString() : $scope.item.startTime.getMinutes().toString();
          startStr = ho + ":" + min;
          $scope.firstStr = $scope.item.startDate ? $scope.firstStr + " " + startStr : '';
          if ($scope.item.startDate) {
            $("#firstStr").css("margin-left", margin);
          }
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
            $("#secondStr").css("margin-left", margin);
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
