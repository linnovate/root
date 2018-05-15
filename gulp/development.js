'use strict';

var _ = require('lodash');
var config = require('../config/env/all.js');
var languages = config.languages;
var languageCode = config.currentLanguage;
var babel = require('gulp-babel');
var runSequence = require('run-sequence');
var rename = require("gulp-rename");

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
    public: ['packages/*/*/public/**/*.*', '!**/test/**', '!**/*.scss', '!**/*.less', 'node_modules/babel-polyfill/dist/polyfill.min.js'],
    bower: ['bower_components/**/*.*'],
    babel: [
      'packages/**/public/**/*.js',
      '!packages/**/bower_components/**',
      '!packages/**/assets/**',
      '!packages/**/node_modules/**',
      '!packages/contrib/**/*.js',
      '!packages/core/**/*.js',
      '!packages/**/socket.io.js',
    ],

//     babel: [
//       'packages/*/*/public/**/*.js',
//       '!packages/**/node_modules/**',
//       '!packages/contrib/**',
//       '!packages/core/**',
//       '!packages/**/bower_components/**',
//       '!packages/**/assets/**',
//       '!**/socket.io.js',
//     ],
    html: ['packages/**/public/**/*.html', 'packages/**/server/views/**'],
    css:  ['!bower_components/**', 'packages/**/public/**/*.css', '!packages/contrib/**/public/**/css/*.css', '!packages/core/**/public/**/css/*.css'],
    less: ['packages/*/*/public/**/less/**/*.less', '!**/lib/**'],
    sass: ['packages/**/public/**/*.scss']
  };

function fixPath() {
  return rename(function (path) {
    path.extname === '.css' || path.extname === '.sass' && console.log(path);
    path.dirname = path.dirname.replace(/(core|custom)\//, '').replace('/public', '');
  });
}

gulp.task('env:development', function () {
  process.env.NODE_ENV = 'development';
});

gulp.task('jshint', function () {
  return gulp.src(paths.js)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    .pipe(plugins.jshint.reporter('fail'))
    .pipe(count('jshint', 'files lint free'));
});

// gulp.task('csslint', function () {
//   return gulp.src(paths.css)
//     .pipe(plugins.csslint('.csslintrc'))
//     .pipe(plugins.csslint.reporter())
//     .pipe(count('csslint', 'files lint free'));
// });

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

gulp.task('devServe', ['env:development'], function () {
  return plugins.nodemon({
    script: 'server.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'development' } ,
    ignore: ['node_modules/', 'packages/custom/**/public/', 'dist/'],
    nodeArgs: ['--debug']
  });
});

// can start server like this
function server() {  
  console.log("Staring server...")
  var success = 'Mean app started on port 3002';
  var fail = 'Mean app failed to start';
  var exited = 'Mean app exited';

  var child_process = require('child_process');
  var server = child_process.spawn('node', ['server'], {
    stdio: [0,'pipe',0]
  });


  // indicate whether server is running
  server.stdout.on('data', function(data) {
    data = data.toString();
      console.log(data)
  })

  server.on('exit', function(code) {
    console.log(fail);
    console.log("code: ", code)
    process.exit(code)
  })


  // kill the server on exit
  function onExit() {
    console.log(exited)
    server.kill()
  }
  process.on('exit', onExit)
  process.on('beforeExit', onExit)
  process.on('uncaughtException', onExit)
  return server ;
} 


gulp.task('quick', function() {
  runSequence(
    ['devServe','quickWatch']
  );
});

gulp.task('quickWatch', function () {
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  gulp.watch(paths.js, ['babel']).on('change', plugins.livereload.changed);
  plugins.livereload.listen({interval: 500});
});


gulp.task('quickServe',function() {
server() ;
}) 



gulp.task('development:watch', function () {
  // gulp.watch(paths.js, ['jshint']).on('change', plugins.livereload.changed);
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  // gulp.watch(paths.css, ['csslint']).on('change', plugins.livereload.changed);
//   gulp.watch(paths.less, ['less']).on('change', plugins.livereload.changed);
  gulp.watch(paths.babel, ['babel']).on('change', plugins.livereload.changed);
  gulp.watch(paths.sass, ['sass']).on('change', plugins.livereload.changed);
  gulp.watch(paths.css, ['dist:css']).on('change', plugins.livereload.changed);
  plugins.livereload.listen({interval: 500});
});

function count(taskName, message) {
  var fileCount = 0;

  function countFiles(file) {
    fileCount++; // jshint ignore:line
  }

  function endStream() {
    gutil.log(gutil.colors.cyan(taskName + ': ') + fileCount + ' ' + message || 'files processed.');
    this.emit('end'); // jshint ignore:line
  }
  return through(countFiles, endStream);
}

gulp.task('development', function(callback) {
  runSequence(
    'clean',
    'sass',
    'dist:css',
    ['dist:public', 'dist:bower'],
    'babel',
    ['devServe', 'development:watch'],
    callback
  );
});
