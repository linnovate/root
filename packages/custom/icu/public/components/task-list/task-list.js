'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $window, $state, tasks, DiscussionsService,TasksService, ProjectsService, context,$timeout, $filter, $stateParams) {
	$scope.tasks = tasks.data || tasks;
	//TasksService.data = $scope.tasks;
	$scope.loadNext = tasks.next;
	$scope.loadPrev = tasks.prev;

	$scope.autocomplete = context.entityName === 'discussion';
	$scope.starred = $stateParams.starred;
	if ($scope.tasks.length > 0 && !$scope.tasks[$scope.tasks.length - 1].id) {
		$scope.tasks = [$scope.tasks[0]];
	}
	$scope.getFilter = function() {
		var a = TasksService.filterValue;
		switch(a) {
			case 'today': 
				return 'tasksDueToday';
			case 'week':
				return 'tasksDueThisWeek';
			case 'watched':
				return 'watchedTasks';
			case 'overdue':
				return 'overdueTasks';
			default:
				return ''
		}
	}

	function init() {
		if(context.entity){
			if(!context.entity.parent) {
				if(context.entity.project ){
					$scope.parentState = 'byentity';
					$scope.parentEntity ='project' ;
					$scope.parentEntityId = context.entity.project._id;
					$scope.parentId = context.entity.id;
				}
				else if(context.entity.discussions ){
					$scope.parentState = 'byentity';
					$scope.parentEntity= 'discussion';
					if(context.entity.discussions[0])
						$scope.parentEntityId = context.entity.discussions[0]._id ;
					$scope.parentId = context.entity.id;
			   }
			}
			if(context.entityName === 'project') {
				ProjectsService.selected = context.entity;
			} else if(context.entityName === 'discussion') {
				$scope.discussionContext = context.entity;
				$scope.firstStr = '';
            	$scope.secondStr = '';
				if($scope.discussionContext.startDate){
					$scope.discussionContext.startDate = new Date($scope.discussionContext.startDate);
					var startStr = $scope.discussionContext.startDate.getDate()+"/"+($scope.discussionContext.startDate.getMonth()+1)+"/"+$scope.discussionContext.startDate.getFullYear();
					$scope.firstStr = startStr;
				}
				if($scope.discussionContext.allDay){
					$scope.secondStr = "All day long";
				} else{
					if($scope.discussionContext.startTime){
						$scope.discussionContext.startTime = new Date($scope.discussionContext.startTime);
						var ho = $scope.discussionContext.startTime.getHours().toString().length==1? "0"+$scope.discussionContext.startTime.getHours().toString():
							$scope.discussionContext.startTime.getHours().toString();
						var min = $scope.discussionContext.startTime.getMinutes().toString().length==1? "0"+$scope.discussionContext.startTime.getMinutes().toString():
							$scope.discussionContext.startTime.getMinutes().toString();
						startStr = ho+":"+min;
						$scope.firstStr = $scope.discussionContext.startDate ? $scope.firstStr + " "+startStr : '';
					}
					if($scope.discussionContext.endDate){
						$scope.discussionContext.endDate = new Date($scope.discussionContext.endDate);
						if($scope.firstStr!='deadline'){
							$scope.firstStr = $scope.firstStr;
						}
						else{
							$scope.firstStr = "";
						}
						var endStr = $scope.discussionContext.endDate.getDate()+"/"+($scope.discussionContext.endDate.getMonth()+1)+"/"+$scope.discussionContext.endDate.getFullYear();
						$scope.secondStr = endStr;
						if($scope.discussionContext.endTime){
							$scope.discussionContext.endTime = new Date($scope.discussionContext.endTime);
							var ho = $scope.discussionContext.endTime.getHours().toString().length==1? "0"+$scope.discussionContext.endTime.getHours().toString():
							$scope.discussionContext.endTime.getHours().toString();
							var min = $scope.discussionContext.endTime.getMinutes().toString().length==1? "0"+$scope.discussionContext.endTime.getMinutes().toString():
							$scope.discussionContext.endTime.getMinutes().toString();
							endStr = ho+":"+min;
							$scope.secondStr = $scope.secondStr +" "+endStr;
						}
				}
			}

            
			}
		}
		else {
			$scope.parentState = 'byparent';
			$scope.parentEntity = 'task';
			if(context.entity){
				$scope.parentEntityId = context.entity.parent;
				$scope.parentId = context.entity.id;
			}
		}
	}

	$timeout(function() {
		init();
	}, 500);

	$scope.goToParent = function() {
		$state.go('main.tasks.'+$scope.parentState+'.details',{entity:$scope.parentEntity,entityId:$scope.parentEntityId,id:$scope.parentId})
	}

	$scope.isCurrentState = function(ids) {
		return ids.indexOf($state.current.name) !== -1;
	};

	$scope.getProjStatus = function() {
		var entityType = $scope.currentContext.entityName;
		if($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined&&
		 $scope.currentContext.entity.status!=undefined){
			return $scope.currentContext.entity.status;
		}
		else if ($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined
		 && $scope.currentContext.entity.status!=undefined){
			return $scope.currentContext.entity.status;
		}
		else{
			if(entityType=="discussion" && DiscussionsService.currentDiscussionName!=undefined){
				return DiscussionsService.currentDiscussionName;
			}
			else if(ProjectsService.currentProjectName!=undefined){
				return ProjectsService.currentProjectName;
			}
			else{
				var tasks = $scope.tasks;
				if(tasks.length==1){
					$state.go('401');
					return "you dont have permission";
				}
				else{
					var task = tasks[0];
					var result;
					if(task.project!=undefined){
						result = task.project.title
					}
					else if(task.discussions!=undefined && task.discussions.title!=undefined){
						result=task.discussions[0].title;
					}
					else{
						result = "you dont have permission";
					}
					return result;
				}
			}

		}
	}

	$scope.getProjName=function(){
		var entityType = $scope.currentContext.entityName;
		if($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined&&
		 $scope.currentContext.entity.title!=undefined){
			return $scope.currentContext.entity.title;
		}
		else if ($scope.currentContext!=undefined && $scope.currentContext.entity!=undefined
		 && $scope.currentContext.entity.name!=undefined){
			return $scope.currentContext.entity.name;
		}
		else{
			if(entityType=="discussion" && DiscussionsService.currentDiscussionName!=undefined){
				return DiscussionsService.currentDiscussionName;
			}
			else if(ProjectsService.currentProjectName!=undefined){
				return ProjectsService.currentProjectName;
			}
			else{
				var tasks = $scope.tasks;
				if(tasks.length==1){
					$state.go('401');
					return "you dont have permission";
				}
				else{
					var task = tasks[0];
					var result;
					if(task.project!=undefined){
						result = task.project.title
					}
					else if(task.discussions!=undefined && task.discussions.title!=undefined){
						result=task.discussions[0].title;
					}
					else{
						result = "you dont have permission";
					}
					return result;
				}
			}

		}
	}

	$scope.changeOrder = function () {
		if($scope.sorting.field != "custom"){
			$scope.sorting.isReverse = !$scope.sorting.isReverse;
		}

		/*Made By OHAD - Needed for reversing sort*/
		$state.go($state.current.name, { sort: $scope.sorting.field });
	};

	$scope.sorting = {
		field: $stateParams.sort || 'created',
		isReverse: false
	};

