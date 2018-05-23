// var Notification = require('../../../general/server/providers/notify.js').Notification;
// var Notify = new Notification();
var config = require('meanio').loadConfig();
var mailService = require('../services/mail');

exports.sendMessage = function(message) {
  var date = new Date();
  if(config.system && (!config.system.errors || !config.system.errors[message.service] || date.getTime() - config.system.errors[message.service].getTime() > config.system.seconds * 1000)) {
    if(config.system.errors && config.system.errors[message.service])

      mailService.system(message);
    config.system.errors = config.system.errors || {};
    config.system.errors[message.service] = new Date;
  }

};
