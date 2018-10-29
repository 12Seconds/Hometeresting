    /* OI VR_Event functions */

    OI_VR_Event = function (document, Room, Assets, Dictionary, SceneManager, frameEvent) {
        var oi = this;
        oi.document = document;
        oi.Room = Room;
        
        oi.vrMultiPlay = function(){
            // 멀티플레이 소켓 연결
            var doOnece = false;
            var originCamCube;
            var socket;
            var sceneUsers;
            var myCharacter;
            oi.tmpInverval = setInterval(function(){
                if(!doOnece){

                    originCamCube = Room.cam_cube;

                    socket = io.connect('https://www.oddidea.xyz:3000');
                    sceneUsers = [];

                    var tmpMyKey = $('#myKey').val();
                    var tmpHostKey = $('#hostKey').val();
                    var mulRoomName;

                    if($('#multiCreate').val()==="true"){
                        mulRoomName = $("#mulRoomName").val();
                    }
                    else{
                        var tmpRoomName = $("#mulRoomName").val();
                        var tmpRoomNameSplit = tmpRoomName.split('_');
                        mulRoomName = tmpRoomNameSplit[1];
                    }

                    // 방 만들기 시에는 tmpRoomName
                    // 방 참여 시에는 mulRoomName이 방의 이름이다.

                    if($('#multiCreate').val()==="true"){ // 호스트가 방을 생성한 경우
                        // 유저 정보 셋팅

                        var info = {
                            nickName : $('#userNickName').val(),
                            myKey : tmpMyKey+'_'+mulRoomName,
                            hostKey : tmpMyKey+'_'+mulRoomName,
                            userImage : '/static/OI_resource/images/user.png',
                            // 초기 pos 값은 나중에 host의 cam_cube 위치를 얻어와서 셋팅
                            posX : originCamCube.position.x,
                            posY : originCamCube.position.y,
                            posZ : originCamCube.position.z,
                            rotX : originCamCube.rotation.x,
                            rotY : originCamCube.rotation.y,
                            rotZ : originCamCube.rotation.z
                        }
                        socket.emit('roomKey', info);
                    }
                    else{ // 멀티플레이 방에 참여하는 경우
                        // 유저 정보 셋팅
                        var info = {
                            nickName : $('#userNickName').val(),
                            myKey : tmpMyKey+'_'+mulRoomName,
                            hostKey : tmpHostKey+'_'+mulRoomName,
                            userImage : '/static/OI_resource/images/user.png',
                            // 초기 pos 값은 나중에 host의 cam_cube 위치를 얻어와서 셋팅
                            posX : originCamCube.position.x,
                            posY : originCamCube.position.y,
                            posZ : originCamCube.position.z,
                            rotX : originCamCube.rotation.x,
                            rotY : originCamCube.rotation.y,
                            rotZ : originCamCube.rotation.z
                        }
                        socket.emit('roomKey', info);
                    }

                    socket.on('joinRoom', function(users){
                        // 해당 Key에 접속되어 있는 모든 유저들 정보
                        console.log(users);

                        // player 초기화
                        sceneUsers = [];
                        myCharacter = null;
                        var playerRemove = [];
                        Room.scene.traverse(function (e) {
                            if (e.getObjectByName("cam_cube0"))
                                playerRemove.push(e);
                        });

                        //console.log(playerRemove);

                        playerRemove.forEach(function (e) {
                            if(e.name==="cam_cube0")
                                Room.scene.remove(e);
                        });

                        // 해당 key에 접속되어 있는 user들 생성
                        for(var i=0; i<users.length; i++){
                            var txr_Loader = new THREE.TextureLoader();
                            var cam_paper = txr_Loader.load(users[i].userImage);

                            var ccMaterial = new THREE.MeshLambertMaterial({map:cam_paper,
                                                                            side:THREE.DoubleSide});
                            var cam_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),
                                                               ccMaterial);

                            cam_cube.position.copy(new THREE.Vector3(users[i].posX,
                                                                users[i].posY,
                                                                users[i].posZ));

                            cam_cube.rotation.setFromVector3( new THREE.Vector3(users[i].rotX,
                                                                    users[i].rotY,
                                                                    users[i].rotZ), "XYZ" );

                            cam_cube.nickName = users[i].nickName;
                            cam_cube.myKey = users[i].myKey;
                            cam_cube.hostKey = users[i].hostKey;
                            cam_cube.name = "cam_cube0";
                            Room.scene.add(cam_cube);
                            sceneUsers.push(cam_cube);
                        }

                        // 내 캐릭터 큐브가 뭔지 셋팅
                        for(var i=0; i<sceneUsers.length; i++){
                            if(($('#myKey').val()+'_'+mulRoomName) === sceneUsers[i].myKey){
                                myCharacter = sceneUsers[i]
                                break;
                            }
                        }

                        //console.log(sceneUsers);
                        console.log(myCharacter);
                        Room.cam_cube = myCharacter;

                        $("#myKey").val(myCharacter.myKey.split('_')[0]);
                        $("#hostKey").val(myCharacter.hostKey.split('_')[0]);
                        frameEvent.setSocket(socket);
                    });

                    // 멀티플레이 프레임 이벤트
                    socket.on('frameUpdate',function(frameInfo){
                        var updateAsset = [];
                        //console.log(frameInfo);
                        Room.scene.traverse(function (e) {
                            if (e.uuid === frameInfo.uuid){
                                updateAsset.push(e);
                            }
                        });

                        updateAsset.forEach(function (e) {
                            var framePic = e.children[0].children[1].material;
                            framePic.map = THREE.ImageUtils.loadTexture( frameInfo.pic );
                            framePic.map.minFilter = THREE.LinearFilter;
                            e.userData.mapName = frameInfo.pic; // 송식
                        });

                        if($("#hostKey").val() === $("#myKey").val()){ // 액자의 이미지 변경을 호스트가 한 경우
                            var mUpdate = new MultiSceneUpdate();
                            mUpdate.sceneSave(Room.scene);
                            //console.log($("#userNickName").val());
                        }
                    });

                    // 내 캐릭터를 제외한 멀티플레이 포지션 및 로테이션 업데이트
                    socket.on('posUpdate', function(userData){

                        Room.scene.traverse(function (e) {
                            if (myCharacter.myKey !== userData.myKey && e.myKey === userData.myKey){
                                e.__dirtyRotation = true;
                                e.__dirtyPosition = true; // 없어야 되는 옵션인데 없으면 깜빡거림

                                e.position.copy(new THREE.Vector3(userData.posX,
                                                                  userData.posY,
                                                                  userData.posZ));
                                e.rotation.setFromVector3(new THREE.Vector3(userData.rotX,
                                                                            userData.rotY,
                                                                            userData.rotZ), "XYZ");
                            }
                        });
                    });

                    // 방을 나간 경우
                    socket.on('leaveRoom',function(userData){

                        console.log(userData);
                        var playerRemove = [];
                        var leaveIndex;
                        Room.scene.traverse(function (e) {
                            if (e.myKey === userData.myKey){
                                playerRemove.push(e);
                            }
                        });
                        playerRemove.forEach(function (e) {
                            Room.scene.remove(e);
                        });

                        for(var i=0; i<sceneUsers.length; i++){
                            if(sceneUsers[i].myKey === userData.myKey){
                                sceneUsers.splice(i,1);
                                break;
                            }
                        }

                    });

                    doOnece = true;
                }

                if(doOnece){
                    if(sceneUsers.length > 0){
                        // 내 캐릭터 정보를 서버에 지속적으로 보냄
                        var userData = {

                            nickName : myCharacter.nickName,               
                            myKey : myCharacter.myKey,
                            hostKey : myCharacter.hostKey,
                            userImage : '/static/OI_resource/images/user.png',
                            posX : myCharacter.position.x,
                            posY : myCharacter.position.y,
                            posZ : myCharacter.position.z,
                            rotX : myCharacter.rotation.x,
                            rotY : myCharacter.rotation.y,
                            rotZ : myCharacter.rotation.z
                        }

                        myCharacter.__dirtyRotation = true;
                        socket.emit('charUpdate', userData);

                    }

                }
            },12);
        }
        
        //div 마우스 클릭시 이벤트
        window.onclick = function(event) {
            //id = 'listPlate'
            if(event.target.parentNode.id == 'listPlate')
            {
                var searchingName = $('#searchingName').attr('title');
                console.log("hihi : "+searchingName);
                var selectedRoom = event.target.parentNode.title; //선택된 방의 이름을 받아옴
                $.ajax({                            
                type: "POST",                   
                url: "/doSearchLoad/",                
                data: {"selectedRoomName": selectedRoom, "searchingName" :searchingName },      
                dataType: "json",                           
                                                                                                           
                success: function(response){                 
                            SceneManager.sceneLoad(Room, response.roomdata, Assets, Dictionary);
                            $('#noRoom').val(false);
                            $("#VRbutton").css("display","block");
                            $("#RTCWindow").css("display","block");
                            //oi.customCam.attachEvent();
                            $("#playWindowVR").css("display","none");
                            //$("#mulExit").css("display","none");
                            
                        },
                error: function(request, status, error){    
                            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                            console.log("ajax 실패");
                        },
                });
            }
            else if(event.target.parentNode.id == "roomBtn"||event.target.parentNode.parentNode.id == "roomBtn")
            {
                $('#yesBtn').off('click');
                $('#noBtn').off('click');
                $('#MExit').off('click');

                // 모달 생성
                $('#deleteModal').css("display","block");

                $("#deleteRoomName").html("멀티 플레이 방을 생성합니다.");
                //각 버튼 이벤트
                
                var roomCreate = function(response){                 
                    SceneManager.sceneLoad(Room, response.roomdata, Assets, Dictionary);
                    $('#noRoom').val(false);
                    $("#VRbutton").css("display","block");
                    $("#RTCWindow").css("display","block");
                    //oi.customCam.attachEvent();
                    $("#creatWindowVR").css("display","none");
                    $("#playWindowVR").css("display","none");
                    //$("#mulExit").css("display","block");

                    var host = $('#userNickName').val();
                    var roomName = $("#mulRoomName").val();
                    var roomJson = response.roomdata;
                    
                    // 멀티플레이룸이 생성되면 새로운 데이터베이스에 관련 정보를 삽입
                    $.ajax({
                        url: '/doInsertMulRoom/',
                        data: {"host": host, "roomName" :roomName,"roomJson":roomJson },
                        dataType: "json",
                        type: 'POST',
                        success: function (data) {
                            //alert("멀티플레이 방 데이터베이스에 입력 완료");
                            //console.log("hihi : "+ data.hihi);
                        },
                        error: function(request, status, error){    // 통신 실패시
                                //alert("데이터 저장에 실패했습니다.");
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                        },

                    });

                    $('#multiCreate').val("true");
                    $("#isMultiplaying").val("true");
                    oi.vrMultiPlay();
                };

                $('#yesBtn').click(function(){

                    var searchingName = $('#userNickName').val();
                    console.log("hihi : "+searchingName);

                    var selectedRoom = event.target.parentNode.title; //선택된 방의 이름을 받아옴
                    if(selectedRoom == "")
                    {
                        selectedRoom = event.target.parentNode.parentNode.title;
                    }
                    $("#mulRoomName").val(selectedRoom);

                    $.ajax({                            
                        type: "POST",                   
                        url: "/doSearchLoad/",                
                        data: {"selectedRoomName": selectedRoom, "searchingName" :searchingName },      
                        dataType: "json",                           

                        error: function(request, status, error){    
                                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                    console.log("ajax 실패");
                                }
                    }).then(roomCreate);

                    $('#deleteModal').css("display","none");
                });
            }
            else if(event.target.parentNode.id == 'mulRoomList')
            {
                //멀티플레이 룸 참여 

                //div 재활용을 위한 이벤트 제거
                $('#yesBtn').off('click');
                $('#noBtn').off('click');
                $('#MExit').off('click');

                // 모달 생성
                $('#deleteModal').css("display","block");
                // 안내문구
                $("#deleteRoomName").html("멀티플레이 방에 참여하시겠습니까?");

                $('#noBtn').click(function(){
                    $('#deleteModal').css("display","none");
                 });
                $('#MExit').click(function(){
                    $('#deleteModal').css("display","none");
                 });

                $('#yesBtn').click(function(){

                    var searchingName = event.target.parentNode.childNodes[1].innerText
                    //console.log("hihi : "+event.target.parentNode.childNodes[1].innerText);

                    var selectedRoom = event.target.parentNode.childNodes[2].innerText; //선택된 방의 이름을 받아옴

                    //var roomName = selectedRoom.split("_");

                    $("#mulRoomName").val(selectedRoom);
                    $.ajax({                            
                        type: "POST",                   
                        url: "/doMulSearchLoad/",                
                        data: {"selectedRoomName": selectedRoom, "searchingName" :searchingName },      
                        dataType: "json",                           

                        error: function(request, status, error){    
                                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                    console.log("ajax 실패");
                                }
                    }).then(roomJoin);

                    $('#deleteModal').css("display","none");
    
                });

                var roomJoin = function(response){     
                    SceneManager.sceneLoad(Room, response.roomdata, Assets, Dictionary);
                    $('#noRoom').val(false);
                    $("#VRbutton").css("display","block");
                    $("#RTCWindow").css("display","block");
                    
                    $("#creatWindowVR").css("display","none");
                    $("#playWindowVR").css("display","none");
                   // $("#mulExit").css("display","block");

                    $("#hostKey").val(response.hostKey);
                    
                    //oi.isMultiplaying = true;
                    $("#isMultiplaying").val("true");

                    $('#multiCreate').val("false");
                    
                    oi.vrMultiPlay();
               };
            }
        }

        // play window 의 listplate 를 만드는 부분
        $("#dosearch").click(function(){
            var searchNick = $("#searchRoom").val();

            $.ajax({               
                type: "POST",                   
                url: "/doUserRoomSearch/",               
                data: {"searchNick": searchNick},
                dataType: "json",                           
                                                                                                             
                success: function(response){        
                            console.log("ajax 성공 : "+ response.responseMsg );
                            if(response.responseMsg =="false" )
                            {
                                console.log("없는 유저 입니다.");
                                alert("존재하지 않는 유저이거나 유저가 방을 생성하지 않았습니다.")
                            }
                            else{
                                $(".listPlate").remove();
                                $("#searchingName").html(searchNick+" 님의 방 목록");
                                $("#searchingName").attr("title",searchNick);
                                for (var i=0;i<response.searchedRoomList.length;i++)
                                {
                                    var tr = oi.document.createElement("tr");
                                    tr.setAttribute("id","listPlate");
                                    tr.setAttribute("class","listPlate table-primary");
                                    tr.setAttribute("title",response.searchedRoomList[i]);

                                    var td1 = oi.document.createElement("th");
                                    td1.setAttribute("scope","row");
                                    td1.innerHTML = i;

                                    var td2 = oi.document.createElement("td");
                                    td2.innerHTML = response.searchedRoomList[i];

                                    tr.appendChild(td1);
                                    tr.appendChild(td2);
                                    $("#showJoinroom").append(tr);
                                }

                            }
                        }, 
                error: function(request, status, error){    
                            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                            console.log("ajax 실패");
                        },
                });
        });

        $("#RTCWindow").draggable();

        $("#RTCExit").on("click", function(){
            $("#RTCWindow").hide("fold", {}, "slow");
        });

        //멀티플레이 룸 만들기 버튼
        $("#makeMulRoom").click(function(){
            $("#creatWindowVR").css("display","block");
            //내 방들을 얻어온다
            $.ajax({                            
                type: "POST",                   
                url: '/doLoadSearch/',                
                data: { },      
                dataType: "json",                           
                                                                                                          
                success: function(response){                
                            $("#CWcontents").empty();
                            for (var i=0;i<response.roomName.length;i++){
                                $("#CWcontents").append('<div id="roomBtn" class="card text-white bg-secondary mb-3" title="'+response.roomName[i]+'"><div class="card-header">'+response.roomName[i]+'</div><div class="card-body"><img style="height: 100px; width: 100%; display: block;" src="1.jpg" alt="Card image"></div></div>');
                            }
                        },
                error: function(request, status, error){    // 통신 실패시
                            //alert("데이터 저장에 실패했습니다.");
                            console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                            console.log("ajax 실패");
                        },
                });
            $("#CWexit").off("click");
            $("#CWexit").click(function(){
                $("#creatWindowVR").css("display","none");
            });
        });

        //멀티 플레이 룸 목록 새로고침 버튼
        $("#mulRoomRefresh").click(function(){
        console.log("새로고침 완료");
        $.ajax({                            
            type: "POST",                   
            url: '/doMulRoomAll/',                
            data: { },      
            dataType: "json",                           
                                                                                                      
            success: function(response){                
                        $("#multiRoomList").empty();

                        for (var i=0;i<response.mulRoomList.length;i++){
                            $("#multiRoomList").append('<tr id="mulRoomList" class="mulRoomList table-primary" title="'+response.mulRoomHost[i]+'"><th scope="row">'+i+'</th><td>'+response.mulRoomHost[i]+'</td><td>'+response.mulRoomList[i]+'</td><td>'+response.NumOfPeople[i]+'</td></tr>');
                        }
                    },
            error: function(request, status, error){    // 통신 실패시
                        //alert("데이터 저장에 실패했습니다.");
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
            });
        });
        function bind(scope, fn) {
            return function () {
                fn.apply(scope, arguments);
            };
        }
        
    }
