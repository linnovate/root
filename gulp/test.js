var gulp = require('gulp'),
  protractor = require('gulp-protractor'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  Server = require('karma').Server;
var plugins = gulpLoadPlugins();
var defaultTasks = ['e2e'];

gulp.task('karma:unit', function (done) {
  new Server({
    configFile: __dirname + '/../karma.conf.js'
  }, done).start();
});

gulp.task('loadTestSchema', function () {
  require('../server.js');
  require('../node_modules/meanio/lib/core_modules/module/util').preload('../packages/**/server', 'model');
});

gulp.task('mochaTest', ['loadTestSchema'], function () {
  return gulp.src('../packages/**/server/tests/**/*.js', {read: false})
    .pipe(plugins.mocha({
      reporter: 'spec'
    }));
});









gulp.task('e2e', ['webdriver_update', 'server'], function(done) {
  gulp.src('test/test.js')
    .pipe(protractor.protractor({
      configFile: 'test/e2e/config.js'
    })).on('error', function(err) {
      console.log(err)
      done()
      process.exit()
    }).on('end', function() {
      done()
      process.exit()
    })
})

gulp.task('server', function() {
  require('../server.js');
})

gulp.task('webdriver_update', protractor.webdriver_update);

gulp.task('test', defaultTasks);
