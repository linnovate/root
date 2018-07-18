'use strict';

angular.module('mean.icu.data.multipleselectservice', [])
    .service('MultipleSelectService', function (ApiUri, $http, $stateParams, $rootScope,
                                                OfficesService, UsersService
    ) {
        let EntityPrefix = '/bulk';
        let me = UsersService.getMe().$$state.value;
        let selectedItems = [];

        let bulkPermissionsMap = {
            'status': ['editor'],
            'assign': ['editor'],
            'watcher': ['editor'],
            'due': ['editor'],
            'tag': ['editor'],
            'delete': ['editor'],
        };

        let cornerStates = [
            'all',
            'some',
            'none',
        ];

        let cornerState = cornerStates[0];

        function refreshCornerState(itemsLength) {
            if (itemsLength === selectedItems.length && itemsLength !== 0) {
                cornerState = cornerStates[0];
            } else if (itemsLength > selectedItems.length) {
                cornerState = cornerStates[1];
            } else {
                cornerState = cornerStates[2];
            }
            return cornerState;
        }

        function getCornerState() {
            return cornerState;
        }

        function changeCornerState() {
            if (cornerState === 'all') {
                cornerState = cornerStates[2];
            } else if (cornerState === 'some' || cornerState === 'none') {
                cornerState = cornerStates[0];
            }
            return cornerState;
        }

        function getSelected() {
            return selectedItems;
        }


        function refreshSelectedList(editedEntity) {
            if (!editedEntity) {
                return selectedItems = [];
            }

            let entitySelectedIndex = selectedItems.findIndex((entity) => {
                return entity._id === editedEntity._id;
            });

            if (entitySelectedIndex === -1) {
                selectedItems.push(editedEntity);
            } else {
                selectedItems.splice(entitySelectedIndex, 1);
            }
            return selectedItems;
        }

        function changeAllSelectedLIst(newList){
            selectedItems = newList;
        }

        function bulkUpdate(bulkObject, entityName) {
            if(bulkObject.update.delete) {
                return $http.patch(ApiUri + '/' + entityName + EntityPrefix, bulkObject)
                    .then(function (result) {
                        refreshSelectedList();
                        return result.data;
                    });
            }
            return $http.put(ApiUri + '/' + entityName + EntityPrefix, bulkObject)
                .then(function (result) {
                    return result.data;
                });
        }

        function haveBulkPerms(entitiesArray, type) {
            let havePermissions = entitiesArray.every((entity) => {
                let userPermissions = entity.permissions.find((permission) => {
                    return permission.id === me._id;
                });
                return _.includes(bulkPermissionsMap[type], userPermissions.level);
            });

            return havePermissions;
        }

        function getNoneRecycledItems(items){
            return items.filter( item => !item.recycled );
        }

        return {
            bulkUpdate: bulkUpdate,
            haveBulkPerms: haveBulkPerms,
            getSelected: getSelected,
            getCornerState: getCornerState,
            getNoneRecycledItems: getNoneRecycledItems,
            refreshSelectedList: refreshSelectedList,
            refreshCornerState: refreshCornerState,
            changeAllSelectedLIst: changeAllSelectedLIst,
            changeCornerState: changeCornerState
        };
    });
