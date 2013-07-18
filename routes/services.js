var mysql = require('mysql');

var baseUrl = 'http://www.alsquare.com:3000/whdoigo/upload/';

var private_key = 'alsquare';

var path = require('path');

var pool = mysql.createPool({
    host:'alsquare.com',
    port:3306,
    user:'whdoigo',
    password:'whdoigo',
    database:'whdoigo'
});

//var crypto = require('crypto');
//var cipher = crypto.createCipher('aes192', private_key);
//var decipher = crypto.createDecipher('aes192', private_key);


exports.test = function(req, res){
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'SELECT * FROM member', function(err, rows) {
            connection.end();
            res.cookie('ddd','test');
            res.cookie('ababab','dmdmdmdm');
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.selectuser = function(req, res){
    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'SELECT userid,name,photo FROM member where userid like ? or name like ?',['%'+req.query.q+'%','%'+req.query.q+'%'], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.createshare = function(req, res){
    var party_id;
    var c_id;
    if(req.get('auth') != undefined || req.get('auth') != ''){
        decipher.update(req.get('auth'),'hex','utf8');
        var userid = decipher.final('utf8');
    }
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
                                    connection.query('INSERT INTO member_party (userid, party_id) VALUES(?,?)',[req.session.userid,party_id],function(err, rows){
                                        connection.end();
                                        res.send(200,'true');
                                    });
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
                    connection.query('UPDATE member_party SET isnew = true WHERE party_id = ?',[req.body.party_id],function(err, rows){
                        connection.end();
                        res.send(200,'true');
                    });
                });
            });
        });
    });
};

exports.addmember = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'insert into member values(?,?,?,?,?)', [req.body.userid,req.body.pwd,req.body.name,baseUrl+path.basename(req.files.picture.path),req.cookies.regId],function(err, rows) {
            connection.end();

            if(rows == undefined){
                res.send(200, 'false');
            }else{
                res.send(200, 'true');
            }
        });
    });
};
//select memo,picture,picture_memo from shared natural join coordinate where s_id='?' and c_id='?'
exports.getcoords = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select *,case c_id when (select c_id from shared where s_id in (select max(s_id) from coordinate natural join shared where party_id = ?)) then true else false end recent from coordinate where party_id = ?',[req.query.party_id,req.query.party_id], function(err, rows) {
            if(err) throw err;
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.login = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select * from member where userid = ? and pwd = ?',[req.query.userid, req.query.pwd], function(err, rows) {
            if(rows.length == 1){
                req.session.userid = rows[0].userid;
                if(rows[0].register_id != req.cookies.regId){
                    connection.query('update member set register_id = ? where userid = ?',[req.cookies.regId,req.query.userid],function(err, rows){
                        connection.end();
                        //cipher.update(req.query.userid,'utf8','hex');
                        //var cypher = cipher.final('hex');
                        //res.set('auth',cypher);
                        res.send(200,'true');
                    });
                }else{
                    connection.end();
                    //cipher.update(req.query.userid,'utf8','hex');
                    //var cypher = cipher.final('hex');
                    //res.set('auth',cypher);
                    res.send(200,'true');
                }
            }else{
                connection.end();
                res.send(200,'false');
            }
        });
    });
};

exports.addfriend = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'insert into friendlist(friend_id,userid) values(?,?)',[req.query.friend_id, req.session.userid], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

exports.notfriend = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select userid,name,photo from member where userid in (select userid from (select userid from friendlist where friend_id = ?) a left outer join (select friend_id from friendlist where userid = ?) b on (a.userid = b.friend_id) where friend_id is null)',[req.session.userid,req.session.userid], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.getimages = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select * from shared where c_id = ?',[req.query.c_id], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.groupmember = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( "select * from (select party_id,group_concat(userid SEPARATOR ', ') members from member_party where party_id in (select party_id from member_party where userid = ?) group by party_id) a natural join (select party_id,isnew from member_party where userid = ?) b order by isnew desc",[req.session.userid,req.session.userid], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.friendlist = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select * from member where userid in (select friend_id from friendlist where userid = ?)',[req.session.userid], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.selectparty = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select * from party where party_id in (select party_id from member_party where userid = ?)',[req.session.userid], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.deletefriend = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'delete from friendlist where userid = ? and friend_id = ?',[req.session.userid,req.query.friend_id], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

exports.viewpicture = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'select memo,picture,picture_memo from shared natural join coordinate where s_id=? and c_id= ?',[req.query.s_id,req.query.c_id], function(err, rows) {
            connection.end();
            res.charset = "utf-8";
            res.json(rows);
        });
    });
};

exports.deletepicture = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'delete from  shared where s_id=?',[req.query.s_id], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

exports.updateread = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'update member_party set isnew = false where party_id = ? and userid = ?', [req.query.party_id ,req.session.userid], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

exports.outparty = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'delete from member_party where party_id = ? and userid = ?', [req.query.party_id ,req.session.userid], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

exports.sharepicture = function(req, res){
    pool.getConnection(function(err, connection) {
        connection.query( 'insert into shared(c_id,picture,picture_memo,up_date) values(?,?,?,now())', [req.body.c_id ,baseUrl+path.basename(req.files.picture.path),req.body.picture_memo], function(err, rows) {
            connection.end();
            res.send(200,'true');
        });
    });
};

/*
 { fieldCount: 0,
 affectedRows: 1,
 insertId: 14,
 serverStatus: 2,
 warningCount: 0,
 message: '',
 protocol41: true,
 changedRows: 0 }
 */