'use strict';

angular.module('mean.icu.data.boldedservice', [])
  .service('BoldedService', function (ApiUri, $http, UsersService) {
    let EntityPrefix = '/bolded';
    let me;
    UsersService.getMe().then(function(result) {
        me = result;
    });

    function boldedUpdate(entity, entityType, action){
      if(!entity._id){
        console.log('No entity ID');
        return;
      }
      let boldedObject = {
        entity_id: entity._id,
        user_id: me._id,
        entity_type: entityType,
        action: action,
      };
      return $http.post(ApiUri + EntityPrefix, boldedObject)
        .then(function (result) {
          return result.data;
        });
    }

    function getBoldedClass(entity, entityType){
      if(!entity)return;
      if(!entity.bolded){
        entity.bolded = [];
        boldedUpdate(entity, entityType, 'updated')
      }
      let bolded = entity.bolded.find((item)=>{return item.id === me._id});

      if(bolded && bolded.bolded){
        return 'bolded';
      } else {
        return 'bold-disabled';
      }
    }

    return {
      boldedUpdate: boldedUpdate,
      getBoldedClass: getBoldedClass,
    };
  });
