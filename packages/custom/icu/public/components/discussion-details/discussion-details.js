'use strict';

angular.module('mean.icu.ui.discussiondetails', []).controller('DiscussionDetailsController', DiscussionDetailsController);

function DiscussionDetailsController($scope, $rootScope, entity, tasks, context, tags, $state, $timeout, people, DiscussionsService, PermissionsService, ActivitiesService, EntityService, UsersService, $stateParams, $window, DetailsPaneService) {

  // ==================================================== init ==================================================== //

  $scope.tabs = DetailsPaneService.orderTabs(['activities', 'documents', 'tasks']);

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("discussions"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }

  if ($scope.item && ($state.current.name === 'main.tasks.byentity.details' || $state.current.name === 'main.search.discussion' || $state.current.name === 'main.discussions.all.details' || $state.current.name === 'main.discussions.byentity.details')) {
    $state.go('.' + window.config.defaultTab);
  }

  $scope.editorOptions = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'scheduled', 'done', 'canceled', 'archived'];

  var errors = {
    'assign': 'please select assignee!',
    'startDate': 'please choose deadline!',
    'title': 'please fill title!',
    'location': 'please fill location'
  };

  $scope.entity = entity || context.entity;
  $scope.tasks = tasks.data || tasks;
  $scope.people = people;
  $scope.main = context.main;
  $scope.CanceledMailSend = false;
  $scope.tags = tags;
  $scope.me = UsersService.getMe().$$state.value;

  var currentState = $state.current.name;

  // backup for previous changes - for updates
  var backupEntity = angular.copy($scope.item);

  DiscussionsService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  $scope.onStar = function(value) {

    $scope.update($scope.item, 'star');

    DiscussionsService.star($scope.item).then(function () {
      $state.reload();
      // "$scope.item.star" will be change in 'ProjectsService.star' function
    });
  }

  $scope.onWantToCreateRoom = function() {
    $scope.item.WantRoom = true;

    $scope.update($scope.item, context);

    DiscussionsService.WantToCreateRoom($scope.item).then(function(data) {
      $state.reload();
      if(data.roomName) {
        $window.open(window.config.rocketChat.uri + '/group/' + data.roomName);
        return true;
      }
      else {
        return false;
      }
    });
  };

  $scope.onAssign = function(value) {
    $scope.item.assign = value;
    $scope.updateAndNotify($scope.item);
  }

  var activeLocationTimeout;

  $scope.updateLocation = function(discussion) {
    if (activeLocationTimeout) {
      clearTimeout(activeLocationTimeout)
    }
    activeLocationTimeout = setTimeout(function () {
      $scope.update(discussion, 'location')
    }, 500);
  };

  $scope.onStatus = function(value) {
    $scope.item.status = value;
    $scope.update($scope.item, 'status');
  }

  $scope.onDateDue = function(value, field) {
    switch(field) {
      case 'startDue':
        $scope.update($scope.item, 'startDate');
        break;
      case 'endDue':
        $scope.update($scope.item, 'endDate');
        break;
    }
  }

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item, 'tags');
  }

  // ==================================================== Menu events ==================================================== //

  $scope.recycle = function() {
    EntityService.recycle('discussions', $scope.item._id).then(function() {
      $scope.item.recycled = new Date();
      let clonedEntity = angular.copy($scope.item);
      clonedEntity.status = "Recycled"
      // just for activity status
      DiscussionsService.updateStatus(clonedEntity, $scope.item).then(function(result) {
        ActivitiesService.data.push(result);
      });

      refreshList();
      $scope.isRecycled = $scope.item.hasOwnProperty('recycled');
      $scope.permsToSee();
      $scope.havePermissions();
      $scope.haveEditiorsPermissions();
    });
  }

  $scope.recycleRestore = function() {
    EntityService.recycleRestore('discussions', $scope.item._id).then(function() {
      let clonedEntity = angular.copy($scope.item);
      clonedEntity.status = "un-deleted"
      // just for activity status
      DiscussionsService.updateStatus(clonedEntity, $scope.item).then(function(result) {
        ActivitiesService.data.push(result);
      });

      refreshList();

      var state = currentState.indexOf('search') !== -1 ? $state.current.name : 'main.discussions.all';
      $state.go(state, {
        entity: context.entityName,
        entityId: context.entityId
      }, {
        reload: true
      });
    });
  }

  function refreshList() {
    $rootScope.$broadcast('refreshList');
  }

  $scope.menuItems = [{
      label: 'recycleDiscussion',
      fa: 'fa-times-circle',
      display: !$scope.item.hasOwnProperty('recycled'),
      action: $scope.recycle,
    }, {
      label: 'unrecycleDiscussion',
      fa: 'fa-times-circle',
      display: $scope.item.hasOwnProperty('recycled'),
      action: $scope.recycleRestore,
  },{
    label: 'Say Hi!',
    icon: 'chat',
    display: true,
    action: $scope.onWantToCreateRoom
  }];

  // ==================================================== Buttons ==================================================== //

  $scope.updateStatusForApproval = function(entity) {
    let context = {
      action: "updated",
      name: "status",
      type: "project"
    }
    entity.status = "waiting-approval";
    $scope.update(entity, 'status');
  }

  $scope.summary = function(discussion) {
    for (var key in errors) {
      if (!discussion[key]) {
        alert(errors[key]);
        return
      }
    }

    if (!(discussion.allDay || (discussion.startTime && discussion.endDate && discussion.endTime))) {
      alert("Dates problem");
      return;
    }

    DiscussionsService.summary(discussion).then(function(result) {
      discussion.status = result.status;
      var index = currentState.indexOf('main.search');
      $state.reload(index === 0 ? 'main.search' : 'main.tasks.byentity');
    });
  }

  $scope.schedule = function(discussion) {
    DiscussionsService.schedule(discussion).then(function(result) {
      discussion.status = result.status;
    });
  }

  $scope.cancele = function(discussion) {
    DiscussionsService.cancele(discussion).then(function(result) {
      discussion.status = result.status;
      $scope.CanceledMailSend = true;
    });
  }

  $scope.archive = function(discussion) {
    discussion.status = 'archived';
    DiscussionsService.update(discussion);
  }

  var scheduleAction = {
    label: 'scheduleDiscussion',
    method: $scope.schedule
  };

  var summaryAction = {
    label: 'sendSummary',
    method: $scope.summary
  };

  var archiveAction = {
    label: 'archiveDiscussion',
    method: $scope.archive
  };

  var canceleAction = {
    label: 'canceleDiscussion',
    method: $scope.cancele
  };

  $scope.statusesActionsMap = {
    new: scheduleAction,
    scheduled: summaryAction,
    done: archiveAction,
    canceled: canceleAction
  };

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal) delayedUpdateTitle($scope.item, 'title');
  });

  $scope.$watch('item.description', function(nVal, oVal) {
    if (nVal !== oVal) delayedUpdateDesc($scope.item, 'description');
  });

  $scope.$watchGroup(['item.startDate', 'item.startTime', 'item.endDate', 'item.endTime'], (nVal, oVal) => {
    if (_.isEqual(nVal, oVal))return;
    $scope.$broadcast('updateDiscussionDue');
  }, true);

  // ==================================================== update ==================================================== //

  $scope.update = function(discussion, type) {
    DiscussionsService.update(discussion);
    switch (type) {
    case 'startDate':
      DiscussionsService.updateStartDate(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;

    case 'endDate':
      DiscussionsService.updateEndDate(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;

    case 'star':
      DiscussionsService.updateStar(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
        refreshList();
      });
      break;

    case 'tags':
      DiscussionsService.updateTags(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
        refreshList();
      });
      break;

    case 'status':
      DiscussionsService.updateStatus(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
        refreshList();
      });
      break;

    case 'location':
      DiscussionsService.updateLocation(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;

    case 'assign':
      if (discussion.assign != null) {
        let filtered = discussion.watchers.filter(watcher=>{
          // check the assignee is not a watcher already
          return watcher == discussion.assign
        }
        );

        // add assignee as watcher
        if (filtered.length == 0) {
          discussion.watchers.push(discussion.assign);
        }
      }

      DiscussionsService.updateAssign(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;
    case 'description':
        DiscussionsService.updateDescription(discussion, $scope.me, backupEntity).then(function(result) {
            backupEntity = angular.copy($scope.item);
            ActivitiesService.data = ActivitiesService.data || [];
            ActivitiesService.data.push(result);
            refreshList();
        });
        break;
    case 'title':
      DiscussionsService.updateTitle(discussion, $scope.me, backupEntity).then(function(result) {
        backupEntity = angular.copy($scope.item);
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
        refreshList();
      });
      break;
    }

    if (currentState.indexOf('search') != -1) {
      refreshList();
    }
  }

    $scope.updateAndNotify = function(item) {
        if (context.entityName === 'discussion') {
            item.discussion = context.entityId;
        }

        if (item.assign === undefined || item.assign === null) {
            delete item['assign'];
        } else {
            // check the assignee is not a watcher already
            let filtered = item.watchers.filter(watcher=>{
                    return watcher._id == item.assign
                }
            );

            if (filtered.length == 0) {
                item.watchers.push(item.assign);
            }
        }

        DiscussionsService.update(item).then(function(result) {
            if (context.entityName === 'project') {
                var projId = result.project ? result.project._id : undefined;
                if (projId !== context.entityId) {
                  $state.reload();
                }
            }

            DiscussionsService.updateAssign(item, $scope.me, backupEntity).then(function(res) {
                backupEntity = angular.copy(result);
                ActivitiesService.data.push(res);
            });
        });

    };

  $scope.updateCurrentDiscussion = function() {
    DiscussionsService.currentDiscussionName = $scope.item.title;
  }

  var delayedUpdateTitle = _.debounce($scope.update, 2000);
  var delayedUpdateDesc = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.isRecycled = $scope.item.hasOwnProperty('recycled');

  $scope.enableRecycled = true;
  $scope.havePermissions = function(type, enableRecycled) {
    enableRecycled = enableRecycled || !$scope.isRecycled;
    return (PermissionsService.havePermissions($scope.entity, type) && enableRecycled);
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

  $scope.permsToSee = function() {
    return PermissionsService.haveAnyPerms($scope.entity);
  }

}
