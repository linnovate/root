var rooms = require("./rooms");

Object.keys(rooms).forEach(function(methodName) {
  exports[methodName] = rooms[methodName];
});

var messages = require("./messages");

Object.keys(messages).forEach(function(methodName) {
  exports[methodName] = messages[methodName];
});

var members = require("./members");

Object.keys(members).forEach(function(methodName) {
  exports[methodName] = members[methodName];
});
