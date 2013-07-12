var gcm = require('node-gcm');
var mysql = require('mysql');

var pool = mysql.createPool({
    host:'alsquare.com',
    port:3306,
    user:'whdoigo',
    password:'whdoigo',
    database:'whdoigo'
});

exports.register = function (req, res) {

    pool.getConnection(function(err, connection) {
        // Use the connection
        connection.query( 'INSERT INTO register(party_id,register_id) values(?,?)', [req.query.party_id,req.cookies.regId], function(err, rows) {
            connection.end();
            console.log(req.query.party_id+" "+req.cookies.regId);
            res.send('true');
        });
    });
}


exports.push = function(req, res) {

    var message = new gcm.Message();

    var sender = new gcm.Sender('AIzaSyA7sfNlKbcyxhVDr-35d7VB4QMOC1Y0dY0');

    var registrationIds = [];


    // Optional

    message.addDataWithObject({
       test1:'message1',
       test2:'message2'
    });

    message.collapseKey = 'demo';

    message.delayWhileIdle = true;

    message.timeToLive = 3;


// At least one required

    registrationIds.push('이곳은 register 함수에서 받은 regId 를 입력하는 부분입니다.');


    /**

     * Parameters: message-literal, registrationIds-array, No. of retries, callback-function

     */

    sender.sendNoRetry(message, registrationIds, function (err, result) {

        console.log(result);

    });

}

