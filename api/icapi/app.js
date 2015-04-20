'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Icapi = new Module('icapi');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
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

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Icapi.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Icapi.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Icapi.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Icapi;
});
