/* OI VR_Scene Load Manager */

VR_SceneManager = function()
{
    var oi = this;
    
    oi.sceneLoad = function(Room, RoomData, Assets, Dictionary)
    {   
        Room.PhysicsOFF();
        oi.sceneReset(Room.scene, Assets);

        var s_obj = JSON.parse(RoomData); // s_obj : scene obeject
    
        // RoomData를 기반으로 에셋을 하나씩 생성하여 씬에 추가
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
                Dictionary.assetDic[value.name].then(function(obj){
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
                            
                            newAsset.material.map = textureLoader.load("/"+value.map);
                            newAsset.material.needsUpdate = true;
                            newAsset.material.map.name = value.map;
                            
                            newAsset.material.map.minFilter = THREE.LinearFilter;
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
                            framePic.map = THREE.ImageUtils.loadTexture( value.map );
                            framePic.map.minFilter = THREE.LinearFilter;
                            newAsset.userData.mapName = value.map;
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
                    Assets.interTarget.push(newAsset);
                    Room.scene.add(newAsset);
                    
                    // 캠 큐브 재연결
                    if(value.name=="cam_cube0"){ Room.cam_cube = newAsset; 
                                               // Room.cam_cube.position.set(30, 10, -30);
                                                //Room.cam_cube.position.set(0,100,0);
                                               //console.log("cam_cube:",Room.cam_cube);
                                        //        Room.cam_cube.visible = false;
                                            //    Room.renderer.vr.setPoseTarget(Room.cam_cube);
                                      //          Room.cam_cube.position.set(0,100,0);
                                        //        Room.cam_cube.add(Room.camera);
                                            //    Room.cam_cube.lookAt(new THREE.Vector3(0,10,0));
                                             //   Room.renderer.vr.setPoseTarget(Room.camera);
                                                
                                          //      Room.train.add(Room.camera);
                                          //      Room.train.positio.set(0,30,0);
                                          //      Room.train.lootAt(new THREE.Vector3(50,10,-50));
                                        }

                });
            }
        );
        // Room.scene.add( oii.testPlay.controls.getObject() ); // 컨트롤 오브젝트 재연결
        
        // ambient light (맵 전체에 깔리는)
        var ambiColor = "#0c0c0c";
        Room.ambientLight = new THREE.AmbientLight(ambiColor);
        Room.scene.add( Room.ambientLight );

        Room.renderer.render(Room.scene, Room.camera);
        
        Room.nowRoomData = s_obj;
        Room.needLoading = true;
        Room.needTargetUpdate = true;
        $("#OIloading-bar").css("width", "0%");
        $("#OIloading").css("display","block");
    }
    
    oi.sceneReset = function(scene, Assets)
    {
        var assetRemove = [];
        scene.traverse(function (e) {
            if(e.name.substring(0,2)!=="VR")
                assetRemove.push(e);
        });
        assetRemove.forEach(function (e) {
                scene.remove(e);
        });
        //Assets.interTarget = [];
    }
    

}