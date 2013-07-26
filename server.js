var express = require('express')
  , http    = require('http')
  , path    = require('path');

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
app.get('/', function(req, res){
  res.render('home');
});

app.get('/game/:id', function(req, res){
  // if valid data in session
  //   render game view
  // else
  //   goto home page
  console.log(req.params);
  res.render('game', {id: req.params.id});
});

app.post('/start', function(req, res){
  // if valid form submission
  //   add valid data to session
  //   goto game page
  // else
  //   add error data to session
  //   goto home page
  console.log(req.body);
  res.redirect('/game/START_STUB');
});

app.post('/join', function(req, res){
  // if valid form submission
  //   add valid data to session
  //   goto game page
  // else
  //   add error data to session
  //   goto home page
  console.log(req.body);
  res.redirect('/game/JOIN_STUB');
});

app.all('*', function(req, res){
  res.redirect('/');
});

// And away we go
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
