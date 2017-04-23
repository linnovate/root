'use strict';

// The Package is past automatically as first parameter
module.exports = function(MeanSocket) {

    var Q = require('q');
    var express = require('express');
    var app = express();
    var bodyParser = require('body-parser');
    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);
    var moment = require('moment');
    var config = require('meanio').loadConfig();

    //var PORT = 8282;
    var PORT = config.socketPort;

    var channelWatchList = [];

    // parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded());

    // parse application/json
    app.use(bodyParser.json());

    // parse application/vnd.api+json as json
    app.use(bodyParser.json({
        type: 'application/vnd.api+json'
    }));

    server.listen(PORT, function() {
        console.log('Chat now listening on port: ' + PORT + '\n');
    });

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.send(200);
        } else {
            next();
        }
    };
    app.use(allowCrossDomain);

    function getMessages(channel) {
        var deferred = Q.defer();

        MeanSocket.settings(function(err, settings) {
            require(settings.settings.funcPage)[settings.settings.getAllMessagesFunc](channel, function(cb) {
                deferred.resolve(cb);
            });
        });

        return deferred.promise;
    }

    function removeKeys() {
        // require(str)[removeOldMessages](function(cb) {
        //     io.emit('message:remove:channel:' + channel, {
        //         message: message,
        //         channel: channel
        //     });
        // });
    }

    setInterval(removeKeys, 6000);

    //Made By OHAD
    var sockets = require('../../../icu/server/providers/socket.js');
    //END Made By OHAD


    io.on('connection', function(socket) {
        console.log('Chat - user connected');
        
        //Made By OHAD
        socket.emit('user joined', {success: true});
        
        socket.on('user joined token', function(data) {
            console.log("data");
            console.log(JSON.stringify(data));
            sockets._new(data, socket);
        });
        //END Made By OHAD

        socket.on('disconnect', function() {
            console.log('Chat - user disconnected');
        });

        socket.on('user:joined', function(user) {
            console.log(user.name + ' joined the room');
            var message = user.name + ' joined the room';
            io.emit('user:joined', {
                message: message,
                time: moment(),
                expires: moment().add(10)
            });
        });

        socket.on('message:send', function(message) {
            console.log('message: ' + message);
            console.log(JSON.stringify(message));
            // var messageKey = 'message:' + message.name;
            // console.log('Storing key: ' + messageKey);

            console.log('storing to set: messages:' + message.channel);
            
            
            //CHECK
            
            //Emit back any messages that havent expired yet.
            getMessages(message.channel).then(function(data) {
                console.log('got messages');
                console.log(data);
                //socket.emit('messages:channel:' + channelInfo.channel, data);
            });
            
            //END CHECK


            MeanSocket.settings(function(err, settings) {
                require(settings.settings.funcPage)[settings.settings.getMessageFunc](message, function(cb) {
                    io.emit('message:channel:' + message.channel, cb);
                    console.log('emited: ' + cb);
                });
            });
        });

        socket.on('channel:join', function(channelInfo) {
            console.log('Channel joined - ', channelInfo.channel);
            console.log(channelInfo);
            console.log('Added to channels: ', channelInfo.channel);
            console.log('messages:' + channelInfo.channel);

            // socket.emit('messages:channel:' + channelInfo.channel, )

            //Add to watch to remove list.
            // for(var i = 0, j = channelWatchList.length; i < j; i++) {
            //   if()
            // }
            if (channelWatchList.indexOf(channelInfo.channel) === -1) {
                channelWatchList.push(channelInfo.channel);
            }

            io.emit('user:channel:joined:' + channelInfo.channel, {
                message: channelInfo,
            });

            MeanSocket.settings(function(err, settings) {
                require(settings.settings.funcPage)[settings.settings.getAllChannelsFunc](function(cb) {
                    for (var i = 0; i < cb.length; i++) {
                        if (channelWatchList.indexOf(cb[i]) === -1) {
                            channelWatchList.push(cb[i]);
                        }
                    }
                    socket.emit('channels', channelWatchList);
                });
            });

            //Emit back any messages that havent expired yet.
            getMessages(channelInfo.channel).then(function(data) {
                console.log('got messages');
                // console.log(data);
                socket.emit('messages:channel:' + channelInfo.channel, data);
            });
        });

    });
};