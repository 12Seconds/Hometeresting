/* VR Chatbot mode Video Event */

OI_VR_VideoEvent = function() // OI_VR_VideoEvent 으로 바꿀 것
{  
    var oi = this;
    
    oi.updateFcts = new Map(); // 재생할 비디오들을 저장하는 맵
    
    oi.stat = "off";
    oi.videoNamesList = [];
    oi.nowVideoNumber = -1; // -> 일단 하나의 TV 에셋에 대해서만 가능함, 여러개의 TV를 각각 컨트롤하려면 값이 여러개 필요
    
    oi.socket = null;
    oi.textureLoader = new THREE.TextureLoader();
    
// test play mode (single) ==============================================================
    oi.VideoInit = function(){ // oi.VideoInit 으로 바꿀 것

        
        var hostNick; // 수정 필요
        
        if($("#isMultiplaying").val()==="false")
        {
            if($("#isVisiting").val()==="true") // isVisiting 없음
                hostNick = $("#searchingName").attr("title");
            else
                hostNick = $("#userNickName").val();
        }
        else if($("#isMultiplaying").val()==="true")
        {
            if($('#multiCreate').val()==="true"){
                hostNick = $("#userNickName").val();
            }
            else{
                var tmpNick = $("#mulRoomName").val().split('_');
                hostNick = tmpNick[0];
                //$("#frameEvent").empty();
            }
        }
        
        //console.log("호스트닉:",hostNick);
        
        $.ajax({                            
            type: "POST",                   
            url: "/doVideoSearch/",               
            data: {"mynick": hostNick},      
            dataType: "json",                           
                                                                                                         
            success: function(response){       
                
                        console.log("hihi : "+response.filename);
            
                        oi.videoNamesList = [];
                        for(var i =1; i<response.filename.length+1;i++)
                        { oi.videoNamesList.push("media/"+response.filename[i-1]); }

                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });

    }

// common functions =====================================================================
    
    oi.deleteVideoTexture = function(obj) // 비디오 텍스쳐 삭제 (단일 객체)
    {
        obj.userData.haveVideo = false;
        obj.userData.videoURL = null;
        obj.userData.videoTexture.video.pause();
        obj.userData.videoTexture = null;

        obj.children[0].children[0].material.map = oi.textureLoader.load("/static/OI_resource/asset/furniture/tv/tv0/screen_off_screen_off.png");
        oi.stat = "off";
        oi.nowVideoNumber = -1;
    }
    
    oi.ClearVideoFcts = function(){
        // 1. 재생 가능한 모든 TV의 비디오 텍스쳐 삭제
        oi.updateFcts.forEach(function(updateFn, obj){
            oi.deleteVideoTexture(obj);
        });
        
        // 2. 맵 클리어
        oi.updateFcts.clear();
    }
    
    oi.changeVideo = function(obj, option){ // 이전, 다음 비디오 선택
        var vaild = false;
        if(option == 'next' && oi.videoNamesList.length > 0 && oi.nowVideoNumber < oi.videoNamesList.length-1){
            oi.nowVideoNumber+=1;
            vaild = true;
        }
        if(option == 'prev' && oi.videoNamesList.length > 0 && oi.nowVideoNumber > 0){
            oi.nowVideoNumber-=1;
            vaild = true;
        }
        
        if(vaild)
        {
            var url = "/"+oi.videoNamesList[oi.nowVideoNumber];
            console.log("changeVideo(vaild) - url : ", url);
            if(obj.userData.haveVideo === true){ // 이미 비디오가 설정되어 있다면 업데이트 맵에서 제거
                obj.userData.videoTexture.video.pause(); // 정지
                oi.updateFcts.delete(obj); // 제거
            }

            obj.userData.haveVideo = true;
            obj.userData.videoURL = url;
            obj.userData.videoTexture = new THREEx.VideoTexture(url); //videoTexture;

            obj.children[0].children[0].material.map = obj.userData.videoTexture.texture;
            // 업데이트 맵에 추가
            oi.updateFcts.set(obj, function(delta, now){ obj.userData.videoTexture.update(delta, now); });
            oi.stat = "stop";
            // oi.playVideo(obj); 동기화 오류 발생 시
            return 1;
        }
        else{ return 0; }
        
    }
    /*
    oi.nextVideo = function(obj){ // 다음 비디오 선택
        if(oi.videoNamesList.length > 0 && oi.nowVideoNumber < oi.videoNamesList.length-1)
        {
            oi.nowVideoNumber+=1;
            var url = oi.videoNamesList[oi.nowVideoNumber];
            
            if(obj.userData.haveVideo === true){ // 이미 비디오가 설정되어 있다면 업데이트 맵에서 제거
                obj.userData.videoTexture.video.pause(); // 정지
                oi.updateFcts.delete(obj); // 제거
            }
        
            obj.userData.haveVideo = true;
            obj.userData.videoURL = url;
            obj.userData.videoTexture = new THREEx.VideoTexture(url); //videoTexture;

            obj.children[0].children[0].material.map = obj.userData.videoTexture.texture;
            // 업데이트 맵에 추가
            oi.updateFcts.set(obj, function(delta, now){ obj.userData.videoTexture.update(delta, now); });
        }
    }
    */
    oi.playVideo = function(obj){ // 비디오 재생
    //  if(obj.userData.videoTexture !== null){
        if(obj.userData.haveVideo === true){
            console.log("oi.playVideo - obj : ", obj);
            oi.stat = "playing";
            obj.userData.videoTexture.video.play(); 
        }
        else{ console.log("비디오가 설정되어있지 않습니다."); }
    }
    
    oi.pauseVideo = function(obj){ // 비디오 일시정지
        if(obj.userData.haveVideo === true){
            oi.stat = "stop";
            obj.userData.videoTexture.video.pause(); 
        }
        else{ console.log("비디오가 설정되어있지 않습니다."); }
    }
    
    oi.stopVideo = function(obj){ // 비디오 정지 (되감음)
        if(obj.userData.haveVideo === true){
            oi.stat = "stop";
            obj.userData.videoTexture.video.pause();
            obj.userData.videoTexture.video.currentTime = 0;	
        }
        else{ console.log("비디오가 설정되어있지 않습니다."); }
    }
    
}