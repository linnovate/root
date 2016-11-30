// var Notification = require('../../../general/server/providers/notify.js').Notification;
// var Notify = new Notification();
var config = require('meanio').loadConfig();
var notifications = require('root-notifications')({rocketChat: config.rocketChat});
var projectController = require('./project.js');
var hiSettings = require(process.cwd() + '/config/hiSettings') || {};

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  Message = mongoose.model('Message'),
  Project = mongoose.model('Project'),
  Task = require('../models/task'),
  _ = require('lodash');
var UserCreator = mongoose.model('User');

//Made By OHAD

exports.read = function(req, res, next) {

  Message.find({
    title: req.user._id
  }).sort('time').populate('user', 'name username').exec(function(err, messages) {
    //console.log("--------------------------------------------------messages.find--------------------------------------");
    //console.log(messages);
    
    req.body = messages;
    
    res.json(messages);
  });
};

exports.updateIsWatched = function(req, res, next) { 

  Message.update(
  { id: req.params.id},
  { $set: { IsWatched : true}}
  ).exec(function(err, messages) {
    console.log("--------------------------------------------------messages.update--------------------------------------");
    console.log(messages);
    
    req.body = messages;
    
    res.json(messages);
  });
};
exports.updateDropDown = function(req, res, next) {

  Message.update(
  { title: req.params.id},
  { $set: { DropDownIsWatched : true}},
  { multi: true }
  ).exec(function(err, messages) {

    req.body = messages;
    
    res.json(messages);
  });
};
//END Made By OHAD

var generateRoomName = function(name, id) {
    if (!name || name === '') {
        name = new Date().toISOString().replace(/\..+/, '').replace(/:/, '-').replace(/:/, '-');
    }
    return name + '-' + id;
}

exports.createRoom = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }
    Project.findOne({_id:req.locals.result._id}).exec(function(error, project) {
        // if (!req.locals.result.hasRoom) {
           createRoom(req.locals.result, function(error, result){
            if (error) {
                req.hi = {error: error};
                req.locals.result.hasRoom = false;
                req.locals.result.save();
                next();
            } else {
                req.body.room = result.id;                
                projectController.update(req, res, next);
            }
        })
       // }

   });
   
    // END Made By OHAD          
};

exports.updateRoom = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }
    console.log(req.locals.result)  
    if (!req.locals.result.room && !req.locals.result.hasRoom) {        
        Project.findOne({_id:req.locals.result._id}).exec(function(error, project){
            if (!project.hasRoom) {
                Project.update({_id:req.locals.result._id},{$set:{hasRoom: true}}, function(){
                exports.createRoom(req, res ,next);        
            })
            }
        })
    } else {
        var data = req.locals.result;
        var oldData = req.locals.old;
        var changed = '';
        var changedArray = [];
        for (var i in data) {        
            if (hiSettings.projectNotify[i] && hiSettings.projectNotify[i].chat) {
                if (data[i] !== oldData[i]) {
                   changed = i + ' changed to ' + data[i];
                   changedArray.push(changed);
                } 
            }
        }

        if (changed !== '') {
            req.body.context = {
                    action: 'updated',
                    type: 'project',
                    name: data.title,
                    user: req.user.username,
                    description: changedArray,
                    url: config.host + '/projects/all/' + data._id + '/activities'
                }
            notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:data.room}, function(error, result){
                    if (error) {
                        req.hi = {error: error};
                    } 
            })
        }

        if (req.locals.result.title !== req.locals.old.title) {
            notifications.notify(['hi'], 'renameRoom', {name: generateRoomName(req.locals.result.title, req.locals.result._id), roomId:req.locals.result.room, message:'message'}, function(error, result){
            if (error) {
                console.log("there is error in renameRoom")
                req.hi = {error: error};
            } 
        }) }
        var added = req.locals.result.watchers.filter(function(o1){
            return !req.locals.old.watchers.some(function(o2){
                return o1.id === o2.id;
            });
        });
        for (var i in added) {
            console.log(JSON.stringify(added[i].profile))
            notifications.notify(['hi'], 'addMember', {member: added[i].profile.rcun, roomId:req.locals.result.room}, function(error, result){
            })
        }

        var removed = req.locals.old.watchers.filter(function(o1){
            return !req.locals.result.watchers.some(function(o2){
                return o1.id === o2.id;
            });
        });
        for (var i in removed) {
            notifications.notify(['hi'], 'removeMember', {member: removed[i].profile.rcun, roomId:req.locals.result.room}, function(error, result){
            if (error) {
                req.hi = {error: error};
            } 
            })
        }

        next();
    }

};


