var mysql = require('mysql');

var baseUrl = 'http://www.alsquare.com:3000/whdoigo/upload/';

var path = require('path');

var pool = mysql.createPool({
    host:'alsquare.com',
    port:3306,
    user:'whdoigo',
    password:'whdoigo',
    database:'whdoigo'
});




exports.test = function(req, res){
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'SELECT * FROM member', function(err, rows) {
            connection.end();
            res.json(rows);
        });
    });
};

exports.selectuser = function(req, res){
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'SELECT userid,name,photo FROM member where userid like ? or name like ?',['%'+req.query.q+'%','%'+req.query.q+'%'], function(err, rows) {
            connection.end();
            res.json(rows);
        });
    });
};

exports.createshare = function(req, res){
    var party_id;
    var c_id;
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'insert into party(uptodate) values(null);', function(err, rows) {
            party_id = rows.insertId;
            connection.query('INSERT INTO coordinate (sx, sy, location, party_id, memo) VALUES(?, ?, ?, ?, ?)',[req.body.sx,req.body.sy,req.body.location,party_id,req.body.memo],function(err, rows){
                c_id = rows.insertId;
                connection.query('INSERT INTO shared (c_id, picture, picture_memo, up_date) VALUES(?, ?, ?, now())',[c_id,baseUrl+path.basename(req.files.picture.path),req.body.picture_memo],function(err, rows){
                    for(var i=0;i<req.body.userid.length;i++){
                        (function(){
                            var j = i;
                            connection.query('INSERT INTO member_party (userid, party_id) VALUES(?,?)',[req.body.userid[j],party_id],function(err, rows){
                                if(err) throw err;
                                if(j == req.body.userid.length-1){
                                    connection.end();
                                    res.send(200,'true');
                                }
                            });
                        })();
                    }
                });
            });
        });
    });
};

exports.addshare = function(req, res){
    var c_id;
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'update party set uptodate = null where party_id  = ?', [req.body.party_id],function(err, rows) {
            connection.query('INSERT INTO coordinate (sx, sy, location, party_id, memo) VALUES(?, ?, ?, ?, ?)',[req.body.sx,req.body.sy,req.body.location,req.body.party_id,req.body.memo],function(err, rows){
                c_id = rows.insertId;
                connection.query('INSERT INTO shared (c_id, picture, picture_memo, up_date) VALUES(?, ?, ?, now())',[c_id,baseUrl+path.basename(req.files.picture.path),req.body.picture_memo],function(err, rows){
                    console.log('success');
                    connection.end();
                    res.send(200,'true');
                });
            });
        });
    });
};