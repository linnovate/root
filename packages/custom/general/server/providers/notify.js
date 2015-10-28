'use strict';

var icapi = require('./icapi.js'),
    _ = require('lodash'),
    mean = require('meanio'),
    owner = mean.loadConfig().letschat.owner;

class Notification {

    constructor(cmd) {

    }

    room(type, data, callback) {
        var options = {
            method: type,
            headers: data.headers,
            form: {
                owner: owner,
                name: data.project.title,
                description: data.project.description,
                participants: data.project.watchers.length ? _.pluck(data.project.watchers, '_id') : [''],
                superusers: ['']
            },
            cmd: '/api/hi/rooms'
        };

        if(type === 'PUT')
            options.param = data.project.room;

        icapi.talkToApi(options, callback);

    }


    sendMessage(data, callback) {

        var options = {
            method: 'POST',
            form: {
                text: bulidMassage(data.context),
                owner: owner,
                room: data.room
            },
            headers: data.headers,
            cmd: '/api/hi/messages'
        };
        icapi.talkToApi(options, callback);

    }

    sendFile(data, callback) {

        var options = {
            method: 'POST',
            form: {
                file: data.file,
                owner: owner,
                room: data.room,
                post: true
            },
            headers: data.headers,
            cmd: '/api/hi/files'
        };
        icapi.talkToApi(options, callback);

    }

    archiveRoom(data, callback) {

        var options = {
            method: 'DELETE',
            param: data.room,
            headers: data.headers,
            cmd: '/api/hi/rooms',
            form: {
                owner: owner
            }
        };

        icapi.talkToApi(options, callback);
    }

}


exports.Notification = Notification;

var bulidMassage = function (context) {
    if(context.action == 'added')
        context.type = 'new ' + context.type;
    var msg = _.capitalize(context.type);
    if(context.name)
        msg += ' "' + context.name + '"';
    msg += ' was ' + context.action;
    if(context.oldVal)
        msg += ' from "' + context.oldVal + '" to "' + context.newVal + ' "';
    if(context.issue)
        msg += ' to ' + context.issue + ' "' + context.issueName + '"';
    if(context.user)
        msg += ' by ' + _.capitalize(context.user);
    if(context.description)
        msg += ':\n"' + context.description + '"';

    return msg;
};