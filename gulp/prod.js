'use strict';

var _ = require('lodash');
var config = require('../config/env/all.js');
var languages = config.languages;
var languageCode = config.currentLanguage;
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");
var forever = require('forever-monitor');

var currentLanguage = _(languages).find(function(language) {
  return language.name === languageCode;
});

var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  through = require('through'),
  gutil = require('gulp-util'),
  plugins = gulpLoadPlugins(),
  paths = {
    js: ['*.js', 'packages/*/*/public/**/*.js', 'test/**/*.js', '!test/coverage/**', '!bower_components/**', '!packages/**/node_modules/**', '!packages/contrib/**/*.js', '!packages/contrib/**/node_modules/**', '!packages/core/**/*.js', '!packages/core/public/assets/lib/**/*.js'],
    public: ['packages/*/*/public/**/*.*', '!**/test/**', '!**/*.sass', '!**/*.less', 'node_modules/babel-polyfill/dist/polyfill.min.js'],
    bower: ['bower_components/**/*.*'],
    babel: [
      'packages/*/*/public/**/*.js',
      '!**/test/**',
      '!**/bower_components/**',
      '!**/node_modules/**',
      '!**/assets/**',
      '!**/socket.io.js',
    ],
    html: ['packages/**/public/**/views/**', 'packages/**/server/views/**'],
    css: ['!bower_components/**', 'packages/**/public/**/css/*.css', '!packages/contrib/**/public/**/css/*.css', '!packages/core/**/public/**/css/*.css'],
    less: ['packages/*/*/public/**/less/**/*.less', '!**/lib/**'],
    sass: ['packages/*/*/public/**/css/*.scss']
  };

function fixPath() {
  return rename(function (path) {
    path.extname === '.css' || path.extname === '.sass' && console.log(path);
    path.dirname = path.dirname.replace(/(core|custom)\//, '').replace('/public', '');
  });
}

gulp.task('sass', function() {
  return gulp.src(paths.sass)
    .pipe(plugins.sass())
    .pipe(currentLanguage.direction === 'rtl' ? plugins.rtlcss({
      clean: false
    }) : gutil.noop())
    .pipe(gulp.dest(function (vinylFile) {
      return vinylFile.cwd + '/packages';
    }));
});

gulp.task('less', function() {
  return gulp.src(paths.less)
    .pipe(plugins.less())
    .pipe(gulp.dest(function (vinylFile) {
      return vinylFile.cwd + '/packages';
    }));
});

gulp.task('dist:public', function() {
  return gulp.src(paths.public)
    .pipe(fixPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:css', function() {
  return gulp.src(paths.css)
    .pipe(fixPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:bower', function() {
  return gulp.src(paths.bower)
    .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('babel', function () {
  return gulp.src(paths.babel)
    .pipe(babel({
      presets: [['env', {
        targets: {
          browsers: ['chrome >= 44']
        }
      }]]
    }))
    .pipe(fixPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('cssmin', function () {
  console.log('in cssmin');
  var config = tokenizeConfig(assets.core.css);

  if (config.srcGlob.length) {
    return gulp.src(config.srcGlob)
      .pipe(plugins.cssmin({keepBreaks: true}))
      .pipe(plugins.concat(config.destFile))
      .pipe(gulp.dest(path.join('bower_components/build', config.destDir)));
  }
});

gulp.task('uglify', function () {
  console.log('in uglify');
  var config = tokenizeConfig(assets.core.js);

  if (config.srcGlob.length) {
    return gulp.src(config.srcGlob)
      .pipe(plugins.concat(config.destFile))
      .pipe(plugins.uglify({mangle: false}))
      .pipe(gulp.dest(path.join('bower_components/build', config.destDir)));
  }
});

function tokenizeConfig(config) {
  var destTokens = _.keys(config)[0].split('/');

  return {
    srcGlob: _.flatten(_.values(config)),
    destDir: destTokens[destTokens.length - 2],
    destFile: destTokens[destTokens.length - 1]
  };
}

gulp.task('forever:server', function () {
  // plugins.nodemon({
  //   script: 'server.js',
  //   env: { 'NODE_ENV': 'production' },
  //   ignore: ['**/*']
  // });
  var child = new (forever.Monitor)('server.js', {
    watch: false,
    env: {
      NODE_ENV: 'development'/*'production'*/, // since meanio internal uglify errors
    }
  });

  child.on('restart', function() {
    console.error('Server restarting ' + child.times + ' time');
  });

  child.on('exit', function () {
    console.log('Server was stopped');
  });

  child.start();
});

gulp.task('prod', function(callback) {
  runSequence(
    'clean',
    ['less', 'sass'],
    ['dist:public', 'dist:bower'],
    'babel',
    'forever:server',
    callback
  );
});