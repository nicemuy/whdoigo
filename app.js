
/**
 * Module dependencies.
 */

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , services = require('./routes/services')
  , gcm_server = require('./routes/gcm-server')
  , http = require('http')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser({keepExtensions:true,uploadDir: __dirname+'/public/upload'}));
app.use(express.methodOverride());
app.use(express.cookieParser('whdoigo'));
app.use(express.session());
app.use('/whdoigo',app.router);
app.use('/whdoigo',express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/services/test', services.test);
app.get('/users', user.list);
app.post('/upload', routes.upload);
app.get('/uploadForm', routes.uploadForm);
app.get('/services/selectuser', services.selectuser);
app.post('/services/createshare', services.createshare);
app.post('/services/addshare', services.addshare);
app.get('/gcm/register', gcm_server.register);
app.get('/gcm/push', gcm_server.push);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
