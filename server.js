'use strict';

/*
var cl = console.log;
console.log = function(){
  console.trace();
  cl.apply(console,arguments);
};
*/

// Requires meanio .
var mean = require('meanio');
var cluster = require('cluster');


// Code to run if we're in the master process or if we are not in debug mode/ running tests

if ((cluster.isMaster) &&
  (process.execArgv.indexOf('--debug') < 0) &&
  (process.env.NODE_ENV!=='test') && (process.env.NODE_ENV!=='development') &&
  (process.execArgv.indexOf('--singleProcess')<0)) {
//if (cluster.isMaster) {

    console.log('for real!');
    // Count the machine's CPUs
    var cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (var i = 0; i < cpuCount; i += 1) {
        console.log ('forking ',i);
        cluster.fork();
    }

    // Listen for dying workers
    cluster.on('exit', function (worker) {
        // Replace the dead worker, we're not sentimental
        console.log('Worker ' + worker.id + ' died :(');
        cluster.fork();

    });

// Code to run if we're in a worker process
} else {

    var workerId = 0;
    if (!cluster.isMaster)
    {
        workerId = cluster.worker.id;
    }
    
    //OHAD 
    var configlate;
    var portlate;  
    //END OHAD
// Creates and serves mean application
    mean.serve({ workerid: workerId /* more options placeholder*/ }, function (app) {
      var config = app.config.clean;
        var port = config.https && config.https.port ? config.https.port : config.http.port;
        console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ') cluster.worker.id:', workerId);
        
        //OHAD 
        //configlate = app.config.clean; 
        //portlate =  configlate.https && configlate.https.port ? configlate.https.port : configlate.http.port;
        //require('./packages/custom/icu/server/middlewares/socket.js')(configlate);
        
        
        
        // var sockets = require('/home/as/Desktop/icu/packages/custom/icu/server/providers/socket.js');
        // var app1 = require('express')();

        // console.log("3003");
        // var server = app1.listen(3003);

        // var io = require('socket.io')(server);


        // //console.log("io");
        // //console.log(JSON.stringify(io));    
        // console.log("sockets");
        // console.log(JSON.stringify(sockets));
        
        // io.on('connection', function(socket) {
        //     socket.emit('user joined', {success: true});
        //     console.log("io success");
        //     socket.on('user joined token', function(data) {
        //         console.log("data");
        //         console.log(JSON.stringify(data));
        //         sockets._new(data, socket);
        //     });
        // });
        
        
        
        //END OHAD
    });
}
