'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  _ = require('lodash'),
  config = require('meanio').loadConfig(),
  templates = require('../template'),
  nodemailer = require('nodemailer'),
  smtpTransport = require('nodemailer-smtp-transport'),
  EmailTemplate = require('../../../mail-templates/node_modules/email-templates').EmailTemplate,
  path = require('path');

function sendMail(mailOptions) {
  var options = config.mailer;

  if (config.mailer.service === 'SMTP') {
    options = smtpTransport(options);
  }

  var transport = nodemailer.createTransport(options);

  transport.sendMail(mailOptions, function (err, response) {
    console.log(err, response);
    if (err) return err;
    return response;
  });
}

//temporary function
//send should be deleted latter and use this function
//as sole interface to main manager
exports.sendEx = function (type, data) {
  if (type === 'comment_email') {
    //template format does not compatible yet
    //use send function
    return;
  }

  data.uriRoot = config.icu.uri;
  data.date = new Date();
  data.attendees = _(data.discussion.watchers).map(function (w) {
    return w.name;
  }).join(', ');

  var templateDir = path.join(__dirname, '..', 'templates', type);
  var template = new EmailTemplate(templateDir);

  template.render(data, function (err, results) {
    if (err) {
      console.log(err.message);
      console.log(err.stack);
    } else {
      console.log(results.html);
    }

    //add discussion owner
    data.discussion.watchers.push(data.discussion.assign);

    data.discussion.watchers.forEach(function (watcher) {
      var mailOptions = {
        to: watcher.email,
        from: config.emailFrom,
        subject: data.discussion.title,
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      sendMail(mailOptions);
    });
  });
};

exports.send = function (doc, task) {
  var arr = doc.text.match(/@([^ :]*)*/g);
  arr = arr.map(function (item) {
    return item.slice(1)
  });
  User.findOne({
    _id: doc.creator
  }).exec(function (err, from) {
    User.find({
      username: {
        $in: arr
      }
    }).exec(function (err, users) {

      for (var i = 0; i < users.length; i += 1) {
        var user = users[i];
        var mailOptions = {
          to: user.email,
          from: config.emailFrom
        };
        mailOptions = templates.comment_email(user, doc.text, from, task, config.icu.uri, mailOptions);
        sendMail(mailOptions);
      }
    });
  });
};
