/* OI Multiplay Scene update (multiplay roomdata DB) */

MultiSceneUpdate = function()
{
    var oi = this;
    var userID = "noname";
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

	        var hostName = $("#userNickName").val()

            // 근빈 추가 
            var roomName = $("#roomName").val();
            $.ajax({ // 버튼을 클릭하면 <새로고침> 없이 ajax로 서버와 통신하겠다.
                type: "POST", // 데이터를 전송하는 방법을 지정
                url: '/doMulFrameUpdate/', // 통신할 url을 지정
                data: {
                    'sceneData': Info,
                    'hostName': hostName
                }, //, 'csrfmiddlewaretoken': '{{ csrf_token }}'}, // 서버로 데이터 전송시 옵션
                dataType: "json", // 서버측에서 전송한 데이터를 어떤 형식의 데이터로서 해석할 것인가를 지정,
                // 서버측에서 전송한 Response 데이터 형식 (json)

                success: function (response) { // 통신 성공시 
                    alert("성공적으로 데이터가 저장 되었습니다.");
                },
                error: function (request, status, error) { // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    console.log("ajax 실패");
                },
            });
    }
}