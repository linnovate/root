var sockets = {};

exports._new = function(id, socket) {
  console.log('USER ' + id.id + ' connected on socket ' + socket.id);
  if(!sockets[id.id]) sockets[id.id] = {};
  sockets[id.id][socket.id] = socket;

  console.log('*************** SOCKETS LIST ******************');
  for(var index in sockets) {
    console.log('user ' + index);
    for(var index1 in sockets[index]) {
      console.log('id ' + index1);
    }
  }
  console.log('*************** END OF SOCKETS LIST ***********');


  socket.on('disconnect', function() {
    console.log('User ' + id.id + ' disconnected');
    delete sockets[id.id][socket.id];
  });
};

exports.sockets = sockets;
