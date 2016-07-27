'use strict';

angular.module('mean.icu.ui.tasklistdirective', [])
.directive('icuTaskList', function ($state, $uiViewScroll, $stateParams, $timeout, context, UsersService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, TasksService) {
        $scope.context = context;
        $scope.isLoading = true;

        _($scope.tasks).each(function(t) {
            t.__state = creatingStatuses.Created;
        });

            var newTask = {
            title: '',
            watchers: [],
            tags: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };

        if (!$scope.displayOnly) {
            if (context.entityName === 'my'){
                UsersService.getMe().then(function (me) {
                    newTask.assign = me._id;    
                    $scope.tasks.push(_(newTask).clone());
                });
            }
            else
                $scope.tasks.push(_(newTask).clone());
        }


        if (context.entityName === 'all') {
        	$scope.detailsState = 'main.tasks.all.details';
        } else if (context.entityName === 'my') {
        	$scope.detailsState = 'main.tasks.byassign.details';
        } else {
        	$scope.detailsState = 'main.tasks.byentity.details';
        }

        $scope.createOrUpdate = function(task) {
            if (context.entityName !== 'all') {
                task[context.entityName] = context.entity;
            }

            if (task.__state === creatingStatuses.NotCreated) {
                task.__state = creatingStatuses.Creating;

                return TasksService.create(task).then(function(result) {
                    task.__state = creatingStatuses.Created;

                    $scope.tasks.push(_(newTask).clone());

                    return task;
                });
            } else if (task.__state === creatingStatuses.Created) {
                return TasksService.update(task);
            }
        };
        $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

        $scope.searchResults = [];

        $scope.search = function(task) {
            if (context.entityName !== 'discussion') {
                return;
            }

            if (!task.__autocomplete) {
                return;
            }

            var term = task.title;
            if (!term) {
                return;
            }

            $scope.searchResults.length = 0;
            $scope.selectedSuggestion = 0;
            TasksService.search(term).then(function(searchResults) {
                _(searchResults).each(function(sr) {
                    var alreadyAdded = _($scope.tasks).any(function(t) {
                        return t._id === sr._id;
                    });

                    if (!alreadyAdded) {
                        $scope.searchResults.push(sr);
                    }
                });
                $scope.selectedSuggestion = 0;
            });
        };

        $scope.select = function(selectedTask) {
            var currentTask = _($scope.tasks).find(function(t) {
                return t.__autocomplete;
            });

            TasksService.remove(currentTask._id);

            _(currentTask).assign(selectedTask);
            currentTask.__autocomplete = false;

            $scope.searchResults.length = 0;
            $scope.selectedSuggestion = 0;

            $scope.createOrUpdate(currentTask).then(function(task) {
                $state.go('main.tasks.byentity.details', {
                    id: task._id,
                    entity: context.entityName,
                    entityId: context.entityId
                });
            });
        };

    }

    function link($scope, $element) {
        var isScrolled = false;

        $scope.initialize = function($event, task) {
            if ($scope.displayOnly) {
                return;
            }

            var nameFocused = angular.element($event.target).hasClass('name');

            if (task.__state === creatingStatuses.NotCreated) {
                $scope.createOrUpdate(task).then(function() {
                    $state.go($scope.detailsState, {
                        id: task._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                });
            } else {
                $state.go($scope.detailsState, {
                    id: task._id,
                    entity: context.entityName,
                    entityId: context.entityId,
                    nameFocused: nameFocused
                });
            }
        };

        $scope.isCurrentState = function (id) {
            var isActive = ($state.current.name.indexOf('main.tasks.byentity.details') === 0 ||
                            $state.current.name.indexOf('main.tasks.all.details') === 0
                       ) && $state.params.id === id;

            if (isActive && !isScrolled) {
                $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                isScrolled = true;
            }

            return isActive;
        };

        $scope.onEnter = function($event, index) {
            if ($event.keyCode === 13 || $event.keyCode === 9) {
                $event.preventDefault();

                $scope.tasks[index].__autocomplete = false;
                if ($element.find('td.name')[index+1]) {
                    // $element.find('td.name')[index+1].focus();
                }
                else {
                	$timeout(function() {
			            $element.find('td.name')[index+1].focus();
			        }, 500);
                }

            }
        };

        $scope.focusAutoComplete = function($event) {
            angular.element($event.target).css('box-shadow', 'none')
            if ($event.keyCode === 38) {
                if ($scope.selectedSuggestion > 0) {
                    $scope.selectedSuggestion -= 1;
                }
                $event.preventDefault();
            } else if ($event.keyCode === 40) {
                if ($scope.selectedSuggestion < $scope.searchResults.length - 1) {
                    $scope.selectedSuggestion += 1;
                }
                $event.preventDefault();
            } else if ($event.keyCode === 13) {
                var sr = $scope.searchResults[$scope.selectedSuggestion];
                $scope.select(sr);
            }


        };

        $scope.hideAutoComplete = function(task) {
            task.__autocomplete = false;
            $scope.searchResults.length = 0;
            $scope.selectedSuggestion = 0;
        };

        // infinite scroll
        $timeout(function() {
            $scope.displayLimit = Math.ceil($element.height() / 50);
            $scope.isLoading = false;
        }, 0);

        $scope.loadMore = function() {
            if (!$scope.isLoading && $scope.loadNext) {
                $scope.isLoading = true;
                $scope.loadNext().then(function(tasks) {
                    var offset = $scope.displayOnly ? 0 : 1;
                    
                    if (tasks.data.length) {                        
                        var index = $scope.tasks.length - offset;
                        var args = [index, 0].concat(tasks.data);

                        [].splice.apply($scope.tasks, args);
                    }

                    $scope.loadNext = tasks.next;
                    $scope.loadPrev = tasks.prev;
                    $scope.isLoading = false;
                });
            }
        };
    }

    

    return {
        restrict: 'A',
        templateUrl: '/icu/components/task-list-directive/task-list.directive.template.html',
        scope: {
            tasks: '=',
            loadNext: '=',
            loadPrev: '=',
            drawArrow: '=',
            groupTasks: '=',
            order: '=',
            displayOnly: '=',
            autocomplete: '='
        },
        link: link,
        controller: controller
    };
});
