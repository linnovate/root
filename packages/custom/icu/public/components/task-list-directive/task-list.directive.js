'use strict';

angular.module('mean.icu.ui.tasklistdirective', ['dragularModule'])
    .directive('icuTaskList', function ($state, $uiViewScroll, $stateParams, $timeout, context, UsersService, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        var newTask = {
            title: '',
            watchers: [],
            tags: [],
            __state: creatingStatuses.NotCreated,
            __autocomplete: true
        };

        function controller($scope, orderService, TasksService, dragularService, $element, $interval, $window) {
            $scope.currentTaskId = function (id) {
                $scope.taskId = id;
            };
            if(($scope.order != null) && ($scope.order.field == "custom")){
                var timer,
                    container = $('.containerVertical'), 
                    scroll = $('.list-table'),
                    box = $('middlepane-container'),
                    topBar = $('.filters'),
                    buttomBar = $('.bottomBar');

                dragularService.cleanEnviroment();

                dragularService(container, {
                    scope: $scope,
                    boundingBox: box,
                    lockY: true,
                    moves: function (el, container, handle) {
                        return handle.className === 'move';
                    }
                });

                $scope.$on('dragulardrag', function (e, el) {
                    e.stopPropagation();
                    $('tr').removeClass('active')
                    el.className = 'active';
                });

                $scope.$on('dragulardrop', function (e, el, targetcontainer, sourcecontainer, conmodel, elindex, targetmodel, dropindex) {
                    e.stopPropagation();
                     $state.go($scope.detailsState + '.activities', {
                         id: $scope.taskId,
                         entity: context.entityName,
                         entityId: context.entityId
                     }, { reload: false });
                    
                    orderService.setOrder(e, elindex, dropindex, $scope.tasks.length - 1);
                });

                // $scope.$on('dragularrelease', function (e, el) {
                //     e.stopPropagation();
                //     $state.go($scope.detailsState + '.activities', {
                //         id: $scope.taskId,
                //         entity: context.entityName,
                //         entityId: context.entityId
                //     }, { reload: false });
                // });

                registerEvents(topBar, scroll, -4);
                registerEvents(buttomBar, scroll, 4);

                function registerEvents(bar, container, inc, speed) {
                    if (!speed) {
                        speed = 20;
                    }
                    angular.element(bar).on('dragularenter', function () {
                        container[0].scrollTop += inc;
                        timer = $interval(function moveScroll() {
                            container[0].scrollTop += inc;
                        }, speed);
                    });
                    angular.element(bar).on('dragularleave dragularrelease', function () {
                        $interval.cancel(timer);
                    });
                }
        };
            $scope.context = context;
            $scope.isLoading = true;

            _($scope.tasks).each(function (t) {
                t.__state = creatingStatuses.Created;
                if (t.title.length > 20) {
                    t.PartTitle = t.title.substring(0, 20) + "...";
                }
                else {
                    t.PartTitle = t.title;
                }
                t.IsTitle = false;
            });

            if (!$scope.displayOnly) {
                if (context.entityName === 'my') {
                    UsersService.getMe().then(function (me) {
                        newTask.assign = me._id;
                        $scope.tasks.push(_(newTask).clone());
                    });
                } else {
                    delete newTask.assign;
                    if (context.entityName === 'task') {
                        // newTask.parent = context.entity._id;    
                        $scope.tasks.push(_(newTask).clone());
                    } else
                        $scope.tasks.push(_(newTask).clone());
                }
            }


            if (context.entityName === 'all') {
                $scope.detailsState = 'main.tasks.all.details';
            } else if (context.entityName === 'my') {
                $scope.detailsState = 'main.tasks.byassign.details';
            } else if (context.entityName === 'task') {
                $scope.detailsState = 'main.tasks.byparent.details';
            } else {
                $scope.detailsState = 'main.tasks.byentity.details';
            }

            $scope.createOrUpdate = function (task) {
                if (context.entityName !== 'all') {
                    task[context.entityName] = context.entity;
                }

                if (task.__state === creatingStatuses.NotCreated) {
                    task.__state = creatingStatuses.Creating;

                    return TasksService.create(task).then(function (result) {
                        task.__state = creatingStatuses.Created;

                        $scope.tasks.push(_(newTask).clone());

                        TasksService.data.push(task);

                        return task;
                    });
                } else if (task.__state === creatingStatuses.Created) {

                    if (!task.IsTitle) {
                        task.PartTitle = task.PartTitle.split("...")[0] + task.title.substring(task.PartTitle.split("...")[0].length, task.title.length);
                        task.IsTitle = !task.IsTitle;
                    }
                    task.title = task.PartTitle;

                    return TasksService.update(task);
                }
            };
            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 1);

            $scope.searchResults = [];

            $scope.search = function (task) {
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
                TasksService.search(term).then(function (searchResults) {
                    _(searchResults).each(function (sr) {
                        var alreadyAdded = _($scope.tasks).any(function (t) {
                            return t._id === sr._id;
                        });

                        if (!alreadyAdded) {
                            $scope.searchResults.push(sr);
                        }
                    });
                    $scope.selectedSuggestion = 0;
                });

            };

            $scope.select = function (selectedTask) {
                var currentTask = _($scope.tasks).findIndex(function (t) {
                    return t.id === $state.params.id;
                });

                // TasksService.remove(currentTask._id);

                // _(currentTask).assign(selectedTask);
                // currentTask.__autocomplete = false;

                // $scope.searchResults.length = 0;
                // $scope.selectedSuggestion = 0;

                $scope.createOrUpdate($scope.tasks[currentTask + 1]).then(function (task) {
                    $state.go($scope.detailsState, {
                        id: task._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };

        }

        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function ($event, task) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name');
                task.PartTitle = task.title;

                if (task.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(task).then(function () {
                        $state.go($scope.detailsState, {
                            id: task._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState + '.activities', {
                        id: task._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }

                LayoutService.clicked();
                
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.tasks.byparent.details') === 0 ||
                    $state.current.name.indexOf('main.tasks.byentity.details') === 0 ||
                    $state.current.name.indexOf('main.tasks.all.details') === 0
                ) && $state.params.id === id;

                if (isActive && !isScrolled) {
                    $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                    isScrolled = true;
                }

                return isActive;
            };

            $scope.onEnter = function ($event, index) {
                if ($event.keyCode === 13 || $event.keyCode === 9) {
                    $event.preventDefault();

                    $scope.tasks[index].__autocomplete = false;
                    if ($element.find('td.name')[index + 1]) {
                        $element.find('td.name')[index + 1].focus();
                    }
                    else {
                        $timeout(function () {
                            $element.find('td.name')[index + 1].focus();
                        }, 500);
                    }

                }
            };

            $scope.focusAutoComplete = function ($event) {
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
                } else if ($event.keyCode === 13 || $event.keyCode === 9) {
                    var sr = $scope.searchResults[$scope.selectedSuggestion];
                    $scope.select(sr);
                }


            };

            $scope.hideAutoComplete = function (task) {

                if (task.title.length > 20) {
                    task.PartTitle = task.title.substring(0, 20) + "...";
                }

                task.__autocomplete = false;
                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
            };

            // infinite scroll
            $timeout(function () {
                $scope.displayLimit = Math.ceil($element.height() / 50);
                $scope.isLoading = false;
            }, 0);

            $scope.loadMore = function () {
                if (!$scope.isLoading && $scope.loadNext) {
                    $scope.isLoading = true;
                    $scope.loadNext().then(function (tasks) {

                     _(tasks.data).each(function(t) {
                        t.__state = creatingStatuses.Created;
                        t.PartTitle = t.title;
                        if (t.title.length > 20)
                        {
                            t.PartTitle = t.title.substring(0,20) + "...";
                        }
                        else
                        {
                            t.PartTitle = t.title;
                        }
                        t.IsTitle = false;
                        });

                        var offset = $scope.displayOnly ? 0 : 1;

                        if (tasks.data.length) {
                            var index = $scope.tasks.length - offset;
                            $scope.tasks.pop();
                            var args = [index, 0].concat(tasks.data);
                            [].splice.apply($scope.tasks, args);
                            $scope.tasks.push(_(newTask).clone());
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
