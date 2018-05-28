'use strict';

const gulp = require('gulp');
const runSequence = require('run-sequence');

require('require-dir')('./gulp');

gulp.task('default', ['development']);

gulp.task('development', function(callback) {
  process.env.NODE_ENV = 'development';
  runSequence(
    'clean',
    'watch',
    'sass',
    ['dist:css', 'dist:public', 'dist:bower', 'babel'],
    'devServe',
    callback
  );
});
