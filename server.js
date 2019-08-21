'use strict';

var mean = require('meanio');

mean.serve({ }, function (app) {
    var config = app.config.clean;
    var port = config.https && config.https.port ? config.https.port : config.http.port;
    console.log('Mean app started on port ' + port + ' (' + process.env.NODE_ENV + ')');
    
    var cron = require('node-cron');
    var taskController = require(__dirname + '/packages/custom/icu/server/controllers/task.js');

    cron.schedule(config.ScheduledMailSendWeekly, function(){
        console.log('running a task every week');

        taskController.GetUsersWantGetMyWeeklyTasksMail();
        taskController.GetUsersWantGetGivenWeeklyTasksMail();
    });

    cron.schedule(config.ScheduledMailSendDaly, function(){
        console.log('running a task every day');

        taskController.GetUsersWantGetMyTodayTasksMail();
        taskController.GetUsersWantGetGivenTodayTasksMail();
    });
});
