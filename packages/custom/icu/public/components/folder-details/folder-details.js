'use strict';

angular.module('mean.icu.ui.folderdetails', [])
    .controller('FolderDetailsController', function ($scope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      folders,
                                                      offices,
                                                      tags,
                                                      $timeout,
                                                      context,
                                                      $state,
                                                      FoldersService,
                                                      $stateParams,
                                                      OfficesService, 
                                                      ActivitiesService) {
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
        $scope.offices = offices.data || offices;
        $scope.officeName = '';
        $scope.offices.push({
            'status': 'default',
            'title': $scope.officeName,
            'class': 'create-new',
            'color': 'rgb(0, 151, 167)'
        });
        $scope.tags = tags;

        $scope.tagInputVisible = false;

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
        // backup for previous changes - for updates
        var backupEntity = JSON.parse(JSON.stringify($scope.folder));

        $scope.$watch('officeName', function(newValue, oldValue) {
            var index = _.findIndex($scope.offices, function(p) {
                return p.title == oldValue;
            });
            $scope.offices[index].title = $scope.officeName;
        });

        $scope.createOffice = function(officeName, cb) {
            var office = {
                color: '0097A7',
                title: officeName,
                watchers: [],
            };

            OfficesService.create(office).then(function(result) {
                $scope.offices.push(result);
                $scope.officeName = '';
                cb(result);
                /*        $scope.update(result,'office')
                 */
            });

        };

        $scope.unsetOffice = function(event, folder) {
            event.stopPropagation();
            delete folder.office;
            $scope.update(folder);
        };

        $scope.updateOfficeName = function(x, y) {
            $scope.officeName = $('.ui-select-search.ng-valid-parse').val()
        }

        $scope.removeCreateNew = function() {
            $scope.officeName = '';
        }


        if (!$scope.folder) {
            $state.go('main.folders.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watch('folder.title', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'title',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'renamed'
                };
                $scope.delayedUpdate($scope.folder, context);
            }
        });

        var nText, oText;
        $scope.$watch('folder.description', function (nVal, oVal) {
            nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            if (nText != oText && oText) {
                var context = {
                    name: 'description',
                    oldVal: oVal,
                    newVal: nVal,
                };
                $scope.delayedUpdate($scope.folder, context);
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

        $scope.getUnusedTags = function() {

            return $scope.tags.filter(function(x) { return $scope.folder.tags.indexOf(x) < 0 })
        };

        $scope.addTagClicked=function(){
        	$scope.setFocusToTagSelect();
        	$scope.tagInputVisible=true;
        }

        $scope.addTag = function(tag) {
        	if(tag!=undefined && $.inArray(tag,$scope.folder.tags)==-1){
        		$scope.folder.tags.push(tag);
            	$scope.update($scope.folder);
        	}

            $scope.tagInputVisible = false;
        };

        $scope.removeTag = function(tag) {
            $scope.folder.tags = _($scope.folder.tags).without(tag);
            $scope.update($scope.folder);
        };

        $scope.setFocusToTagSelect = function() {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function() {
                element.focus();
            }, 0);
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

                    // if (context.entityName === 'office') {
                    //     var officeId = res.office ? res.office._id : undefined;
                    //     if (!officeIds) {
                    //         $state.go('main.folders.all.details', {
                    //             entity: 'folder',
                    //             id: folder._id
                    //         }, {
                    //             reload: true
                    //         });
                    //     } else {
                    //         if (officeId !== context.entityId || type === 'office') {
                    //             $state.go('main.folders.byentity.details', {
                    //                 entity: context.entityName,
                    //                 entityId: officeId,
                    //                 id: folder._id
                    //             }, {
                    //                 reload: true
                    //             });
                    //         }
                    //     }
                    // }
                }
                    switch (context.name) {
                        case 'status':
                            FoldersService.updateStatus(folder, backupEntity).then(function(result) {
                                backupEntity = JSON.parse(JSON.stringify($scope.folder));
                                ActivitiesService.data = ActivitiesService.data || [] ;
                                ActivitiesService.data.push(result);
                            });
                            break;
                    
                        case 'color':
                            FoldersService.updateColor(folder).then(function(result) {
                                ActivitiesService.data = ActivitiesService.data || [] ;
                                ActivitiesService.data.push(result);
                            });
                            break;   
                        case 'title':
                        case 'description':
                            FoldersService.updateTitle(folder, backupEntity, context.name).then(function(result) {
                                backupEntity = JSON.parse(JSON.stringify($scope.folder));
                                ActivitiesService.data = ActivitiesService.data || [];
                                ActivitiesService.data.push(result);
                            });
                            break; 
                    }
            });
        };


        $scope.updateOffice = function(folder, type, proj) {
            if (proj && proj !== '') {
                $scope.createOffice(proj, function(result) {
                    folder.office = result;
                    FoldersService.update(folder).then(function(result) {
                        if (context.entityName === 'office') {
                            FoldersService.updateEntity(folder, backupEntity).then(function(result) {
                                backupEntity = JSON.parse(JSON.stringify($scope.folder));
                                ActivitiesService.data = ActivitiesService.data || [] ;
                                ActivitiesService.data.push(result);
                            });
                            var officeId = result.office ? result.office._id : undefined;
                            if (officeId !== context.entityId || type === 'office') {
                                $state.go('main.folders.byentity.details', {
                                    entity: context.entityName,
                                    entityId: officeId,
                                    id: folder._id
                                }, {
                                    reload: true
                                });
                            }
                        }
                    });
                });
            }
            // if (context.entityName === 'discussion') {
            //     folder.discussion = context.entityId;
            // }
            folder.watchers = folder.watchers.concat(folder.office.watchers);
            folder.watchers = _.map(_.groupBy(folder.watchers,function(doc){
                return doc._id;
            }),function(grouped){
                return grouped[0];
            });

            FoldersService.update(folder).then(function(result) {
                FoldersService.updateEntity(folder, backupEntity).then(function(result) {
                    backupEntity = JSON.parse(JSON.stringify($scope.folder));
                    ActivitiesService.data = ActivitiesService.data || [] ;
                    ActivitiesService.data.push(result);
                });
                folder.PartTitle = folder.title;
                //if (context.entityName === 'office') {
                    var officeId = result.office ? result.office._id : undefined;
                    if (!officeId) {
                        $state.go('main.folders.all.details', {
                            entity: 'folder',
                            id: folder._id
                        }, {
                            reload: true
                        });
                    } else {
                        if (officeId !== context.entityId || type === 'office') {
                            $state.go('main.folders.byentity.details', {
                                entity: context.entityName,
                                entityId: officeId,
                                id: folder._id
                            }, {
                                reload: true
                            });
                        }
                    }
                //}
            });
        };

        $scope.updateCurrentFolder = function(){
            $scope.folder.PartTitle = $scope.folder.title;
            FoldersService.currentFolderName = $scope.folder.title;
        }

        $scope.delayedUpdate = _.debounce($scope.update, 2000);

        if ($scope.folder &&
            ($state.current.name === 'main.folders.all.details' ||
            $state.current.name === 'main.search.folder' ||
            $state.current.name === 'main.folders.byentity.details')) {
            $state.go('.activities');
        }
    });
