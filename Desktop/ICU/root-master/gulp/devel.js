'use strict';

var gulp = require('gulp'),
    through = require('through'),
    chalk = require('chalk'),
    gulpLoadPlugins = require('gulp-load-plugins');
var del = require('del');
var plugins = gulpLoadPlugins();
var paths = {
    js: ['*.js', 'test/**/*.js', '!test/coverage/**', '!bower_components/**', 'packages/**/*.js', '!packages/**/node_modules/**', '!packages/contrib/**/*.js', '!packages/contrib/**/node_modules/**'],
    html: ['packages/**/public/**/views/**', 'packages/**/server/views/**'],
    css: ['!bower_components/**', 'packages/**/public/**/css/*.css', '!packages/contrib/**/public/**/css/*.css'],
    less: ['**/public/**/css/*.less'],
    sass: ['**/public/**/css/*.scss']
};

var defaultTasks = ['clean', 'jshint', 'sass', 'csslint','develop','watch'];

gulp.task('clean', function (cb) {
  return del(['bower_components/build'], cb);
});

gulp.task('jshint', function () {
  return gulp.src(paths.js)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(count('jshint', 'files lint free'));
});

gulp.task('sass', function () {
  return gulp.src(paths.sass)
    .pipe(plugins.sass().on('error', console.log))
    .pipe(gulp.dest('.'));
});

gulp.task('csslint', function () {
  return gulp.src(paths.css)
    .pipe(plugins.csslint('.csslintrc'))
    .pipe(plugins.csslint.reporter())
    .pipe(count('csslint', 'files lint free'));
});

gulp.task('develop', ['env:develop'], function () {
  plugins.nodemon({
    script: 'server.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'development' } ,
    ignore: ['node_modules/'],
    execMap : { "js": "iojs --harmony "},
    nodeArgs: ['--debug']
  });

  gulp.start('frontend');
});

gulp.task('watch', function () {
  gulp.watch(paths.js, ['jshint']).on('change', plugins.livereload.changed);
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  gulp.watch(paths.css, ['csslint']).on('change', plugins.livereload.changed);
  gulp.watch(paths.sass, ['sass']).on('change', plugins.livereload.changed);
  gulp.watch(paths.less, ['less']).on('change', plugins.livereload.changed);

  plugins.livereload.listen({interval: 500});
});

gulp.task('frontend', defaultTasks);

function count(taskName, message) {
  var fileCount = 0;

  function countFiles(file) {
    fileCount++; // jshint ignore:line
  }

  function endStream() {
    console.log(chalk.cyan(taskName + ': ' + fileCount + ' ' + message || 'files processed.'));
    this.emit('end'); // jshint ignore:line
  }

  return through(countFiles, endStream);
}
