const io = require('socket.io')();
const mongoAdapter = require('socket.io-adapter-mongo');
const config = require('meanio').loadConfig();

/**
 * Here we are using `userId` for `socket.io` room name in order to broadcast
 * messages to all sockets of the same user.
 * See https://socket.io/docs/rooms-and-namespaces/#Rooms
 */

function socketServer(server) {
  io.attach(server);
  io.adapter(mongoAdapter(config.db));
  io.on('connection', (socket) => {
    socket.once('register', (userId) => {
      socket.join(userId);
    })
  })
}

function notify(userId, msg) {
  io.to(userId).emit('update', msg)
}

module.exports = {
  socketServer,
  notify
};
