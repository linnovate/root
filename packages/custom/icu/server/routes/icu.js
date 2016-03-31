'use strict';

var project = require('../controllers/project');
var task = require('../controllers/task');
var comment = require('../controllers/comments');
var discussion = require('../controllers/discussion');
var profile = require('../controllers/profile');
var users = require('../controllers/users');
var updates = require('../controllers/updates');
var notification = require('../controllers/notification');

var attachments = require('../controllers/attachments');
var star = require('../controllers/star');
var elasticsearch = require('../controllers/elasticsearch');

var authorization = require('../middlewares/auth.js');
var locals = require('../middlewares/locals.js');
var entity = require('../middlewares/entity.js');
var response = require('../middlewares/response.js');
var pagination = require('../middlewares/pagination.js');
var error = require('../middlewares/error.js');

module.exports = function (Icu, app) {

  // /^((?!\/hi\/).)*$/ all routes without '/api/hi/*'
  app.route(/^((?!\/hi\/).)*$/).all(locals);
  app.route(/^((?!\/hi\/).)*$/).all(authorization);

  //star & get starred list
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/star')
    .patch(star.toggleStar);
  app.route('/api/:entity(tasks|discussions|projects)/starred')
    .get(pagination.parseParams, star.getStarred, pagination.formResponse);

  app.route('/api/projects*').all(entity('projects'));
  app.route('/api/projects')
    //.all(auth.requiresLogin, permission.echo)
    .post(project.create, notification.createRoom, updates.created)
    .get(pagination.parseParams, project.all, star.isStarred, pagination.formResponse);
  app.route('/api/projects/:id([0-9a-fA-F]{24})')
    .get(project.read, star.isStarred)
    .put(project.read, project.update, star.isStarred)
    .delete(star.unstarEntity, project.read, project.destroy);
  app.route('/api/history/projects/:id([0-9a-fA-F]{24})')
    .get(project.readHistory);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects')
    .get(pagination.parseParams, project.getByDiscussion, project.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects/starred')
    .get(pagination.parseParams, star.getStarredIds('projects'), project.getByDiscussion, project.getByEntity, pagination.formResponse);

  app.route('/api/tasks*').all(entity('tasks'));
  app.route('/api/tasks')
    .post(task.create, notification.sendNotification, updates.created)
    .get(pagination.parseParams, task.all, star.isStarred, pagination.formResponse);
  app.route('/api/tasks/tags')
    .get(task.tagsList);
  app.route('/api/tasks/zombie')
    .get(task.getZombieTasks, star.isStarred);
  app.route('/api/tasks/:id([0-9a-fA-F]{24})')
    .get(task.read, star.isStarred)
    .put(task.read, task.update, star.isStarred, updates.updated)
    .delete(star.unstarEntity, task.read, task.destroy);

  app.route('/api/:entity(discussions|projects|users)/:id([0-9a-fA-F]{24})/tasks')
    .get(pagination.parseParams, task.getByEntity, pagination.formResponse);
  app.route('/api/:entity(discussions|projects|users)/:id([0-9a-fA-F]{24})/tasks/starred')
    .get(pagination.parseParams, star.getStarredIds('tasks'), task.getByEntity, pagination.formResponse);
  app.route('/api/history/tasks/:id([0-9a-fA-F]{24})')
    .get(task.readHistory);

  app.route('/api/comments/*').all(entity('comments'));
  app.route('/api/comments')
    .post(comment.create)
    .get(comment.all);
  app.route('/api/comments/:id([0-9a-fA-F]{24})')
    .get(comment.read)
    .put(comment.update)
    .delete(comment.destroy);
  app.route('/api/history/comments/:id([0-9a-fA-F]{24})')
    .get(comment.readHistory);

  app.route('/api/avatar')
    .post(profile.profile, profile.uploadAvatar, profile.update);

  app.route('/api/users*').all(entity('users'));
  app.route('/api/users')
    .post(users.filterProperties, users.create)
    .get(users.all);
  app.route('/api/users/:id([0-9a-fA-F]{24})')
    .get(users.read)
    .put(users.read, users.filterProperties, users.update)
    .delete(users.read, users.destroy);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/users')
    .get(users.getByEntity);

  app.route('/api/attachments*').all(entity('attachments'));
  app.route('/api/attachments')
    .post(attachments.upload, attachments.create)
    .get(attachments.all);
  app.route('/api/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.read)
    .post(attachments.read, attachments.upload, attachments.update);
  app.route('/api/history/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.readHistory);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/attachments')
    .get(attachments.getByEntity);

  app.route('/api/search')
    .get(elasticsearch.search);

  app.route('/api/discussions*').all(entity('discussions'));
  app.route('/api/discussions')
    .post(discussion.create, updates.created)
    .get(pagination.parseParams, discussion.all, star.isStarred, pagination.formResponse);
  app.route('/api/history/discussions/:id([0-9a-fA-F]{24})')
    .get(discussion.readHistory);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})')
    .get(discussion.read, star.isStarred)
    .put(discussion.read, discussion.update, star.isStarred, updates.updated)
    .delete(star.unstarEntity, discussion.read, discussion.destroy);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/schedule')
    .post(discussion.read, discussion.schedule, discussion.update, updates.updated);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/summary')
    .post(discussion.read, discussion.summary, discussion.update, updates.updated);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions')
    .get(pagination.parseParams, discussion.getByProject, discussion.getByEntity, star.isStarred, pagination.formResponse); //, discussion.getByEntity);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions/starred')
    .get(pagination.parseParams, star.getStarredIds('discussions'), discussion.getByProject, discussion.getByEntity, pagination.formResponse); //, discussion.getByEntity);

  app.route('/api/updates*').all(entity('updates'));
  app.route('/api/updates')
    .post(updates.create, notification.sendUpdate)
    // .post(updates.create, notification.sendUpdate)
    .get(updates.all, updates.getAttachmentsForUpdate);
  app.route('/api/updates/:id([0-9a-fA-F]{24})')
    .get(updates.read, updates.getAttachmentsForUpdate)
    .put(updates.update);
  //     // .delete(updates.destroy);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/updates')
    .get(updates.getByEntity, updates.getAttachmentsForUpdate);
  app.route('/api/history/updates/:id([0-9a-fA-F]{24})')
    .get(updates.readHistory);

  //temporary -because of swagger bug with 'tasks' word

  app.route('/api/task/tags')
    .get(task.tagsList);
  app.route('/api/task/zombie')
    .get(task.getZombieTasks);
  app.route('/api/task/:id([0-9a-fA-F]{24})')
    .get(task.read)
    .put(task.update)
    .delete(task.destroy);

  app.route(/^((?!\/hi\/).)*$/).all(response);
  app.route(/^((?!\/hi\/).)*$/).all(error);

  //app.use(utils.errorHandler);
};
