'use strict';

angular.module('mean.icu.ui.discussiondetails', []).controller('DiscussionDetailsController', DiscussionDetailsController);

function DiscussionDetailsController($scope, $rootScope, entity, tasks, context, tags, $state, $timeout, people, DiscussionsService, PermissionsService, ActivitiesService, EntityService, UsersService, $stateParams, $window) {

  // ==================================================== init ==================================================== //

  if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("discussions"))) {
    $scope.item = entity || context.entity;
  } else {
    $scope.item = context.entity || entity;
  }

  if ($scope.item && ($state.current.name === 'main.tasks.byentity.details' || $state.current.name === 'main.search.discussion' || $state.current.name === 'main.discussions.all.details' || $state.current.name === 'main.discussions.byentity.details')) {
    $state.go('.activities');
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
  $scope.people = people.data || people;
  $scope.main = context.main;
  $scope.CanceledMailSend = false;
  $scope.tags = tags;
  $scope.me = UsersService.getMe().$$state.value;

  var currentState = $state.current.name;

  // backup for previous changes - for updates
  var backupEntity = JSON.parse(JSON.stringify($scope.item));

  if ($scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
    var newPeople = {
      name: 'no select'
    };
    $scope.people.push(_(newPeople).clone());
  }

  for (var i = 0; i < $scope.people.length; i++) {
    if ($scope.people[i] && ($scope.people[i].job == undefined || $scope.people[i].job == null)) {
      $scope.people[i].job = $scope.people[i].name;
    }
  }

  DiscussionsService.getStarred().then(function(starred) {
    $scope.item.star = _(starred).any(function(s) {
      return s._id === $scope.item._id;
    });
  });

  // ==================================================== onChanges ==================================================== //

  function navigateToDetails(discussion) {
    $scope.detailsState = context.entityName === 'all' ? 'main.discussions.all.details' : 'main.discussions.byentity.details';

    $state.go($scope.detailsState, {
      id: discussion._id,
      entity: context.entityName,
      entityId: context.entityId,
      starred: $stateParams.starred
    }, {
      reload: true
    });
  }

  $scope.onStar = function(value) {
    DiscussionsService.star($scope.item).then(function () {
      navigateToDetails($scope.item);
      // "$scope.item.star" will be change in 'ProjectsService.star' function
    });
  }

  $scope.onWantToCreateRoom = function() {
    $scope.item.WantRoom = true;

    $scope.update($scope.item, context);

    DiscussionsService.WantToCreateRoom($scope.item).then(function(data) {
      navigateToDetails($scope.item);
      if(data.roomName) {
        $window.open(window.config.rocketChat.uri + '/group/', data.roomName);
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
    $scope.update($scope.item, {
      name: 'status'
    })
  }

  $scope.onDateDue = function(item, type) {
    $scope.update(item, type);
  }

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item);
  }

  // ==================================================== Menu events ==================================================== //

  $scope.recycle = function() {
    EntityService.recycle('discussions', $scope.item._id).then(function() {
      let clonedEntity = JSON.parse(JSON.stringify($scope.item));
      clonedEntity.status = "Recycled"
      // just for activity status
      DiscussionsService.updateStatus(clonedEntity, $scope.item).then(function(result) {
        ActivitiesService.data.push(result);
      });

      refreshList();
      if (currentState.indexOf('search') != -1) {
        $state.go(currentState, {
          entity: context.entityName,
          entityId: context.entityId
        }, {
          reload: true,
          query: $stateParams.query
        });
      } else {
        $state.go('main.discussions.all', {
          entity: 'all'
        }, {
          reload: true
        });
      }
    });
  }

  $scope.recycleRestore = function() {
    EntityService.recycleRestore('discussions', $scope.item._id).then(function() {
      let clonedEntity = JSON.parse(JSON.stringify($scope.item));
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

  var activeTitleTimeout;
  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal && oVal) {
      if (activeTitleTimeout) {
        clearTimeout(activeTitleTimeout)
      }
      activeTitleTimeout = setTimeout(function() {
        $scope.update($scope.item, 'title')
      }, 2000);
    }
  });

  var activeDescriptionTimeout, nText, oText;
  $scope.$watch('item.description', function(nVal, oVal) {
    nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    if (nText != oText && oText) {
      if (activeDescriptionTimeout) {
        clearTimeout(activeDescriptionTimeout)
      }
      activeDescriptionTimeout = setTimeout(function() {
        $scope.update($scope.item, 'description')
      }, 2000);
    }
  });

  // ==================================================== update ==================================================== //

  $scope.update = function(discussion, type) {

    DiscussionsService.update(discussion);
    switch (type) {
    case 'startDue':
    case 'endDue':
      DiscussionsService.updateDue(discussion, backupEntity, type).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;

    case 'status':
      DiscussionsService.updateStatus(discussion, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;

    case 'location':
      DiscussionsService.updateLocation(discussion, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
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

      DiscussionsService.updateAssign(discussion, backupEntity).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
        ActivitiesService.data = ActivitiesService.data || [];
        ActivitiesService.data.push(result);
      });
      break;
    case 'title':
    case 'description':
      DiscussionsService.updateTitle(discussion, backupEntity, type).then(function(result) {
        backupEntity = JSON.parse(JSON.stringify($scope.item));
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
                    $state.go('main.discussions.byentity', {
                        entity: context.entityName,
                        entityId: context.entityId
                    }, {
                        reload: true
                    });
                }
            }

            DiscussionsService.updateAssign(item, $scope.me, backupEntity).then(function(res) {
                backupEntity = JSON.parse(JSON.stringify(result));
                ActivitiesService.data.push(res);
            });
        });

    };

  $scope.updateCurrentDiscussion = function() {
    DiscussionsService.currentDiscussionName = $scope.item.title;
  }

  $scope.delayedUpdate = _.debounce($scope.update, 500);

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
