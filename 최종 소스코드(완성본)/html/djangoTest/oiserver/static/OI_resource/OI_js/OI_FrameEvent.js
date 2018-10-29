 OI_FrameEvent = function ()
 {
     var oi = this;
     oi.socket = null;
     
     oi.tpFrame = function(playSelectedAsset){
         
         $("#frameImage").off('click');
         $("#frameImage").click(false);
   
         //$("#frameEvent").empty();

        // 서버에서 이미지 받아와야 되는 부분 ------------------------
        var hostNick;
        if($("#isVisiting").val()==="true")
            hostNick = $("#searchingName").attr("title");
        else
            hostNick = $("#userNickName").val();

         
        console.log("search닉:", $("#searchingName").attr("title"));
        console.log("user닉:", $("#userNickName").val());
        console.log("호스트닉:",hostNick);
         
        console.log("image start!!! : "+hostNick);
        $.ajax({                            
            type: "POST",                   
            url: "/doImageSearch/",               
            data: {"mynick": hostNick},      
            dataType: "json",                           
                                                                                                         
            success: function(response){       
                
                        $("#frameEvent").css("display", "block");
                        $("#frameImage").css("display","block");
                        if($("#isVisiting").val()==="true"){
                            $("#fileUpload").css("display","none");
                            $("#frameImageDelete").css("display","none");
                        }
                        else{
                            $("#fileUpload").css("display","block");
                            $("#frameImageDelete").css("display","block");
                        }

                        Galleria.run('.galleria2');
                        
                        console.log("hihi : "+response.filename);
                        var parentDiv = document.getElementById('frameEvent');

                        //Galleria.ready(function (options) {
                            for(var i =0; i<response.filename.length;i++)
                            {
                                if(i==0){
                                    Galleria.get(0).load(
                                        { image: "media/"+response.filename[0] }
                                    );
                                }
                                else{
                                    Galleria.get(0).push(
                                        { image: "media/"+response.filename[i] }
                                    );
                                }
                            }
                        //});

                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });
         
        // test play 모드에서 이미지 보여주기
        Galleria.ready(function(options){
            this.bind('image',function(e){
                //console.log(e.imageTarget.src);
                $("#targetFrame").val(e.imageTarget.src);
            });
        });
         
        // 싱글 플레이에서 프레임 이미지를 설정하는 부분
        $( "#frameImage" ).click(function() {
            var frame = playSelectedAsset;
            var framePic = frame.children[0].children[1].material;
            framePic.map = THREE.ImageUtils.loadTexture( $("#targetFrame").val() );
            framePic.map.minFilter = THREE.LinearFilter;
            frame.userData.mapName = $("#targetFrame").val(); // 송식
        });

     };
     
     oi.setSocket = function(socket){
         oi.socket = socket;
     }
     
     oi.multiFrame = function(playSelectedAsset){
         
        $("#frameImage").off('click');
        $("#frameImage").click(false);
         
        var hostNick;
        if($('#multiCreate').val()==="true"){
            hostNick = $("#userNickName").val();
        }
        else{
            var tmpNick = $("#mulRoomName").val().split('_');
            hostNick = tmpNick[0];
            $("#frameEvent").empty();
        }

        // 서버에서 이미지 받아와야 되는 부분 ------------------------

        console.log("image start!!! : "+hostNick);
        $.ajax({                            
            type: "POST",                   
            url: "/doImageSearch/",               
            data: {"mynick": hostNick},      
            dataType: "json",                           
                                                                                                         
            success: function(response){       
                
                        $("#frameEvent").css("display", "block");
                        $("#frameImage").css("display","block");
                        $("#fileUpload").css("display","none");
                        $("#frameImageDelete").css("display","none");
                
                        Galleria.run('.galleria2');
                        
                        console.log("hihi : "+response.filename);
                        var parentDiv = document.getElementById('frameEvent');

                        //Galleria.ready(function (options) {
                            for(var i =0; i<response.filename.length;i++)
                            {

                                if(i==0){
                                    Galleria.get(0).load(
                                        { image: "media/"+response.filename[0] }
                                    );
                                }
                                else{
                                    Galleria.get(0).push(
                                        { image: "media/"+response.filename[i] }
                                    );
                                }
                            }
                        //});
    
                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });
        /////////////////////////////////////////////////////////

        // multi play 모드에서 이미지 보여주기
        Galleria.ready(function(options){
            this.bind('image',function(e){
                //console.log(e.imageTarget.src);
                $("#targetFrame").val(e.imageTarget.src);
            });
        });
         
        // 멀티 플레이에서 프레임 이미지를 설정하는 부분
         
        $( "#frameImage" ).click(function() {
            //console.log($("#hostKey").val());
            //console.log($("#myKey").val());
            if($("#hostKey").val() === $("#myKey").val()){ // 액자의 이미지 변경을 호스트가 한 경우
                var frame = playSelectedAsset;
                var frameInfo;

                if($('#multiCreate').val()==="true"){
                    frameInfo = {
                        uuid : frame.uuid,
                        pic : $("#targetFrame").val(),
                        hostKey : $("#hostKey").val()+"_"+$("#mulRoomName").val()
                    }
                }
                else{

                    frameInfo = {
                        uuid : frame.uuid,
                        pic : $("#targetFrame").val(),
                        hostKey : $("#hostKey").val()+"_"+$("#mulRoomName").val().split('_')[1]
                    }
                }
                
                console.log(frameInfo);
                
                oi.socket.emit('frameUpdate', frameInfo);
            }
            else{
                alert("host가 아니면 액자 이미지 변경 불가능");
            }
        });

     }

     // 이미지 삭제 버튼
     var frameImageDelete = function(){
        console.log($("#targetFrame").val());

        var selectedImageName = $("#targetFrame").val();
        $.ajax({                            
            type: "POST",                   
            url: "/doImageDelete/",               
            data: {"selectedImageName": selectedImageName},      
            dataType: "json",                           
                                                                                                         
            success: function(response){       
	            		console.log("resmessage : " + response.msg );
	                    if (response.msg == "success"){
	                    	alert("이미지 삭제 완료.");
	                    }
	                    else{
	                    	alert("삭제할 파일이 없습니다.");
	                    }
                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        }); // ajax 끝
     }; // 함수 끝

    $("#frameImageDelete").click(frameImageDelete);
 }