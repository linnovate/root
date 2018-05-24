'use strict';

angular.module('mean.icu.ui.attachmentdetails', [])
    .controller('AttachmentDetailsController', function ($scope,
                                                        $http,
                                                         entity,
                                                         tasks,
                                                         context,
                                                         $state,
                                                         AttachmentsService,
                                                         DocumentsService,
                                                         UsersService,
                                                         EntityService,
                                                         $stateParams) {
        $scope.update = entity || context.entity;
        $scope.tasks = tasks;
        $scope.shouldAutofocus = !$stateParams.nameFocused;
        $scope.attachment = entity ;
        let attachment = $scope.attachment ;         
        
        $scope.attName =  attachment.name ;
        $scope.attCreated =  attachment.created ; 
        $scope.attSize =  attachment.size ;
        $scope.attCreator = null ; 
        $scope.attUser ; 
        UsersService.getById(attachment.creator).then(user => $scope.attUser = user) ;
        $scope.attPath =  attachment.path ;  
        $scope.attPrint =  attachment.size ;
        $scope.attType =  attachment.attachmentType;
        $scope.attLinkToEntityName ;
        EntityService.getByEntityId(attachment.entity,attachment.entityId).then(res => $scope.attLinkToEntityName = res) ;

        

        $scope.attLinkToEntity = '/' + attachment.entity + '/all/' + attachment.entityId + '/documents';


        $scope.$watchGroup(['update.description', 'update.title'], function (nVal, oVal) {
            if (nVal !== oVal && oVal) {
                $scope.delayedUpdate($scope.update);
            }
        });

        $scope.options = {
            theme: 'bootstrap',
            buttons: ['bold', 'italic', 'underline', 'anchor', 'quote', 'orderedlist', 'unorderedlist']
        };

        function navigateToDetails(update) {
            $scope.detailsState = 'main.search.update';

            $state.go($scope.detailsState, {
                id: update._id,
                entity: $scope.currentContext.entityName,
                entityId: $scope.currentContext.entityId,
                starred: $stateParams.starred
            }, {reload: true});
        }

        $scope.viewAttachment = function (document1) { 
                        return(document1.path + '?view=true') ;      
        }

        $scope.previewTab = function(document) {
            AttachmentsService.previewTab(document) ;
        }       

        $scope.deleteUpdate = function (update) {
            DocumentsService.remove(update._id).then(function () {
                $state.reload();
            });
        };

        $scope.update = function (update) {
            DocumentsService.update(update);
        };

        $scope.delayedUpdate = _.debounce($scope.update, 500);

        if ($scope.update && $state.current.name === 'main.search.update') {
            $state.go('.versions');
        }
    });
