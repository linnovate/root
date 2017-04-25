'use strict';

angular.module('mean.icu.ui.taskdetails', [])
    .controller('TaskDetailsController', function($scope,
        entity,
        tags,
        projects,
        $state,
        TasksService,
        ActivitiesService,
        context,
        $stateParams,
        $rootScope,
        MeanSocket,
        UsersService,
        people,
        $timeout,
        ProjectsService,
        me //,subtasks
    ) {
        $scope.task = entity || context.entity;
        $scope.addSubTasks = false;
        $scope.me = me;
        $scope.imgUrl = '?' + Date.now();
        /*test for sub-task*/
        // $scope.addSubTasks = false;
        // $scope.test = [];
        // $scope.test.push($scope.task)
        /*     $scope.test.push($scope.task)
         */
        /*end test for sub-task*/
        $scope.tags = tags;
        $scope.projects = projects.data || projects;
        $scope.projName = '';
        $scope.projects.push({
            'status': 'default',
            'title': $scope.projName,
            'class': 'create-new',
            'color': 'rgb(0, 151, 167)'
        });

        $scope.shouldAutofocus = !$stateParams.nameFocused;
        if ($scope.task._id) {
            TasksService.getStarred().then(function(starred) {
                $scope.task.star = _(starred).any(function(s) {
                    return s._id === $scope.task._id;
                });
            });

            TasksService.getTemplate().then(function(template) {
                $scope.template = template;
            });
        }

        $scope.people = people.data || people;
        if ($scope.people[Object.keys($scope.people).length - 1].name !== 'no select') {
            var newPeople = {
                name: 'no select'
            };

            $scope.people.push(_(newPeople).clone());
        }

        if (!$scope.task) {
            $state.go('main.tasks.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.updateProjName = function(x, y) {
            $scope.projName = $('.ui-select-search.ng-valid-parse').val()
        }

        $scope.removeCreateNew = function() {
            $scope.projName = '';
        }

        $scope.$watch('projName', function(newValue, oldValue) {
            var index = _.findIndex($scope.projects, function(p) {
                return p.title == oldValue;
            });
            $scope.projects[index].title = $scope.projName;
        });

        $scope.createProject = function(projName, cb) {
            var project = {
                color: '0097A7',
                title: projName,
                watchers: [],
            };

            ProjectsService.create(project).then(function(result) {
                $scope.projects.push(result);
                $scope.projName = '';
                cb(result);
                /*        $scope.update(result,'project')
                 */
            });

        };

        $scope.statusType = function() {
            alert('statusType');
        };

        if (!$scope.task) {
            $state.go('main.tasks.byentity', {
                entity: context.entityName,
                entityId: context.entityId
            });
        }

        $scope.tagInputVisible = false;

        $scope.statuses = ['new', 'assigned', 'in-progress', 'review', 'rejected', 'done'];
        $rootScope.$broadcast('updateNotification', {
            taskId: $stateParams.id
        });

        $scope.getUnusedTags = function() {
            return _.chain($scope.tags).reject(function(t) {
                return $scope.task.tags.indexOf(t.term) >= 0;
            }).sortBy(function(a, b) {
                return b.count - a.count;
            }).pluck('term').value();
        };

        $scope.$watchGroup(['task.description', 'task.title'], function(nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.task);
            }
        });

        $scope.addTagClicked=function(){
        	$scope.setFocusToTagSelect();
        	$scope.tagInputVisible=true;
        }

        $scope.addTag = function(tag) {
        	if(tag!=undefined && $.inArray(tag,$scope.task.tags)==-1){
        		$scope.task.tags.push(tag);
            	$scope.update($scope.task);
        	}

            $scope.tagInputVisible = false;
        };

        $scope.removeTag = function(tag) {
            $scope.task.tags = _($scope.task.tags).without(tag);
            $scope.update($scope.task);
        };

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        if ($scope.task.due) $scope.task.due = new Date($scope.task.due);

        $scope.dueOptions = {
            onSelect: function() {
                $scope.update($scope.task);
            },
            onClose: function() {
                document.getElementById('ui-datepicker-div').style.display = 'none';
                $scope.open();
            },
            dateFormat: 'd.m.yy'
        };

        $scope.checkDate = function() {
            var d = new Date()
            if (d > $scope.task.due) {
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

        function navigateToDetails(task) {
            $scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

            $state.reload('main.tasks');
        }

        $scope.star = function(task) {
            TasksService.star(task).then(function() {
                navigateToDetails(task);
            });
        };

        $scope.unsetProject = function(event, task) {
            event.stopPropagation();
            delete task.project;
            $scope.update(task);
        };

        $scope.deleteTask = function(task) {
            TasksService.remove(task._id).then(function() {
                var state = context.entityName === 'all' ? 'main.tasks.all' : context.entityName === 'my' ? 'main.tasks.byassign' : 'main.tasks.byentity';
                TasksService.getWatchedTasks().then(function(result){
                   TasksService.watchedTasksArray = result;
                    $state.go(state, {
                        entity: context.entityName,
                        entityId: context.entityId
                    }, {
                    reload: true
                });

                });

              
            });
        };

        //Made By OHAD
        $scope.updateAndNotify = function(task) {
            if (context.entityName === 'discussion') {
                task.discussion = context.entityId;
            }

            if (task.assign === undefined || task.assign === null) {
                delete task['assign'];
            }

            TasksService.assign(task, me).then(function(result) {
                ActivitiesService.data.push(result);
            });

            TasksService.update(task).then(function(result) {
                if (context.entityName === 'project') {
                    var projId = result.project ? result.project._id : undefined;
                    if (projId !== context.entityId) {
                        $state.go('main.tasks.byentity', {
                            entity: context.entityName,
                            entityId: context.entityId
                        }, {
                            reload: true
                        });
                    }
                }
            });

        };
        //END Made By OHAD

        $scope.update = function(task, type, proj) {
            if (proj && proj !== '') {
                $scope.createProject(proj, function(result) {
                    task.project = result;
                    TasksService.update(task).then(function(result) {
                        if (context.entityName === 'project') {
                            var projId = result.project ? result.project._id : undefined;
                            if (projId !== context.entityId || type === 'project') {
                                $state.go('main.tasks.byentity.details', {
                                    entity: context.entityName,
                                    entityId: context.entityId,
                                    id: task._id
                                }, {
                                    reload: true
                                });
                            }
                        }
                    });
                });
            }
            if (context.entityName === 'discussion') {
                task.discussion = context.entityId;
            }
            TasksService.update(task).then(function(result) {
                if (context.entityName === 'project') {
                    var projId = result.project ? result.project._id : undefined;
                    if (projId !== context.entityId || type === 'project') {
                        $state.go('main.tasks.byentity.details', {
                            entity: context.entityName,
                            entityId: context.entityId,
                            id: task._id
                        }, {
                            reload: true
                        });
                    }
                }
            });
        };

        $scope.newTemplate = {
            'name': '',
            'watcher': me
        };

        $scope.saveTemplate = function() {
            $scope.isopen = false;
            if ($scope.task.subTasks[0]._id) {
                TasksService.saveTemplate($stateParams.id, $scope.newTemplate).then(function(result) {
                    $scope.showMsgSavedTpl = true;
                    $scope.newTemplate.name = '';
                    var element = angular.element('.sub-tasks .fa-chevron-down')[0];
                    $timeout(function() {
                        element.click();
                    }, 0);
                    $timeout(function() {
                        $scope.showMsgSavedTpl = false;
                    }, 3000);
                    $scope.template.push(result);
                });
            } else
                console.log('no subTasks')
        };

        $scope.setFocusToTagSelect = function() {
            var element = angular.element('#addTag > input.ui-select-focusser')[0];
            $timeout(function() {
                element.focus();
            }, 0);
        };


        function deleteClass(tasks) {
            for (var i = tasks.length - 1; i >= 0; i--) {
                tasks[i].isNew = false;
            }
        }
        $scope.template2subTasks = function(templateId) {
            $scope.isopen = false;
            TasksService.template2subTasks(templateId, {
                'taskId': $stateParams.id
            }).then(function(result) {
                for (var i = result.length - 1; i >= 0; i--) {
                    result[i].isNew = true;
                }

                $timeout(function() {
                    deleteClass(result);
                }, 5000);
                var tmp = $scope.task.subTasks.pop()
                $scope.task.subTasks = $scope.task.subTasks.concat(result);
                $scope.task.subTasks.push(tmp);
            });
        };

        $scope.deleteTemplate = function(id, index) {
            TasksService.deleteTemplate(id).then(function(result) {
                $scope.template.splice(index, 1);
            })
        }
        $scope.delayedUpdate = _.debounce($scope.update, 500);

        // if ($scope.task &&
        //         ($state.current.name === 'main.tasks.byentity.details' ||
        //         $state.current.name === 'main.search.task' ||
        //         $state.current.name === 'main.tasks.all.details' ||
        //         $state.current.name === 'main.tasks.byassign.details')) {
        //     $state.go('.subtasks');
        // }

        if ($scope.task &&
            ($state.current.name === 'main.tasks.byentity.details' ||
                $state.current.name === 'main.search.task' ||
                $state.current.name === 'main.tasks.all.details' ||
                $state.current.name === 'main.tasks.byassign.details')) {
            $state.go('.activities');
        }
    })
    .directive('selectOnBlur', function($timeout) {
        return {
            require: 'uiSelect',
            link: function(scope, elm, attrs, ctrl) {
                elm.on('blur', 'input.ui-select-search', function(e) {
                	var ngModelName = attrs.id;
                	if(ngModelName == "addTag"){
                		ctrl.select();
                		ctrl.ngModel.$setViewValue(undefined);
                		scope.tagInputVisible=false;
                	}
                });

                elm.on('blur', 'input.ui-select-focusser', function(e, g) {
                    $timeout(function() {
                        if (!e.target.hasAttribute('disabled')) {
                            scope.tagInputVisible = false;
                        }
                    }, 5);
                });

            }
        };
    }).directive('test',function(){
    	return{
    		scope:true,
    		require:'ngModel',
    		link: function($scope,$elm,$attrs,ngModel){
    			ngModel.$setViewValue('hi');
    		}
    	}
    }).filter('searchfilter', function() {
        return function(input, query) {
            var r = RegExp('(' + query + ')');
            if (input !== undefined)
                return input.replace(r, '<span class="super-class">$1</span>');
        }
    });
