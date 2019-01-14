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
    function load(key) {
      return JSON.parse($window.localStorage.getItem(key));
    }

    return {
      save,
      load,
    };
  });
