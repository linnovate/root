'use strict';

var icapi = require('./icapi.js');

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
        console.dir(data)
        var options = {
            method: 'POST',
            form: {
                message: 'Task ' + data.title + ' has created'
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
    //patch(data, callback) {
    //    var options = {
    //        method: 'PATCH',
    //        form: data.data,
    //        param: data.param,
    //        headers: data.headers
    //    };
    //
    //    this.talkToApi(options, callback);
    //}

}


exports.Notification = Notification;
