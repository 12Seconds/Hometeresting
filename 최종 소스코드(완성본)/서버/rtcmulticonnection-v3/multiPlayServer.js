var app = require('express')();
// http server¸¦ socket.io server·Î upgradeÇÑ´Ù
var express = require('express');

var port = 3000;

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

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('/var/www/html/djangoTest/db.sqlite3');

app.use(express.static(__dirname+'/static'));

app.get('https://www.oddidea.xyz:3000/socket.io/socket.io.js',function(req,res){
    //res.sendFile(__dirname + 'socekt.io.js');
    res.sendFile('https://www.oddidea.xyz/socket/');
});
    

server.listen(3000, function() {
  console.log('Socket IO server listening on port 3000');
});

io.on('connection',function(socket){
	console.log('user port 3000 connected');

	// »ç¿ëÀÚ Á¢¼Ó
	socket.on('roomKey', function(info){
        	//console.log(info);
        
        	socket.nickName = info.nickName;
        	socket.myKey = info.myKey;
        	socket.hostKey = info.hostKey;
        	socket.userImage = info.userImage;
        	socket.posX = info.posX;
        	socket.posY = info.posY;
        	socket.posZ = info.posZ;
        	socket.rotX = info.rotX;
        	socket.rotY = info.rotY;
        	socket.rotZ = info.rotZ;
            socket.colorR = info.colorR;
            socket.colorG = info.colorG;
            socket.colorB = info.colorB;
        
        	socket.join(info.hostKey);

        	// ÇØ´ç key°ª¿¡ ¿¬°áµÇ¾î ÀÖ´Â À¯Àúµé Á¤º¸
        	var innerRoomInfo = io.sockets.adapter.rooms[info.hostKey].sockets;

        	var users = new Array();
        
        	// ÇØ´ç Key¿¡ Á¢¼ÓµÇ¾î ÀÖ´Â ¸ðµç À¯ÀúÀÇ Á¤º¸¸¦ users¹è¿­¿¡ push
        	for (var clientId in innerRoomInfo ) {
            		var clientSocket = io.sockets.connected[clientId];
            		//console.log(clientSocket.nickName);
            		var userInfo = new Object();
            		userInfo.nickName = clientSocket.nickName;
            		userInfo.myKey = clientSocket.myKey;
            		userInfo.hostKey = clientSocket.hostKey;
            		userInfo.userImage = clientSocket.userImage;
            		userInfo.posX = clientSocket.posX;
            		userInfo.posY = clientSocket.posY;
            		userInfo.posZ = clientSocket.posZ;
            		userInfo.rotX = clientSocket.rotX;
            		userInfo.rotY = clientSocket.rotY;
            		userInfo.rotZ = clientSocket.rotZ;
                    userInfo.colorR = clientSocket.colorR;
                    userInfo.colorG = clientSocket.colorG;
                    userInfo.colorB = clientSocket.colorB;
            		users.push(userInfo);
        	}
        
        	console.log(socket.nickName+" user "+socket.hostKey+" room join");
        	io.to(info.hostKey).emit('joinRoom',users);
    	});

	// Ä³¸¯ÅÍ Æ÷Áö¼Ç, ·ÎÅ×ÀÌ¼Ç ¾÷µ¥ÀÌÆ®
    	socket.on('charUpdate',function(userData){
        	socket.posX = userData.posX;
        	socket.posY = userData.posY;
        	socket.posZ = userData.posZ;
        	socket.rotX = userData.rotX;
        	socket.rotY = userData.rotY;
        	socket.rotZ = userData.rotZ;
        
        	//console.log(userData);
        
        	io.to(userData.hostKey).emit('posUpdate',userData);
    	});
    
    // frame 이미지 업데이트
    socket.on('frameUpdate',function(frameInfo){
        //console.log(frameInfo);
        io.to(frameInfo.hostKey).emit('frameUpdate',frameInfo);
    });

	socket.on('disconnect', function () {
        	console.log(socket.nickName+" user "+socket.hostKey+" room leave");
        	//console.log(socket);
        
        	var leaveUser = new Object();
        	leaveUser.nickName = socket.nickName;
        	leaveUser.myKey = socket.myKey;
        	leaveUser.hostKey = socket.hostKey;

        	var sqlHostKey = leaveUser.hostKey.split('_');
        	// 호스트 키로 호스트 닉네임 얻기
        	let sql = "select userNickName from oiserver_userinfo where userID="
        				+"'"+sqlHostKey[0]+"';";

			db.get(sql, [], (err, rows) => {
			  if (err) {
			    throw err;
			  }
			  // host = rows.userNickName
			  // mulRoomName = host+'_'+sqlHostKey[1]
			  var hostNickName = rows.userNickName;
			  var mulRoomName = hostNickName+'_'+sqlHostKey[1];

			  let sql2 = "update oiserver_multiplayroom set NumPeople=NumPeople-1 "+
			   			"where host='"+hostNickName+"' "
			   			+ "and mulRoomName='"+mulRoomName+"';";

			   db.run(sql2,function(err){
			 		if(err){
			 			return console.error(err.message);
			 		}
			   });
			   
			   let sql3 = "select NumPeople from oiserver_multiplayroom "+
			    		"where host='"+hostNickName+"' "+
			    		 "and mulRoomName='"+mulRoomName+"';";

			    db.get(sql3,[],(err,rows) =>{
			    	if(err){
			    		throw err;
			    	}

			    	if(rows.NumPeople < 1){
			    		let sql4 = "delete from oiserver_multiplayroom "+
			    					"where NumPeople < 1;";

			    		db.run(sql4,function(err){
					 		if(err){
					 			return console.error(err.message);
					 		}
					   });
			    	}
			    });
			});
        
        	io.to(leaveUser.hostKey).emit('leaveRoom',leaveUser);
    	});
});
