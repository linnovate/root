'use strict';

angular.module('mean.icu.ui.tasklist', [])
.controller('TaskListController', function ($scope, $state, tasks, TasksService, context,$timeout, $filter, $stateParams) {
    $scope.tasks = tasks.data || tasks;
    TasksService.data = $scope.tasks;
    $scope.loadNext = tasks.next;
    $scope.loadPrev = tasks.prev;

    $scope.autocomplete = context.entityName === 'discussion';
    $scope.starred = $stateParams.starred;
    
    function init() {
        if(context.entity)
      	if(!context.entity.parent) {
	        if(context.entity.project ){
	            $scope.parentState = 'byentity';
	            $scope.parentEntity ='project' ;
	            $scope.parentEntityId = context.entity.project._id;
	            $scope.parentId=context.entity.id ;
	        }
	        else if(context.entity.discussions ){
	           $scope.parentState = 'byentity';
	           $scope.parentEntity= 'discussion';
	           $scope.parentEntityId = context.entity.discussions[0]._id ;
	           $scope.parentId = context.entity.id;
	       }
	   	} 
	   	else {
		    $scope.parentState = 'byparent';
		    $scope.parentEntity = 'task';
		    $scope.parentEntityId = context.entity.parent;
		    $scope.parentId = context.entity.id;
	   	}
	}

	$timeout(function() {
 		init();
	}, 500);

	$scope.goToParent = function() {
	    $state.go('main.tasks.'+$scope.parentState+'.details',{entity:$scope.parentEntity,entityId:$scope.parentEntityId,id:$scope.parentId})
	}

	$scope.isCurrentState = function(id) {
	    return $state.current.name === id;
	};

	$scope.changeOrder = function () {
	    $scope.sorting.isReverse = !$scope.sorting.isReverse;
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
    $state.current.name !== 'main.tasks.byentity.activities' &&
            //$state.current.name !== 'main.tasks.byentity.tasks') {
                $state.current.name !== 'main.tasks.byentity.details.activities') {
    $state.go('.activities');
}
});
