const io = require('socket.io')();

/**
 * Here we are using `userId` for `socket.io` room name in order to broadcast
 * messages to all sockets of the same user.
 * See https://socket.io/docs/rooms-and-namespaces/#Rooms
 */

function socketServer(server) {

  io.attach(server);
  console.log('socket.io server is listening');

  io.on('connection', (socket) => {

    console.log('user is connected');
    socket.once('register', (userId) => {

      console.log('userId:', userId);
      socket.join(userId);

    })

  })

}

function notify(userId, msg) {
  console.log('notifying:', userId, msg)
  io.to(userId).emit('update', msg)
}

module.exports = {
  socketServer,
  notify
};
