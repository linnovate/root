'use strict';

angular.module('mean.icu.ui.officedocumentlistdirective', [])
    .directive('icuOfficeDocumentList', function ($state, $uiViewScroll, OfficeDocumentsService,$timeout, $stateParams, context, LayoutService,EntityService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, OfficeDocumentsService, FoldersService, orderService, dragularService, $element, $interval, $window) {
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

                    orderService.setOrder(e, elindex, dropindex, $scope.officeDocuments.length - 1);
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
        var sortFilter = EntityService.getSortFilterValue();
        $scope.order1 = {"field":sortFilter.field,"order":sortFilter.order};
        $scope.order1.order = $scope.order1.order==1?false:true;

        _($scope.officeDocuments).each(function (p) {
            p.__state = creatingStatuses.Created;
            if (p.title.length > 20) {
                p.PartTitle = p.title.substring(0, 20) + "...";
            } else {
                p.PartTitle = p.title;
            }
            p.IsTitle = false;
        });

            var newOfficeDocument = {
                title: '',
                color: '0097A7',
                watchers: [],
                __state: creatingStatuses.NotCreated,
                __autocomplete: true
            };

            $scope.officeDocuments.push(_(newOfficeDocument).clone());

            $scope.detailsState = context.entityName === 'all' ? 'main.officeDocuments.all.details' : 'main.officeDocuments.byentity.details';

            $scope.createOrUpdate = function(officeDocument) {

                if (context.entityName !== 'all') {
                    officeDocument[context.entityName] = context.entity;
                }

            //    if (officeDocument.__state === creatingStatuses.NotCreated) {
            //        officeDocument.__state = creatingStatuses.Creating;

            //     return OfficeDocumentsService.create(officeDocument).then(function(result) {
            //         officeDocument.__state = creatingStatuses.Created;

            //         $scope.officeDocuments.push(_(newOfficeDocument).clone());

            //         OfficeDocumentsService.data.push(officeDocument);

            //         return officeDocument;
            //     });
            // } else
            //
            if (officeDocument.__state === creatingStatuses.Created) {

                if (!officeDocument.IsTitle) {
                    officeDocument.PartTitle = officeDocument.PartTitle.split("...")[0] + officeDocument.title.substring(officeDocument.PartTitle.split("...")[0].length, officeDocument.title.length);
                    officeDocument.IsTitle = !officeDocument.IsTitle;
                }
                officeDocument.title = officeDocument.PartTitle;
                return OfficeDocumentsService.update(officeDocument);
            }
        };

            $scope.debouncedUpdate = _.debounce($scope.createOrUpdate, 300);

            $scope.searchResults = [];



            $scope.create = function(){
                var data = {};
                if($stateParams.entity=='folder'){
                    data['folder']=$stateParams.entityId;
                }

                OfficeDocumentsService.createDocument(data).then(function(result){
                    result.created=new Date(result.created);
                    $scope.officeDocuments.push(result);
                    if(localStorage.getItem('type') == 'new'){
                        if(context.entityName=='folder'){
                            $scope.officeDocuments = $scope.officeDocuments.filter(function(officeDocument){
                                return officeDocument.status =='new' &&officeDocument.folder&& officeDocument.folder._id==context.entityId ;
                            });

                        }else{

                            $scope.officeDocuments = $scope.officeDocuments.filter(function(officeDocument){
                                return officeDocument.status == 'new' ;
                            });

                        }
                        $state.go($scope.detailsState+'.activities', {
                            id: result._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: false,
                            officeDocuments:$scope.officeDocuments
                        });
                    }else{

                        $state.go($scope.detailsState+'.activities', {
                            id: result._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: false
                        });
                }
                });
            }

            $scope.search = function(officeDocument) {
                if (context.entityName !== 'discussion') {
                    return;
                }

                if (!officeDocument.__autocomplete) {
                    return;
                }

                var term = officeDocument.title;
                if (!term) {
                    return;
                }

                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
                OfficeDocumentsService.search(term).then(function(searchResults) {
                    _(searchResults).each(function(sr) {
                        var alreadyAdded = _($scope.officeDocuments).any(function(p) {
                            return p._id === sr._id;
                        });

                        if (!alreadyAdded) {
                            $scope.searchResults.push(sr);
                        }
                    });
                    $scope.selectedSuggestion = 0;
                });
            };

            $scope.select = function(document) {
                var clone = JSON.parse(JSON.stringify(newOfficeDocument));
                var index = _.find($scope.officeDocuments, clone);

                if($scope.officeDocuments.length == 2){
                    $scope.officeDocuments.splice(index, 1);
                    $scope.officeDocuments.push(clone);
                }

                var currentOfficeDocument = _($scope.officeDocuments).findIndex(function(p) {
                    return p._id === document._id;
                });

                $scope.createOrUpdate($scope.officeDocuments[currentOfficeDocument + 1]).then(function(officeDocument) {
                    $state.go($scope.detailsState, {
                        id: officeDocument._id,
                        entity: context.entityName,
                        entityId: context.entityId
                    });
                });
            };
        }



        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function($event, officeDocument) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name') || angular.element($event.target).parent().hasClass('name');
                officeDocument.PartTitle = officeDocument.title;

                if (officeDocument.__state === creatingStatuses.NotCreated) {
                    //
                    // $scope.createOrUpdate(officeDocument).then(function() {
                    //     $state.go($scope.detailsState, {
                    //         id: officeDocument._id,
                    //         entity: context.entityName,
                    //         entityId: context.entityId,
                    //         nameFocused: nameFocused
                    //     });
                    // });
                    //
                } else {
                    $state.go($scope.detailsState+'.activities', {
                        id: officeDocument._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }
                LayoutService.clicked();
            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.officeDocuments.byentity.details') === 0 ||
                                $state.current.name.indexOf('main.officeDocuments.all.details') === 0
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

                    $scope.officeDocuments[index].__autocomplete = false;
                    if ($element.find('td.name')[index + 1]) {
                        $element.find('td.name')[index + 1].focus();
                    }
                    else {
                        $timeout(function() {
                            $element.find('td.name')[index + 1].focus();
                        }, 500);
                    }

                }
            };

            $scope.focusAutoComplete = function($event, document) {
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
                    $scope.select(document);
                }


            };

            $scope.hideAutoComplete = function(task) {

                task.PartTitle = task.title;

                task.__autocomplete = false;
                $scope.searchResults.length = 0;
                $scope.selectedSuggestion = 0;
            };

            // infinite scroll
            $timeout(function() {
                $scope.displayLimit = Math.ceil($element.height() / 50);
                $scope.isLoading = false;
            }, 0);

            $scope.loadMore2 = function() {
                var LIMIT = 25 ;

            if (!$scope.isLoading) {
                $scope.isLoading = true;
                var start = $scope.officeDocuments.length;
                var sort = $scope.order.field; //$scope.sorting?$scope.sorting:"created";
                OfficeDocumentsService.getAll(start, LIMIT,
                                              EntityService.getSortFilterValue().field,
                                              EntityService.getSortFilterValue().order,
                                              EntityService.getActiveStatusFilterValue(),
                                              EntityService.getEntityFolderValue().id).then(function (docs) {
                    docs.forEach(function (d) {
                        if (d.title.length > 20) {
                            d.PartTitle = d.title.substring(0, 20) + "...";
                        } else {
                            d.PartTitle = d.title;
                        }
                      //  if(EntityService.getSortFilterValue().order == -1){
                      //      $scope.officeDocuments.unshift(d);
                       // }else{

                            $scope.officeDocuments.push(d);
                       // }
                    });

                    $scope.isLoading = false;
                });
            }
        };


            $scope.loadMore = function() {
                if (!$scope.isLoading && $scope.loadNext) {
                    $scope.isLoading = true;
                    $scope.loadNext().then(function(officeDocuments) {

                        _(officeDocuments.data).each(function(p) {
                            p.__state = creatingStatuses.Created;
                            p.PartTitle = p.title;
                        });

                        var offset = $scope.displayOnly ? 0 : 1;

                        if (officeDocuments.data.length) {
                            var index = $scope.officeDocuments.length - offset;
                            var args = [index, 0].concat(officeDocuments.data);

                            [].splice.apply($scope.officeDocuments, args);
                        }

                        $scope.loadNext = officeDocuments.next;
                        $scope.loadPrev = officeDocuments.prev;
                        $scope.isLoading = false;
                    });
                }
            };
        }

    return {
        restrict: 'A',
        templateUrl: '/icu/components/officeDocument-list-directive/officeDocument-list.directive.template.html',
        scope: {
            loadNext: '=',
            loadPrev: '=',
            officeDocuments: '=',
            drawArrow: '=',
            order: '=',
            displayOnly: '=',
            activeToggle: '=',
            zbb:'='
        },
        link: link,
        controller: controller
    };
});
