'use strict';
angular.module('mean.icu.ui.modaldeletetasksbyentity', [])
    .directive('icuOpenModal', function ($state, $uibModal, OfficeDocumentsService, TemplateDocsService ) {

        if( window.config.version !=  localStorage.getItem("icuVersion")){
            $uibModal.open({
                animation: true,
                size:  'lg',
                templateUrl: '/icu/components/modal-directive/whats-new/whats-new.html',
                controller: controllerwhatsNew,
                resolve: {
    
                }
            }); 
        }

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

function controllerDocument($scope, $state,$uibModalInstance, $filter,officeDocument, people, OfficeDocumentsService) {
      
    $scope.officeDocument = officeDocument;
    $scope.people = people;
    // $scope.sendingForm.title = undefined;
    // $scope.sendingForm.sendingAs = undefined;
    // $scope.sendingForm.classification = undefined;

    $scope.classificationList = ['unclassified','private','secret','topSecret' ]; 

    $scope.ok = function (sendingForm) {

        var elem = document.getElementById("message");
        alertify.parent(elem);
        alertify.logPosition("bottom right");
        console.log(sendingForm)
     
        if(sendingForm.classification == undefined || 
            sendingForm.doneBy == undefined ||
            sendingForm.forNotice == undefined){
            alertify.error("נא למלא סיווג לידיעה ולטיפול");
        }else{

            OfficeDocumentsService.sendDocument(sendingForm, $scope.officeDocument).then(function(result){
                console.log("===RETURNED===");
                console.dir(result);
                // Object.keys(result).forEach(function(key){
                    //    $scope.officeDocument[key]=result[key];
                // });
                $state.reload();
                $scope.cancel();
                alertify.reset();
                alertify.logPosition("bottom right");
                alertify.success("המסמך נשלח בהצלחה");
        });  
    }
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
            // $scope.receiveStatus = "received" ;
            OfficeDocumentsService.receiveDocument($scope.officeDocument) ;
        },
        container: 'dragcontainer'
    }
    $scope.ok = function (sendingForm) {
            $scope.cancel();            
    };    
    $scope.cancel = function () {
        $state.reload();
        $uibModalInstance.dismiss('cancel');
    };
}


function distributedCtrl($scope, $state,$uibModalInstance, $filter, officeDocument, people, OfficeDocumentsService) {
    $scope.distributedList = [] ;
    if(officeDocument.sentTo && officeDocument.sentTo.length) {
        OfficeDocumentsService.sentToDocument(officeDocument).then(function(res) {
        // gets the user names, with ids as present in the sentTo field
        let resWithDate = res.map(r => {
            let currentSentTo = officeDocument.readBy.filter(rb => { 
                return rb.user == r._id }) ;

                if(currentSentTo.length) {
                return Object.assign({date: currentSentTo[0].date, received: true}, r) ;
                
            }
            else {
                return Object.assign({received: false}, r) ;
            }
         } )
        // add the read date as it appears on the doc.
        $scope.distributedList  = resWithDate ;        
    }) ;
    }
    else {
        $scope.distributedList = [] ;
    }

    $scope.officeDocument = officeDocument;
    $scope.ok = function (sendingForm) {
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