/*Made By OHAD - Needed for reversing sort*/
	// $scope.$watch('sorting.field', function(newValue, oldValue) {
	//     //if (newValue && newValue !== oldValue) {
	//         $state.go($state.current.name, { sort: $scope.sorting.field });
	//     //}
	// });

	$scope.sortingList = [
	{
		title: 'due',
		value: 'due'
	}, {
		title: 'project',
		value: 'project.title'
	}, {
		title: 'title',
		value: 'title'
	}, {
		title: 'status',
		value: 'status'
	}, {
		title: 'created',
		value: 'created'
	}
	];

	if(context.entityName != "all"){
            $scope.sortingList.push({
                title: 'custom',
                value: 'custom'
            });
        };

	function navigateToDetails(task) {
		$scope.detailsState = context.entityName === 'all' ? 'main.tasks.all.details' : 'main.tasks.byentity.details';

		$state.go($scope.detailsState, {
			id: task._id,
			entity: $scope.currentContext.entityName,
			entityId: $scope.currentContext.entityId,
		});
	}

	$scope.toggleStarred = function () {
		$state.go($state.current.name, { starred: !$stateParams.starred });
	};

	$scope.print = function() {
		$window.print()
	}
	if ($scope.tasks.length) {
		if ($state.current.name === 'main.tasks.all' ||
			$state.current.name === 'main.tasks.byentity') {
			navigateToDetails($scope.tasks[0]);
	}
	} else if (
		$state.current.name !== 'main.tasks.byentity.activities'
				&& $state.current.name !== 'main.tasks.byentity.tasks'
				&& $state.current.name !== 'main.tasks.all'
				&& $state.current.name !== 'main.tasks.byentity.details.activities'
				&& $state.current.name !== 'main.tasks.byassign.details.activities'
				) {
		$state.go('.activities');
	}
});
