'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;
var config = require('meanio').loadConfig();
var MeanSocket = new Module('mean-socket');
var { socketServer } = require('./server');

function socketHttp(http) {
    socketServer(http)
    return MeanSocket;
}

function socketHttps(https) {
    socketServer(https)
    return MeanSocket;
}

if (config.https && config.https.port) {
    MeanSocket.register(socketHttps);
} else {
    MeanSocket.register(socketHttp);
}
