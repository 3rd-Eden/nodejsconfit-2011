/**
 * Demo dependencies
 */

var path = require('path')
  , connect = require('connect')
  , app = connect.createServer(connect.static(path.join(__dirname, '../')));

// require the new redis store
var sio = require('socket.io')
  , RedisStore = sio.RedisStore
  , io = sio.listen(app);

io.set('store', new RedisStore);

// same shit different server
io.sockets.on('connection', function (socket) {
  socket.on('chat', function (data) {
    socket.broadcast.emit('chat', data);
  })
});

// cluster compatiblity
if (!module.parent) {
  app.listen(process.argv[2] || 8081);
  console.log('Listening on ', app.address());
} else {
  module.exports = app;
}
