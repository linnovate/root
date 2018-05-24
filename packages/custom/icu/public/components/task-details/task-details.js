'use strict';

angular.module('mean.icu.ui.taskdetails', []).controller('TaskDetailsController', TaskDetailsController);

function TaskDetailsController($scope, entity, tags, projects, $state, TasksService, ActivitiesService, PermissionsService, context, $stateParams, $rootScope, people, $timeout, ProjectsService, EntityService, me) {

  // ==================================================== init ==================================================== //

  $scope.item = entity || context.entity;
  $scope.entity = entity || context.entity;

  if (!$scope.item) {
    $state.go('main.tasks.byentity', {
      entity: context.entityName,
      entityId: context.entityId
    });
  } else if ($scope.item && ($state.current.name === 'main.tasks.byentity.details' || $state.current.name === 'main.search.task' || $state.current.name === 'main.tasks.all.details' || $state.current.name === 'main.tasks.byassign.details')) {
    $state.go('.activities');
  }

  $scope.editorOptions = {
    theme: 'bootstrap',
    buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
  };
  $scope.statuses = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'];

  $scope.me = me;
  $scope.tags = tags;
  $scope.projects = projects.data || projects;

  var currentState = $state.current.name;

  // backup for previous changes - for updates
  var backupEntity = JSON.parse(JSON.stringify($scope.item));

  $scope.people = people.data || people;
  if ($scope.people.length && $scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
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

  $rootScope.$broadcast('updateNotification', {
    taskId: $stateParams.id
  });

  if ($scope.item._id) {
    TasksService.getStarred().then(function(starred) {
      $scope.item.star = _(starred).any(function(s) {
        return s._id === $scope.item._id;
      });
    });

    TasksService.getTemplate().then(function(template) {
      $scope.template = template;
    });
  }

  // ==================================================== onChanges ==================================================== //

  function navigateToDetails() {
    $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';
    $state.reload('main.tasks');
  }

  $scope.onStar = function(value) {
    TasksService.star($scope.item).then(function() {
      navigateToDetails($scope.item);
      // "$scope.item.star" will be change in 'ProjectsService.star' function
    });
  }

  $scope.onAssign = function(value) {
    $scope.item.assign = value;
    $scope.updateAndNotify($scope.item);
  }

  $scope.onDateDue = function(value) {
    $scope.item.due = value;
    if (context.entityName === 'discussion') {
      $scope.item.discussion = context.entityId;
    }

    TasksService.updateDue($scope.item, backupEntity).then(function(result) {
      backupEntity = JSON.parse(JSON.stringify($scope.item));
      ActivitiesService.data.push(result);
    });

    TasksService.update($scope.item).then(function(result) {
      if (context.entityName === 'project') {
        var projId = result.project ? result.project._id : undefined;
        if (projId !== context.entityId) {
          $state.go('main.tasks.byentity', {
            entity: context.entityName,
            entityId: context.entityId
          }, {
            reload: true
          });
        }
      }
    });
  }

  $scope.onStatus = function(value) {
    $scope.item.status = value;

    if (context.entityName === 'discussion') {
      $scope.item.discussion = context.entityId;
    }

    TasksService.updateStatus($scope.item, backupEntity).then(function(result) {
      backupEntity = JSON.parse(JSON.stringify($scope.item));
      ActivitiesService.data.push(result);
    });

    TasksService.update($scope.item).then(function(result) {
      refreshList();
    });
  }

  $scope.onTags = function(value) {
    $scope.item.tags = value;
    $scope.update($scope.item);
  }

  // ==================================================== Menu events ==================================================== //

  $scope.recycle = function() {
    TasksService.removeFromParent($scope.item).then(()=>{
      EntityService.recycle('tasks', $scope.item._id).then(function() {
        let clonedEntity = JSON.parse(JSON.stringify($scope.item));
        clonedEntity.status = "deleted";
        // just for activity status
        TasksService.updateStatus(clonedEntity, $scope.item).then(function(result) {
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
          var state = context.entityName === 'all' ? 'main.tasks.all' : context.entityName === 'my' ? 'main.tasks.byassign' : 'main.tasks.byentity';
          $state.go(state, {
            entity: context.entityName,
            entityId: context.entityId
          }, {
            reload: true
          });
        }
      });
    }
    )
  }

  $scope.recycleRestore = function(entity) {
    TasksService.addToParent(entity).then(()=>{
      EntityService.recycleRestore('tasks', entity._id).then(function() {
        let clonedEntity = JSON.parse(JSON.stringify(entity));
        clonedEntity.status = "un-deleted";
        // just for activity status
        TasksService.updateStatus(clonedEntity, entity).then(function(result) {
          ActivitiesService.data.push(result);
        });

        refreshList();

        var state = currentState.indexOf('search') !== -1 ? $state.current.name : context.entityName === 'all' ? 'main.tasks.all' : context.entityName === 'my' ? 'main.tasks.byassign' : 'main.tasks.byentity';
        $state.go(state, {
          entity: context.entityName,
          entityId: context.entityId
        }, {
          reload: true
        });
      });
    }
    )
  }

  $scope.menuItems = [{
    label: 'recycleTask',
    icon: 'times-circle',
    display: !$scope.item.hasOwnProperty('recycled'),
    action: $scope.recycle,
  }, {
    label: 'unrecycleTask',
    icon: 'times-circle',
    display: $scope.item.hasOwnProperty('recycled'),
    action: $scope.recycleRestore,
  }];

  // ==================================================== Buttons ==================================================== //

  $scope.updateStatusForApproval = function() {
    $scope.onStatus("waiting-approval");
  }

  // ==================================================== Category ==================================================== //

  $scope.onCategory = function(value) {
    $scope.item.project = value;
    $scope.update($scope.item, 'project');
  }
  
  $scope.newCategory = function(value) {
    var project = {
      color: '0097A7',
      title: value,
      watchers: [],
    };
    return ProjectsService.create(project).then(function(result) {
      $scope.projects.push(result);
      return result;
    });

  }

  // ==================================================== Template ==================================================== //

  $scope.saveTemplate = function(newTemplate) {
    return TasksService.saveTemplate($stateParams.id, newTemplate)
  }

  $scope.deleteTemplate = function(id) {
    return TasksService.deleteTemplate(id)
  }

  $scope.implementTemplate = function(id) {
    return TasksService.template2subTasks(id, {
      'taskId': $stateParams.id
    }).then(function(result) {
      for (var i = result.length - 1; i >= 0; i--) {
        result[i].isNew = true;
      }
      $timeout(function() {
        for (var i = result.length - 1; i >= 0; i--) {
          result[i].isNew = false;
        }
      }, 5000);
      var tmp = $scope.item.subTasks.pop()
      $scope.item.subTasks = $scope.item.subTasks.concat(result);
      $scope.item.subTasks.push(tmp);
    });
  }

  // ==================================================== $watch: title / desc ==================================================== //

  $scope.$watch('item.title', function(nVal, oVal) {
    if (nVal !== oVal && oVal) {
      $scope.delayedUpdate($scope.item, 'title');
    }
  });

  var nText, oText;
  $scope.$watch('item.description', function(nVal, oVal) {
    nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
    if (nText != oText && oText) {
      $scope.delayedUpdate($scope.item, 'description');
    }
  });

  function refreshList() {
    $rootScope.$broadcast('refreshList');
  }

  var refreshView = function() {
    var state = context.entityName === 'all' ? 'main.tasks.all' : context.entityName === 'my' ? 'main.tasks.byassign' : 'main.tasks.byentity';
    TasksService.getWatchedTasks().then(function(result) {
      TasksService.watchedTasksArray = result;
      $state.go(state, {
        entity: context.entityName,
        entityId: context.entityId
      }, {
        reload: true
      });

    });
  }

  // ==================================================== Update  ==================================================== //

  //Made By OHAD
  $scope.updateAndNotify = function(item) {
    item.status = $scope.statuses[1];
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

    TasksService.update(item).then(function(result) {
      if (context.entityName === 'project') {
        var projId = result.project ? result.project._id : undefined;
        if (projId !== context.entityId) {
          $state.go('main.tasks.byentity', {
            entity: context.entityName,
            entityId: context.entityId
          }, {
            reload: true
          });
        }
      }

      TasksService.assign(item, me, backupEntity).then(function(res) {
        backupEntity = JSON.parse(JSON.stringify(result));
        ActivitiesService.data.push(res);
      });
    });

  }

  $scope.update = function(item, type, proj) {
    if (proj && proj !== '') {
      $scope.createProject(proj, function(result) {
        item.project = result;
        TasksService.update(item).then(function(result) {
          TasksService.updateEntity(item, backupEntity).then(function(result) {
            backupEntity = JSON.parse(JSON.stringify($scope.item));
            ActivitiesService.data.push(result);
          });

          if (context.entityName === 'project') {
            var projId = result.project ? result.project._id : undefined;
            if (projId !== context.entityId || type === 'project') {
              $state.go('main.tasks.byentity.details', {
                entity: context.entityName,
                entityId: projId,
                id: item._id
              }, {
                reload: true
              });
            }
          }
        });
      });
    }
    if (context.entityName === 'discussion') {
      item.discussion = context.entityId;
    }
    TasksService.update(item).then(function(result) {
      if (type === 'project') {
        TasksService.updateEntity(item, backupEntity).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data.push(result);
        });
      }
      var isSearchState = currentState.indexOf('search') != -1;
      if (context.entityName === 'project' && !isSearchState) {
        var projId = result.project ? result.project._id : undefined;
        if (!projId) {
          $state.go('main.tasks.all.details', {
            entity: 'task',
            id: item._id
          }, {
            reload: true
          });
        } else if (!isSearchState) {
          if (projId !== context.entityId || type === 'project') {
            $state.go('main.tasks.byentity.details', {
              entity: context.entityName,
              entityId: projId,
              id: item._id
            }, {
              reload: true
            });
          }
        }
      }
      if (type === 'title' || type === 'description') {
        TasksService.updateTitle(item, backupEntity, type).then(function(result) {
          backupEntity = JSON.parse(JSON.stringify($scope.item));
          ActivitiesService.data = ActivitiesService.data || [];
          ActivitiesService.data.push(result);
          refreshList();
        });
      }
    });
  }

  $scope.delayedUpdate = _.debounce($scope.update, 2000);

  // ==================================================== havePermissions ==================================================== //

  $scope.enableRecycled = true;
  $scope.isRecycled = $scope.item.hasOwnProperty('recycled');

  $scope.havePermissions = function(type, enableRecycled) {
    enableRecycled = enableRecycled || !$scope.isRecycled;
    return (PermissionsService.havePermissions(entity, type) && enableRecycled);
  }

  $scope.haveEditiorsPermissions = function() {
    return PermissionsService.haveEditorsPerms($scope.entity);
  }

  $scope.permsToSee = function() {
    return PermissionsService.haveAnyPerms($scope.entity);
  }

}
