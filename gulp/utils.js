var gulp = require('gulp');
var del = require('del');

gulp.task('clean', function (cb) {
  return del([
    'dist',
    'packages/custom/icu/public/assets/css/styles.css' // produced by task 'sass'
  ], cb);
});

gulp.task('mongoExpress', function () {
  console.log("Staring mongoExpress... http://localhost:3017/")

  var child_process = require('child_process');
  process.chdir('node_modules/mongo-express');

  var server = child_process.spawn('node', ['app.js','-a', '-U', 'mongodb://localhost:27017', '--port', '3017'], {
    stdio: [0,'pipe',0]
  });
});
