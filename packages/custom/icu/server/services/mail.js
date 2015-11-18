'use strict';

var Q = require('q');
var config = require('meanio').loadConfig();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var EmailTemplate = require('../../../mail-templates/node_modules/email-templates').EmailTemplate;
var path = require('path');

function send(mailOptions) {
  var options = config.mailer;

  if (config.mailer.service === 'SMTP') {
    options = smtpTransport(options);
  }

  var transport = nodemailer.createTransport(options);
  return Q.ninvoke(transport, 'sendMail', mailOptions);
}

function render(type, data) {
  var templateDir = path.join(__dirname, '..', 'templates', type);
  var template = new EmailTemplate(templateDir);

  return template.render(data);
}

exports.send = function (type, data) {
  if (type === 'comment_email') {
    return;
  }

  data.uriRoot = config.icu.uri;
  data.date = new Date();

  //HACK

  data.discussion.watchers.push(data.discussion.assign);
  data.attendees = data.discussion.watchers.map(function (w) {
    return w.name;
  }).join(', ');

  return render(type, data).then(function(results) {
    var promises = data.discussion.watchers.map(function (watcher) {
      var mailOptions = {
        to: watcher.email,
        from: config.emailFrom,
        subject: data.discussion.title,
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};
