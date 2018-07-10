'use strict';

var project = require('../controllers/project');
var task = require('../controllers/task');
var customData = require('../controllers/customData');
var comment = require('../controllers/comments');
var discussion = require('../controllers/discussion');
var profile = require('../controllers/profile');
var users = require('../controllers/users');
var updates = require('../controllers/updates');
var notification = require('../controllers/notification');
var attachments = require('../controllers/attachments');
var star = require('../controllers/star');
var recycle = require('../controllers/recycle');
var elasticsearch = require('../controllers/elasticsearch');
var templates = require('../controllers/templates');
var eventDrops = require('../controllers/event-drops');
var office = require('../controllers/office');
var folder = require('../controllers/folder');
var webHook = require('../controllers/webhook');
var documents = require('../controllers/documents');
var config = require('meanio').loadConfig()
let documentPlugins = require('../controllers/plugins/documents');
// creates new document plugin middleware
let documentsPlugin = new documentPlugins[config.documentPlugin];
console.log("documentsPlugin.keys", documentsPlugin.keys) ;
var templateDocs = require('../controllers/templateDocs');
var signatures = require('../controllers/signatures');
var authorization = require('../middlewares/auth.js');
var locals = require('../middlewares/locals.js');
var entity = require('../middlewares/entity.js');
var response = require('../middlewares/response.js');
var pagination = require('../middlewares/pagination.js');
var error = require('../middlewares/error.js');

var circleSettings = require(process.cwd() + '/config/circleSettings') || {};
var order = require('../controllers/order');
var express = require('express');
var ftp = require('../services/ftp.js');

//update mapping - OHAD
//var mean = require('meanio');
//var elasticActions = require('../controllers/elastic-actions.js');
//END update mapping - OHAD

//socket
// var socket = require('../middlewares/socket.js');

