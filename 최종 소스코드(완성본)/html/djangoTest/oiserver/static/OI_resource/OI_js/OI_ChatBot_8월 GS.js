/* ChatBot command manager (Google Cloud Speech API) */
/* 2차 룸에서 처리*/

/* https://sansho.studio/blog/live-google-speech-recognition-stream-with-nodejs-and-socketio 
   https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground
   
   참조하여 Google Cloud Speech API를 이용한 Streaming Recognition 클라이언트 작성
*/

OI_ChatBot = function(videoEvent)
{
    var oi = this;
    oi.stat = "none";
    oi.TV;
    oi.Frame;
    oi.recognition;
    //oi.first = 1;
    oi.room;
    oi.reply = true;

    var CBspeaker = document.getElementById('CBspeaker');
    
    //================= SOCKET IO =================
    const socket = io.connect('https://www.oddidea.xyz:3001'); //connection to socket 
    socket.on('connected', function (data) {
        console.log("[success]", data);
        //document.getElementById('textArea').value = data;
      //  startRecording();
    });

    socket.on('speechData', function (data) {
        console.log("socket.on _speechData_ : ", data);
        console.log("data.results[0].alternatives[0].transcript : ", data.results[0].alternatives[0].transcript);

        //document.getElementById('greyText').value = data.results[0].alternatives[0].transcript;
        //document.getElementById('textArea').value = data.results[0].alternatives[0].transcript;
   //     stopRecording(); // 별
        //if(data.results[0].alternatives[0].transcript !==""){
         //oi.reply = false;
            oi.Work(data.results[0].alternatives[0].transcript);
        $('#CBspeaker').bind('ended',function(){
            oi.reply = true;
        });
        
       // }
        
        
    });

    // 페이지에서 나갈 시 이벤트
    window.onbeforeunload = function () {
        if (streamStreaming) { socket.emit('endGoogleCloudStream', ''); }
        socket.disconnect();
    };
    
    oi.Init = function(Room)
    {
        console.log("init 내부");
        oi.stat = "waiting";
        
        // TV, Frame Asset 찾아서 매핑
        oi.findTV(Room);
        
        Room.needChatBotUpdate = false;
        console.log("chatbot init success");
        oi.room = Room;
        
        startRecording();
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
            if(msg.search("집사") != -1 || msg.search("집사야") != -1){
                oi.reply = false;    
                console.log("네 말씀하세요.");
               //  var audio = new Audio('/static/OI_resource/sounds/chatbot/imready.mp3'); audio.play();
                CBspeaker.src = '/static/OI_resource/sounds/chatbot/imready.mp3'; CBspeaker.play();
                
                //oi.reply = false;
                console.log(oi.reply);
                oi.stat = "listening";
            }
        }
        else if(oi.stat == "listening")
        {
            if(msg.search("됐어")!=-1 || msg.search("고마워")!=-1 || msg.search("아니야")!=-1){
                oi.reply = false;
                console.log("즐거운 하루 되세요.");
                CBspeaker.src = '/static/OI_resource/sounds/chatbot/haveaniceday.mp3'; CBspeaker.play();
                // var audio = new Audio('/static/OI_resource/sounds/chatbot/haveaniceday.mp3'); audio.play();
                $("#chatbot_val").attr("value","waiting");
                oi.stat = "waiting";
                //recognition.abort();
                //oi.recognition.stop();
            }
            else if(msg.search("tv켜")!=-1 || msg.search("tv켜줘")!=-1 || msg.search("tV틀어줘")!=-1 ||
                   msg.search("TV켜")!=-1 || msg.search("TV켜줘")!=-1 || msg.search("TV틀어줘")!=-1 ||
                   msg.search("티비켜")!=-1 || msg.search("티비켜줘")!=-1 || msg.search("티비틀어줘")!=-1){
                oi.reply = false;
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
            }
            else if(msg.search("tv꺼")!=-1 || msg.search("tv꺼줘")!=-1 || msg.search("TV꺼")!=-1 || 
                    msg.search("TV꺼줘")!=-1 || msg.search("티비꺼")!=-1 || msg.search("티비꺼줘")!=-1 || 
                    msg.search("티브이꺼")!=-1 || msg.search("티브이꺼줘")!=-1){
                oi.reply = false;
                if(videoEvent.stat != "off"){
                    console.log("알겠습니다.");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/yessir.mp3'; CBspeaker.play();
                    videoEvent.ClearVideoFcts(); // 또는 videoEvent.deleteVideoTexture(obj)
                }else{ 
                    console.log("이미 꺼져있는데요?");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/alreadyOFF.mp3'; CBspeaker.play(); 
                }
                //oi.stat = "waiting";
            }
            else if(msg.search("재생")!=-1 || msg.search("재생해")!=-1 || msg.search("재생해줘")!=-1 ||
                   msg.search("플레이")!=-1 || msg.search("플레이해")!=-1 || msg.search("플레이해줘")!=-1){
                
                if(videoEvent.stat == "stop"){
                    videoEvent.playVideo(oi.TV);
                }else if(videoEvent.stat == "off") { 
                    oi.reply = false;
                    console.log("재생중인 비디오가 없는걸요.");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                }
                else if(videoEvent.stat == "playing"){
                    oi.reply = false;
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/aleadyPlaying.mp3'; CBspeaker.play(); 
                }
                //oi.stat = "waiting";
            }
            else if(msg.search("멈춰")!=-1 || msg.search("일시정지")!=-1 || msg.search("잠깐멈춰")!=-1 ||
                   msg.search("잠깐멈춰줘")!=-1){
                oi.reply = false;
                if(videoEvent.stat == "playing"){
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/yessir.mp3'; CBspeaker.play();
                    videoEvent.pauseVideo(oi.TV);
                }else{ CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); }
                //oi.stat = "waiting";
            }
            else if(msg.search("정지")!=-1 || msg.search("되감기")!=-1 || msg.search("처음부터틀어줘")!=-1){
                oi.reply = false;
                if(videoEvent.stat != "off"){
                    videoEvent.stopVideo(oi.TV);
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/yeah.mp3'; CBspeaker.play();
                }else{ 
                    console.log("재생중인 비디오가 없는걸요.");
                    CBspeaker.src = '/static/OI_resource/sounds/chatbot/noPlayingVideo.mp3'; CBspeaker.play(); 
                }
                //oi.stat = "waiting";
            }
            else if(msg.search("다음영상보여줘")!=-1 || msg.search("다음영상틀어줘")!=-1 || msg.search("다음동영상보여줘")!=-1 ||
                   msg.search("다음동영상틀어줘")!=-1){
                oi.reply = false;
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
            }
            else if(msg.search("이전영상보여줘")!=-1 || msg.search("이전영상틀어줘")!=-1 || msg.search("이전영상보여줘")!=-1 || 
                   msg.search("이전동영상틀어줘")!=-1){
                    oi.reply = false;
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
            }
            else{
                oi.reply = false;
                console.log("무슨 말씀인지 모르겠어요.");
                CBspeaker.src = '/static/OI_resource/sounds/chatbot/what.mp3'; CBspeaker.play(); 
                //oi.stat = "waiting";
            }
                    
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
        }
    //  initRecording(); // 별
    }
    
    /* ############################################## */
    
    // socket
    //const socket = io.connect('https://www.oddidea.xyz:3001'); //connection to socket 

    //================= CONFIG =================
    // Stream Audio
    let bufferSize = 2048,
        AudioContext,
        context,
        processor,
        input,
        globalStream;

    //vars
    let audioElement = document.querySelector('audio'),
        finalWord = false,
        //resultText = document.getElementById('ResultText'),
        removeLastWord = true,
        streamStreaming = false;


    //audioStream constraints
    const constraints = {
        audio: true,
        video: false
    };

    /* ******* client.js ******** */

    //================= INTERFACE =================
    /*
    var startButton = document.getElementById("startRecButton");
    startButton.addEventListener("click", startRecording);

    var endButton = document.getElementById("stopRecButton");
    endButton.addEventListener("click", stopRecording);
    endButton.disabled = true;
    */
    function startRecording() {

      //  socket = io.connect('https://www.oddidea.xyz:3001'); //connection to socket 
        var info = {
            nickName : "user"//,
            //msg : "hihi"
        }                  
        socket.emit('join', info);

        //startButton.disabled = true;
        //endButton.disabled = true;
        initRecording();

    }

    function initRecording() {
        socket.emit('startGoogleCloudStream', ''); //init socket Google Speech Connection
        console.log("qwe");
        streamStreaming = true;
        AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || 
            window.oAudioContext || window.msAudioContext;
        context = new AudioContext();
        console.log("context : ", context); // 별
        processor = context.createScriptProcessor(bufferSize, 1, 1);
        processor.connect(context.destination);
        context.resume();
        
        var handleSuccess = function (stream) {
            globalStream = stream;
            input = context.createMediaStreamSource(stream);
            input.connect(processor);

            processor.onaudioprocess = function (e) {
                microphoneProcess(e);
            };
        };

        navigator.mediaDevices.getUserMedia(constraints)
            .then(handleSuccess);
    }
    
    function microphoneProcess(e) {
    //    console.log("e.inputBuffer : ", e.inputBuffer); // 별
        var left = e.inputBuffer.getChannelData(0);
        var left16 = convertFloat32ToInt16(left);
        
        if(oi.reply){
            socket.emit('binaryData', left16);
        }
    }
    // sampleRateHertz 16000 //saved sound is awefull
    function convertFloat32ToInt16(buffer) {
        let l = buffer.length;
        let buf = new Int16Array(l / 3);

        while (l--) {
            if (l % 3 == 0) {
                buf[l / 3] = buffer[l] * 0xFFFF;
            }
        }
        return buf.buffer
    }  

    function stopRecording() {
        // waited for FinalWord
       // startButton.disabled = true;
       // endButton.disabled = true;
        streamStreaming = false;
        socket.emit('endGoogleCloudStream', '');
        console.log("globalStream.getTracks() : ", globalStream.getTracks()); // 별
        console.log("CBspeaker : ", CBspeaker);
        let track = globalStream.getTracks()[0];
        track.stop();

        input.disconnect(processor);
        processor.disconnect(context.destination);
        context.close().then(function () {
            input = null;
            processor = null;
            context = null;
            AudioContext = null;
         //   startButton.disabled = false;
        });
    }

    /*
    //================= SOCKET IO =================
    oi.socket.on('connected', function (data) {
        console.log("[success]", data);
        //document.getElementById('textArea').value = data;
        startRecording();
    });

    oi.socket.on('speechData', function (data) {
        console.log("socket.on _speechData_ : ", data);
        console.log("data.results[0].alternatives[0].transcript : ", data.results[0].alternatives[0].transcript);

        //document.getElementById('greyText').value = data.results[0].alternatives[0].transcript;
        //document.getElementById('textArea').value = data.results[0].alternatives[0].transcript;
        
        oi.Work(data.results[0].alternatives[0].transcript);

    });

    // 페이지에서 나갈 시 이벤트
    window.onbeforeunload = function () {
        if (streamStreaming) { oi.socket.emit('endGoogleCloudStream', ''); }
        oi.socket.disconnect();
    };
    */
    
    /* ############################################## */
    
}