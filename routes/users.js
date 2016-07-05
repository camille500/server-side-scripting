var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');


// Alle users opslaan in res.locals.data > Kan worden gebruikt in users/index.ejs
router.get('/', function(req, res) {
    req.getConnection(function(err, connection) {
        connection.query('SELECT * FROM users', function(err, results) {
            res.locals.data = results;
            res.render('users/index');
        });
    });
});

router.get('/new', function(req, res) {
    res.render('users/new_user');
});

// Nieuwe gebruiker wordt aangemaakt met ingevulde gegevens uit formulier users/new_user.ejs
router.post('/new', function(req, res) {
    req.getConnection(function (err, connection) {
        var data = {
            username: req.body.username,
            password: passwordHash.generate(req.body.password),
            mail: req.body.mail,
            hometown: req.body.hometown
        };
        connection.query("INSERT INTO users set ? ", [data], function(err, results) {
            res.redirect('/users');
        });
    });
});

// Opent pagina waar gebruiker kan worden bewerkt, ID wordt meegegeven 
router.get('/change_user/:id', function(req, res) {
    var id = req.params.id;
    req.getConnection(function(err, connection) {
        connection.query('SELECT * FROM users WHERE id = ?', [id], function(err, results) {
            res.locals.data = results[0];
            res.render('users/change_user');
        });
    });
});

// Bewerkt het account met unieke ID
router.post('/change_user/:id', function(req, res) {
    var id = req.params.id;
    req.getConnection(function (err, connection) {
        var data = {
            username: req.body.username,
            password: req.body.password,
            mail: req.body.mail,
            hometown: req.body.hometown
        };
        connection.query("UPDATE users set ? WHERE id = ? ", [data,id], function(err, results) {
            res.redirect('/users');
        });
    });
});

router.get('/delete_user/:id', function(req, res) {
  var id = req.params.id;
  req.getConnection(function (err, connection) {
    connection.query("DELETE FROM users WHERE id = ? ", [id], function(err, results) {
         res.redirect('/users');
    });
  });
});

module.exports = router;