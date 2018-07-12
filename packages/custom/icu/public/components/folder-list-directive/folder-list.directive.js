'use strict';

angular.module('mean.icu.ui.folderlistdirective', ['dragularModule'])
    .directive('icuFolderList', function ($state, $uiViewScroll, $stateParams, $timeout, context, UsersService, LayoutService) {
        var creatingStatuses = {
            NotCreated: 0,
            Creating: 1,
            Created: 2
        };

        function controller($scope, orderService, FoldersService, dragularService, $element, $interval, $window) {
            $scope.currentFolderId = function (id) {
                $scope.folderId = id;
            };

            $scope.context = context;

            _($scope.folders).each(function (t) {
                t.__state = creatingStatuses.Created;
                t.PartTitle = t.title;
            });


            if (context.entityName === 'all') {
                $scope.detailsState = 'main.folders.all.details';
            } else if (context.entityName === 'my') {
                $scope.detailsState = 'main.folders.byassign.details';
            } else if (context.entityName === 'folder') {
                $scope.detailsState = 'main.folders.byparent.details';
            } else {
                $scope.detailsState = 'main.folders.byentity.details';
            }
        }

        function link($scope, $element) {
            var isScrolled = false;

            $scope.initialize = function ($event, folder) {
                if ($scope.displayOnly) {
                    return;
                }

                var nameFocused = angular.element($event.target).hasClass('name');
                folder.PartTitle = folder.title;

                if (folder.__state === creatingStatuses.NotCreated) {
                    $scope.createOrUpdate(folder).then(function () {
                        $state.go($scope.detailsState, {
                            id: folder._id,
                            entity: context.entityName,
                            entityId: context.entityId,
                            nameFocused: nameFocused
                        });
                    });
                } else {
                    $state.go($scope.detailsState + '.activities', {
                        id: folder._id,
                        entity: context.entityName,
                        entityId: context.entityId,
                        nameFocused: nameFocused
                    });
                }

                LayoutService.clicked();

            };

            $scope.isCurrentState = function (id) {
                var isActive = ($state.current.name.indexOf('main.folders.byparent.details') === 0 ||
                    $state.current.name.indexOf('main.folders.byentity.details') === 0 ||
                    $state.current.name.indexOf('main.folders.all.details') === 0
                ) && $state.params.id === id;

                if (isActive && !isScrolled) {
                    $uiViewScroll($element.find('[data-id="' + $stateParams.id + '"]'));
                    isScrolled = true;
                }

                return isActive;
            };


            $scope.loadMore = function () {
                if (!$scope.isLoading && $scope.loadNext) {
                    $scope.loadNext().then(function (folders) {

                        _(folders.data).each(function(t) {
                            t.__state = creatingStatuses.Created;
                            t.PartTitle = t.title;
                        });

                        var offset = $scope.displayOnly ? 0 : 1;

                        if (folders.data.length) {
                            var index = $scope.folders.length - offset;
                            $scope.folders.pop();
                            var args = [index, 0].concat(folders.data);
                            [].splice.apply($scope.folders, args);
                            $scope.folders.push(_(newFolder).clone());
                        }

                        $scope.loadNext = folders.next;
                        $scope.loadPrev = folders.prev;
                    });
                }
            };
        }



        return {
            restrict: 'A',
            templateUrl: '/icu/components/folder-list-directive/folder-list.directive.template.html',
            scope: {
                folders: '=',
                loadNext: '=',
                loadPrev: '=',
                drawArrow: '=',
                groupFolders: '=',
                order: '=',
                displayOnly: '=',
                autocomplete: '='
            },
            link: link,
            controller: controller
        };
    });
