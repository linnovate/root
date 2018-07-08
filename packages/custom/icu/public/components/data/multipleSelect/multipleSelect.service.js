'use strict';

angular.module('mean.icu.data.multipleselectservice', [])
  .service('MultipleSelectService', function(ApiUri, $http, $stateParams, $rootScope,
                                          NotifyingService, OfficesService, UsersService, PermissionsService
  ) {
    var EntityPrefix = '/bulk-operations';
    var me = UsersService.getMe().$$state.value;

    function getUserPerms(entity, user){
      user = user || me;
      return _.find(entity.permissions, {'id': user._id});
    }

    return {
      getUserPerms: getUserPerms,
    };
  });
