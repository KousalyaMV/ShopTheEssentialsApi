  var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
// module for maintaining sessions
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session=require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
var validator = require('express-validator');
var methodOverride = require('method-override');
app.use(methodOverride('_method'));
// path is used the get the path of our files on the computer
var path = require ('path');
// set the templating engine 
app.set('view engine', 'jade');

//set the views folder
app.set('views',path.join(__dirname + '/app/views'));


var dbPath  = "mongodb://localhost/ShopTheLook";

// command to connect with database
db = mongoose.connect(dbPath);

mongoose.connection.once('open', function() {

  console.log("database connection open success");

});

app.use(express.static(path.join(__dirname,'app')));
app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());
// initialization of session middleware 
app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key for whole app
  resave: true,
  httpOnly : true,//to prevent cookie forgery
  saveUninitialized: false,
  cookie: { secure: false } ,//make it true if ssl certificate is there
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
  res.locals.session = req.session;
  res.locals.login = req.isAuthenticated();
    next();
});
app.use(function(req, res, next) {
   req.session.cookie.maxAge = 180 * 60 * 1000; // 3 hours
    next();
});

// fs module, by default module for file management in nodejs
var fs = require('fs');

// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	// check if the file is js or not
	if(file.indexOf('.js'))
		// if it is js then include the file from that folder into our express app using require
		require('./app/models/'+file);

});// end for each

// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		// include a file as a route variable
		var route = require('./app/controllers/'+file);
		//call controller function of each file and pass your app instance to it
		route.controllerFunction(app)

	}

});//end for each
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });	
app.use(function(err, req, res, next) {
    res.status(err.status || 404);
    res.render('error', {
      message: err.message,
      error: err
    });
  });

app.listen(8080, function () {
  console.log('Shopping app listening on port 8080!');
});
