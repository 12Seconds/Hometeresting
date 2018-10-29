/* ChatBot command manager (Google Cloud Speech API) */
/* 2차 룸에서 처리*/

OI_ChatBot = function(videoEvent)
{
    var oi = this;
    oi.stat = "none";
    oi.TV;
    oi.Frame;
    oi.recognition;
    //oi.first = 1;
    oi.room;
    oi.Init = function(Room)
    {
        console.log("init 내부");
        oi.stat = "waiting";
        
        // TV, Frame Asset 찾아서 매핑
        oi.findTV(Room);
        
        Room.needChatBotUpdate = false;
        console.log("chatbot init success");
        oi.room = Room;
    }
    
    oi.findTV = function(Room)
    {
        // TV, Frame Asset 찾아서 매핑
        Room.scene.traverse(function (e) {
            if(e.name.substring(0,2)==="tv"){ oi.TV = e; console.log(oi.TV); }
            //if(e.name.substring(0,5)==="frame"){ oi.Frame = e; console.log(oi.Frame); }
        });
    }
    
    oi.update = function(Room)
    {
        if(Room.needChatBotUpdate)
            oi.Init(Room);

        // detecting controller input
        if(!Room.needLoading && !Room.needChatBotUpdate){
        //    if(oi.controller.getTriggerBtnState()===true){
        //        console.log("vr버튼클릭");
       //     }
        }
        
    }
    
    oi.Work = function(msg)
    {
        msg = msg.replace(/ /gi, ""); // remove blank
        console.log("oi.Work - msg : ", msg);
        console.log("oi.Work - stat : ", oi.stat);
        
        if(oi.stat == "waiting")
        {
            if(msg == "집사" || msg == "집사야"){
                    
                console.log("네 말씀하세요.");
                // var audio = new Audio('/static/OI_resource/sounds/chatbot/imready.mp3'); audio.play();
                CBspeaker.src = '/static/OI_resource/sounds/chatbot/imready.mp3';
                CBspeaker.play();

                oi.stat = "listening";
            }
        }
        else if(oi.stat == "listening")
        {
            switch(msg)
            {        
                case "됐어" :
                case "고마워" :
                case "아니야" :
                    console.log("즐거운 하루 되세요.");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/haveaniceday.mp3'; CBspeaker.play();
                    // var audio = new Audio('/static/OI_resource/sounds/chatbot/haveaniceday.mp3'); audio.play();
                    $("#chatbot_val").attr("value","waiting");
                    //oi.stat = "waiting";
                    //recognition.abort();
                    //oi.recognition.stop();
                    break;

                case "tv켜" :
                case "tv켜줘" :
                case "tV틀어줘" :
                case "TV켜" :
                case "TV켜줘" :
                case "TV틀어줘" :
                case "티비켜" :
                case "티비켜줘" :
                case "티비틀어줘" :    
                case "티브이켜" :                    
                case "티브이켜줘" :
                case "티브이틀어줘" :
                    if(videoEvent.stat == "off"){
                        console.log("알겠습니다.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/yessir.mp3'; CBspeaker.play();
                        if(oi.Room != null)
                            oi.findTV(oi.Room);
                        videoEvent.changeVideo(oi.TV, "next");
                        videoEvent.playVideo(oi.TV);

                    }else{ console.log("이미 켜져 있는데요?");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/alreadyON.mp3'; CBspeaker.play();
                    }
                    //oi.stat = "waiting";
                    break;
                    
                case "tv꺼" :
                case "tv꺼줘" :
                case "TV꺼" :
                case "TV꺼줘" :
                case "티비꺼" :
                case "티비꺼줘" :
                case "티브이꺼" :                    
                case "티브이꺼줘" :
                    if(videoEvent.stat != "off"){
                        console.log("알겠습니다.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/yessir.mp3'; CBspeaker.play();
                        videoEvent.ClearVideoFcts(); // 또는 videoEvent.deleteVideoTexture(obj)
                    }else{ 
                        console.log("이미 꺼져있는데요?");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/alreadyOFF.mp3'; CBspeaker.play(); 
                    }
                    //oi.stat = "waiting";
                    break;
                
                case "재생" :
                case "재생해" :    
                case "재생해줘" :
                case "플레이" :
                case "플레이해" :
                case "플레이해줘" :
                    if(videoEvent.stat == "stop"){
                        videoEvent.playVideo(oi.TV);
                    }else if(videoEvent.stat == "off") { 
                        console.log("재생중인 비디오가 없는걸요.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                    }
                    else if(videoEvent.stat == "playing"){
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/aleadyPlaying.mp3'; CBspeaker.play(); 
                    }
                    //oi.stat = "waiting";
                    break;
                
                case "멈춰" :
                case "일시정지" :
                case "잠깐멈춰" :
                case "잠깐멈춰줘" :
                    if(videoEvent.stat == "playing"){
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/yessir.mp3'; CBspeaker.play();
                        videoEvent.pauseVideo(oi.TV);
                    }else{ CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); }
                    //oi.stat = "waiting";
                    break;
                
                case "정지" :
                case "되감기" :
                case "처음부터틀어줘" :
                    if(videoEvent.stat != "off"){
                        videoEvent.stopVideo(oi.TV);
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/yeah.mp3'; CBspeaker.play();
                    }else{ 
                        console.log("재생중인 비디오가 없는걸요.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                    }
                    //oi.stat = "waiting";
                    break;
                
                case "다음영상보여줘":
                case "다음영상틀어줘":
                case "다음동영상보여줘":
                case "다음동영상틀어줘":
                    if(videoEvent.stat != "off"){
                        if(videoEvent.changeVideo(oi.TV, "next"))
                        {CBspeaker.src = '/static/OI_resource/sounds/chatbot/yeah.mp3'; CBspeaker.play(); videoEvent.playVideo(oi.TV);}
                        else
                        {CBspeaker.src = '/static/OI_resource/sounds/chatbot/lastVideo.mp3'; CBspeaker.play();}
                    }else{ 
                        console.log("재생중인 비디오가 없는걸요.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                    }   
                    //oi.stat = "waiting";
                    break;
                    
                case "이전영상보여줘":
                case "이전영상틀어줘":
                case "이전동영상보여줘":
                case "이전동영상틀어줘":
                    if(videoEvent.stat != "off"){
                        if(videoEvent.changeVideo(oi.TV, "prev"))
                        {CBspeaker.src = '/static/OI_resource/sounds/chatbot/yeah.mp3'; CBspeaker.play(); videoEvent.playVideo(oi.TV);}
                        else
                        {CBspeaker.src = '/static/OI_resource/sounds/chatbot/latestVideo.mp3'; CBspeaker.play();}
                    }else{ 
                        console.log("재생중인 비디오가 없는걸요.");
                        CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                    }
                    //oi.stat = "waiting";
                    break;
                    
                /*
                case "다음 그림 보여줘":
                case "다음 사진 보여줘":
                    console.log("알겠습니다.");
                    FrameEvent.changeImage(oi.Frame, "next")
                    oi.stat = "waiting";
                    break;
                case "이전 그림 보여줘":
                case "이전 사진 보여줘":
                    console.log("알겠습니다.");
                    FrameEvent.changeImage(oi.Frame, "prev")
                    oi.stat = "waiting";
                    break;
                */
                default :
                    console.log("무슨 말씀인지 모르겠어요.");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/what.mp3'; CBspeaker.play(); 
                    //oi.stat = "waiting";
                    break;
            }
        }
    }
    
    /* ############################################## */
    
    if (window.hasOwnProperty('webkitSpeechRecognition')) {

        oi.recognition = new webkitSpeechRecognition();
        console.log(oi.recognition);
        oi.recognition.continuous = false;
        oi.recognition.interimResults = false;
        oi.recognition.lang = "ko-KR";

        oi.recognition.onresult = function(e) {
            //console.log(e);
            var result = e.results[0][0].transcript;
            console.log("recognition - on RESULT : ", result);
            
           // if(!oi.first)
                oi.Work(result);
                
                
       

            //    oi.recognition.stop();
            //    document.getElementById('labnol').submit();
        };

        oi.recognition.onerror = function(e) {
            console.log("recognition - on error");
            oi.recognition.stop();
        }

        oi.recognition.onend = function(event) {
            console.log("recognition - on end");
            /*
            if(oi.first){
                oi.first=0;
            }
            */
          //recognition.start();
        }

        /*
        function resetVoiceRecog() {
            oi.recognition.stop();
        }
        //interval = setInterval(resetVoiceRecog, 5000);
        */
        oi.recognition.start();
        
    }else{ console.log("시스템 또는 브라우저가 webkitSpeechRecognition을 지원하지 않습니다."); }
    
    /* ############################################## */
    
}