module.exports = function(Icu, app) {
  var circles = require('circles-npm')(app, config.circles.uri, circleSettings);

  var hi = require('root-notifications')({
    rocketChat: config.rocketChat
  }, app);

  // /^((?!\/hi\/).)*$/ all routes without '/api/hi/*'
  app.route(/^((?!\/hi\/).)*$/).all(locals);
  app.route(/^((?!\/hi\/).)*$/).all(authorization);

  //app.route(/^((?!\/hi\/).)*$/).all(authorization, socket);

  //app.route(/^((?!\/socket.io\/).)*$/).all(locals);
  //app.route(/^((\/socket.io\/).)*$/).all(authorization);

  // When need to update mapping, use this authorization, and not the abouve one
  // app.route(/^((\/index-data\/).)*$/).all(authorization);

  //update mapping - OHAD
  app.post('/api/index-data/:schema', function(req, res) {
    console.log('unsupported code error');
    // unsupported code
    // elasticActions.indexData(req, res, mean.elasticsearch);
  });
  //END update mapping - OHAD

  app.route('/api/:entity(officeDocsFiles|tasks|discussions|projects|users|circles|files|attachments|updates|templates|myTasksStatistics|event-drops|offices|folders|officeDocuments|officeTemplates|templateDocs|new|customData)*').all(circles.acl());

  app.use('/api/files', attachments.getByPath, error, express.static(config.attachmentDir));
   //app.use('/api/files', express.static(config.attachmentDir));

  //app.get('/files', attachments.getByPath, error, attachments.download);


  app.use('/api/Excelfiles', express.static(config.attachmentDir));


  //update socket - OHAD
  // app.route('/api/socket.io/')
  // .post(socket)
  // .get(socket);
  //END update socket - OHAD

  //Notification READ - OHAD
  app.route('/api/notification/:id([0-9a-fA-F]{24})')
    .get(notification.read)
    .put(notification.updateIsWatched);
  app.route('/api/notification1/:id([0-9a-fA-F]{24})')
    .put(notification.updateDropDown);
  //END Notification READ - OHAD

  //recycle && recycleRestore
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/recycle')
    .patch(recycle.recycleEntity);
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/recycle_restore')
    .patch(recycle.recycleRestoreEntity);
  app.route('/api/:entity(all|tasks|discussions|projects|offices|folders|officeDocuments)/get_recycle_bin')
    .get(recycle.recycleGetBin);
  app.route('/api/get_search_all')
    .get(recycle.searchAll);
  //star & get starred list
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/star')
    .patch(star.toggleStar);
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/starred')
    .get(pagination.parseParams, star.getStarred, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|projects|offices|folders)/starred/:type(byAssign)')
    .get(pagination.parseParams, star.getStarred, pagination.formResponse);
  //Create HI Room if the user wish
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/WantToCreateRoom')
    .post(project.read, notification.createRoom);
  //.post(project.read);

  //Create HI Room if the user wish
  app.route('/api/:entity(offices)/:id([0-9a-fA-F]{24})/WantToCreateRoom')
    //.post(project.read, notification.createRoom);
    .post(office.read);

  //Create HI Room if the user wish
  app.route('/api/:entity(folders)/:id([0-9a-fA-F]{24})/WantToCreateRoom')
    //.post(project.read, notification.createRoom);
    .post(folder.read);

  app.route('/api/projects*').all(entity('projects'));
  app.route('/api/projects')
  //.all(auth.requiresLogin, permission.echo)
    .post(project.create, project.updateParent, notification.sendNotification, updates.created)
    .get(pagination.parseParams, project.all, project.populateSubProjects, star.isStarred, pagination.formResponse);



  app.route('/api/projects/:id([0-9a-fA-F]{24})')
    .get(project.read, star.isStarred)
  //.put(project.read, project.update, star.isStarred)
    .put(project.read, project.update, attachments.sign, notification.updateRoom, star.isStarred)
    .delete(star.unstarEntity, project.read, project.destroy);
  app.route('/api/history/projects/:id([0-9a-fA-F]{24})')
    .get(project.readHistory);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects')
    .get(pagination.parseParams, project.getByDiscussion, project.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|projects)/:id([0-9a-fA-F]{24})/projects/starred')
    .get(pagination.parseParams, star.getStarredIds('projects'), project.getByDiscussion, project.getByEntity, pagination.formResponse);
  app.route('/api/projects/tags')
    .get(project.tagsList);

  app.route('/api/offices*').all(entity('offices'));
  app.route('/api/offices')
  //.all(auth.requiresLogin, permission.echo)
    .post(office.create, updates.created)
    .get(pagination.parseParams, office.all, star.isStarred, pagination.formResponse);
  app.route('/api/offices/:id([0-9a-fA-F]{24})')
    .get(office.read, star.isStarred)
  //.put(project.read, project.update, star.isStarred)
    .put(office.read, office.update, attachments.sign, notification.updateRoom, star.isStarred)
    .delete(star.unstarEntity, office.read, office.destroy);
  app.route('/api/history/offices/:id([0-9a-fA-F]{24})')
    .get(office.readHistory);
  app.route('/api/:entity(tasks|discussions|offices)/:id([0-9a-fA-F]{24})/offices')
    .get(pagination.parseParams, office.getByDiscussion, office.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|offices)/:id([0-9a-fA-F]{24})/offices/starred')
    .get(pagination.parseParams, star.getStarredIds('offices'), office.getByDiscussion, office.getByEntity, pagination.formResponse);

  app.route('/api/folders*').all(entity('folders'));
  app.route('/api/folders')
  //.all(auth.requiresLogin, permission.echo)
    .post(folder.create, updates.created)
    .get(pagination.parseParams, folder.all, star.isStarred, pagination.formResponse);
  app.route('/api/folders/:id([0-9a-fA-F]{24})')
    .get(folder.read, star.isStarred)
  //.put(project.read, project.update, star.isStarred)
    .put(folder.read, folder.update, attachments.sign, notification.updateRoom, star.isStarred)
    .delete(star.unstarEntity, folder.read, folder.destroy);
  app.route('/api/history/folders/:id([0-9a-fA-F]{24})')
    .get(folder.readHistory);
  app.route('/api/:entity(tasks|discussions|offices|folders)/:id([0-9a-fA-F]{24})/folders')
    .get(pagination.parseParams, folder.getByEntity, pagination.formResponse);
  app.route('/api/:entity(tasks|discussions|offices|folders)/:id([0-9a-fA-F]{24})/folders/starred')
    .get(pagination.parseParams, star.getStarredIds('folders'), folder.getByDiscussion, folder.getByEntity, pagination.formResponse);
  app.route('/api/folders/tags')
    .get(folder.tagsList);

  app.route('/api/officeDocuments*').all(entity('officeDocuments'));

  app.route('/api/tasks*').all(entity('tasks'));
  app.route('/api/tasks')
    .post(task.create, task.updateParent, notification.sendNotification, updates.created)
    .get(pagination.parseParams, task.all, task.populateSubTasks, star.isStarred, pagination.formResponse);
  app.route('/api/tasks/tags')
    .get(task.tagsList);
  app.route('/api/tasks/zombie')
    .get(task.getZombieTasks, star.isStarred);
  app.route('/api/tasks/:id([0-9a-fA-F]{24})')
    .get(task.read, star.isStarred)
    .put(task.read, task.update, profile.profile, profile.updateMember, star.isStarred, attachments.sign, updates.updated, notification.updateTaskNotification)
    .delete(star.unstarEntity, task.read, task.removeSubTask, task.destroy);
  app.route('/api/tasks/byAssign')
    .get(task.byAssign, task.populateSubTasks);


  // app.route('/api/tasks/subtasks')
  // 	.post(task.addSubTasks)
  app.route('/api/tasks/subtasks/:id([0-9a-fA-F]{24})')
    .get(task.getSubTasks);

  app.route('/api/projects/subprojects/:id([0-9a-fA-F]{24})')
    .get(project.getSubProjects);

  app.route('/api/tasks/MyTasksOfNextWeekSummary')
    .post(task.read, task.MyTasksOfNextWeekSummary);

  app.route('/api/tasks/GivenTasksOfNextWeekSummary')
    .post(task.read, task.GivenTasksOfNextWeekSummary);

  app.route('/api/tasks/excel')
    .get(pagination.parseParams, task.all, task.excel);

  // app.route('/api/:entity(discussions|projects|offices|users|folders)/:id([0-9a-fA-F]{24})/folders')
  //     .get(pagination.parseParams, folder.getByEntity, pagination.formResponse);

  app.route('/api/:entity(discussions|projects|offices|users|folders|officeDocuments)/:id([0-9a-fA-F]{24})/tasks')
    .get(pagination.parseParams, task.getByEntity, pagination.formResponse);
  app.route('/api/:entity(discussions|projects|offices|users|folders|officeDocuments)/:id([0-9a-fA-F]{24})/tasks/starred')
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
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/users')
    .get(users.getByEntity);

  app.route('/api/attachments*').all(entity('attachments'));
  app.route('/api/attachments')
    .post(attachments.upload, attachments.signNew, attachments.create)
    .get(attachments.all);
  app.route('/api/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.read)
    .post(attachments.read, attachments.upload, attachments.update)
    .delete(attachments.deleteFile);
  app.route('/api/history/attachments/:id([0-9a-fA-F]{24})')
    .get(attachments.readHistory);
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/attachments')
    .get(attachments.getByEntity);
  app.route('/api/tasks/myTasks/attachments')
    .get(attachments.getMyTasks);

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
    .put(discussion.read, discussion.update, star.isStarred, attachments.sign)
    .delete(star.unstarEntity, discussion.read, discussion.destroy);
  app.route('/api/discussions/:id([0-9a-fA-eact applicaF]{24})/schedule')
    .post(discussion.read, discussion.schedule, discussion.update, updates.updated);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/summary')
    .post(discussion.read, discussion.summary, discussion.update, updates.updated);
  app.route('/api/discussions/:id([0-9a-fA-F]{24})/cancele')
    .post(discussion.read, discussion.cancele, discussion.update, updates.updated);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions')
    .get(pagination.parseParams, discussion.getByProject, discussion.getByEntity, star.isStarred, pagination.formResponse); //, discussion.getByEntity);
  app.route('/api/:entity(projects)/:id([0-9a-fA-F]{24})/discussions/starred')
    .get(pagination.parseParams, star.getStarredIds('discussions'), discussion.getByProject, discussion.getByEntity, pagination.formResponse); //, discussion.getByEntity);
  app.route('/api/discussions/tags')
    .get(discussion.tagsList);

  app.route('/api/updates*').all(entity('updates'));
  app.route('/api/updates')
    .post(updates.signNew, updates.create, notification.sendUpdate)
  // .post(updates.create, notification.sendUpdate)
    .get(updates.all, updates.getAttachmentsForUpdate);
  app.route('/api/updates/:id([0-9a-fA-F]{24})')
    .get(updates.read, updates.getAttachmentsForUpdate)
    .put(updates.update);
  app.route('/api/tasks/myTasks/updates')
    .get(updates.getMyTasks);
  //     // .delete(updates.destroy);
  app.route('/api/:entity(tasks|discussions|projects|offices|folders|officeDocuments)/:id([0-9a-fA-F]{24})/updates')
    .get(updates.getByEntity, updates.getAttachmentsForUpdate);
  app.route('/api/:entity(templateDocs)/:id([0-9a-fA-F]{24})/updates')
    .get(updates.getByEntity);
  app.route('/api/history/updates/:id([0-9a-fA-F]{24})')
    .get(updates.readHistory);

  app.route('/api/tasks/:id([0-9a-fA-F]{24})/toTemplate')
    .post(profile.profile, profile.updateMember, templates.toTemplate);
  app.route('/api/templates/:id([0-9a-fA-F]{24})')
    .delete(templates.read, templates.removeSubTask, templates.destroy);
  app.route('/api/templates/:id([0-9a-fA-F]{24})/toSubTasks')
    .post(templates.toSubTasks);
  app.route('/api/templates')
    .get(pagination.parseParams, templates.all, pagination.formResponse);

  //temporary -because of swagger bug with 'tasks' word

  app.route('/api/task/tags')
    .get(task.tagsList);
  app.route('/api/task/zombie')
    .get(task.getZombieTasks);
  app.route('/api/task/:id([0-9a-fA-F]{24})')
    .get(task.read)
    .put(task.update)
    .delete(task.destroy);

  app.route('/api/myTasksStatistics')
    .get(task.myTasksStatistics);
  app.route('/api/overdueWatchedTasks')
    .get(task.getOverdueWatchedTasks);
  app.route('/api/watchedTasks')
    .get(task.getWatchedTasksList);
  app.route('/api/order/set')
    .post(order.set);
  app.route('/api/event-drops')
    .get(eventDrops.getMyEvents);

  app.route('/api/new')
    .post(webHook.create); //notification.0, updates.created)

  app.route(/^((?!\/hi\/).)*$/).all(response);
  app.route(/^((?!\/hi\/).)*$/).all(error);
  app.route('/api/myTasksStatistics')
    .get(task.myTasksStatistics);
  app.route('/api/overdueWatchedTasks')
    .get(task.getOverdueWatchedTasks);
  app.route('/api/watchedTasks')
    .get(task.getWatchedTasksList);
  app.route('/api/order/set')
    .post(order.set);
  app.route('/api/event-drops')
    .get(eventDrops.getMyEvents);

  /* OFFICEDOCUMENTS */
  app.route('/api/officeDocuments*').all(entity('officeDocuments'));
  app.route('/api/officeDocuments')
    .post(documentsPlugin.type,documentsPlugin.create)
    .get(documentsPlugin.all);
  app.route('/api/officeDocuments/:id([0-9a-fA-F]{24})')
    .get(documentsPlugin.read, star.isStarred)    
    .put(documentsPlugin.read,documentsPlugin.update, star.isStarred, attachments.sign)
    .delete(documentsPlugin.delete);

  app.route('/api/officeDocuments/addSerialTitle')
    .post(documents.addSerialTitle);

  app.route('/api/officeDocuments/uploadEmpty')
    .post(documents.uploadEmpty);

  app.route('/api/officeDocuments/deleteDocumentFile/:id([0-9a-fA-F]{24})')
    .post(documents.deleteDocumentFile);


  app.route('/api/officeDocuments/uploadFileToDocument')
    .post(documents.uploadFileToDocument);
  app.route('/api/officeDocuments/sendDocument')
    .post(documents.sendDocument);
  app.route('/api/officeDocuments/signOnDocx')
    .post(documents.signOnDocx);
  app.route('/api/folders/:id([0-9a-fA-F]{24})/officeDocuments').get(documents.getByFolder);

  // document sending operations (sentToDocument, distributedDocument, receiveDocument, readByDocument)
  app.route('/api/officeDocuments/receiveDocument/:id([0-9a-fA-F]{24})')
    .post(documents.receiveDocument);

  app.route('/api/officeDocuments/distributedDocument/:id([0-9a-fA-F]{24})')
    .post(documentsPlugin.distributedDocument);

  app.route('/api/officeDocuments/readByDocument/:id([0-9a-fA-F]{24})')
    .post(documentsPlugin.readByDocument);

  app.route('/api/officeDocuments/sentToDocument/:id([0-9a-fA-F]{24})')
    .post(documentsPlugin.sentToDocument);

  app.route('/api/officeTemplates/createNew')
    .post(templateDocs.createNew);


  app.route('/api/signatures/create')
    .post(signatures.createSignature);
  app.route('/api/signatures/getByOfficeId/:id([0-9a-fA-F]{24})')
    .get(signatures.getByOffice);
  app.route('/api/signatures/:id([0-9a-fA-F]{24})')
    .delete(signatures.removeSignature);

  app.route('/api/officeTemplates')
  //.post(templateDocs.upload)
    .get(pagination.parseParams, templateDocs.all, pagination.formResponse);
  app.route('/api/officeTemplates/getByofficeId')
    .post(templateDocs.getByOfficeId);

  app.route('/api/officeTemplates*').all(entity('templateDocs'));


  app.route('/api/officeDocuments/uploadDocumentFromTemplate')
    .post(documents.uploadDocumentsFromTemplate);

  app.route('/api/officeTemplates/uploadTemplate')
    .post(templateDocs.uploadTemplate);
  app.route('/api/officeTemplates/:id([0-9a-fA-F]{24})')
    .get(templateDocs.getById)
    .post(templateDocs.update2)
    .delete(templateDocs.deleteTemplate);
  //app.route('/api/:entity(tasks|discussions|projects|offices|folders)/:id([0-9a-fA-F]{24})/templates').get(templateDocs.getByEntity);

  app.route(/^((?!\/hi\/).)*$/).all(response);
  app.route(/^((?!\/hi\/).)*$/).all(error);
  //app.use(utils.errorHandler);
};
