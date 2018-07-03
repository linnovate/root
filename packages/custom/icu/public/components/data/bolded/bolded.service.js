'use strict';

angular.module('mean.icu.data.boldedservice', [])
  .service('BoldedService', function (ApiUri, $http, UsersService) {
    let EntityPrefix = '/bolded';
    let me;
    UsersService.getMe().then(function(result) {
        me = result;
    });

    function boldedUpdate(entity, entityType, action){
      let boldedObject = {
        entity_id: entity._id,
        user_id: me._id,
        entity_type: entityType,
        action: action,
      };
      console.log(boldedObject);
      return $http.post(ApiUri + EntityPrefix, boldedObject)
        .then(function (result) {

          return result.data;
        });
    }

    return {
      boldedUpdate: boldedUpdate,
    };
  });
