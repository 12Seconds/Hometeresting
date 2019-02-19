var app = require('express')();
// http server¸¦ socket.io server·Î upgradeÇÑ´Ù
var express = require('express');

var port = 3001;

var fs = require('fs');
var path = require('path');
var url = require('url');

var options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/cert.pem'),
  ca: fs.readFileSync('/etc/letsencrypt/live/www.oddidea.xyz/chain.pem')
};

var server = require('https').createServer(options,app);
var io = require('socket.io')(server);

//const sqlite3 = require('sqlite3').verbose();
//let db = new sqlite3.Database('/var/www/html/djangoTest/db.sqlite3');

app.use(express.static(__dirname+'/static'));

app.get('https://www.oddidea.xyz:3001/socket.io/socket.io.js',function(req,res){
    //res.sendFile(__dirname + 'socekt.io.js');
    res.sendFile('https://www.oddidea.xyz/socket/');
});
    

server.listen(3001, function() {
  console.log('Socket IO server listening on port 3001');
});

io.on('connection',function(socket){
	console.log('user port 3001 connected');

    socket.on('testSend', function (data) {
        var msg = data.nickName+"Connected to Server";
        console.log(msg);
        socket.emit('messages', msg);
    });
    
});
