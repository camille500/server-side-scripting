// Modules inladen
var express = require('express'),                           
    path = require('path'),
    mysql = require('mysql'),
    session = require('express-session'),
    myConnection = require('express-myconnection'),
    bodyParser = require('body-parser'),
    passwordHash = require('password-hash');

var app = express();

// Database instellingen
var dbConnection = {
    host: 'localhost',
    user: 'student',
    password: 'serverSide',
    database: 'student'
};

// Routers laden
var userRouters = require('./routes/users'),
    fileRouters = require('./routes/files'),
    secretRouter = require('./routes/secret');

// Sessie gegevens
app.use(session({
    secret: "DMdKdxXxJddsUmxlldjW",
    resave: false,
    saveUninitialized: true
    }));

// Body-parser voor het uitlezen van POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Middleware voor het maken van verbinding met de database
app.use(myConnection(mysql, dbConnection, 'single'));

// Middleware voor de viewengine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Routers instellen
app.use(express.static('public')); // Voor het serveren van statische bestanden


app.use('/users', userRouters);
app.use('/upload', fileRouters);
app.use('/secret', secretRouter);


app.get('/', function(req, res) {
    res.render('index');
});

// 404 Pagina
app.enable('verbose errors');
app.use(function(req, res, next) {
   res.render('404');
});

// Start de server
app.listen(3000, function() {
    console.log('De server is opgestart: http://192.168.101:3000');
});
