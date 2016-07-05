var express = require('express');
var router = express.Router();
var passwordHash = require('password-hash');

// Kijken of er moet worden ingelogd
router.get('/', function(req, res, next) {
  if(req.session.login){
    res.locals.req = req;
    res.render('secret/index');    
  } else {
    res.redirect(req.baseUrl + '/login');
  }
});

// Uitloggen en redirectie
router.get('/logout', function(req, res, next){
  req.session.destroy(function(){
    res.redirect(req.baseUrl);
  });
});

// Laat het login formulier zien
router.get('/login', function(req, res, next) {
  res.locals.req = req;
  res.render('secret/login');
});

router.get('/register', function(req, res, next) {
    res.render('secret/register');
});

router.post('/register', function(req, res, next) {
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

router.post('/login', function(req, res, next) {
    
   var user_login = req.body.username;
   var password_login = req.body.password;
    
    req.getConnection(function(err, connection) {
        
        if (err) throw err;
        
        connection.query('SELECT * FROM users WHERE username = ?', [user_login], function(err, results) {
            
            if(results[0] && passwordHash.verify(password_login, results[0].password)) {
                
                  console.log('Ingevoerd: ' + password_login);
                  console.log(results[0].password);
                  req.session.regenerate(function(){
                  req.session.login = true;
                  req.session.username = user_login;
                      
                  var new_status = 1;
                  var uid = results[0].id;
                  connection.query("UPDATE users SET status = ? WHERE id = ? ", [new_status, uid], function(err, results) {
                  console.log(req.session.username + " is ingelogd");
                   });  
                      
                  req.session.data = results[0];
                  req.session.id = results[0].id;
                  res.redirect(req.baseUrl);
                      
            });
                
            } else if(!results[0]) {
                
                console.log('Geen resultaten'); // true
                res.redirect(req.baseUrl);
                
            } else {
                
                console.log('Else ..');
                res.redirect(req.baseUrl);
                
            }
            
        });
            
      });
        
    });

router.get('/logout/:id', function(req, res, next){
    var id = req.params.id;
    
    req.getConnection(function(err, connection) {
        
     if (err) throw err; 
        
     var new_status = 0;
     connection.query("UPDATE users SET status = ? WHERE id = ? ", [new_status, id], function(err, results) {
         console.log("Query wordt uitgevoerd ..");
     });    
    });
    
    req.session.destroy(function(){
    res.redirect(req.baseUrl);
  }); 
});
        

module.exports = router;