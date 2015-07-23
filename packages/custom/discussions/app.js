'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Discussions = new Module('discussions');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Discussions.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Discussions.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Discussions.menus.add({
    title: 'discussions example page',
    link: 'discussions example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Discussions.aggregateAsset('css', 'discussions.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Discussions.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Discussions.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Discussions.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Discussions;
});
