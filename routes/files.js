var express = require('express');
var router = express.Router();
var dateFormat = require('dateformat');
var now = new Date();

var fs = require('fs');
var path = require('path');
var multer = require('multer');


var uploader = multer({ dest: 'public/uploaddir/'});

router.get('/', function(req, res) {
    
    req.getConnection(function(err, connection) {
        connection.query('SELECT * FROM upload', function(err, results) {
            res.locals.data = results;
            res.render('upload/gallerij');
        });
    });
});


router.get("/new_upload", function(req, res){
    
        if(req.session.login){
    res.locals.req = req;
    res.render("upload/new_upload");
        } else {
    res.redirect('http://192.168.56.101:3000/secret/login');
  }
        
    
});

router.post("/new_upload", uploader.single('file'), function(req, res, next) {

    req.getConnection(function(err, connection) {
        
        if (err) throw err;
     
        var db_name = req.file.originalname;
        var db_re = /(?:\.([^.]+))?$/;
        var db_ext = db_re.exec(db_name)[1];
        var date = dateFormat(now, "dd-mm-yyyy");
        var sess_data = req.session;
        var uid = sess_data.data;
        console.log(ext);
        
        var file_nw = req.body.filename + "." + db_ext;
        console.log(file_nw);
        
        var data = {
            filename: req.body.filename + "." + db_ext,
            date: date,
            user_id: uid.id,
            username: uid.username
        };
                
        connection.query("INSERT INTO upload SET ? ", [data], function(err, results) {
            if (err) throw err;
            if(!results) {
                console.log("Uploaden is mislukt");
            };
        });
    });
    
    var name = req.file.originalname;
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(name)[1];                 
    console.log(ext);
    
    fs.rename(req.file.path, req.file.destination + req.body.filename + "." + ext);
    fs.readdir("public/uploaddir", function(err, files) {

        res.locals.files = files;
        res.redirect('/upload');
        console.log("Upload geslaagd");
    });
});

router.get("/gallerij", function (req, res, next) {
    res.render("upload/gallerij");
});

router.get('/show/:id', function(req, res) {
    var id = req.params.id;
    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM upload WHERE file_id = ?", [id], function(err, results) {
            connection.query("SELECT * FROM comments WHERE upload_id = ?", [id], function (err, result) { 
            console.log(results[0], result[0]);
            res.locals.result = result;
            res.locals.results = results[0];
            res.render('upload/show');
            
            });
        });
    });
});

router.post("/show/:id", function(req, res) {
    var id = req.params.id;
    var date = dateFormat(now, "dd-mm-yyyy");
    var message = req.body.comment_txt;
    var name = req.body.name;
    
    var data = {
        comment: message,
        upload_id: id,
        upload_by: name,
        date: date
    }
    
    req.getConnection(function(err, connection) {
        
        if (err) throw err;
    
    connection.query("INSERT INTO comments SET ? ", [data], function(err, results) {
            if (err) throw err;
            if(!results) {
                console.log("Uploaden is mislukt");
            };
        });
    });
    
    res.redirect('/upload/show/' + id);
    
});

module.exports = router;