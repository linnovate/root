'use strict';

var Q = require('q');
var config = require('meanio').loadConfig();
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var EmailTemplate = require('../../../mail-templates/node_modules/email-templates').EmailTemplate;
var iCalEvent = require('icalevent');
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


exports.send = function(type, data) {
  if (type === 'comment_email') {
    return;
  }
  var port = config.https && config.https.port ? config.https.port : config.http.port;
  data.uriRoot = config.host + ':' + port;
  data.date = new Date();
  var recipients = data.discussion.watchers;
  var discussionStatus = data.discussion.status;
  var attendingPeople=[];
  data.attendees = [];
  var ids = [], emails = [];
  for (var i = 0; i < recipients.length; i++) {
    if (ids.indexOf(recipients[i]._id.toString()) === -1) {
      var json = {
        "name": recipients[i].name,
        "email": recipients[i].email
      };
      attendingPeople.push(json);
      ids.push(recipients[i]._id.toString());
      emails.push(recipients[i].email);
      data.attendees.push(recipients[i].name);
    }
  }
  var status = data.discussion.status;
  var calMethod = status=="canceled"?"CANCEL":"REQUEST";
  var event = new iCalEvent();
  event.set('uid', data.discussion._id);
  event.set('offset', new Date().getTimezoneOffset());
  event.set('method', calMethod);
  event.set('status', data.discussion.status);
  event.set('attendees', attendingPeople);
  event.set('start', data.discussion.due);
  event.set('end', data.discussion.due);
  event.set('timezone', 'Jerusalem');
  event.set('description', 'ICU Discussion Event : '+data.discussion.title);
  event.set('location', data.discussion.creator.name);
  event.set('organizer', { name: 'ICU', email: 'admin@linnovate.net' });

  var eventInvitation = event.toFile();
  var buffer = new Buffer(eventInvitation);
  console.log("/n/n/n/n");
  console.log(eventInvitation);

  data.attendees.join(', ');

  return render(type, data).then(function(results) {
    var promises = emails.map(function(recipient) {
      var mailOptions = {
        "to" : recipient,
        "from" : config.emailFrom,
        "subject" : data.discussion.title,
        "html" : results.html,
        "text" : results.text,
        "forceEmbeddedImages" : true
      };
      if(status == "new"){
        mailOptions['alternatives'] =  [{
          contentType: "text/calendar",
          content: buffer}];
      }
      return send(mailOptions);
    });

    return Q.all(promises);
  });
};

exports.system = function(data) {
  var port = config.https && config.https.port ? config.https.port : config.http.port;
  data.uriRoot = config.host + ':' + port;
  data.date = new Date();
  var recipients = config.system.recipients;
  var r = [];
  for (var i in recipients) {
    r.push(recipients[i]);
  }

  return render('system', data).then(function(results) {
    var promises = r.map(function(recipient) {
      var mailOptions = {
        to: recipient,
        from: config.emailFrom,
        subject: 'Root System',
        html: results.html,
        text: results.text,
        forceEmbeddedImages: true
      };

      return send(mailOptions);
    });

    return Q.all(promises);
  });
};
