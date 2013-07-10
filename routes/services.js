var mysql = require('mysql');

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
        connection.query( 'SELECT userid,name,photo FROM member where userid = ? or name = ?',[req.params.query,req.params.query], function(err, rows) {
            connection.end();
            res.json(rows);
        });
    });
}