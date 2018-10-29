OI_VideoEvent = function()
{  
    var oi = this;
    
    oi.updateFcts = new Map(); // 재생할 비디오들을 저장하는 맵
    
    oi.socket = null;
    
    oi.textureLoader = new THREE.TextureLoader();
    
    oi.videoPath =null;
// test play mode (single) ==============================================================
    oi.tpVideoInit = function(asset){

        // Ajax & div settings 비디오 목록 세팅 ---------------
        /*
        $("#video1").off('click'); // 이벤트 제거
        $("#video2").off('click');
        
        $( "#video1" ).click(function() {
            oi.selectVideo(asset, 'static/test.mp4');
        });
        
        $( "#video2" ).click(function() {
            oi.selectVideo(asset, 'static/perfect.mp4');
        });
        */
        
        
        var hostNick;
        //console.log($("#isMultiplaying").val());
        
        if($("#isMultiplaying").val()==="false")
        {
            if($("#isVisiting").val()==="true"){
                hostNick = $("#searchingName").attr("title");
                $("#videoBody").css("display","none");
            }
            else{
                hostNick = $("#userNickName").val();
                $("#videoBody").css("display","block");
            }
                
        }
        else if($("#isMultiplaying").val()==="true")
        {
            $("#videoBody").css("display","none");
            if($('#multiCreate').val()==="true"){
                hostNick = $("#userNickName").val();
            }
            else{
                var tmpNick = $("#mulRoomName").val().split('_');
                hostNick = tmpNick[0];
                //$("#frameEvent").empty();
            }
        }
        
        console.log("호스트닉:",hostNick);
        
        $.ajax({                            
            type: "POST",                   
            url: "/doVideoSearch/",               
            data: {"mynick": hostNick},      
            dataType: "json",                           
                                                                                                         
            success: function(response){        
                        $("#video_List").empty();

                            for(var i =1; i<response.filename.length+1;i++)
                            {
                                var name = response.filename[i-1];
                                var start = name.indexOf("/");
                                var end   = name.lastIndexOf(".");
                                name = name.substr(start+1,end);
                    

                                var tmp ="<tr id='video"+i+"' title='"+"media/"+response.filename[i-1]+"' class='table-primary'><th scope='row'>"+i+"</th><td>"+name+"</td></tr>"
                                $("#video_List").append(tmp);
                                $("#video"+i).click(function() {
                                    oi.selectVideo(asset,  $(this).attr("title"));
                                    oi.videoPath = $(this).attr("title");
                                });

                            }
                        //});

                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });





        // 컨트롤러 세팅 --------------------------------------
        $("#video_play").off('click'); // 이벤트 제거
        $("#video_pause").off('click');
        $("#video_stop").off('click');
        
        $("#video_play").click(function(){
            oi.playVideo(asset);
        });
        
        $("#video_pause").click(function(){
            oi.pauseVideo(asset);
        });

        $("#video_stop").click(function(){
            oi.stopVideo(asset);
        });

        $("#videoDelete").click(function(){
            oi.deleteVideo();
        });
        
        // Div 출력 ------------------------------------------
        $("#tvEvent").css("display","block");
    }
    
// multi play mode 예비용 ================================================================
    
    // oi.multiVideoInit = function(asset){ console.log("멀티 tv 클릭 "); } 

// common functions =====================================================================
    
    oi.deleteVideoTexture = function(obj) // 비디오 텍스쳐 삭제 (단일 객체)
    {
        obj.userData.haveVideo = false;
        obj.userData.videoURL = null;
        obj.userData.videoTexture.video.pause();
        obj.userData.videoTexture = null;

        obj.children[0].children[0].material.map = oi.textureLoader.load("/static/OI_resource/asset/furniture/tv/tv0/screen_off_screen_off.png");
    }
    
    oi.ClearVideoFcts = function(){
        // 1. 재생 가능한 모든 TV의 비디오 텍스쳐 삭제
        oi.updateFcts.forEach(function(updateFn, obj){
            oi.deleteVideoTexture(obj);
        });
        
        // 2. 맵 클리어
        oi.updateFcts.clear();
    }
    
    
    oi.selectVideo = function(obj, url){ // 비디오 선택

        if(obj.userData.haveVideo === true){ // 이미 비디오가 설정되어 있다면 업데이트 맵에서 제거
            obj.userData.videoTexture.video.pause(); // 정지
            oi.updateFcts.delete(obj); // 제거
        }
        
        obj.userData.haveVideo = true;
        obj.userData.videoURL = url;
        obj.userData.videoTexture = new THREEx.VideoTexture(url); //videoTexture;
    
        obj.children[0].children[0].material.map = obj.userData.videoTexture.texture;
        // 업데이트 맵에 추가
      //  oi.updateFcts.set(obj.uuid, function(delta, now){ obj.userData.videoTexture.update(delta, now); });
        oi.updateFcts.set(obj, function(delta, now){ obj.userData.videoTexture.update(delta, now); });

    }

    oi.playVideo = function(obj){ // 비디오 재생
    //  if(obj.userData.videoTexture !== null){
        if(obj.userData.haveVideo === true){
            obj.userData.videoTexture.video.play(); 
        }
        else{ console.log("비디오가 설정되어 있지 않습니다."); }
    }
    
    oi.pauseVideo = function(obj){ // 비디오 일시정지
        if(obj.userData.haveVideo === true){
            obj.userData.videoTexture.video.pause(); 
        }
        else{ console.log("비디오가 설정되어 있지 않습니다."); }
    }
    
    oi.stopVideo = function(obj){ // 비디오 정지 (되감음)
        if(obj.userData.haveVideo === true){
            obj.userData.videoTexture.video.pause();
            obj.userData.videoTexture.video.currentTime = 0;	
        }
        else{ console.log("비디오가 설정되어 있지 않습니다."); }
    }

    oi.deleteVideo = function(){
        if (oi.videoPath === null)
        {console.log("비디오가 설정되어 있지 않습니다.");}
        else
        {
            $.ajax({                            
                type: "POST",                   
                url: "/doVideoDelete/",               
                data: {"videoPath": oi.videoPath},      
                dataType: "json",                           
                                                                                                             
                success: function(response){        
                            if(response.msg === "success"){
                                alert("비디오가 성공적으로 삭제되었습니다.");
                            }
                            else{alert("비디오삭제에 실패했습니다.");}
                        },
                error: function(request, status, error){    
                            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                            console.log("ajax 실패");
                        },
            });
        }
    }
    
    // 플레이 바 추가할 것..
}