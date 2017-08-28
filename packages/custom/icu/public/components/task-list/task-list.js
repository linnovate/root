'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $state, tasks, DiscussionsService,TasksService, ProjectsService, context,$timeout, $filter, $stateParams) {
	$scope.tasks = tasks.data || tasks;
	//TasksService.data = $scope.tasks;
	$scope.loadNext = tasks.next;
	$scope.loadPrev = tasks.prev;

	$scope.autocomplete = context.entityName === 'discussion';
	$scope.starred = $stateParams.starred;

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
