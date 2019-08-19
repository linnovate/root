'use strict';

const gulp = require('gulp');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

require('require-dir')('./gulp');

gulp.task('development', gulp.series('build', 'watch', 'devServe'))

gulp.task('default', gulp.series('development'));
