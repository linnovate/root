'use strict';

angular.module('mean.icu.ui.officelistdirective', [])
    .directive('icuOfficeList', function ($state, $uiViewScroll, $timeout, $stateParams, context, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, OfficesService, orderService, dragularService, $element, $interval, $window) {

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

                    orderService.setOrder(e, elindex, dropindex, $scope.offices.length - 1);
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

            _($scope.offices).each(function(p) {
                p.__state = creatingStatuses.Created;
                p.PartTitle = p.title;
            });

            var newOffice = {
                title: '',
                color: '0097A7',
                watchers: [],
                __state: creatingStatuses.NotCreated,
                __autocomplete: true
            };

            $scope.offices.push(_(newOffice).clone());

            $scope.detailsState = context.entityName === 'all' ? 'main.offices.all.details' : 'main.offices.byentity.details';

            $scope.createOrUpdate = function(office) {

                if (context.entityName !== 'all') {
                    office[context.entityName] = context.entity;
                }

                if (office.__state === creatingStatuses.NotCreated) {
                    office.__state = creatingStatuses.Creating;

                    return OfficesService.create(office).then(function(result) {
                        office.__state = creatingStatuses.Created;

                        $scope.offices.push(_(newOffice).clone());

                        OfficesService.data.push(office);

                        return office;
                    });
                } else if (office.__state === creatingStatuses.Created) {

                    office.title = office.PartTitle;
                    return OfficesService.update(office);
                }
            };

            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

            $scope.searchResults = [];

            $scope.search = function(office) {
                if (context.entityName !== 'discussion') {
                    return;
                }

                if (!office.__autocomplete) {
                    return;
                }

                var term = office.title;
                if (!term) {
                    return;
                }

                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
                OfficesService.search(term).then(function(searchResults) {
                    _(searchResults).each(function(sr) {
                        var alreadyAdded = _($scope.offices).any(function(p) {
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
                var currentOffice = _($scope.offices).findIndex(function(p) {
                    return p.id === $state.params.id;
                });

                $scope.createOrUpdate($scope.offices[currentOffice + 1]).then(function(office) {
                    $state.go($scope.detailsState, {
                        id: office._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };
        }



        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function($event, office) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name') || angular.element($event.target).parent().hasClass('name');

                office.PartTitle = office.title;

                if (office.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(office).then(function() {
                        $state.go($scope.detailsState, {
                            id: office._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState+'.activities', {
                        id: office._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }
                LayoutService.clicked();
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.offices.byentity.details') === 0 ||
                                $state.current.name.indexOf('main.offices.all.details') === 0
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

                //     $scope.offices[index].__autocomplete = false;

                //     if ($scope.offices.length - 2 === index) {
                //         $element.find('td.name:nth-child(1)')[0].focus();
                //     }
                // }
                if ($event.keyCode === 13 || $event.keyCode === 9) {
                    $event.preventDefault();

                    $scope.offices[index].__autocomplete = false;
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

                task.PartTitle = task.title

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
                    $scope.loadNext().then(function(offices) {

                        _(offices.data).each(function(p) {
                            p.__state = creatingStatuses.Created;
                            p.PartTitle = p.title;
                        });

                        var offset = $scope.displayOnly ? 0 : 1;

                        if (offices.data.length) {
                            var index = $scope.offices.length - offset;
                            var args = [index, 0].concat(offices.data);

                            [].splice.apply($scope.offices, args);
                        }

                        $scope.loadNext = offices.next;
                        $scope.loadPrev = offices.prev;
                        $scope.isLoading = false;
                    });
                }
            };
        }

        return {
            restrict: 'A',
            templateUrl: '/icu/components/office-list-directive/office-list.directive.template.html',
            scope: {
                loadNext: '=',
                loadPrev: '=',
                offices: '=',
                drawArrow: '=',
                order: '=',
                displayOnly: '='
            },
            link: link,
            controller: controller
        };
    });