exports.sendNotification = function(req, res, next) { 
    if (req.locals.error) {
        return next();
    }    
    var data = req.locals.result;
    console.log("sendNotification data data")
    console.log(data)
    if (data.project) {
        req.body.context = {
                    action: 'added',
                    type: 'task',
                    name: data.title,
                    proj: data.project.title,
                    proj_url: config.host + '/projects/all/' + data.project._id + '/activities',
                    user: req.user.username,
                    url: config.host + '/tasks/by-project/' + data.project._id + '/' + data._id + '/activities'
                }
    	if (data.project.room) {            
            notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:data.project.room}, function(error, result){
                    if (error) {
                        req.hi = {error: error};
                    } 
            })
        } else {
            console.log("this project not have room!!!!!!!")
            Project.findOne({_id:data.project.id}).exec(function(error, project) {
                if (project.room) {
                    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:project.room}, function(error, result){
                    if (error) {
                        req.hi = {error: error};
                    } 
            })
                } else {
                    createRoomAndSendMessage(project, req, next);     
                }       
            })
        }
    }

    // added sub task
    else if(data.parent)
        Task.findOne({_id: data.parent}).populate('project').exec(function(error, task) {
                if (task.project.room) {
                    req.body.context = {
                    sub: 'sub-task',
                    sub_url: config.host + '/tasks/subTasks/' + task._id + '/' + data._id,
                    parent: task.title,
                    action: 'added',
                    type: 'task',
                    proj: task.project.title,
                    proj_url: config.host + '/projects/all/' + task.project._id + '/activities',
                    name: data.title,
                    user: req.user.username,
                    url: config.host + '/tasks/by-project/' + task.project._id + '/' + task._id + '/activities'
                    }
                    req.body.context.room = task.project.room;
                    req.body.context.user = req.user.name;        
                    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                                if (error) {
                                    req.hi = {error: error};
                                } 
                        })
                }
            })
   

    next();
};

exports.sendUpdate = function(req, res, next) {    
    if (req.locals.error) {
        return next();
    }
    
    if (req.body.context.room) {
        req.body.context.user = req.user.name;        
    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                if (error) {
                    req.hi = {error: error};
                } 
        })
    }

    else if(!req.body.context.room) {
        if (req.body.data.issue === 'project') {            
            Project.findOne({_id: req.body.data.issueId}).exec(function(error, project) {
                if (project.room) {
                    req.body.context.room = project.room;
                    req.body.context.user = req.user.name;        
                    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                                if (error) {
                                    req.hi = {error: error};
                                } 
                        })
                } else {
                    createRoomAndSendMessage(project, req, next);     
                }       
            })
            
        }
        else if (req.body.data.issue === 'task') {
            Task.findOne({_id: req.body.data.issueId}).populate('project').exec(function(error, task) {
                if (task.project.room) {
                    req.body.context.room = task.room;
                    req.body.context.user = req.user.name;        
                    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                                if (error) {
                                    req.hi = {error: error};
       
                                } 
                        })
                } else {
                createRoomAndSendMessage(task.project, req, next);
                }         
            })
        }
    }

    next();
};

exports.updateTaskNotification = function(req, res, next) {
    if (req.locals.error) {
        return next();
    }    
    var data = req.locals.result;
    console.log('data data data')
    console.log(data);
    var oldData = req.locals.old;
    var changed = '';
    var changedArray = [];
    var projectChanged = false;

    for (var i in data) {
        if (hiSettings.taskNotify[i] && hiSettings.taskNotify[i].chat) {
            if (i == 'due' &&  (typeof(data[i]) !== 'undefined' || typeof(oldData[i]) !== 'undefined')) {
                if (new Date(data[i]).getTime() !== new Date(oldData[i]).getTime()) {                
                    changed = i + ' changed to ' + data[i];
                    changedArray.push(changed);
                }
            }
            else if (i == 'watchers') {
                    var addedWatchers = [];
                    var removedWatchers = [];
                    var added = data.watchers.filter(function(o1){
                        return !oldData.watchers.some(function(o2){
                            return o1.id === o2.id;
                        });
                    });

                    var removed = req.locals.old.watchers.filter(function(o1){
                        return !req.locals.result.watchers.some(function(o2){
                            return o1.id === o2.id;
                        });
                    });

                    for (var i in added) {
                        addedWatchers.push('user ' + added[i].name + ' was added' + '\n');
                    }
                    for (var i in removed) {
                        removedWatchers.push('user ' + removed[i].name + ' was removed' + '\n');
                    }
                    if (addedWatchers.length > 0)
                        changedArray.push(addedWatchers);
                    if (removedWatchers.length > 0)
                        changedArray.push(removedWatchers); 
            }
            else if (i == 'project') {
                if (data[i].title !== oldData[i].title) {
                    changed = i + ' changed to ' + data[i].title;
                    changedArray.push(changed);
                    projectChanged = true;
                }
            }
            else if (i !== 'assign' && data[i] !== oldData[i]) {
               changed = i + ' changed to ' + data[i];
               changedArray.push(changed);
            }
            else if (i == 'assign') 
                if (oldData[i] && data[i] && data[i].username !== oldData[i].username) {
                    changed = i + ' changed to ' + data[i].username;
                    changedArray.push(changed);
                }
                else if (!oldData[i] && data[i]) {
                    changed = i + ' set to ' + data[i].username;
                    changedArray.push(changed);
                }
                else if (oldData[i] && !data[i]) {
                    changed = i + ' changed to no select';
                    changedArray.push(changed);
                }
        }
        
    }
    
    if (data.project && changed !== '') {
        req.body.context = {
                    action: 'updated',
                    type: 'task',
                    proj: data.project.title,
                    proj_url: config.host + '/projects/all/' + data.project._id + '/activities',
                    name: data.title,
                    user: req.user.username,
                    url: config.host + '/tasks/by-project/' + data.project._id + '/' + data._id + '/activities',
                    description: changedArray
                }
        if (data.project.room) {
            console.log("createMessage")
            console.log(changedArray)        
            notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:data.project.room}, function(error, result){
                    if (error) {
                        req.hi = {error: error};
                    } 
            })
            if (projectChanged == true) {
                notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:oldData.project.room}, function(error, result){
                    if (error) {
                        req.hi = {error: error};
                    } 
            })
            }
        } 
    }

    // update sub task
    else if (data.parent && changed !== '')
        Task.findOne({_id: data.parent}).populate('project').exec(function(error, task) {
                if (task.project.room) {
                    req.body.context = {
                    sub: 'sub-task',
                    sub_url: config.host + '/tasks/subTasks/' + task._id + '/' + data._id,
                    parent: task.title,
                    action: 'updated',
                    type: 'task',
                    proj: task.project.title,
                    proj_url: config.host + '/projects/all/' + task.project._id + '/activities',
                    name: data.title,
                    user: req.user.username,
                    url: config.host + '/tasks/by-project/' + task.project._id + '/' + task._id + '/activities',
                    description: changedArray
                    }
                    req.body.context.room = task.project.room;
                    req.body.context.user = req.user.name;        
                    notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:req.body.context.room}, function(error, result){
                                if (error) {
                                    req.hi = {error: error};
                                } 
                        })
                }
            })
   

    next();
};


 var msgWithUrl = function(msg, url) {
    if (!url) return msg;
    return '[' + msg + '](' + url + ')';
};

