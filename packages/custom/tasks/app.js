'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Tasks = new Module('tasks');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Tasks.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Tasks.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Tasks.menus.add({
    title: 'tasks example page',
    link: 'tasks example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Tasks.aggregateAsset('css', 'tasks.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Tasks.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Tasks.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Tasks.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Tasks;
});
