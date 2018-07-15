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
            $scope.isLoading = true;

            _($scope.folders).each(function (t) {
                t.__state = creatingStatuses.Created;
                t.PartTitle = t.title;
            });
        }

        function link($scope, $element) {
            var isScrolled = false;

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
