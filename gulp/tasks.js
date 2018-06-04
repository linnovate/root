'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const runSequence = require('run-sequence');

const { languages, currentLanguage } = require('../config/env/all.js');
const language = languages.find(function(language) {
  return language.name === currentLanguage;
});

const paths = {
  public: [
    'packages/*/*/public/**/*.!(md|scss|less)',
    'node_modules/babel-polyfill/dist/polyfill.min.js'
  ],
  bower: 'bower_components/**/*.*',
  babel: 'packages/custom/*/public/!(assets)/**/!(socket.io).js',
  html: [
    'packages/*/*/public/**/*.html',
    'packages/*/*/server/views/**'
  ],
  css:  'packages/custom/*/public/assets/{css,lib/**}/*.css',
  sass: 'packages/custom/icu/public/assets/css/**/*.scss'
};

function distPath() {
  return plugins.rename(function (path) {
    path.dirname = path.dirname.replace(/(core|custom)\//, '').replace('/public', '');
  });
}



gulp.task('sass', function() {
  return gulp.src(paths.sass, { base: 'packages/' })
    .pipe(plugins.sass())
    .pipe(language.direction === 'rtl' ? plugins.rtlcss({
      clean: false
    }) : plugins.util.noop())
    .pipe(gulp.dest('packages/'));
});

gulp.task('dist:public', function() {
  return gulp.src(paths.public)
    .pipe(distPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:css', function() {
  return gulp.src(paths.css)
    .pipe(process.env.NODE_ENV === 'production' ? plugins.cssmin(): plugins.util.noop())
    .pipe(distPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('dist:bower', function() {
  return gulp.src(paths.bower)
    .pipe(gulp.dest('dist/bower_components/'));
});

gulp.task('babel', function () {
  return gulp.src(paths.babel)
    .pipe(plugins.babel({
      presets: [['env', {
        targets: {
          browsers: ['chrome >= 44']
        }
      }]]
    }))
    .pipe(process.env.NODE_ENV === 'production' ? plugins.babelMinify(): plugins.util.noop())
    .pipe(distPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('devServe', function () {
  return plugins.nodemon({
    script: 'server.js',
    ext: 'html js',
    env: { 'NODE_ENV': 'development' } ,
    ignore: ['node_modules/', 'packages/custom/**/public/', 'dist/'],
    nodeArgs: ['--inspect']
  });
});

gulp.task('watch', function () {
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  gulp.watch(paths.babel, ['babel']).on('change', plugins.livereload.changed);
  gulp.watch(paths.sass, ['sass']).on('change', plugins.livereload.changed);
  gulp.watch(paths.css, ['dist:css']).on('change', plugins.livereload.changed);
  plugins.livereload.listen({interval: 500});
});

gulp.task('build', function(callback) {
  runSequence(
    'clean',
    'sass',
    ['dist:css', 'dist:public', 'dist:bower', 'babel'],
    callback
  );
})
