'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Hi = new Module('hi');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Hi.register(function(app, auth, database, swagger) {

  //We enable routing. By default the Package Object is passed to the routes
  Hi.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  //Notifications.menus.add({
  //  title: 'notifications example page',
  //  link: 'notifications example page',
  //  roles: ['authenticated'],
  //  menu: 'main'
  //});

  Hi.aggregateAsset('css', 'notifications.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Notifications.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Notifications.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Notifications.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  //swagger.add(__dirname);

  return Hi;
});
