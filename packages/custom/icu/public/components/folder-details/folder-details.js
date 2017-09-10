'use strict';

angular.module('mean.icu.ui.folderdetails', [])
    .controller('FolderDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      folders,
                                                      context,
                                                      $state,
                                                      FoldersService,
                                                      $stateParams) {
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("folders")))
        {
            $scope.folder = entity || context.entity;
        }
        else
        {
            $scope.folder = context.entity || entity;
        }
        $scope.tasks = tasks.data || tasks;
        $scope.folders = folders.data || folders;
        $scope.shouldAutofocus = !$stateParams.nameFocused;

        FoldersService.getStarred().then(function (starred) {

            // Chack if HI room created and so needs to show HI.png
            if($scope.folder.WantRoom == true)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            }

            $scope.folder.star = _(starred).any(function (s) {
                return s._id === $scope.folder._id;
            });
        });

        if (!$scope.folder) {
            $state.go('main.folders.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watchGroup(['folder.description', 'folder.title'], function (nVal, oVal, scope) {
            if (nVal !== oVal && oVal) {
                var newContext;
                if (nVal[1] !== oVal[1]) {
                    newContext = {
                        name: 'title',
                        oldVal: oVal[1],
                        newVal: nVal[1],
                        action: 'renamed'
                    };
                } else {
                    newContext = {
                        name: 'description',
                        oldVal: oVal[0],
                        newVal: nVal[0]
                    };
                }
                $scope.delayedUpdate($scope.folder, newContext);
            }
        });

        $scope.$watch('folder.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.folder, context);
            }
        });

        $scope.people = people.data || people;

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        $scope.dueOptions = {
            onSelect: function () {
                $scope.update($scope.folder, 'due');
            },
            dateFormat: 'd.m.yy'
        };

        function navigateToDetails(folder) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.folders.all.details' : 'main.folders.byentity.details';

            $state.go($scope.detailsState, {
                id: folder._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.star = function (folder) {
            FoldersService.star(folder).then(function () {
                navigateToDetails(folder);
            });
        };

        $scope.WantToCreateRoom = function (folder) {

            if($scope.folder.WantRoom == false)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');

                folder.WantRoom = true;

                $scope.update(folder, context);

                FoldersService.WantToCreateRoom(folder).then(function () {
                    navigateToDetails(folder);
                });
            }
        };

        $scope.deleteFolder = function (folder) {
            FoldersService.remove(folder._id).then(function () {

                $state.go('main.folders.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.update = function (folder, context) {
            FoldersService.update(folder, context).then(function(res) {
                if (FoldersService.selected && res._id === FoldersService.selected._id) {
                    if (context.name === 'title') {
                        FoldersService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        FoldersService.selected.color = res.color;
                    }
                }
            });
        };

        $scope.updateCurrentFolder = function(){
            $scope.folder.PartTitle = $scope.folder.title;
            FolderesService.currentFolderName = $scope.folder.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.folder &&
            ($state.current.name === 'main.folders.all.details' ||
            $state.current.name === 'main.search.folder' ||
            $state.current.name === 'main.folders.byentity.details')) {
            $state.go('.activities');
        }
    });
