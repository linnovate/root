'use strict';

angular.module('mean.icu.data.localstorageservice', [])
  .service('LocalStorageService', function($window
  ) {

    function save(key, data){
      let formattedData = data;
      if(typeof data === 'object')formattedData = JSON.stringify(data);

      $window.localStorage.setItem(key, formattedData);
      return data;
    }
    function load(key){

      let data = $window.localStorage.getItem(key);
      if(typeof data === 'object')data = JSON.stringify(data);
      return data;
    }

    return {
      save,
      load,
    };
  });