var bulidMassage = function (context) {
    console.log(JSON.stringify(context))
    if(context.action == 'added')
        context.type = 'new ' + context.type;
    var msg = _.capitalize(context.type);
    if(context.name)
        msg += ' "' + context.name + '"';
    if(context.sub !== 'sub-task') 
        msg = msgWithUrl(msg, context.url);
    else msg = msgWithUrl(msg, context.sub_url);
    if(context.sub == 'sub-task' && context.action == 'updated') {
        console.log("context sub task")
        msg += ' - sub task to task ' + msgWithUrl(context.parent, context.url);
    }
    if(context.proj && context.proj_url) {
        if(context.action == 'updated')
            msg += ' from project ';
        else if (context.action == 'added')
            msg += ' to project ';
        var proj = context.proj;
        var proj_url = msgWithUrl(proj, context.proj_url);
        msg += proj_url;
    }
    msg += ' was ' + context.action;    
    
    if(context.issue)
        msg += ' to ' + msgWithUrl(context.issue + ' "' + context.issueName + '"', context.location);
    if(context.user)
        msg += ' by ' + _.capitalize(context.user);
    if(context.description){
        var description = context.description;       
        msg += ':\n' + description;
        // msg += ':\n' + context.description.join('\n');
    }
    if(context.sub == 'sub-task' && context.action == 'added') {
        msg += ' as sub task to task ';
        if(context.parent)
            msg += msgWithUrl(context.parent, context.url);
    }
    return msg;
};


function createRoom(project, callback) {
    // Made By OHAD
    var ArrayOfusernames = [];
 
    // Get the username by the _id from the mongo.
    // There is callback so everything is in the callback
    UserCreator.findOne({ _id: project.creator}, function(err, user) {
        
        if(user && user.profile && user.profile.rcun) ArrayOfusernames.push(user.profile.rcun);

        // Check if there is watchers
        if (project.watchers && project.watchers.length != 0)
        {
            project.watchers.forEach(function (item) {
                if(item.profile && item.profile.rcun && ArrayOfusernames.indexOf(item.profile.rcun) < 0) 
                    ArrayOfusernames.push(item.profile.rcun);
            });
        }
        notifications.notify(['hi'], 'createRoom', {name: generateRoomName(project.title, project._id), message:'message',members:ArrayOfusernames}, function(error, result){
            callback(error, result)
            
        })

    //End Of callback    
    });
    // END Made By OHAD          
       
}

function createRoomAndSendMessage(project, req, next) {
    createRoom(project, function(error, result) {
                    if (error) {
                        req.hi = {error: error};
                        next();
                    } else {
                        console.log('result from createRoomAndSendMessage')
                        console.log(result)
                        project.room = result.id;
                        project.save();
                        req.body.context.room = result[0].rid;
                        req.body.context.user = req.user.name;        
                        notifications.notify(['hi'], 'createMessage', {message:bulidMassage(req.body.context),roomId:project.room}, function(error, result){
                                    if (error) {
                                        req.hi = {error: error};
                                    } 
                            })
                    }
                });
}
