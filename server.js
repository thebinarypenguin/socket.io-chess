var express   = require('express')
  , socket    = require('socket.io')
  , http      = require('http')
  , path      = require('path')
  , routes    = require('./routes')
  , GameStore = require('./GameStore');

app = express();

var server = http.createServer(app)
  , io     = socket.listen(server);

var cookieParser = express.cookieParser('your secret here')
  , sessionStore = new express.session.MemoryStore();

// Application Settings
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Application Globals
app.locals.games = new GameStore();

// Middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(cookieParser);
app.use(express.session({ store: sessionStore }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Routes
app.get('/',         routes.home);
app.get('/game/:id', routes.game);
app.post('/start',   routes.startGame);
app.post('/join',    routes.joinGame);
app.all('*',         routes.invalid);

io.configure('development', function() {
  io.set('log level', 1);
  io.set('authorization', function (handshakeData, callback) {
    // Use the cookie parser middleware to parse the signed cookie and
    // add that data to the handshakeData object as a signedCookies property
    cookieParser(handshakeData, {}, function(err) {
      if (err) return callback(err);
      // Use that signed cookie data to load up the session
      sessionStore.load(handshakeData.signedCookies['connect.sid'], function(err, session) {
        if (err) return callback(err);
        // Save session to handshakeData for use later in the event handlers
        handshakeData.session = session;
        callback(null, true);
      });
    });
  });
});

// Sockets
io.sockets.on('connection', function (socket) {
  console.log('Socket '+socket.id+' connected');

  var sess = socket.handshake.session;

  socket.on('join', function(data) {
    if (data.gameID !== sess.gameID) {
      console.log('ERROR: Game ID mismatch');
      return;
    }

    var game = app.locals.games.find(data.gameID);
    game.addPlayer(data);

    console.log(data.playerName+ ' joined '+data.gameID);

    socket.join(data.gameID);
    io.sockets.in(data.gameID).emit('update', game);
  });

  socket.on('move', function(data) {
    if (data.gameID !== sess.gameID) {
      console.log('ERROR: Game ID mismatch');
      return;
    }

    var game = app.locals.games.find(data.gameID);
    game.move(data.move);

    console.log('Player Name: Move-String');

    io.sockets.in(data.gameID).emit('update', game)
  })

  socket.on('disconnect', function() {
    console.log('Player Name left GameID');
    console.log('Socket '+this.id+' disconnected');
  });
});

// And away we go
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
