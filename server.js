var path         = require('path')
  , http         = require('http')
  , express      = require('express')
  , socket       = require('socket.io')
  , httpRoutes   = require('./routes/http')
  , socketRoutes = require('./routes/socket')
  , GameStore    = require('./lib/GameStore');

var app    = express()
  , server = http.createServer(app)
  , io     = socket.listen(server);

var DB = new GameStore();

var cookieParser = express.cookieParser('I wish you were an oatmeal cookie')
  , sessionStore = new express.session.MemoryStore();

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware
app.use(express.favicon(__dirname + '/public/img/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(cookieParser);
app.use(express.session({ store: sessionStore }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/*
 * Only allow socket connections that come from clients with an established session.
 * This requires re-purposing Express's cookieParser middleware in order to expose
 * the session info to Socket.IO
 */
io.set('authorization', function (handshakeData, callback) {
  cookieParser(handshakeData, {}, function(err) {
    if (err) return callback(err);
    sessionStore.load(handshakeData.signedCookies['connect.sid'], function(err, session) {
      if (err) return callback(err);
      handshakeData.session = session;
      var authorized = (handshakeData.session) ? true : false;
      callback(null, authorized);
    });
  });
});

// Attach routes
httpRoutes.attach(app, DB);
socketRoutes.attach(io, DB);

// And away we go
server.listen(app.get('port'), function(){
  console.log('Socket.IO Chess is listening on port ' + app.get('port'));
});
