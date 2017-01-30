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







var child_process = require('child_process');

gulp.task('e2e', ['server', 'webdriver_update'], function(done) {

  var protractor = child_process.spawn('node_modules/.bin/protractor', ['test/e2e/config.js'], {
    stdio: [0,0,0]
  })

  protractor.on('exit', function (code) {
    done()
    process.exit(code)
  })

})

gulp.task('server', function(done) {
  // require('../server.js');

  var success = 'Mean app started on port 3002';

  var server = child_process.spawn('node', ['server'], {
    stdio: [0,'pipe',0]
  });

  // indicate whether server is running
  server.stdout.on('data', function(data) {
    data = data.toString();
    if(data.match(success)) {
      console.log(success)
      done()
    }
  })

  // kill the server on exit
  function onExit() {
    server.kill()
  }
  process.on('exit', onExit)
  process.on('beforeExit', onExit)
  process.on('uncaughtException', onExit)
})

gulp.task('webdriver_update', protractor.webdriver_update);

gulp.task('test', defaultTasks);
