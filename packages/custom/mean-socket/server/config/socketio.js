'use strict';

var config = require('meanio').loadConfig(),
    cookie = require('cookie'),
    cookieParser = require('cookie-parser'),
    socketio = require('socket.io');

module.exports = function(http) {

    var io = socketio.listen(http);
    
    io.use(function(socket, next) {
        var data = socket.request;
        next();
    });

    return io;
};