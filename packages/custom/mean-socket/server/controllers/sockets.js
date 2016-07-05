'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  _ = require('lodash');
  
exports.createFromSocket = function(data, cb) {
  
  console.log("data");
  console.log(JSON.stringify(data));
  console.log("cb");
  console.log(cb);
  
  var message = new Message(data.message);
  message.user = data.user._id;
  message.time = new Date();
  message.title = data.channel;
  message.name = data.user;
  message.id = data.id;
  message.IsWatched = false;
  
  
  //OHAD
  
    //Check if there is allready message on this id
    Message.find({id: data.id}, function(err,obj) { 

        // There isn't message, so it create one
        if(!Object.keys(obj).length)
        {
            console.log("message.save");
            message.save(function(err) {
                if (err) console.log(err);
                Message.findOne({
                _id: message._id
                }).populate('user', 'name username').exec(function(err, message) {
                    return cb(message);
                });
            });
        }
        //There is this message, so it update it
        else
        {
            console.log("message.update");
            console.log(data.message.content);

            Message.findOneAndUpdate({ id: data.id }, { 
                "IsWatched" : false,
                "id" : data.id,
                "name" : data.user,
                "title" : data.channel,
                "time" : new Date(),
                "content" : data.message.content,
            }, function(err, user) {
                if (err) throw err;
                   
                   return cb(user);
            });
        }
    });

//END OHAD  
  
//   message.save(function(err) {
//     if (err) console.log(err);
//     Message.findOne({
//       _id: message._id
//     }).populate('user', 'name username').exec(function(err, message) {
//       return cb(message);
//     });
//   });
};

exports.getAllForSocket = function(channel, cb) {
  Message.find({
    //channel: channel
    title: channel
  }).sort('time').populate('user', 'name username').exec(function(err, messages) {
    return cb(messages);
  });
};

exports.getListOfChannels = function(cb) {
  Message.distinct('channel', {}, function(err, channels) {
    console.log('channels', channels);
    return cb(channels);
  });
};



// 'use strict';

// /**
//  * Module dependencies.
//  */
// var mongoose = require('mongoose'),
//   Article = mongoose.model('Article');

// exports.createFromSocket = function(data, cb) {
  
//   console.log("data");
//   console.log(JSON.stringify(data));
//   console.log("cb");
//   console.log(cb);
  
//   var article = new Article(data.message);
//   article.user = data.user._id;
//   article.title = data.channel;
//   article.name = data.user;
//   article.save(function(err) {
//     if (err) console.log(err);
//     Article.findOne({
//       _id: article._id
//     }).populate('user', 'name username').exec(function(err, article) {
//       return cb(article);
//     });
//   });
// };

// exports.getAllForSocket = function(channel, cb) {
//   Article.find({
//     title: channel
//   }).sort('created').populate('user', 'name username').exec(function(err, articles) {
//     return cb(articles);
//   });
// };

// exports.getListOfChannels = function(cb) {
//   Article.distinct('title', {}, function(err, articles) {
//     console.log(articles)
//     return cb(articles);
//   });
// };
