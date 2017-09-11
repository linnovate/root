'use strict';

angular.module('mean.icu.ui.folderlistdirective', [])
    .directive('icuFolderList', function ($state, $uiViewScroll, $timeout, $stateParams, context, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, FoldersService, orderService, dragularService, $element, $interval, $window) {

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
                    
                    orderService.setOrder(e, elindex, dropindex, $scope.folders.length - 1);
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

            _($scope.folders).each(function(p) {
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

            var newFolder = {
                title: '',
                color: '0097A7',
                watchers: [],
                __state: creatingStatuses.NotCreated,
                __autocomplete: true
            };

            $scope.folders.push(_(newFolder).clone());

            $scope.detailsState = context.entityName === 'all' ? 'main.folders.all.details' : 'main.folders.byentity.details';

            $scope.createOrUpdate = function(folder) {

                if (context.entityName !== 'all') {
                    folder[context.entityName] = context.entity;
                }

                if (folder.__state === creatingStatuses.NotCreated) {
                    folder.__state = creatingStatuses.Creating;

                    return FoldersService.create(folder).then(function(result) {
                        folder.__state = creatingStatuses.Created;

                        $scope.folders.push(_(newFolder).clone());

                        FoldersService.data.push(folder);

                        return folder;
                    });
                } else if (folder.__state === creatingStatuses.Created) {

                    if (!folder.IsTitle)
                    {
                        folder.PartTitle = folder.PartTitle.split("...")[0] + folder.title.substring(folder.PartTitle.split("...")[0].length,folder.title.length);
                        folder.IsTitle = !folder.IsTitle;
                    }
                    folder.title = folder.PartTitle;
                    return FoldersService.update(folder);
                }
            };

            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

            $scope.searchResults = [];

            $scope.search = function(folder) {
                if (context.entityName !== 'discussion') {
                    return;
                }

                if (!folder.__autocomplete) {
                    return;
                }

                var term = folder.title;
                if (!term) {
                    return;
                }

                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
                FoldersService.search(term).then(function(searchResults) {
                    _(searchResults).each(function(sr) {
                        var alreadyAdded = _($scope.folders).any(function(p) {
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
                var currentFolder = _($scope.folders).findIndex(function(p) {
                    return p.id === $state.params.id;
                });

                $scope.createOrUpdate($scope.folders[currentFolder + 1]).then(function(folder) {
                    $state.go($scope.detailsState, {
                        id: folder._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };
        }



        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function($event, folder) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name');

                folder.PartTitle = folder.title;

                if (folder.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(folder).then(function() {
                        $state.go($scope.detailsState, {
                            id: folder._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState+'.activities', {
                        id: folder._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }
                LayoutService.clicked();
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.folders.byentity.details') === 0 ||
                                $state.current.name.indexOf('main.folders.all.details') === 0
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

                //     $scope.folders[index].__autocomplete = false;

                //     if ($scope.folders.length - 2 === index) {
                //         $element.find('td.name:nth-child(1)')[0].focus();
                //     }
                // }
                if ($event.keyCode === 13 || $event.keyCode === 9) {
                    $event.preventDefault();

                    $scope.folders[index].__autocomplete = false;
                    if ($element.find('td.name')[index+1]) {
                        console.log('find');
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
                    $scope.loadNext().then(function(folders) {

                        _(folders.data).each(function(p) {
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

                        if (folders.data.length) {
                            var index = $scope.folders.length - offset;
                            var args = [index, 0].concat(folders.data);

                            [].splice.apply($scope.folders, args);
                        }

                        $scope.loadNext = folders.next;
                        $scope.loadPrev = folders.prev;
                        $scope.isLoading = false;
                    });
                }
            };
        }

        return {
            restrict: 'A',
            templateUrl: '/icu/components/folder-list-directive/folder-list.directive.template.html',
            scope: {
                loadNext: '=',
                loadPrev: '=',
                folders: '=',
                drawArrow: '=',
                order: '=',
                displayOnly: '='
            },
            link: link,
            controller: controller
        };
    });
