'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Icapi = new Module('icapi');

Icapi.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Icapi.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Icapi.menus.add({
    title: 'icapi example page',
    link: 'icapi example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Icapi.aggregateAsset('css', 'icapi.css');

  return Icapi;
});
