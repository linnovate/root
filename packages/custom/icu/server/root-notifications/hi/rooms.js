var talkToRocketChat = require("./talkToRocketChat");

exports.createRoom = function(rocketChat, params, callback) {
  talkToRocketChat.talkToRocketChat(
    rocketChat,
    {
      method: "POST",
      cmd: "/api/v1/groups.create",
      form: {
        name: params.name
        // members: params.members
      }
    },
    function(error, result, statusCode) {
      if (
        error ||
        (error != null &&
          error != undefined &&
          error.status != undefined &&
          error.status == "error")
      ) {
        callback(error, result);
      } else {
        var roomId = result.group._id;
        if (params.members && params.members.length > 0) {
          for (var i = 0; i < params.members.length; i++) {
            var str = params.members[i].substring(
              0,
              params.members[i].lastIndexOf(".")
            );
            talkToRocketChat.talkToRocketChat(
              rocketChat,
              {
                method: "POST",
                cmd: "/api/v1/groups.invite",
                form: {
                  roomId: roomId,
                  username: str
                }
              },
              function(error, result) {}
            );
          }
        }
        callback(error, result);
      }
    }
  );
};

exports.renameRoom = function(rocketChat, params, callback) {
  talkToRocketChat.talkToRocketChat(
    rocketChat,
    {
      method: "POST",
      cmd: "/api/v1/groups.rename",
      form: {
        name: params.name,
        roomId: params.roomId
      }
    },
    function(error, result) {
      callback(error, result);
    }
  );
};
