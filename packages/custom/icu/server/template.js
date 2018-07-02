'use strict';

var dateFormat = function(date) {
  return '3:07 PM on July 16, 2015';
};

var curr = new Date();
curr.setHours(0, 0, 0, 0);
//var firstday = new Date(curr.setDate(curr.getDate() - curr.getDay()));
var lastday = new Date(curr.setDate(curr.getDate() - curr.getDay() + 6));
lastday = new Date(lastday.setHours(23, 59, 59, 0));

module.exports = {
  comment_email: function(user, text, from, task, icu, mailOptions) {
    mailOptions.html = [
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:orange">',
      '<div style="margin:0 auto;max-height:37px;max-width:122px;text-align: center;">ICU</div></div>',
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:#FCFBF6">',
      '<h2>Here’s what you missed…</h2>',
      // '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;" src="'+from.profile.avatar+'"/>',
      '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;"/>',
      '<strong>' + from.name + '</strong> commented on task ',
      '<a href="' + icu + '/' + 'tasks/by-project/' + task.project._id + '/' + task._id + '/activities">' + task.title + '</a>',
      ' on ',
      '<a href="' + icu + '/' + 'tasks/by-project/' + task.project._id + '">' + task.project.title + '</a>',
      '<div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">' + text + '</div>'
    ].join('\n\n');
    mailOptions.subject = from.name + ' mentioned you on the task ' + task.title + ' on ' + task.project.title + ' at ' + dateFormat(0);
    mailOptions.forceEmbeddedImages = true;
    return mailOptions;
  },
  discussionSchedule: {
    subject: 'Discussion was scheduled',
    body: [
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:orange">',
      '<div style="margin:0 auto;max-height:37px;max-width:122px;text-align: center;">ICU</div></div>',
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:#FCFBF6">',
      '<p>Today Date: <%= new Date().toLocaleString() %></p>',
      '<h2><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>"><%= discussion.title %> </a>, <%= discussion.due.toLocaleString() %></h2>',
      '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;"/>',

      '<p>Attendees: <%= discussion.watchers.map(function(w) { return w.name; }).join(",") %></p>',

      '<div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">',
      '<% print(discussion.description) %>',
      '</div>',
      //'<!--<h3>Agenda tasks: </h3>-->',
      //'<!--<ol><% agendaTasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>-->',
      '<h3>Additional tasks: </h3>',
      '<ol><% additionalTasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>',
    ].join('\n\n')
  },
  discussionSummary: {
    subject: 'Discussion summary',
    body: [
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:orange">',
      '<div style="margin:0 auto;max-height:37px;max-width:122px;text-align: center;">ICU</div></div>',
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:#FCFBF6">',
      '<p>Today Date: <%= new Date().toLocaleString() %></p>',
      '<h2><%= discussion.title %>, <%= discussion.due.toLocaleString() %></h2>',
      '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;"/>',

      '<p>Attendees: <%= discussion.watchers.map(function(w) { return w.name; }).join(",") %></p>',

      '<div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">',
      '<% print(discussion.description) %>',
      '</div>',

      // '<h3>Task discussed: </h3>',
      // '<% projects.forEach(function(project) { %>',
      // '<ol>',
      // '<li><%- project.title %>',
      // '<ol type="a"><% project.tasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>',
      // '</li></ol>',
      // '<% }); %>',
      '<h4>Additional tasks: </h4>',
      '<ol><% additionalTasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>',
    ].join('\n\n')
  },
  discussionCancele: {
    subject: 'Discussion Cancele',
    body: [
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:orange">',
      '<div style="margin:0 auto;max-height:37px;max-width:122px;text-align: center;">ICU</div></div>',
      '<h3>Canceled !</h3>',
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:#FCFBF6">',
      '<p>Today Date: <%= new Date().toLocaleString() %></p>',
      '<h2><%= discussion.title %>, <%= discussion.due.toLocaleString() %></h2>',
      '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;"/>',

      '<p>Attendees: <%= discussion.watchers.map(function(w) { return w.name; }).join(",") %></p>',

      '<div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">',
      '<% print(discussion.description) %>',
      '</div>',

      // '<h3>Task discussed: </h3>',
      // '<% projects.forEach(function(project) { %>',
      // '<ol>',
      // '<li><%- project.title %>',
      // '<ol type="a"><% project.tasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>',
      // '</li></ol>',
      // '<% }); %>',
      '<h4>Additional tasks: </h4>',
      '<ol><% additionalTasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/by-discussion/<%= discussion._id %>/<%= task._id %>"><%- task.title %></a></li><% }); %></ol>',
    ].join('\n\n')
  },
  MyTasksOfNextWeekSummary: {
    subject: 'My Tasks Of Next week summary',
    body: [
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:orange">',
      '<div style="margin:0 auto;max-height:37px;max-width:122px;text-align: center;">ICU</div></div>',
      '<div style="display:block;margin:0 auto;max-width:580px;padding:12px 16px;background-color:#FCFBF6">',
      '<p>Today Date: <%= new Date().toLocaleString() %></p>',
      '<p>End day Date: <%= ' + lastday + ' %></p>',
      // '<h2><%= discussion.title %>, <%= discussion.due.toLocaleString() %></h2>',
      // '<img style="appearance: none;border: none;height: calc(30px * 2);border-radius: 30px;width: calc(30px * 2);background-color: #b8e77f;width: 45px;height: 44px;margin: 0 7.5px;"/>',

      // '<p>Attendees: <%= discussion.watchers.map(function(w) { return w.name; }).join(",") %></p>',

      // '<div style="background-color:#fff;border:1px solid #dbdbdb;border-radius:3px;display:block;margin:6px 60px;padding:10px 12px">',
      // '<% print(discussion.description) %>',
      // '</div>',

      '<h2>Tasks: </h2>',
      '<ol><% WeekTasks.forEach(function(task) { %><li><a href="<%= uriRoot %>/tasks/all/<%= task._id %>"><%- task.title %></a>, ',
      '<%- task.due %>',
      '</li><% }); %></ol>',
    ].join('\n\n')
  }
};
