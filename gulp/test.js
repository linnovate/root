const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const runSequence = require('run-sequence');
const child_process = require('child_process');
const plugins = gulpLoadPlugins();

var server;

gulp.task('webdriver-update', function(done) {
  child_process.spawn(require.resolve('protractor/bin/webdriver-manager'), ['update', '--standalone'], {
    stdio: 'inherit'
  }).once('close', done);
});

gulp.task('test-server', function(done) {
  server = child_process.spawn('node', ['server'], {
    stdio: ['ignore','pipe','ignore']
  });

  // indicate whether server is running
  server.stdout.on('data', function(data) {
    data = data.toString();
    if(data.match('Mean app started on port')) {
      done()
    }
  })
})

gulp.task('e2e', function(done) {
  child_process.spawn(require.resolve('protractor/bin/protractor'), ['test/e2e/config'], {
    stdio: 'inherit'
  }).once('close', done);
})

gulp.task('test', function(done) {
  runSequence(
    'webdriver-update',
    'test-server',
    'e2e',
    function() {
      server.kill()
      done()
    }
  );
});
