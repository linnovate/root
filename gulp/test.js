const gulp = require('gulp');
const child_process = require('child_process');

var server;

gulp.task('webdriver-update', function(done) {
  child_process.spawn(require.resolve('protractor/bin/webdriver-manager'), ['update', '--standalone'], {
    stdio: 'inherit'
  }).once('close', done);
});

gulp.task('test-server', function(done) {
  if(process.env.ROOT_URL) return done(); // we test a running server, no need to start locally

  server = child_process.spawn('node', ['server'], {
    stdio: ['ignore','pipe','inherit']
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

gulp.task('test', gulp.series('webdriver-update', 'test-server', 'e2e', () => {server && server.kill()}))
