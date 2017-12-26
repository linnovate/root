'use strict';

angular.module('mean.icu.ui.mainpane', [])
.directive('icuMainpane', function () {
    function controller() {

    }

    return {
        restrict: 'A',
        controller: controller,
        templateUrl: '/icu/components/mainpane/mainpane.html',
        link: function() {

        }
    };
});

// function SearchController($scope, $state, $stateParams, context, TasksService, $timeout, SearchService, $document) {
//     $scope.$on('$stateChangeSuccess', function ($event, toState) {
//         if (toState.name.indexOf('main.search') !== 0) {
//             if ($stateParams.query && $stateParams.query.length) {
//                 $scope.term = $stateParams.query;
//             } else {
//                 $scope.term = '';
//             }
//         }
//     });

// function onDocumentClick() {
//         // check for flag
//         if(angular.element('#build-in-search').css('display') == 'block')
//         {
//             angular.element('#build-in-search').css('display', 'none');
//         }
//         else{
//             angular.element('#build-in-search').css('display', 'block');
//         }
//     }

//     $document.on("click", onDocumentClick);

//     $scope.clearSearch = function () {
//         $scope.term = '';
//         $scope.search();
//     };

//     $scope.search = function (term) {
//         SearchService.builtInSearchArray = false;
//         if (term && term.length) {
//             $state.go('main.search', {query: term});
//         } else {
//             //$state.go('main.tasks.all');
//         }
//     };

//     $scope.builtInSearch = function(funcName) {
//         $document.on("click", onDocumentClick);
//     	TasksService[funcName]().then(function(res){
//     		SearchService.builtInSearchArray = res;
//     		$state.go('main.search', {query: ''}, {reload: true});
//     	});
//     }

//     // $scope.blur = function(){
//     // 	$timeout(function() {
//     // 		$scope.click = false;
//     // 	}, 1000);
//     // }
// }

// angular.module('mean.icu.ui.search', [])
//     .controller('SearchController', SearchController);

// function MainpaneController() {
// }

// angular.module('mean.icu.ui.mainpane')
//     .controller('MainpaneController', MainpaneController);
