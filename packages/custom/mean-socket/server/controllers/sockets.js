'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    _ = require('lodash');

exports.createFromSocket = function(data, cb) {

    var message = new Message(data.message);
    message.creator = data.user._id;
    message.time = new Date();
    message.user = data.channel;
    message.id = data.id;
    message.IsWatched = false;
    message.DropDownIsWatched = false;
    message.entity = data.entity;
    message.type = data.type;

    message.save(function(err) {
        if (err) console.log(err);
        Message.findOne({
            _id: message._id
        }).populate('user', 'name username').exec(function(err, message) {
            return cb(message);
        });
    });
};

exports.getAllForSocket = function(channel, cb) {
    Message.find({
        //channel: channel
        title: channel
    }).sort('time').populate('user', 'name username').exec(function(err, messages) {
        return cb(messages);
    });
};

exports.getListOfChannels = function(cb) {
    Message.distinct('channel', {}, function(err, channels) {
        console.log('channels', channels);
        return cb(channels);
    });
};