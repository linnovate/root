'use strict';

angular.module('mean.icu.ui.documentlist', [])
    .controller('DocumentListController', function ($scope,
                                                   $state,
                                                  documents,
                                                   //DocumentsService,
                                                   context,
                                                   $filter,
                                                   $stateParams) {
        $scope.documents = documents;

    });
