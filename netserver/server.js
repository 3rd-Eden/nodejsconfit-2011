/**
 * Demo dependencies
 */

var net = require('net')
  , repl = require('repl')
  , path = require('path')
  , connect = require('connect')
  , app = connect.createServer(connect.static(path.join(__dirname, '../')))
  , io = require('socket.io').listen(app);

process.on('uncaughtException', function (e) {
  console.error('(uncaught exception)', e.message);
  console.error(e.stack);
});

/**
 * Used to store the net server sockets
 *
 * @api private
 */

var sockets = [];

/**
 * Write to the queued sockets
 *
 * @param {String} nick nickname
 * @param {String} message message for the chat
 * @api private
 */

function netWrite (nick, message, me) {
  sockets.forEach(function (socket) {
    try {
      socket.write((!me ? '\n': '') + '(' + nick + ') ' + message + '\n');
      socket.repl.displayPrompt();
    } catch (e) {
      console.error(e.message, e.stack);
    }
  });
}

// setup a small netserver that we can use as a telnet chatbox
var server = net.createServer(function (socket) {
  socket.write('\n\nWelcome to the socket.io-o-tron 3000 chatbox. \n');
  socket.write('type .nick <nick> to change your nickname \n');
  socket.write('type .say <bla bla> to start chatting \n');
  socket.write('type .exit to close the chatbox \n\n\n');

  // start a repl session on the connected socket.
  var command = repl.start('socket.io > ', socket)
    , nickname = 'anonymous';

  // when you press .say <line> it will be emitted to the browser
  command.defineCommand('say', function (line) {
    io.sockets.emit('chat', { nickname: nickname, line: line });

    // just show what you just typed
    netWrite(nickname, line, true);
  });

  // change nicknames
  command.defineCommand('nick', function (nick) {
    nickname = nick;

    // write output
    socket.write('(server) Howdy ' + nick + '\n');
    this.displayPrompt();
  });

  // add the socket to our internal array
  socket.repl = command;
  sockets.push(socket);

  // remove the socket again
  socket.on('close', function () {
    sockets.splice(sockets.indexOf(socket), 1);
  });
});

// and this is all what is needed for socket.io
io.sockets.on('connection', function (socket) {
  socket.on('chat', function (data) {
    netWrite(data.nickname || 'anonymous', data.line);

    // also update all browsers
    socket.broadcast.emit('chat', data);
  });
})

server.listen(1337);
app.listen(8080);

console.log('telnet server started on port 1337 (telnet localhost 1337)');
console.log('socket.io started on port 8080 (http://localhost:8080)');
