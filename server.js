var express = require('express')
  , http    = require('http')
  , path    = require('path')
  , routes  = require('./routes');

var app    = express();
var server = http.createServer(app);

// Application Settings
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

// Middleware
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
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

// And away we go
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
