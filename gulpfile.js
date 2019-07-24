"use strict";

const gulp = require("gulp");
const runSequence = require("run-sequence");

process.env.NODE_ENV = process.env.NODE_ENV || "development";

require("require-dir")("./gulp");

gulp.task("default", ["development"]);

gulp.task("development", function(callback) {
  runSequence("build", "watch", "devServe", callback);
});

gulp.task("production", function(callback) {
  process.env.NODE_ENV = "production";
  gulp.start("build");
});
