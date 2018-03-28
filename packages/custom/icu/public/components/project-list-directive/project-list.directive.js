'use strict';

angular.module('mean.icu.ui.projectlistdirective', [])
    .directive('icuProjectList', function ($state, $uiViewScroll, $timeout, $stateParams, context, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, ProjectsService, orderService, dragularService, $element, $interval, $window,EntityService) {
            $scope.currentTaskId = function (id) {
                $scope.taskId = id;
            };
            if($scope.order.field == "custom"){
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

                    orderService.setOrder(e, elindex, dropindex, $scope.projects.length - 1);
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

            _($scope.projects).each(function(p) {
                p.__state = creatingStatuses.Created;
                if (p.title.length > 20)
                {
                    p.PartTitle = p.title.substring(0,20) + "...";
                }
                else
                {
                    p.PartTitle = p.title;
                }
                p.IsTitle = false;
            });

            var newProject = {
                title: '',
                color: '0097A7',
                watchers: [],
                __state: creatingStatuses.NotCreated,
                __autocomplete: true
            };

            $scope.projects.push(_(newProject).clone());

            $scope.detailsState = context.entityName === 'all' ? 'main.projects.all.details' : 'main.projects.byentity.details';

            $scope.createOrUpdate = function(project) {

                if (context.entityName !== 'all') {
                    project[context.entityName] = context.entity;
                }

                if (project.__state === creatingStatuses.NotCreated) {
                    project.__state = creatingStatuses.Creating;

                    return ProjectsService.create(project).then(function(result) {
                        project.__state = creatingStatuses.Created;

                        $scope.projects.push(_(newProject).clone());

                        ProjectsService.data.push(project);

                        return project;
                    });
                } else if (project.__state === creatingStatuses.Created) {

                    if (!project.IsTitle)
                    {
                        project.PartTitle = project.PartTitle.split("...")[0] + project.title.substring(project.PartTitle.split("...")[0].length,project.title.length);
                        project.IsTitle = !project.IsTitle;
                    }
                    project.title = project.PartTitle;
                    return ProjectsService.update(project);
                }
            };

            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

            $scope.searchResults = [];

            $scope.search = function(project) {
                if (context.entityName !== 'discussion') {
                    return;
                }

                if (!project.__autocomplete) {
                    return;
                }

                var term = project.title;
                if (!term) {
                    return;
                }

                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
                ProjectsService.search(term).then(function(searchResults) {
                    _(searchResults).each(function(sr) {
                        var alreadyAdded = _($scope.projects).any(function(p) {
                            return p._id === sr._id;
                        });

                        if (!alreadyAdded) {
                            $scope.searchResults.push(sr);
                        }
                    });
                    $scope.selectedSuggestion = 0;
                });
            };

            $scope.select = function(selectedTask) {
                var currentProject = _($scope.projects).findIndex(function(p) {
                    return p.id === $state.params.id;
                });

                $scope.createOrUpdate($scope.projects[currentProject + 1]).then(function(project) {
                    $state.go($scope.detailsState, {
                        id: project._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };
        }



        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function($event, project) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name');

                project.PartTitle = project.title;

                if (project.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(project).then(function() {
                        $state.go($scope.detailsState, {
                            id: project._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState+'.activities', {
                        id: project._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }
                LayoutService.clicked();
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.projects.byentity.details') === 0 ||
                                $state.current.name.indexOf('main.projects.all.details') === 0
                           ) && $state.params.id === id;


                if (isActive && !isScrolled) {
                    $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                    isScrolled = true;
                }

                return isActive;
            };

            $scope.onEnter = function($event, index) {
                // if ($event.keyCode === 13) {
                //     $event.preventDefault();

                //     $scope.projects[index].__autocomplete = false;

                //     if ($scope.projects.length - 2 === index) {
                //         $element.find('td.name:nth-child(1)')[0].focus();
                //     }
                // }
                if ($event.keyCode === 13 || $event.keyCode === 9) {
                    $event.preventDefault();

                    $scope.projects[index].__autocomplete = false;
                    if ($element.find('td.name')[index+1]) {
                        $element.find('td.name')[index+1].focus();
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

                if (task.title.length > 20)
                {
                    task.PartTitle = task.title.substring(0,20) + "...";
                }

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
                    $scope.loadNext().then(function(projects) {

                        _(projects.data).each(function(p) {
                            p.__state = creatingStatuses.Created;
                            p.PartTitle = p.title;
                            if (p.title.length > 20)
                            {
                                p.PartTitle = p.title.substring(0,20) + "...";
                            }
                            else
                            {
                                p.PartTitle = p.title;
                            }
                            p.IsTitle = false;
                        });

                        var offset = $scope.displayOnly ? 0 : 1;

                        if (projects.data.length) {
                            var index = $scope.projects.length - offset;
                            var args = [index, 0].concat(projects.data);

                            [].splice.apply($scope.projects, args);
                        }

                        $scope.loadNext = projects.next;
                        $scope.loadPrev = projects.prev;
                        $scope.isLoading = false;
                    });
                }
            };
        }

        return {
            restrict: 'A',
            templateUrl: '/icu/components/project-list-directive/project-list.directive.template.html',
            scope: {
                loadNext: '=',
                loadPrev: '=',
                projects: '=',
                drawArrow: '=',
                order: '=',
                displayOnly: '=',
                groupProjects: '='
            },
            link: link,
            controller: controller
        };
    });
