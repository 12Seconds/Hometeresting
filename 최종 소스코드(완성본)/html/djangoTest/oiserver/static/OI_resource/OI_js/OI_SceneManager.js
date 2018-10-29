/* OI Scene Save & Load Manager */

SceneManager = function(userID)
{
    var oi = this;
    
    oi.user = userID;
  //  oi.Assets = oiAssets;
    
    /* Save Json */
    oi.sceneSave = function(scene)
    { 
        //console.log(scene);
        //  console.log(obj.children[1].position.x);   *됨
             
	   var sceneInfo = new Object();
	        
	   sceneInfo.level = 1;
	   sceneInfo.owner = userID;
	   sceneInfo.sceneID = userID+"-NS01"; // userid + Normal Scene 01, 02, 03 ...
	   //sceneInfo.sceneType = "normal";

	   var assetArray = new Array();

	   // assetArray.push(); // ??...왜있지
	        
	        $.each(scene.children, function(key, value){
	            
	            if(scene.children[key].name!=""){ // 씬의 차일드중 이름이 공백이 아닌 에셋이면 저장
	                var s_obj = new Object();
	                var tmp1, tmp2, tmp3;
	                
	                //console.log(scene.children[key].name);
	                
	                s_obj.name = scene.children[key].name;
                    s_obj.uuid = scene.children[key].uuid;
                    
                    // 좌표 저장
	                tmp1 = JSON.stringify(scene.children[key].position.x);
	                tmp2 = JSON.stringify(scene.children[key].position.y);
	                tmp3 = JSON.stringify(scene.children[key].position.z);
	                s_obj.position = tmp1+","+tmp2+","+tmp3;
	                // 회전 저장
	                tmp1 = JSON.stringify(scene.children[key].rotation.x);
	                tmp2 = JSON.stringify(scene.children[key].rotation.y);
	                tmp3 = JSON.stringify(scene.children[key].rotation.z);
	                s_obj.rotation = tmp1+","+tmp2+","+tmp3;
	                // 크기 저장
	                tmp1 = JSON.stringify(scene.children[key].scale.x);
	                tmp2 = JSON.stringify(scene.children[key].scale.y);
	                tmp3 = JSON.stringify(scene.children[key].scale.z);
	                s_obj.scale = tmp1+","+tmp2+","+tmp3;
	                
                    // 투명도 저장
                    if(scene.children[key].name.substr(0,5)==="basic")
                    {
                        s_obj.transparent = scene.children[key].material.transparent;
                        s_obj.opacity = scene.children[key].material.opacity;
                    }
                    else if(scene.children[key].name.substr(0,5) !=="light" && scene.children[key].name.substr(0,3) !=="cam")
                    {
                        s_obj.transparent = scene.children[key].userData.transparent;
                        s_obj.opacity = scene.children[key].userData.opacity;
                    }
                    
                    
                    // 송식, basic 에셋 material 정보 저장
                    if(scene.children[key].name.substr(0,5)==="basic")
                    {
                        // 색
                        tmp1 = JSON.stringify(scene.children[key].material.color.r);
                        tmp2 = JSON.stringify(scene.children[key].material.color.g);
                        tmp3 = JSON.stringify(scene.children[key].material.color.b);
                        s_obj.color = tmp1+","+tmp2+","+tmp3;
                        
                        // 텍스쳐
                        if(scene.children[key].material.map!==null){
                           // s_obj.map = JSON.stringify(scene.children[key].material.map.name);
                            s_obj.map=scene.children[key].material.map.name;
                        }
                        else{
                            s_obj.map = "null";
                        }
                    }
                    
                    // lights 에셋
                    if(scene.children[key].name.substr(0,5)==="light")
                    {
                        // 색
                        tmp1 = JSON.stringify(scene.children[key].color.r);
                        tmp2 = JSON.stringify(scene.children[key].color.g);
                        tmp3 = JSON.stringify(scene.children[key].color.b);
                        s_obj.color = tmp1+","+tmp2+","+tmp3;
                        
                        s_obj.intensity = scene.children[key].intensity; // 공통
                        
                        if(scene.children[key].name.substr(5,1)!=="2") // directional을 제외한 조명들은 distance 값을 가짐
                        {
                            s_obj.distance = scene.children[key].distance;
                        }
                        
                        if(scene.children[key].name.substr(5,1)==="1") // spot Light
                        {
                            s_obj.angle = scene.children[key].angle;
                        }
                
                        if(scene.children[key].name.substr(5,1)!=="0") // spot, directional 타겟 
                        {
                            if(scene.children[key].target.name==="")
                                s_obj.target = "";
                            else
                                s_obj.target = scene.children[key].target.uuid;
                        }
                    }
                    
                    // 송식 액자 텍스쳐 저장
                    if(scene.children[key].name.substr(0,5)==="frame")
                    {
                       // console.log("프레임 맵");
                       // console.log(scene.children[key].material.map);
                        console.log("---");
                        console.log(scene.children[key].userData.mapName);
                        
                        // 텍스쳐
                        if(scene.children[key].userData.mapName !=="default"){
                            s_obj.map = scene.children[key].userData.mapName;
                        }
                        else{
                            s_obj.map = "default";
                        } 
                    }
                    
	                assetArray.push(s_obj);
	            }
	        });
	    
	        sceneInfo.assets = assetArray;
	        
	        var Info = JSON.stringify(sceneInfo, null, "\t");
	        console.log(Info);
	        
	        //  localStorage.setItem('myStorage', Info); // 로컬 스토리지에 저장
	        
            // 근빈 추가 
            var roomName = $("#roomName").val();
            $.ajax({ // 버튼을 클릭하면 <새로고침> 없이 ajax로 서버와 통신하겠다.
                type: "POST", // 데이터를 전송하는 방법을 지정
                url: '/doSave/', // 통신할 url을 지정
                data: {
                    'sceneData': Info,
                    'roomName': roomName
                }, //, 'csrfmiddlewaretoken': '{{ csrf_token }}'}, // 서버로 데이터 전송시 옵션
                dataType: "json", // 서버측에서 전송한 데이터를 어떤 형식의 데이터로서 해석할 것인가를 지정,
                // 서버측에서 전송한 Response 데이터 형식 (json)

                success: function (response) { // 통신 성공시 
                    alert("성공적으로 데이터가 저장 되었습니다.");
                    console.log("ajax 성공");
                    $("#myModal").css('display','none');    // 저장 성공 후 모달창 없앰
                },
                error: function (request, status, error) { // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    console.log("ajax 실패");
                },
            });
  		
            // 테스트용 클리어 함수
           // oi.sceneReset(scene);
        
    }

    /* load Json */ // 테스트용, room type에 따른 씬 로드 수정 필요 
    oi.sceneLoad = function(oii, roomdata)
    {   
        oi.sceneReset(oii.mainRoom.scene, oii.Assets);

    //  var s_obj = JSON.parse(localStorage.getItem('myStorage')); // s_obj : scene obeject , 로컬 스토리지에서 읽어옴
        var s_obj = JSON.parse(roomdata); // s_obj : scene obeject
        
        //console.log(s_obj);
        //console.log(s_obj.sceneID);
    
        // 에셋 하나씩 로드
        s_obj.assets.forEach(
            function addNumber(value) {
             // console.log(value.position); 
                var tmp, position, scale, rotation, color; // XYZ parsing
                tmp = value.position;
               // console.log('포지션'+tmp);
                position = tmp.split(',');
                //console.log('x:'+position[0]+'y:'+position[1]+'z:'+position[2]);   
                
                tmp = value.rotation;
                //console.log(tmp);
                rotation = tmp.split(',');
                
                tmp = value.scale;
                //console.log(tmp);
                scale = tmp.split(',');
                
               // console.log("발류네임"+value.name);
                oii.dic.assetDic[value.name].then(function(obj){
                    var newAsset = obj.clone();
                    
                    // 베이직 디테일
                    if(newAsset.name.substring(0,5)==="basic"){
                        newAsset.material = obj.material.clone();
                        // 송식
                        // 색 
                        tmp = value.color;
                        color = tmp.split(',');
                        newAsset.material.color.setRGB(Number(color[0]),Number(color[1]),Number(color[2]));
                        
                        // 텍스쳐
                        if(value.map!=="null" && value.map!=="undefined")
                        {
                            var textureLoader = new THREE.TextureLoader();
                            
                            // 이냉
                            const img = new Image();
                            img.src = "/"+value.map;
                            img.decode().then(() => {
                                newAsset.material.map = textureLoader.load("/"+value.map);
                                newAsset.material.needsUpdate = true;
                                newAsset.material.map.name = value.map;

                                newAsset.material.map.minFilter = THREE.LinearFilter;
                                
                                //console.log(newAsset.material.map);
                            }).catch(() => {
                                throw new Error('Could not load/decode big image.');
                            });                       

                        }
                    }

                    // 액자 디테일
                    if(newAsset.name.substring(0,5)==="frame"){
                        var mat;
                        
                        for(var j=0; j<obj.children.length; j++){
                            //console.log(obj.children[j]);
                            for(var k=0; k<obj.children[j].children.length; k++){
                                //obj.children[j].children[k].parent = obj;
                                if(obj.children[j].children[k] instanceof THREE.Mesh){
                                    mat = obj.children[j].children[k].material;
                                    newAsset.children[j].children[k].material = mat.clone();
                                }
                            }
                        }
                        
                        // 텍스쳐
                        if(value.map!=="default" && value.map!=="undefined")
                        {
                            var framePic = newAsset.children[0].children[1].material;
                            
                            // 이냉
                            const img = new Image();
                            img.src = value.map;
                            img.decode().then(() => {
                                framePic.map = THREE.ImageUtils.loadTexture( value.map );
                                framePic.map.minFilter = THREE.LinearFilter;
                                newAsset.userData.mapName = value.map;
                            }).catch(() => {
                                throw new Error('Could not load/decode big image.');
                            });   

                        }
                    }
                    
                    // 조명 디테일
                    if(newAsset.name.substring(0,5)==="light"){
                        tmp = value.color;
                        color = tmp.split(',');
                        newAsset.color.setRGB(Number(color[0]),Number(color[1]),Number(color[2]));
                        
                        newAsset.intensity = Number(value.intensity);
                        
                        if(newAsset.name!=="light_directional") // directional을 제외한 조명들은 distance 값을 가짐
                        {
                            newAsset.distance = Number(value.distance);
                        }
                        
                        if(newAsset.name==="light_spot")
                        {
                            newAsset.angle = Number(value.angle);
                        }
                        
                    }
                    
                    // 투명도 설정
                    if(newAsset.name.substring(0,5)==="basic")
                    {
                        newAsset.material.transparent = value.transparent;
                        newAsset.material.opacity = value.opacity;
                    }
                    else if(newAsset.name.substring(0,5)!=="light" && newAsset.name.substring(0,3)!=="cam")
                    {
                        newAsset.userData.transparent = value.transparent;
                        newAsset.userData.opacity = value.opacity;
                        
                        if(value.transparent){
                            var obj = newAsset;
                            var mat;
                            for(var j=0; j<obj.children.length; j++){
                                for(var k=0; k<obj.children[j].children.length; k++){
                                    if(obj.children[j].children[k] instanceof THREE.Mesh){
                                        mat = obj.children[j].children[k].material;
                                        mat.transparent = value.transparent;
                                        mat.opacity = value.opacity;
                                    }
                                }
                            }
                        }

                    }
                    
                    newAsset.position.set(Number(position[0]),Number(position[1]),Number(position[2])); 
                    newAsset.rotation.set(Number(rotation[0]),Number(rotation[1]),Number(rotation[2]));
                    newAsset.scale.set(Number(scale[0]),Number(scale[1]),Number(scale[2]));
                    newAsset.name = value.name;
                    newAsset.uuid = value.uuid;
                    oii.Assets.interTarget.push(newAsset);
                    oii.mainRoom.scene.add(newAsset);
                    
                    if(value.name=="cam_cube0"){ 
                        // 캠 큐브 재연결
                        oii.mainRoom.cam_cube = newAsset;
                        $("#cubeOriginPos").val(JSON.stringify(oii.mainRoom.cam_cube.position));
                    }

                });
            }
        );
        oii.mainRoom.scene.add( oii.testPlay.controls.getObject() ); // 컨트롤 오브젝트 재연결
        
        // ambient light (맵 전체에 깔리는)
        var ambiColor = "#0c0c0c";
        oii.mainRoom.ambientLight = new THREE.AmbientLight(ambiColor);
        oii.mainRoom.scene.add( oii.mainRoom.ambientLight );
        console.log(oii.mainRoom.scene);
        
        console.log("렌더링");
        oii.mainRoom.renderer.render(oii.mainRoom.scene, oii.mainRoom.camera);
        console.log(oii.mainRoom.scene.children.length);
        
        console.log("재연결");
        // 조명에셋 타겟 재연결
        s_obj.assets.forEach(
            function addNumber(value) {
                var light=1, target=1;
                //if(value.name==="light1" || value.name==="light2"){
                //console.log(value.name);
                //console.log(value.target);
                //}
                
                if(value.name==="light1" || value.name==="light2")
                {  
                   // console.log("1. value.name"); console.log(value.name);
                   // console.log("2. value.target"); console.log(value.target);
                    
                    console.log("포이치");
                    
                   
                    if(value.target!==""){
                        
                         /* 
                        //console.log(oii.mainRoom.scene.children.length);
                        
                        $.each(oii.mainRoom.scene.children, function(key, value2){
                            
	                       if(oii.mainRoom.scene.children[key].uuid===value.uuid){
                                light = oii.mainRoom.scene.children[key]; // 조명 찾기
                               console.log("라이트");
                               console.log(light);
                               }
	                       if(oii.mainRoom.scene.children[key].uuid===value.target)
                                target = oii.mainRoom.scene.children[key]; // 조명 찾기
                                
                            console.log(oii.mainRoom.scene.children[key]);
                        }); 
                             */
                        /*
                        for(var i=0; i<oii.mainRoom.scene.children.length;i++)
                        {   
                            console.log(oii.mainRoom.scene.children[i]);
                            
                            console.log("3. value.uuid & children[i].uuid"); 
                            console.log(value.uuid);
                            console.log(oii.mainRoom.scene.children[i].uuid)
                            if(value.uuid === oii.mainRoom.scene.children[i].uuid)
                                light = oii.mainRoom.scene.children[i]; // 조명 찾기
                            if(value.target === oii.mainRoom.scene.children[i].uuid)
                                target = oii.mainRoom.scene.children[i];// 타겟 찾기
                                
                        }
                        */
                        //light.target = target; // 연결
                        
                    }

                } 
            });
        // 조명 타겟 업데이트 
        oii.nowRoomdata = s_obj;
        //console.log("로드부분 룸데이터");
        //console.log(oii.nowRoomdata.assets.length);
        oii.needTargetUpdate = true;
        
        oii.needLoading = true;
        $("#LoadingDoOnce").val("true");
        $("#oiTextureLoading").val("false");
        $("#OIloading").css("display","block");
    }
    
    // 테스트용 클리어 함수
    oi.sceneReset = function(scene, Assets)
    {
       /* var size = scene.children.length;
        console.log(size);
        for(var i=1; i<=size;i++)
        {
                console.log("삭제:");
                console.log(scene.children[0]);
                scene.remove(scene.children[0]); // scene.chidren[0] 은 골격 그룹
        }*/
        var assetRemove = [];
            scene.traverse(function (e) {
                    assetRemove.push(e);
            });
            assetRemove.forEach(function (e) {
                scene.remove(e);
            });
        
        console.log("클리어 이후 씬 정보");
        console.log(scene);
        Assets.interTarget = []; //송식
    }
    
}