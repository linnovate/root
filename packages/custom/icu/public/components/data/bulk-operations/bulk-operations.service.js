'use strict';

angular.module('mean.icu.data.multipleselectservice', [])
    .service('MultipleSelectService', function(ApiUri, $http, $stateParams, $rootScope,
                                            NotifyingService,OfficesService,UsersService
    ) {
        let EntityPrefix = '/bulk';
        let me = UsersService.getMe().$$state.value;
        let selectedItems = [];

        let bulkPermissionsMap = {
            'status' : ['editor'],
            'assign' : ['editor'],
            'watcher' : ['editor'],
            'due' : ['editor'],
            'tag' : ['editor'],
            'delete' : ['editor'],
        };

        let cornerStates = [
            'all',
            'some',
            'none',
        ];

        let cornerState = cornerStates[0];

        function refreshCornerState(itemsLength){
            if(itemsLength === selectedItems.length){
                cornerState = cornerStates[0];
            } else if(itemsLength > selectedItems.length){
                cornerState = cornerStates[1];
            } else {
                cornerState = cornerStates[2];
            }
            return cornerState;
        }

        function getCornerState(){
            return cornerState;
        }

        function changeCornerState(){
            if(cornerState === 'all'){
                cornerState = cornerStates[2];
            } else if(cornerState === 'some' || cornerState === 'none'){
                cornerState = cornerStates[0];
            }
            return cornerState;
        }

        function getSelected(){
            return selectedItems;
        }


        function refreshSelectedList (editedEntity) {
            if(!editedEntity){
                selectedItems = [];
                return;
            }

            let entitySelectedIndex = selectedItems.findIndex((entity)=>{
                return entity._id === editedEntity._id;
            });

            if(entitySelectedIndex === -1){
                selectedItems.push(editedEntity);
            } else {
                selectedItems.splice(entitySelectedIndex, 1);
            }
            return selectedItems;
        }

        function bulkUpdate(bulkObject, entityName) {
            return $http.put(ApiUri + '/' + entityName + EntityPrefix, bulkObject)
                .then(function (result) {
                    return result.data;
                });
        }

        function haveBulkPerms(entitiesArray, type) {
            let havePermissions = entitiesArray.every((entity)=>{
                let userPermissions = entity.permissions.find((permission)=>{
                    return permission.id === me._id;
                });
                return _.includes(bulkPermissionsMap[type], userPermissions.level);
            });

            return havePermissions;
        }

        return {
            bulkUpdate: bulkUpdate,
            haveBulkPerms: haveBulkPerms,
            getSelected: getSelected,
            refreshSelectedList: refreshSelectedList,
            getCornerState: getCornerState,
            refreshCornerState: refreshCornerState,
            changeCornerState: changeCornerState,
        };
    });
