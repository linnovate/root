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
                if(scope.modalName == 'receive' && scope.entityName == "officeDocument") { 
//                    console.log("buildModal receive", scope) ;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size:  'md',
                        templateUrl: '/icu/components/modal-directive/receiveModal.html',
                        controller: dragCtrl,
                        resolve: {
                            officeDocument: function () {
                                return scope.data;
                            },
                            people:function () {
                                return scope.people;
                            }
                        }
                    }); 
                }
                else if(scope.modalName == 'distributed' && scope.entityName == "officeDocument") { 
//                    console.log("buildModal distributed", scope) ;
                    var modalInstance = $uibModal.open({
                        animation: true,
                        size:  'md',
                        templateUrl: '/icu/components/modal-directive/distributedModal.html',
                        controller: distributedCtrl,
                        resolve: {
                            officeDocument: function () {
                                return scope.data;
                            },
                            people:function () {
                                return scope.people;
                            }
                        }
                    }); 
                }

                else if(scope.send && scope.entityName == "officeDocument"){
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

                } 
                else if(scope.modalName == 'template' && scope.entityName == "officeDocument"){
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
                            },
                            officeDocument: function(){
                                return scope.data;
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

function controllerDocument($scope, $state,$uibModalInstance, $filter, officeDocument, people, OfficeDocumentsService) {
      
    $scope.officeDocument = officeDocument;
    $scope.people = people;

    $scope.classificationList = ['unclassified','private','secret','topSecret' ]; 

    $scope.ok = function (sendingForm) {
        OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument).then(function(result){
            console.log("===RETURNED===");
           debugger;
            console.dir(result);
           // Object.keys(result).forEach(function(key){
            //    $scope.officeDocument[key]=result[key];
           // });
           $state.reload();
            $scope.cancel();
            
        });  
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };
}


function dragCtrl($scope, $state,$uibModalInstance, $filter, officeDocument, people, OfficeDocumentsService) {
    console.log("dragCtrl") ;
    $scope.officeDocument = officeDocument;
    $scope.dragOptions = {
        start: function(e) {
//          console.log("STARTING");
        },
        drag: function(e) {
//          console.log("DRAGGING");
        },
        stop: function(e) {
//          console.log("STOPPING");
        },
        receive: function(e) {
            console.log("RECEIVED", e);
//            $scope.receiveStatus = "received" ;
//            console.log("OfficeDocumentsService.receiveDocument") ;

            OfficeDocumentsService.receiveDocument($scope.officeDocument) ;
        },
        container: 'dragcontainer'
    }
    $scope.ok = function (sendingForm) {
            // console.log("===RETURNED===");
            // console.log($scope.receiveStatus);            
            $scope.cancel();            
    };    
    $scope.cancel = function () {
        $state.reload();
        $uibModalInstance.dismiss('cancel');
    };
}


function distributedCtrl($scope, $state,$uibModalInstance, $filter, officeDocument, people, OfficeDocumentsService) {
    if(officeDocument.readBy && officeDocument.readBy.length) {
    OfficeDocumentsService.readByDocument(officeDocument).then(function(res) {         
        let resWithDate = res.map(r => { 
            let currentReadBy = officeDocument.readBy.filter(rb => rb.user == r._id) ;
            return Object.assign({date: currentReadBy[0].date}, r) ;
         } )
        // add the read date as it appears on the doc.
        $scope.readBy  = resWithDate ;
    }) ;
    }
    else {
        $scope.readBy = [] ;
    }
    $scope.officeDocument = officeDocument;
    $scope.dragOptions = {
        start: function(e) {
//          console.log("STARTING");
        },
        drag: function(e) {
//          console.log("DRAGGING");
        },
        stop: function(e) {
//          console.log("STOPPING");
        },
        receive: function(e) {
//            console.log("RECEIVED", e);
//            $scope.receiveStatus = "received" ;
//            console.log("OfficeDocumentsService.distributedDocument") ;

            OfficeDocumentsService.distributedDocument($scope.officeDocument) ;
        },
        container: 'dragcontainer'
    }
    $scope.ok = function (sendingForm) {
            // console.log("===RETURNED===");
            // console.log($scope.receiveStatus);            
            $scope.cancel();            
    };    
    $scope.cancel = function () {
        $state.reload();
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
