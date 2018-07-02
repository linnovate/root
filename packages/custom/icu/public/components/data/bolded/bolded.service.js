'use strict';

angular.module('mean.icu.data.boldedservice', [])
  .service('BoldedService', function (ApiUri, $http) {
    let EntityPrefix = '/bolded';
    let me = UsersService.getMe().$$state.value;

    function boldedUpdate(entity, entityType, action){
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

    function addBolded(entity, user){
      user = user || me;

      let newBolded = {
        id: user._id,
        bolded: false,
        lastViewed: Date.now()
      }
      entity.bolded.push(newBolded);

      return entity;
    }

    function removeBolded(entity, user){
      let removedIndex;
      entity.bolded.find((bolded, index)=>{
        if(bolded.id === user._id){
          removedIndex = index;
          return true;
        }
      });

      entity.bolded.splice(removedIndex, 1);
      return entity;
    }

    return {
      boldedUpdate: boldedUpdate,
      addBolded: addBolded,
      removeBolded: removeBolded,
    };
  });
