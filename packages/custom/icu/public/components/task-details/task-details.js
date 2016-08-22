'use strict';

angular.module('mean.icu.ui.taskdetails', [])
.controller('TaskDetailsController', function ($scope,
                                               entity,
                                               tags,
                                               projects,
                                               $state,
                                               TasksService,
                                               ActivitiesService,
                                               context,
                                               $stateParams,
                                               $rootScope,
                                               MeanSocket,
                                               UsersService,
                                               people,
                                               $timeout,
                                               subtasks) {
    $scope.task = entity || context.entity;
    $scope.task.subtasks = subtasks;
     /*test for sub-task*/
    $scope.addSubTasks = false;
    $scope.test = [];
    $scope.test.push($scope.task)
/*     $scope.test.push($scope.task)
*/    /*end test for sub-task*/
    $scope.tags = tags;
    $scope.projects = projects.data || projects;
    $scope.shouldAutofocus = !$stateParams.nameFocused;
    
    TasksService.getStarred().then(function(starred) {
        $scope.task.star = _(starred).any(function(s) {
            return s._id === $scope.task._id;
        });
    });

    $scope.people = people.data || people;
    if($scope.people[Object.keys($scope.people).length-1].name !== 'no select'){
        var newPeople = {
            name: 'no select'
        };

        $scope.people.push(_(newPeople).clone());
    }


    if (!$scope.task) {
        $state.go('main.tasks.byentity', {
            entity: context.entityName,
            entityId: context.entityId
        });
    }

    $scope.tagInputVisible = false;

    $scope.statuses = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'];
    $rootScope.$broadcast('updateNotification', { taskId: $stateParams.id });

    $scope.getUnusedTags = function () {
        return _.chain($scope.tags).reject(function (t) {
            return $scope.task.tags.indexOf(t.term) >= 0;
        }).sortBy(function (a, b) {
            return b.count - a.count;
        }).pluck('term').value();
    };

    $scope.$watchGroup(['task.description', 'task.title'], function (nVal, oVal) {
        if (nVal !== oVal && oVal) {
            $scope.delayedUpdate($scope.task);
        }
    });

    $scope.addTag = function (tag) {
        $scope.task.tags.push(tag);
        $scope.update($scope.task);
        $scope.tagInputVisible = false;
    };

    $scope.removeTag = function (tag) {
        $scope.task.tags = _($scope.task.tags).without(tag);
        $scope.update($scope.task);
    };

    $scope.options = {
        theme: 'bootstrap',
        buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
    };

    if ($scope.task.due) $scope.task.due = new Date($scope.task.due);
    
    $scope.dueOptions = {
        onSelect: function () {
            var now = $scope.task.due; 
            $scope.task.due = new Date(now.getTime() + now.getTimezoneOffset() * 60000);
            $scope.update($scope.task);
        },
        dateFormat: 'd.m.yy'
    };

    function navigateToDetails(task) {
        $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

        $state.reload('main.tasks');
    }

    $scope.star = function (task) {
        TasksService.star(task).then(function () {
            navigateToDetails(task);
        });
    };

    $scope.unsetProject = function (event, task) {
        event.stopPropagation();
        delete task.project;
        $scope.update(task);
    };

    $scope.deleteTask = function (task) {
        TasksService.remove(task._id).then(function () {
            var state = context.entityName === 'all' ?
                'main.tasks.all' : context.entityName === 'my' ? 'main.tasks.byassign' : 'main.tasks.byentity';

            $state.go(state, {
                entity: context.entityName,
                entityId: context.entityId
            }, {reload: true});
        });
    };
    
    //Made By OHAD
    $scope.updateAndNotiy = function (task) {
        if (context.entityName === 'discussion') {
            task.discussion = context.entityId;
        }
        
        if (task.assign === undefined  || task.assign === null) {
            delete task['assign'];
        }
        UsersService.getMe().then(function (me) {
            
            var message = {};
            message.content = task.title;
            //"message":{"content":"tyui"}
            MeanSocket.emit('message:send', {
                message: message,
                user: me.name,
                channel: task.assign,
                id: task.id
            });

            TasksService.update(task).then(function (result) {
                if (context.entityName === 'project') {
                    var projId = result.project ? result.project._id : undefined;
                    if (projId !== context.entityId) {
                        $state.go('main.tasks.byentity', {
                            entity: context.entityName,
                            entityId: context.entityId
                        }, {reload: true});
                    }
                }
            });
        
        });
        ActivitiesService.create({
            data: {
                issue: 'task',
                issueId: task.id,
                type: 'assign',
                userObj: task.assign
            },
            context: {}
        }).then(function(result) {
            ActivitiesService.data.push(result);
        });

    };
    //END Made By OHAD

    $scope.update = function (task, type) {
        if (context.entityName === 'discussion') {
            task.discussion = context.entityId;
        }

        TasksService.update(task).then(function (result) {
            if (context.entityName === 'project') {
                var projId = result.project ? result.project._id : undefined;
                if (projId !== context.entityId || type === 'project') {
                    $state.go('main.tasks.byentity.details', {
                        entity: context.entityName,
                        entityId: context.entityId,
                        id: task._id
                    }, {reload: true});
                }
            }
        });
    };

    $scope.setFocusToTagSelect = function() {
    	var element = angular.element('#addTag > input.ui-select-focusser')[0];
    	$timeout(function () {
    		element.focus();
    	}, 0);
    }

    $scope.delayedUpdate = _.debounce($scope.update, 500);

    // if ($scope.task &&
    //         ($state.current.name === 'main.tasks.byentity.details' ||
    //         $state.current.name === 'main.search.task' ||
    //         $state.current.name === 'main.tasks.all.details' ||
    //         $state.current.name === 'main.tasks.byassign.details')) {
    //     $state.go('.subtasks');
    // }

    if ($scope.task &&
            ($state.current.name === 'main.tasks.byentity.details' ||
            $state.current.name === 'main.search.task' ||
            $state.current.name === 'main.tasks.all.details' ||
            $state.current.name === 'main.tasks.byassign.details')) {
        $state.go('.activities');
    }
})
.directive('selectOnBlur', function($timeout) {
    return {
        require: 'uiSelect',
        link: function(scope, elm, attrs, ctrl) {
            elm.on('blur', 'input.ui-select-search', function(e) {
                scope.$parent.tagInputVisible = false;
            });

            elm.on('blur', 'input.ui-select-focusser', function(e, g) {
            	$timeout(function () {
		    		if(!e.target.hasAttribute('disabled')) {
						scope.$parent.tagInputVisible = false;
		    		}
		    	}, 5);
            });

        }
    };
})
.filter('searchfilter', function() {
    return function (input, query) {
        var r = RegExp('('+ query + ')', 'g');
        return input.replace(r, '<span class="super-class">$1</span>');
    }
});