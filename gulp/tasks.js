'use strict';

const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();
const del = require('del');

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
  babel: 'packages/custom/*/public/{app,components}/**/*.js',
  html: [
    'packages/*/*/public/**/*.html',
    'packages/*/*/server/views/**'
  ],
  css:  'packages/custom/*/public/assets/{css,lib/**,fonts/**}/*.css',
  sass: 'packages/custom/icu/public/assets/css/**/*.scss'
};

function distPath() {
  return plugins.rename(path => {
    path.dirname = path.dirname.replace(/(core|custom)\//, '').replace('/public', '');
  });
}



gulp.task('clean', function() {
  return del('dist')
});

gulp.task('sass', function() {
  return gulp.src(paths.sass, { base: 'packages/' })
    .pipe(plugins.sass())
    .pipe(process.env.NODE_ENV === 'production' ? plugins.cssmin(): plugins.util.noop())
    .pipe(distPath())
    .pipe(plugins.rename({ basename: 'styles-ltr' }))
    .pipe(gulp.dest('dist/'))
    .pipe(plugins.rtlcss({ clean: false }))
    .pipe(plugins.rename({ basename: 'styles-rtl' }))
    .pipe(gulp.dest('dist/'));
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

gulp.task('babel', function() {
  return gulp.src(paths.babel)
    .pipe(plugins.babel({
      presets: [['env', {
        targets: {
          browsers: ['chrome >= 44']
        }
      }]]
    }))
    .pipe(distPath())
    .pipe(gulp.dest('dist/'));
});

gulp.task('devServe', function() {
  return plugins.nodemon({
    script: 'server.js',
    ext: 'html js',
    ignore: ['node_modules/', 'packages/custom/**/public/', 'dist/'],
    nodeArgs: ['--inspect=0.0.0.0']
  });
});

gulp.task('watch', function(cb) {
  gulp.watch(paths.html).on('change', plugins.livereload.changed);
  gulp.watch(paths.babel, gulp.series('babel')).on('change', plugins.livereload.changed);
  gulp.watch(paths.sass, gulp.series('sass')).on('change', plugins.livereload.changed);
  plugins.livereload.listen({interval: 500});
  cb()
});

gulp.task('dist', gulp.parallel('dist:css', 'dist:public', 'dist:bower'))

gulp.task('build', gulp.series('clean', 'sass', 'dist', 'babel'));
