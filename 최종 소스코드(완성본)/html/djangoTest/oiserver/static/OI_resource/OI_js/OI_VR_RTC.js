 OI_VR_RTC = function ()
 {
     var oi = this;
    
     oi.connection = new RTCMultiConnection();
     oi.connection.socketURL = 'https://www.oddidea.xyz:9001/';
     oi.connection.extra.originNick = $("#userNickName").val();
     
     oi.device = null;
     
     oi.createFullRoomName = null;
     oi.MultiCreateFullRoomName = null;
     
     oi.joinFullRoomName = null;
     oi.MultiJoinFullRoomName = null;
     
     oi.isRTCWindow = false;
     
     oi.isRTCDoing = false;
     
     oi.disableRTCBtn = function(){
         $("#makeRTCRoom").css('display','none');
         $("#RTCChannelSearchSubmit").css('display','none');
         $("#RTCChannelSearch").css('display','none');
         
         $("#outRTCRoom").css('display','block');
     }
     oi.enableRTCBtn = function(){
         $("#makeRTCRoom").css('display','block');
         $("#RTCChannelSearchSubmit").css('display','block');
         $("#RTCChannelSearch").css('display','block');
         
         $("#outRTCRoom").css('display','none');
     }
     
     oi.mulDisableRTCBtn = function(){
         $("#makeRTCRoom").css('display','none');
         $("#RTCChannelSearchSubmit").css('display','none');
         $("#RTCChannelSearch").css('display','none');
         
         $("#multiCardBody").css('display','none');
         
         $("#outRTCRoom").css('display','block');
     }
     
     oi.mulEnableRTCBtn = function(){
         $("#makeRTCRoom").css('display','block');
         $("#RTCChannelSearchSubmit").css('display','block');
         $("#RTCChannelSearch").css('display','block');
         
         $("#multiCardBody").css('display','block');
         
         $("#outRTCRoom").css('display','none');
     }

    oi.connection.onUserStatusChanged = function(event) {

      if (event.status === 'offline') {
        // Is the room owner here?	
        var chat_room = oi.connection.sessionid; // Initiator
        //console.log(chat_room);
          
        setTimeout(function(){
            var chatters = oi.connection.getAllParticipants(); // 자신을 제외한 Array of chatters
            chatters.push(oi.connection.userid);
            console.log(chatters);
            var isInitiatorExist = chatters.indexOf(chat_room);
            if(isInitiatorExist !== -1)
                console.log('Initiator Exist. Nothing to do');
            else{ // Initiator가 나간 경우
                console.log('Initiator Exit!');
                if(chatters.length === 1) // 나 혼자 남은 경우
                {
                    oi.connection.DetectRTC.load(function(){ 
                        oi.device = oi.connection.DetectRTC;
                        
                        if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){
                            oi.connection.userid = chat_room; // 자신을 방장으로 만듦
                            // 재접속
                            oi.connection.leave();
                            oi.connection.open(chat_room,true);
                            console.log('i am now initiator : ' + oi.connection.userid);
                        }
                        else{
                             oi.connection.leave();
                             //oi.connection.close();
                             oi.connection.closeSocket();
                            alert("마이크 또는 스피커가 없어서 방장이 될 수 없음");
                        }
                    });
                }
                else // initiator가 나가고 여러 피어가 있는 경우
                {
                    chatters.sort();
                    //console.log(chatters);

                    // open or join
                    chatters[0].userid = chat_room; // 다른 사람을 방장으로 만듦

                    if(oi.connection.userid == chatters[0]){ 
                        // 방 다시 팜
                        oi.connection.leave();
                        oi.connection.open(chat_room,true);
                        for(var i=0; i<5; i++){
                            oi.connection.checkPresence(chat_room, function(isRoomExists, roomid){
                                if(isRoomExists){
                                    
                                }
                                else{
                                    oi.connection.leave();
                                    oi.connection.open(chat_room,true);
                                }
                            });
                        }
                        
                        console.log('i am initiator : '+chat_room);
                    }
                    else{
                        // 방 다시 들어감
                        oi.connection.leave();
                        oi.connection.closeSocket();
                        setTimeout(function(){
                                oi.connection.join(chat_room);
                            console.log('i am not initiator');
                        },400);

                    }
                    
                }
            }
        },2000);
      }
    };

     function chatAppendDiv(msg){
         var resMsg = msg.data || msg;
         var sender;
         if(msg.extra==undefined){
             sender = $("#userNickName").val();
         }
         else{
             sender = msg.extra.originNick;
         }
         
         var msgDiv = document.createElement('span');

         msgDiv.innerHTML = sender+" : "+ resMsg;
         var msgOutput = document.getElementById('RTCKeyChatOutput');
         msgOutput.appendChild(msgDiv);
         msgOutput.appendChild(document.createElement("br"));
         $("#RTCKeyChatOutput").scrollTop($("#RTCKeyChatOutput").scrollTop()+20.8);
     }
     
    // oi.connection.onmessage = chatAppendDiv;
     
     oi.chatFunction = function(){
         if(oi.isRTCDoing){
             //if($("#RTCKeyChatWindow").css('opacity')==0.4){
            //     $("#RTCKeyChatWindow").css('opacity','1');
            //     $("#inputDefault").focus();
             //}
             //else{
                 $("#RTCKeyChatWindow").css('opacity','1');
                 $("#inputDefault").focus();
                 
                 if($("#inputDefault").val().length !== 0){
                     $("#inputDefault").val($("#inputDefault").val().replace(/^\s+|\s+$/g, ''));
                     oi.connection.send($("#inputDefault").val());
                     
                     chatAppendDiv($("#inputDefault").val());
                     
                     $("#inputDefault").val('');
                 }
            
                // $("#inputDefault").blur();
             //}
         }
     }
    

     $("#outRTCRoom").off("click");
     $("#outRTCRoom").click(function(){
         oi.connection.leave();
         //oi.connection.close();
         oi.connection.closeSocket();
         //if($("#isMultiplaying").val()==="false"){
        //     oi.enableRTCBtn();
         //}
         //else{
             oi.mulEnableRTCBtn();
        // }
         $("#currentJoinRoomText").html("없음");
         oi.isRTCDoing = false;
         $("#RTCKeyChatOutput").empty();
         
         $("#RTCKeyChatWindow").css("display","none");
     });
     
     $("#RTCModalExit").off("click");
     $("#RTCModalExit").click(function(){
         $("#RTCModal").css("display","none");
         oi.isRTCWindow = true;
        
         $("#RTCModalinput").blur();
     });
     
     
     $("#makeMulRTCRoom").off("click");
     $("#makeMulRTCRoom").click(function(){
         if($("#isMultiplaying").val()==="true"){
             if($('#multiCreate').val()==="true"){
                 //console.log($("#userNickName").val());
                 //console.log($("#mulRoomName").val());
                oi.connection.DetectRTC.load(function(){ 
                     oi.device = oi.connection.DetectRTC;
                     if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){
                   
                         oi.MultiCreateFullRoomName = $("#userNickName").val()+"_"+$("#mulRoomName").val();

                         oi.connection.checkPresence(oi.MultiCreateFullRoomName, function(isRoomExists, roomid){
                             if(isRoomExists){
                                 alert("해당 방이 이미 존재합니다. 방으로 다시 참여합니다.");
                                 $("#currentJoinRoomText").html(oi.connection.sessionid);
                                 oi.disableRTCBtn();

                                 $("#RTCWindow").css("display","none");
                                 oi.isRTCWindow = false;
                                

                                 oi.isRTCDoing = true;
                                 
                         
                             }
                             else{
                                 // 기존에 있던 방에서 나감
                                 oi.connection.leave();
                                 oi.connection.closeSocket();
                                 $("#RTCKeyChatOutput").empty();
                                 
                                 $("#RTCModal").css("display","none");
                                 $("#RTCWindow").css("display","none");
                                 oi.isRTCWindow = false;
                           

                                 oi.connection.session = {
                                     audio: true,
                                     video: false,
                                     data: true
                                 };

                                 oi.connection.mediaConstraints = {
                                     audio: true,
                                     video: false
                                 };

                                 oi.connection.sdpConstraints.mandatory = {
                                    OfferToReceiveAudio: true,
                                    OfferToReceiveVideo: false
                                 };


                                 oi.connection.audiosContainer = document.getElementById('audioContainer');

                                 oi.connection.onstream = function(event) {
                                    var mediaElement = getHTMLMediaElement(event.mediaElement, {
                                        title: $("#userNickName").val(), // event.userid
                                        buttons: ['full-screen'],
                                        showOnMouseEnter: false
                                    });

                                    oi.connection.audiosContainer.appendChild(mediaElement);
                                    oi.connection.audiosContainer.appendChild('<br>');

                                    setTimeout(function() {
                                        mediaElement.media.play();
                                    }, 5000);

                                    mediaElement.id = event.streamid;
                                };

                                oi.connection.onstreamended = function(event) {
                                    var mediaElement = document.getElementById(event.streamid);
                                    if (mediaElement) {
                                        mediaElement.parentNode.removeChild(mediaElement);
                                    }
                                };

                                 oi.connection.open(oi.MultiCreateFullRoomName,true);
                                 oi.mulDisableRTCBtn();
                                 $("#currentJoinRoomText").html(oi.MultiCreateFullRoomName);
                                 
                                 oi.isRTCDoing = true;
                                 
                                 
                                 console.log(oi.MultiCreateFullRoomName+" create");

                             }
                         });
                     }
                     else
                         alert("마이크 또는 스피커가 없습니다.");
                 });

             }
             else{
                 alert("host만 가능합니다. 참여 버튼을 이용해 주세요.");
             }
         }
         else{
             alert("멀티 플레이 모드에서만 사용 가능합니다.");
         }
         
     });
     
     $("#joinMulRTCRoom").off("click");
     $("#joinMulRTCRoom").click(function(){
         if($("#isMultiplaying").val()==="true"){
             if($('#multiCreate').val()==="false"){

                 oi.MultiJoinFullRoomName = $("#mulRoomName").val();

                 oi.connection.checkPresence(oi.MultiJoinFullRoomName, function(isRoomExists, roomid){
                    if(isRoomExists){
                         // 기존에 있던 방에서 나감
                         oi.connection.leave();
                         oi.connection.closeSocket();
                        $("#RTCKeyChatOutput").empty();

                        oi.connection.DetectRTC.load(function(){
                            oi.device = oi.connection.DetectRTC;

                            if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){ // 참가자의 mic가 있는 경우

                                oi.connection.mediaConstraints = {
                                    audio: true,
                                    video: false
                                };
                                oi.connection.session = {
                                    audio: true,
                                    video: false,
                                    data: true
                                };
                            }
                            else if(oi.device.hasMicrophone===false && oi.device.hasSpeakers===true){ // 참가자의 mic가 없는 경우
                                oi.connection.mediaConstraints = {
                                    audio: false,
                                    video: false
                                };

                                oi.connection.session = {
                                    audio: false,
                                    video: false,
                                    data: true,
                                    oneway: true
                                };
                            }

                            oi.connection.sdpConstraints.mandatory = {
                                OfferToReceiveAudio: true,
                                OfferToReceiveVideo: true
                            };


                            oi.connection.audiosContainer = document.getElementById('audioContainer');

                            oi.connection.onstream = function(event) {
                                var mediaElement = getHTMLMediaElement(event.mediaElement, {
                                    title: $("#userNickName").val(), // event.userid
                                    buttons: ['full-screen'],
                                    showOnMouseEnter: false
                                });

                                oi.connection.audiosContainer.appendChild(mediaElement);
                                oi.connection.audiosContainer.appendChild('<br>');

                                setTimeout(function() {
                                    mediaElement.media.play();
                                }, 5000);

                                mediaElement.id = event.streamid;
                            };

                            oi.connection.onstreamended = function(event) {
                                var mediaElement = document.getElementById(event.streamid);
                                if (mediaElement) {
                                    mediaElement.parentNode.removeChild(mediaElement);
                                }
                            };


                            console.log(oi.connection.userid+" join");
                            oi.connection.join(oi.MultiJoinFullRoomName);
                            $("#currentJoinRoomText").html(oi.MultiJoinFullRoomName);
                            oi.mulDisableRTCBtn();

                            $("#RTCWindow").css("display","none");
                            oi.isRTCWindow = false;
                            
                            
                            oi.isRTCDoing = true;
                            
                        
                        });
                    }
                    else
                        alert("host가 방을 생성하지 않았습니다.");
                 });

             }
             else{
                 alert("host는 불가능합니다. 만들기 버튼을 이용해 주세요.");
             }
         }
         else{
             alert("멀티 플레이 모드에서만 사용 가능합니다.");
         }
     });
     
     $("#RTCModalinputCommit").off("click");
     $("#RTCModalinputCommit").click(function(){
         //start btn
         //console.log($("#RTCModalinput").val()); // input vlaue 
         //console.log($("#userNickName").val());
         if($("#RTCModalinput").val().length===0){
             alert("생성할 방 이름을 입력해 주세요");
         }
         else{
                  
             oi.connection.DetectRTC.load(function(){ 
                 oi.device = oi.connection.DetectRTC;
                 if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){

                     oi.createFullRoomName = $("#userNickName").val()+"_"+$("#RTCModalinput").val();

                     oi.connection.checkPresence(oi.createFullRoomName, function(isRoomExists, roomid){
                         if(isRoomExists){
                             alert("해당 방이 이미 존재합니다.");
                         }
                         else{
                             // 기존에 있던 방에서 나감
                             oi.connection.leave();
                             oi.connection.closeSocket();
                             $("#RTCKeyChatOutput").empty();

                             $("#RTCModal").css("display","none");
                             $("#RTCWindow").css("display","none");
                             oi.isRTCWindow = false;
                           

                             oi.connection.session = {
                                 audio: true,
                                 video: false,
                                 data: true
                             };

                             oi.connection.mediaConstraints = {
                                 audio: true,
                                 video: false
                             };

                             oi.connection.sdpConstraints.mandatory = {
                                OfferToReceiveAudio: true,
                                OfferToReceiveVideo: false
                             };

                             oi.connection.audiosContainer = document.getElementById('audioContainer');

                             oi.connection.onstream = function(event) {
                                var mediaElement = getHTMLMediaElement(event.mediaElement, {
                                    title: $("#userNickName").val(), // event.userid
                                    buttons: ['full-screen'],
                                    showOnMouseEnter: false
                                });

                                oi.connection.audiosContainer.appendChild(mediaElement);
                                oi.connection.audiosContainer.appendChild('<br>');

                                setTimeout(function() {
                                    mediaElement.media.play();
                                }, 5000);

                                mediaElement.id = event.streamid;
                            };

                            oi.connection.onstreamended = function(event) {
                                var mediaElement = document.getElementById(event.streamid);
                                if (mediaElement) {
                                    mediaElement.parentNode.removeChild(mediaElement);
                                }
                            };

                             oi.connection.open(oi.createFullRoomName,true);
                             oi.disableRTCBtn();
                             $("#RTCModalinput").blur();
                             $("#currentJoinRoomText").html(oi.createFullRoomName);

                             oi.isRTCDoing = true;
                             
                             //oi.chatFunction();
                             console.log(oi.createFullRoomName+" create");

                         }
                     });
                 }
                 else
                     alert("마이크 또는 스피커가 없습니다.");
             });
         }
     });
     
     $("#makeRTCRoom").off("click");
     $("#makeRTCRoom").click(function(){
         oi.isRTCWindow = true;
         oi.connection.DetectRTC.load(function(){   
             oi.device = oi.connection.DetectRTC;
             
             if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){
                $("#RTCModal").css("display","block");
             
                $("#RTCModalinput").focus();
             }
             else
                 alert("마이크가 있는지 확인해 주세요");
         });

     });
     
     $("#RTCChannelSearchSubmit").off("click");
     $("#RTCChannelSearchSubmit").click(function(){
         
         if($("#RTCChannelSearch").val().length===0){
             alert("입장할 방을 입력해주세요");
         }
         else{
             oi.joinFullRoomName = $("#RTCChannelSearch").val();

             oi.connection.checkPresence(oi.joinFullRoomName, function(isRoomExists, roomid){
                if(isRoomExists){
                     // 기존에 있던 방에서 나감
                     oi.connection.leave();
                     oi.connection.closeSocket();
                    $("#RTCKeyChatOutput").empty();

                    oi.connection.DetectRTC.load(function(){
                        oi.device = oi.connection.DetectRTC;

                        if(oi.device.hasMicrophone===true && oi.device.hasSpeakers===true){ // 참가자의 mic가 있는 경우

                            oi.connection.mediaConstraints = {
                                audio: true,
                                video: false
                            };
                            oi.connection.session = {
                                audio: true,
                                video: false,
                                data: true
                            };
                        }
                        else if(oi.device.hasMicrophone===false && oi.device.hasSpeakers===true){ // 참가자의 mic가 없는 경우
                            oi.connection.mediaConstraints = {
                                audio: false,
                                video: false
                            };

                            oi.connection.session = {
                                audio: false,
                                video: false,
                                data: true,
                                oneway: true
                            };
                        }

                        oi.connection.sdpConstraints.mandatory = {
                            OfferToReceiveAudio: true,
                            OfferToReceiveVideo: true
                        };

                        oi.connection.audiosContainer = document.getElementById('audioContainer');

                        oi.connection.onstream = function(event) {
                            var mediaElement = getHTMLMediaElement(event.mediaElement, {
                                title: $("#userNickName").val(), // event.userid
                                buttons: ['full-screen'],
                                showOnMouseEnter: false
                            });

                            oi.connection.audiosContainer.appendChild(mediaElement);
                            oi.connection.audiosContainer.appendChild('<br>');

                            setTimeout(function() {
                                mediaElement.media.play();
                            }, 5000);

                            mediaElement.id = event.streamid;
                        };

                        oi.connection.onstreamended = function(event) {
                            var mediaElement = document.getElementById(event.streamid);
                            if (mediaElement) {
                                mediaElement.parentNode.removeChild(mediaElement);
                            }
                        };

                        console.log(oi.connection.userid+" join");
                        oi.connection.join(oi.joinFullRoomName);
                        $("#currentJoinRoomText").html(oi.joinFullRoomName);
                        oi.disableRTCBtn();

                        $("#RTCWindow").css("display","none");
                        oi.isRTCWindow = false;
                    

                        oi.isRTCDoing = true;
                        
                        
                    });
                }
                else
                    alert("해당 방이 존재하지 않습니다.");
             });
         }
     });
     
     
     /*
    (function looper() {
        oi.connection.getPublicModerators(function(array) {
            setTimeout(looper, 3000);
        });
    })();
    */
     
 }