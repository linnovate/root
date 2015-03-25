'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var General = new Module('general');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
General.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  General.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  General.menus.add({
    title: 'general example page',
    link: 'general example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  General.aggregateAsset('css', 'general.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    General.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    General.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    General.settings(function(err, settings) {
        //you now have the settings object
    });
    */

	//class someClass {
	//	constructor(name, age) {
	//		this.name = name;
	//		this.age = age;
	//	}
	//
	//	sayName() {
	//		console.log('some class ' + this.name);
	//	}
	//}
	//
	//class Child extends someClass {
	//	constructor(name, age) {
	//		super(name, age);
	//	}
	//
	//	// Override the someClass method above
	//	sayName() {
	//		// This will call someClass.sayName() triggering the old alert
	//		// Which will just display our name
	//		super();
	//
	//		// This will trigger the new alert which has labels and our age
	//		console.log('Name:' + this.name + ' Age:' + this.age);
	//	}
	//}
	//
	//var myChild = new Child('dwayne', 27);
	//myChild.sayName();

  return General;
});
