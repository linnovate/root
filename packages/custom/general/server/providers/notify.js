'use strict';

var icapi = require('./icapi.js'),
    _ = require('lodash');

class Notification {

    constructor(cmd) {

    }

    createRoom(data, callback) {
        var options = {
            method: 'POST',
            headers: data.headers,
            form: {
                title: data.project.title,
                watchers: data.project.watchers
            },
            cmd: '/api/rooms'
        };

        icapi.talkToApi(options, callback);

    }

    send(data, callback) {

        var options = {
            method: 'POST',
            form: {
                message: bulidMassage(data.context)
            },
            param: data.room,
            headers: data.headers,
            cmd: '/api/notifications'
        };
        icapi.talkToApi(options, callback);

    }

    //delete(data, callback) {
    //
    //    var options = {
    //        method: 'DELETE',
    //        param: data.param,
    //        headers: data.headers
    //    };
    //
    //    this.talkToApi(options, callback);
    //}
    //
    patch(data, callback) {

        var options = {
            method: 'PUT',
            form: {
                watchers: data.project.watchers,

                message: bulidMassage(data.context),
                title: data.project.title
            },
            param: data.project.room,
            headers: data.headers,
            cmd: '/api/rooms'
        };

        icapi.talkToApi(options, callback);
    }

}


exports.Notification = Notification;

var bulidMassage = function (context) {
    var msg = [_.capitalize(context.type), _.capitalize(context.name),'was', context.action];
    if(context.oldVal)
        msg = msg.concat(['from', '"' +context.oldVal + '"', 'to', '"' + context.newVal + '"']);

    return msg.join(' ');
}