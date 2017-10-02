'use strict';
angular.module('mean.icu.ui.modaldeletetasksbyentity', [])
    .directive('icuOpenModal', function ($state, $uibModal, OfficeDocumentsService, TemplateDocsService ) {

        function link(scope, elem, attrs) {
            elem.bind('click', function() {

                if($state.current.name.indexOf('main.tasks.byentity') != -1 && scope.entityName != 'Document')
                   scope.showModal --;

                if(scope.showModal) {
                    buildModal();
                } else {
                  scope.deleteFn();
                }
            });

            function buildModal() {
                if(scope.send && scope.entityName == "officeDocument"){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size:  'lg',
                        templateUrl: '/icu/components/modal-directive/sendDocument.html',
                        controller: controllerDocument,
                        resolve: {
                            officeDocument: function () {
                                return scope.data;
                            },
                            people:function () {
                                return scope.people;
                            }
                        }
                    
                    }); 

                } else if(scope.modalName == 'template' && scope.entityName == "officeDocument"){
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size:  'lg',
                        templateUrl: '/icu/components/modal-directive/templateModal/template.html',
                        controller: controllerTemplate,
                        resolve: {
                            templates: function () {
                                if(scope.data.folder == undefined){
                                  return [];                                                                     
                                }else{
                                    return TemplateDocsService.getTemplatesByFolder(scope.data.folder);
                                } 
                            }
                        }
                    
                    }); 
                }else {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: '/icu/components/modal-directive/modal.html',
                    controller: controller,
                    resolve: {
                        entity: function () {
                            return scope.entityName;
                        }
                    }
                
                });
            }

                modalInstance.result.then(function () {
                    scope.deleteFn();
                }, function () {
                    console.log('Modal dismissed');
                });
            }
        };

        return {
            restrict: 'A',
            scope: {
                showModal: '=',
                deleteFn: '&',
                entityName: '@',
                send: '=',
                sendDocument: '&',
                data: '=',
                people: "=",
                modalName: '@'
            },
            link: link
        };
    });

function controller($scope, $uibModalInstance, $filter, entity) {
    $scope.entity = {type: entity};

    $scope.ok = function () {
        if($scope.entity.textDelete && $scope.entity.textDelete == $filter('i18next')('DELETE'))
            $uibModalInstance.close();
        else
            $scope.cancel();

    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}

function controllerDocument($scope, $uibModalInstance, $filter, officeDocument, people, OfficeDocumentsService) {
    
    $scope.officeDocument = officeDocument;
    $scope.people = people;

    $scope.classificationList = ['Unclassified','Private','Secret','Top Secret' ]; 

    $scope.ok = function (sendingForm) {
        
        OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument)    
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}


// function controllerTemplate($scope, $uibModalInstance, $filter) {
    
    
//         $scope.ok = function (sendingForm) {
            
//            // OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument)    
//         };
    
//         $scope.cancel = function () {
//             $uibModalInstance.dismiss('cancel');
//         };
// }
