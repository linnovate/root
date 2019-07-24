"use strict";

/*
 * Defining the Package
 */
var Module = require("meanio").Module;

var MediumEditor = new Module("medium-editor");

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MediumEditor.register(function(app, auth, database) {
  //We enable routing. By default the Package Object is passed to the routes
  MediumEditor.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  MediumEditor.menus.add({
    title: "mediumEditor example page",
    link: "mediumEditor example page",
    roles: ["authenticated"],
    menu: "main"
  });

  MediumEditor.aggregateAsset(
    "js",
    "../lib/angular-contenteditable/angular-contenteditable.js"
  );
  MediumEditor.aggregateAsset(
    "js",
    "../lib/medium-editor/dist/js/medium-editor.min.js"
  );
  MediumEditor.aggregateAsset(
    "js",
    "../lib/angular-medium-editor/dist/angular-medium-editor.js"
  );
  MediumEditor.aggregateAsset(
    "css",
    "../lib/medium-editor/dist/css/medium-editor.css"
  );
  MediumEditor.aggregateAsset(
    "css",
    "../lib/medium-editor/dist/css/themes/bootstrap.css"
  );

  MediumEditor.angularDependencies([
    "contenteditable",
    "angular-medium-editor"
  ]);

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    MediumEditor.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    MediumEditor.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    MediumEditor.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return MediumEditor;
});
