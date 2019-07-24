"use strict";

/*
 * Defining the Package
 */
var Module = require("meanio").Module;

var adfs = new Module("adfs");

adfs.register(function(app) {
  adfs.routes(app);

  return adfs;
});
