'use strict';

/*
 * Defining the Package
 */

var Module = require('meanio').Module;

var ICU = new Module('icu');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
ICU.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  ICU.routes(app, auth, database);

  app.set('views', __dirname + '/server/views');

  //We are adding a link to the main menu for all authenticated users
  ICU.menus.add({
    title: 'ICU example page',
    link: 'ICU example page',
    menu: 'main'
  });

  ICU.aggregateAsset('css', 'styles.css');
  ICU.aggregateAsset('js', '../lib/underscore/underscore.js');
  ICU.aggregateAsset('js', '../lib/moment/moment.js');

  ICU.angularDependencies([
      'mean.system',
      'mean.icu.ui.sidepane',
      'mean.icu.ui.middlepane',
      'mean.icu.ui.detailspane',
      'mean.icu.ui.userlist',
      'mean.icu.ui.userdetails',
      'mean.icu.ui.tasklist',
      'mean.icu.ui.taskdetails',
      'mean.icu.ui.taskcreate',
      'mean.icu.ui.notificationsheader',
      'mean.icu.ui.membersfooter',
      'mean.icu.ui.tabs',
      'mean.icu.ui.rows',
      'mean.icu.data.activitiesservice',
      'mean.icu.data.usersservice',
      'mean.icu.data.notificationsservice',
      'mean.icu.data.projectsservice',
      'mean.icu.data.discussionsservice',
      'mean.icu.data.tasksservice',
      'mean.icu.data.constants',
  ]);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    ICU.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    ICU.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    ICU.settings(function(err, settings) {
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

  return ICU;
});
