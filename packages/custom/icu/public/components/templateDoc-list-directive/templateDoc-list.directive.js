'use strict';

angular.module('mean.icu.ui.templateDoclistdirective', [])
    .directive('icuTemplateDocList', function ($state, $uiViewScroll, $timeout, $stateParams, context, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, TemplateDocsService, orderService, dragularService, $element, $interval, $window) {

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

                    orderService.setOrder(e, elindex, dropindex, $scope.templateDocs.length - 1);
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

            _($scope.templateDocs).each(function(p) {
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

            var newTemplateDoc = {
                title: '',
                color: '0097A7',
                watchers: [],
                __state: creatingStatuses.NotCreated,
                __autocomplete: true
            };

            $scope.templateDocs.push(_(newTemplateDoc).clone());

            $scope.detailsState = context.entityName === 'all' ? 'main.templateDocs.all.details' : 'main.templateDocs.byentity.details';


            $scope.createOrUpdate = function(templateDoc) {

                if (context.entityName !== 'all') {
                    templateDoc[context.entityName] = context.entity;
                }

                if (templateDoc.__state === creatingStatuses.NotCreated) {
                    templateDoc.__state = creatingStatuses.Creating;

                    return TemplateDocsService.create(templateDoc).then(function(result) {
                        templateDoc.__state = creatingStatuses.Created;

                        $scope.templateDocs.push(_(newTemplateDoc).clone());

                        TemplateDocsService.data.push(templateDoc);

                        return templateDoc;
                    });
                } else if (templateDoc.__state === creatingStatuses.Created) {

                    if (!templateDoc.IsTitle)
                    {
                        templateDoc.PartTitle = templateDoc.PartTitle.split("...")[0] + templateDoc.title.substring(templateDoc.PartTitle.split("...")[0].length,templateDoc.title.length);
                        templateDoc.IsTitle = !templateDoc.IsTitle;
                    }
                    templateDoc.title = templateDoc.PartTitle;
                    var json = {
                        'name':'title',
                        'newVal':templateDoc.title
                    };
                    return TemplateDocsService.updateTemplateDoc(templateDoc._id,json);
                }
            };

            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

            $scope.searchResults = [];

            $scope.search = function(templateDoc) {
                if (context.entityName !== 'discussion') {
                    return;
                }

                if (!templateDoc.__autocomplete) {
                    return;
                }

                var term = templateDoc.title;
                if (!term) {
                    return;
                }

                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
                TemplateDocsService.search(term).then(function(searchResults) {
                    _(searchResults).each(function(sr) {
                        var alreadyAdded = _($scope.templateDocs).any(function(p) {
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
                var currentTemplateDoc = _($scope.templateDocs).findIndex(function(p) {
                    return p.id === $state.params.id;
                });

                $scope.createOrUpdate($scope.templateDocs[currentTemplateDoc + 1]).then(function(templateDoc) {
                    $state.go($scope.detailsState, {
                        id: templateDoc._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };
        }



        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function($event, templateDoc) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name') || angular.element($event.target).parent().hasClass('name');

                templateDoc.PartTitle = templateDoc.title;

                if (templateDoc.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(templateDoc).then(function() {
                        $state.go($scope.detailsState, {
                            id: templateDoc._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState+'.activities', {
                        id: templateDoc._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }
                LayoutService.clicked();
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.templateDocs.byentity.details') === 0 ||
                                $state.current.name.indexOf('main.templateDocs.all.details') === 0
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

                //     $scope.templateDocs[index].__autocomplete = false;

                //     if ($scope.templateDocs.length - 2 === index) {
                //         $element.find('td.name:nth-child(1)')[0].focus();
                //     }
                // }
                if ($event.keyCode === 13 || $event.keyCode === 9) {
                    $event.preventDefault();

                    $scope.templateDocs[index].__autocomplete = false;
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
                    $scope.loadNext().then(function(templateDocs) {

                        _(templateDocs.data).each(function(p) {
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

                        if (templateDocs.data.length) {
                            var index = $scope.templateDocs.length - offset;
                            var args = [index, 0].concat(templateDocs.data);

                            [].splice.apply($scope.templateDocs, args);
                        }

                        $scope.loadNext = templateDocs.next;
                        $scope.loadPrev = templateDocs.prev;
                        $scope.isLoading = false;
                    });
                }
            };
        }

        return {
            restrict: 'A',
            templateUrl: '/icu/components/templateDoc-list-directive/templateDoc-list.directive.template.html',
            scope: {
                loadNext: '=',
                loadPrev: '=',
                templateDocs: '=',
                drawArrow: '=',
                order: '=',
                displayOnly: '='
            },
            link: link,
            controller: controller
        };
    });
