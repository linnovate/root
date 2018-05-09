var talkToRocketChat = require('./talkToRocketChat');

exports.createMessage = function(rocketChat, params, callback) {

  talkToRocketChat.talkToRocketChat(rocketChat, {
    method: 'POST',
    form: {
      text: params.message,
      roomId: params.roomId
    },
    cmd: '/api/v1/chat.postMessage'
  }, function(error, result) {
    callback(error, result);
  });
};
