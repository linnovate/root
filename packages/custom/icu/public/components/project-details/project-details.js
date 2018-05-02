'use strict';

angular.module('mean.icu.ui.projectdetails', [])
    .controller('ProjectDetailsController', function ($scope,
                                                      $rootScope,
                                                      entity,
                                                      tasks,
                                                      people,
                                                      projects,
                                                      tags,
                                                      $timeout,
                                                      context,
                                                      $state,
                                                      ProjectsService,
                                                      ActivitiesService,
                                                      PermissionsService,
                                                      EntityService,
                                                      $stateParams,
                                                      me
    ) {
        $scope.me = me;
        if (($state.$current.url.source.includes("search")) || ($state.$current.url.source.includes("projects")))
        {
            $scope.project = entity || context.entity;
        }
        else
        {
            $scope.project = context.entity || entity;
        }
        $scope.tasks = tasks.data || tasks;
        $scope.projects = projects.data || projects;
        $scope.project = entity || context.entity;
        $scope.entity = entity || context.entity;
        $scope.tags = tags;
        $scope.addSubProjects = false;

        $scope.tagInputVisible = false;
        var currentState = $state.current.name;

        $scope.people = people.data || people;
        if ($scope.people && $scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
            var newPeople = {
                name: 'no select'
            };

            $scope.people.push(_(newPeople).clone());
        }
        for(var i =0 ; i<$scope.people.length;i++){
            if($scope.people[i] && ($scope.people[i].job == undefined || $scope.people[i].job==null)){
                $scope.people[i].job = $scope.people[i].name;
            }
        }

        $scope.isRecycled = $scope.project.hasOwnProperty('recycled');

        ProjectsService.getStarred().then(function (starred) {

            // Chack if HI room created and so needs to show HI.png
            if($scope.project.WantRoom == true)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');
            }

            $scope.project.star = _(starred).any(function (s) {
                return s._id === $scope.project._id;
            });
        });

        // backup for previous changes - for updates
        var backupEntity = JSON.parse(JSON.stringify($scope.project));

        if (!$scope.project) {
            $state.go('main.projects.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.statuses = ['new', 'assigned', 'in-progress', 'canceled', 'completed', 'archived'];

        $scope.$watch('project.title', function(nVal, oVal) {
            if (nVal !== oVal && oVal) {
                var newContext = {
                    name: 'title',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'renamed'
                };
                $scope.delayedUpdate($scope.project, newContext);
            }
        });

        var nText, oText;
        $scope.$watch('project.description', function(nVal, oVal) {
            nText = nVal ? nVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            oText = oVal ? oVal.replace(/<(?:.|\n)*?>/gm, '') : '';
            if (nText != oText && oText) {
                var newContext = {
                    name: 'description',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'renamed'
                };
                $scope.delayedUpdate($scope.project, newContext);
            }
        });

        $scope.updateAndNotify = function(project) {
            project.status = $scope.statuses[1];

            if (context.entityName === 'discussion') {
                project.discussion = context.entityId;
            }

            if (project.assign === undefined || project.assign === null) {
                delete project['assign'];
            }
            else {
                // check the assignee is not a watcher already
                let filtered = project.watchers.filter(watcher => {
                    return watcher._id == project.assign;
                });

                // add assignee as watcher
                if(filtered.length == 0) {
                    project.watchers.push(project.assign);
                }
            }


            ProjectsService.update(project).then(function(result) {
                if (context.entityName === 'project') {
                    var projId = result.project ? result.project._id : undefined;
                    if (projId !== context.entityId) {
                        $state.go('main.projects.byentity', {
                            entity: context.entityName,
                            entityId: context.entityId
                        }, {
                            reload: true
                        });
                    }
                }

                ProjectsService.assign(project, me, backupEntity).then(function(res) {
                    backupEntity = JSON.parse(JSON.stringify(result));
                    ActivitiesService.data.push(res);
                });
            });

        };

        $scope.$watch('project.color', function (nVal, oVal) {
            if (nVal !== oVal) {
                var context = {
                    name: 'color',
                    oldVal: oVal,
                    newVal: nVal,
                    action: 'changed'
                };
                $scope.update($scope.project, context);
            }
        });


        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        //due start
        if ($scope.project.due) $scope.project.due = new Date($scope.project.due);

        $scope.dueOptions = {
            onSelect: function() {
                $scope.updateDue($scope.project);
            },
            onClose: function() {
                if ($scope.checkDate()){
                    document.getElementById('ui-datepicker-div').style.display = 'block';
                    $scope.open();
                }else{
                    document.getElementById('ui-datepicker-div').style.display = 'none';
                    $scope.open();
                }
            },
            dateFormat: 'd.m.yy'
        };

        $scope.checkDate = function() {
            var d = new Date();
            d.setHours(0,0,0,0);
            if (d > $scope.project.due) {
                return true;
            }
            return false;
        };

        $scope.open = function() {
            if ($scope.checkDate()) {
                document.getElementById('past').style.display = document.getElementById('ui-datepicker-div').style.display;
                document.getElementById('past').style.left = document.getElementById('ui-datepicker-div').style.left;
            } else {
                document.getElementById('past').style.display = 'none';
            }
        };

        $scope.updateDue = function(project) {

            if (context.entityName === 'discussion') {
                project.discussion = context.entityId;
            }


            ProjectsService.updateDue(project, backupEntity).then(function(result) {
                backupEntity = JSON.parse(JSON.stringify($scope.project));
                ActivitiesService.data.push(result);
            });

            ProjectsService.update(project).then(function(result) {
                if (context.entityName === 'project') {
                    var projId = result.project ? result.project._id : undefined;
                    if (projId !== context.entityId) {
                        $state.go('main.projects.byentity', {
                            entity: context.entityName,
                            entityId: context.entityId
                        }, {
                            reload: true
                        });
                    }
                }
            });
        };
        // end due

        $scope.closeOldDateNotification = function(){
            document.getElementById('past').style.display = 'none';
        };

        $scope.getUnusedTags = function() {

            return $scope.tags.filter(function(x) { return $scope.project.tags.indexOf(x) < 0 })
        };

        $scope.addTagClicked=function(){
        	$scope.setFocusToTagSelect();
        	$scope.tagInputVisible=true;
        }

        $scope.addTag = function(tag) {
        	if(tag!=undefined && $.inArray(tag,$scope.project.tags)==-1){
        		$scope.project.tags.push(tag);
            	$scope.update($scope.project);
        	}

            $scope.tagInputVisible = false;
        };

        $scope.enableRecycled = true;
        $scope.havePermissions = function(type, enableRecycled){
            enableRecycled = enableRecycled || !$scope.isRecycled;
            return (PermissionsService.havePermissions($scope.entity, type) && enableRecycled);
        };

        $scope.haveEditiorsPermissions = function(){
            return PermissionsService.haveEditorsPerms($scope.entity);
        };

        $scope.permsToSee = function(){
            return PermissionsService.haveAnyPerms($scope.entity);
        };

        $scope.shouldAutofocus = !$stateParams.nameFocused && $scope.haveEditiorsPermissions;

        $scope.removeTag = function(tag) {
            $scope.project.tags = _($scope.project.tags).without(tag);
            $scope.update($scope.project);
        };

        $scope.setFocusToTagSelect = function() {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function() {
                element.focus();
            }, 0);
        };

        function navigateToDetails(project) {
            $scope.detailsState = context.entityName === 'all' ?
                'main.projects.all.details' : 'main.projects.byentity.details';

            $state.go($scope.detailsState, {
                id: project._id,
                entity: context.entityName,
                entityId: context.entityId,
                starred: $stateParams.starred
            }, {
                reload: true
            });
        }

        $scope.star = function (project) {
            ProjectsService.star(project).then(function () {
                navigateToDetails(project);
            });
        };

        $scope.WantToCreateRoom = function (project) {

            if($scope.project.WantRoom == false)
            {
                $('#HI').css('background-image', 'url(/icu/assets/img/Hi.png)');

                project.WantRoom = true;

                $scope.update(project, context);

                ProjectsService.WantToCreateRoom(project).then(function () {
                    navigateToDetails(project);
                });
            }
        };

        $scope.recycle = function(entity) {
            EntityService.recycle('projects', entity._id).then(function() {
                let clonedEntity = JSON.parse(JSON.stringify(entity));
                clonedEntity.status = "Recycled" // just for activity status
                ProjectsService.updateStatus(clonedEntity, entity).then(function(result) {
                    ActivitiesService.data.push(result);
                });

                refreshList();
                if(currentState.indexOf('search') !== -1){
                    $state.go(currentState, {
                        entity: context.entityName,
                        entityId: context.entityId
                    }, {
                        reload: true,
                        query: $stateParams.query
                    });
                } else {
                    $state.go('main.projects.all', {
                        entity: 'all',
                    }, {
                        reload: true
                    });
                }
            });
        };

        $scope.recycleRestore = function(entity) {
            EntityService.recycleRestore('projects', entity._id).then(function() {
                let clonedEntity = JSON.parse(JSON.stringify(entity));
                clonedEntity.status = "un-deleted" // just for activity status
                ProjectsService.updateStatus(clonedEntity, entity).then(function(result) {
                    ActivitiesService.data.push(result);
                });
                refreshList();

                var state = currentState.indexOf('search') !== -1 ? $state.current.name : 'main.projects.all';
                $state.go(state, {
                    entity: context.entityName,
                    entityId: context.entityId
                }, {
                    reload: true
                });
            });
        };

        function refreshList(){
            $rootScope.$broadcast('refreshList');
        }

        $scope.deleteProject = function (project) {
            ProjectsService.remove(project._id).then(function () {

                $state.go('main.projects.all', {
                    entity: 'all'
                }, {reload: true});
            });
        };

        $scope.updateStatusForApproval = function(entity) {
            let context = {
                action:"updated",
                name:  "status",
                type:  "project"
            }
            entity.status = "waiting-approval" ;
            $scope.update(entity, context) ;
        }


        $scope.update = function (project, context) {
            ProjectsService.update(project, context).then(function(res) {
                if (ProjectsService.selected && res._id === ProjectsService.selected._id) {
                    if (context.name === 'title') {
                        ProjectsService.selected.title = res.title;
                    }
                    if (context.name === 'color') {
                        ProjectsService.selected.color = res.color;
                    }
                }
                switch (context.name) {
                    case 'status':
                        if (context.entityName === 'discussion') {
                            project.discussion = context.entityId;
                        }

                        ProjectsService.updateStatus(project, backupEntity).then(function(result) {
                            backupEntity = JSON.parse(JSON.stringify($scope.project));
                            ActivitiesService.data = ActivitiesService.data || [] ;
                            ActivitiesService.data.push(result);
                        });
                        break;

                    case 'color':
                        ProjectsService.updateColor(project).then(function(result) {
                            backupEntity = JSON.parse(JSON.stringify($scope.project));
                            ActivitiesService.data = ActivitiesService.data || [] ;
                            ActivitiesService.data.push(result);
                        });
                        break;
                    case 'title':
                    case 'description':
                        ProjectsService.updateTitle(project, backupEntity, context.name).then(function(result) {
                            backupEntity = JSON.parse(JSON.stringify($scope.project));
                            ActivitiesService.data = ActivitiesService.data || [];
                            ActivitiesService.data.push(result);
                            refreshList();
                        });
                        break;
                }
            });
        };

        $scope.updateCurrentProject = function(){
            $scope.project.PartTitle = $scope.project.title;
            ProjectsService.currentProjectName = $scope.project.title;
        }

        $scope.saveTemplate = function () {
            $scope.isopen = false;
            $scope.newTemplate.frequentUser = $scope.newTemplate.watcher;
            if ($scope.project.subProjects[0]._id) {
                ProjectsService.saveTemplate($stateParams.id, $scope.newTemplate).then(function (result) {
                    $scope.showMsgSavedTpl = true;
                    $scope.newTemplate.name = '';
                    var element = angular.element('.sub-projects .fa-chevron-down')[0];
                    $timeout(function () {
                        element.click();
                    }, 0);
                    $timeout(function () {
                        $scope.showMsgSavedTpl = false;
                    }, 3000);
                    $scope.template.push(result);
                });
            }
        };

        $scope.setFocusToTagSelect = function () {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function () {
                element.focus();
            }, 0);
        };

        function deleteClass(projects) {
            for (var i = projects.length - 1; i >= 0; i--) {
                projects[i].isNew = false;
            }
        }
        $scope.template2subProjects = function (templateId) {
            $scope.isopen = false;
            ProjectsService.template2subProjects(templateId, {
                'projectId': $stateParams.id
            }).then(function (result) {
                for (var i = result.length - 1; i >= 0; i--) {
                    result[i].isNew = true;
                }

                $timeout(function () {
                    deleteClass(result);
                }, 5000);
                var tmp = $scope.project.subProjects.pop();
                $scope.project.subProjects = $scope.project.subProjects.concat(result);
                $scope.project.subProjects.push(tmp);
            });
        };

        $scope.deleteTemplate = function (id, index) {
            ProjectsService.deleteTemplate(id).then(function (result) {
                $scope.template.splice(index, 1);
            });
        };

        $scope.delayedUpdate = _.debounce($scope.update, 2000);

        if ($scope.project &&
            ($state.current.name === 'main.projects.all.details' ||
                $state.current.name === 'main.search.project' ||
                $state.current.name === 'main.projects.byentity.details')) {
            $state.go('.activities');
        }
    });
