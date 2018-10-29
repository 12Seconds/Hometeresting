/* OI VRScene Creator */

VR_SceneLoader = function(domElement, ChatBot, videoEvent)
{
    var oi = this;
    
    oi.prevTime = performance.now();
    oi.velocity = new THREE.Vector3();
    oi.prevPos = new THREE.Vector3();
    oi.canJump = false;
    oi.moveJump = false;
    oi.fframe = 0;
    oi.isEvent = false;
    
    oi.hostNick = "null";
    
    oi.domE = domElement;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;

    oi.nowRoomData;
    oi.needLoading = false;
    oi.needTargetUpdate = false;
    oi.needChatBotUpdate = false; //chatbot의 tv, frame 에셋 초기화가 필요하다는 뜻
    // 씬
    oi.scene = new Physijs.Scene; // new THREE.Scene();
    oi.scene.setGravity(new THREE.Vector3(0,-30,0));
    /*
    oi.scene.addEventListener(
        'update',
        function() {
            oi.scene.simulate( undefined, 1 );
        }
    );
    */
    // 카메라
    oi.camera = new THREE.PerspectiveCamera(45, oi.windowWidth/oi.windowHeight, 1, 1000);
    oi.camera.position.set(-50,20,50);
    oi.camera.lookAt(new THREE.Vector3(50, 0,-50));
    
    // 렌더러
    
    oi.renderer = new THREE.WebGLRenderer({ clearAlpha: 1, alpha:true, antialias: true });

    oi.renderer.setClearColor(0xEEEEEE);
    oi.renderer.setSize(oi.windowWidth,oi.windowHeight);
//    oi.renderer.shadowMapEnabled = true;
    oi.renderer.shadowMapType = THREE.PCFSoftShadowMap;
    
    oi.renderer.setPixelRatio( window.devicePixelRatio );
 // oi.renderer.autoClear = false;
/*
    oi.renderer = new THREE.WebGLRenderer( { antialias: true } );
    oi.renderer.setPixelRatio( window.devicePixelRatio );
    oi.renderer.setSize( window.innerWidth, window.innerHeight );
*/    
    // vr
    oi.renderer.vr.enabled = true;  //추가할것 
    oi.renderer.vr.userHeight = 0; // TOFIX   
//    console.log("camera : ", oi.camera);
 //   oi.renderer.vr.setPoseTarget(oi.camera.getObject());
    
//    oi.train = new THREE.Object3D();
//    oi.train.name = "VR_train";
//    oi.scene.add( oi.train );
    
  //  document.getElementById("VRbutton").appendChild( WEBVR.createButton( oi.renderer ) ); //추가할것
    
    oi.velocity = new THREE.Vector3();

    domElement.appendChild(oi.renderer.domElement);
    
    oi.txr_Loader = new THREE.TextureLoader();
    oi.wallpaper01 = oi.txr_Loader.load("/static/OI_resource/asset/wallpaper/testpaper.jpg");

    oi.wallMaterial = new THREE.MeshLambertMaterial({map:oi.wallpaper01, side:THREE.DoubleSide});
    
    oi.pyWallMaterial = Physijs.createMaterial(
        oi.wallMaterial,
        .0, // high friction
        .9 // low restitution
    );
    
    oi.spotLight = new THREE.SpotLight(0xffffff);
    oi.spotLight.position.set(0, 600, 0);
    oi.spotLight.castShadow = true;
    oi.spotLight.distance = 50;
    oi.spotLight.exponent =1;
    oi.spotLight.angle = Math.PI / 4;
    oi.spotLight.tager = oi.floor;
    
    oi.spotLight.shadowCameraVisible = true;
    oi.spotLight.name = "light1";
    oi.scene.add(oi.spotLight); 
            
    // Lights helper
    oi.helper = new THREE.PointLightHelper( oi.spotLight );
    oi.helper2 = new THREE.CameraHelper( oi.spotLight.shadow.camera ); // shadow camera helper
//    oi.scene.add( oi.helper );
//    oi.scene.add( oi.helper2);
    
    // 캐릭터 큐브
    oi.cam_paper = oi.txr_Loader.load("/static/OI_resource/images/user.png");
    oi.ccMaterial = new THREE.MeshLambertMaterial({map:oi.cam_paper, side:THREE.DoubleSide});
    
    oi.cam_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),oi.ccMaterial/* 0 /* mass */);
    
    oi.dummyCube = new THREE.Object3D();
    oi.dummyCube.name = "VR_dummyCube";
    console.log(oi.dummyCube.visible);
    
    oi.scene.add(oi.dummyCube);
    
    oi.dummyCube.add(oi.camera);

    oi.cam_cube.name = "cam_cube0";
    
    oi.cam_cube.__dirtyPosition=true;
    oi.cam_cube.__dirtyRotation=true;
    
    oi.cam_cube.position.set(0,10,0);
    oi.cam_cube.setCcdMotionThreshold(0.01);
    oi.cam_cube.setCcdSweptSphereRadius(1.5);
    oi.scene.add(oi.cam_cube);
 

// VR
    oi.controller = new THREE.GearVRController();
    oi.controller.position.set( 0.25, 10.75, 0 );
    oi.controller.scale.set(10,10,10);
    oi.controller.name = "VR_controller";
    oi.scene.add( oi.controller );
    
// controller model
    oi.MTL = new THREE.MTLLoader(); 
    oi.MTL.setPath( '/static/THREE_JS/models/obj/gear_vr_controller/' );
    oi.MTL.load( 'gear_vr_controller.mtl', function ( materials ) {

        materials.preload();

        var OBJ = new THREE.OBJLoader();
        OBJ.setMaterials( materials );
        OBJ.setPath( '/static/THREE_JS/models/obj/gear_vr_controller/' );

        OBJ.load( 'gear_vr_controller.obj', function ( obj ) {

            obj.translateZ( - 0.03 );
            oi.controller.add( obj );
        } );
    } );
    
   // oi.scene.simulate();
   // oi.scene.simulate(undefined, 1);
    
  // update function (resize)

    oi.sizeUpdate = function(){
        oi.windowWidth = domElement.clientWidth;
        oi.windowHeight = domElement.clientHeight;
        
        oi.camera.aspect = oi.windowWidth / oi.windowHeight;
        oi.camera.updateProjectionMatrix();
        
        oi.renderer.setSize(oi.windowWidth, oi.windowHeight);
    }

    var cameraDirection = new THREE.Vector3();
    oi.update = function(){

        var time = performance.now();
        var delta = ( time - oi.prevTime ) / 100;
        
        oi.cam_cube.__dirtyRotation = true;
        //oi.cam_cube.rotation.copy(oi.camera.rotation);
        oi.controller.update(); 
        //oi.dummyCube.quaternion.copy(oi.camera.quaternion);
        
        var afterPos = new THREE.Vector3();
        afterPos.copy(oi.cam_cube.position);
        var teleport = false;
        
        //console.log("update - needChatbBotUpdate : ", oi.needChatBotUpdate);
        /*챗봇
        if(oi.needChatBotUpdate){
            console.log("니드챗봇업데이트 chatbot.Init 호출");
            ChatBot.Init(this);
        } */
        
        if( Math.abs(afterPos.x-oi.prevPos.x) > 3 || Math.abs(afterPos.z-oi.prevPos.z) > 3 ){
            teleport = true;
        }
        
        if(!teleport && !oi.needLoading){
            if(oi.controller.getTriggerBtnState()===true){
                /*if(oi.canJump){
                    oi.moveJump = true;
                } */
                if(ChatBot.stat !="none"){
                    ChatBot.recognition.start();
                }
            }
            
            if(oi.cam_cube._physijs.touches[0]==undefined && !oi.moveJump){
                oi.velocity.y = -30;
                oi.canJump=false;
            }
            else{
                oi.canJump = true;
                oi.velocity.y = 0;
            }
            
            oi.velocity.x -= oi.velocity.x * 10.0 * delta;
            oi.velocity.z -= oi.velocity.z * 10.0 * delta;
            
            oi.camera.getWorldDirection( cameraDirection );
            
            if ( oi.controller.getTouchpadState() === true ) {
                oi.velocity.x += cameraDirection.x * (2000.0 * delta);
                oi.velocity.z += cameraDirection.z * (2000.0 * delta);
            }
            
            if (oi.moveJump){
                oi.canJump=false;
                oi.velocity.y = 20;
                oi.fframe=oi.fframe+1;
                if(oi.fframe==20) {
                    oi.moveJump=false; 
                    oi.fframe=0; 
                }

            }
            
            if(!oi.isEvent){
                oi.dummyCube.position.set(oi.cam_cube.position.x,
                                          oi.cam_cube.position.y+5,
                                          oi.cam_cube.position.z);
            }
            
            oi.cam_cube.setCcdMotionThreshold(0.01);
            oi.cam_cube.setCcdSweptSphereRadius(1.5);
            oi.controller.position.copy(oi.cam_cube.position);
        }
        else{
            oi.velocity.x = oi.velocity.z = 0;
            oi.moveJump = false;
        }
        
        oi.cam_cube.setLinearVelocity(new THREE.Vector3(oi.velocity.x * delta,
                                                        oi.velocity.y,
                                                        oi.velocity.z * delta));

        oi.prevTime = time;
        oi.prevPos.copy(oi.cam_cube.position);
        
    }

    
    var sim = function(){
        oi.scene.simulate(undefined, 1);
    }
    
    oi.PhysicsON = function(){
        // 플레이 모드가 되면 달아주어야 하는 이벤트
        oi.scene.addEventListener('update', sim, false);
    }    
    oi.PhysicsOFF = function(){
        oi.scene.removeEventListener('update', sim, false);
    }
    
    
    oi.loading = function(){
        var percent = Math.floor((oi.scene.children.length / (oi.nowRoomData.assets.length + 2)) * 100); 
        var width = percent.toString() + "%";                               // +2 : ambient light , VR_controller , VR_train

        $("#OIloading-bar").css("width", width);

        if (percent >= 100){
            document.getElementById("OIloading-bar").innerHTML = '이벤트 로딩중';
      //      console.log("oi.scene", oi.scene);
      //      console.log("nowRoomdata.scene", oi.nowRoomData);
        }
        else
            document.getElementById("OIloading-bar").innerHTML = width;

        if (percent >= 100 && $('#oiEventLoading').val() === "true") {
            setTimeout(function () {
                //$("#OIloading").css("display","none");
                $("#OIloading").hide("fade", {}, "slow");
            }, 100);

            oi.needLoading = false;
            oi.needChatBotUpdate = true;
            oi.reCreate_Physijs();
            oi.targetUpdate();
            
            videoEvent.VideoInit();
            ChatBot.Init(this);
            //$('#oiEventLoading').val("false");
            
            oi.dummyCube.position.set(oi.cam_cube.position.x,
                                    oi.cam_cube.position.y+5,
                                    oi.cam_cube.position.z);
        }
    }
    
    // 조명 타겟 업데이트 함수
    oi.targetUpdate = function(){
        oi.nowRoomData.assets.forEach(
            function addNumber(value) {
                var light, target;

                if(value.name==="light1" || value.name==="light2")
                {           
                    if(value.target!==""){

                        $.each(oi.scene.children, function(key, value2){
                            
	                       if(oi.scene.children[key].uuid===value.uuid){
                                light = oi.scene.children[key]; // 조명 찾기
                               }
	                       if(oi.scene.children[key].uuid===value.target)
                                target = oi.scene.children[key]; // 조명 찾기
                                
                        }); 

                        light.target = target; // 연결
                        console.log("조명 타겟 연결 성공");

                        console.log(light);
                        //oi.needTargetUpdate = false;
                    }
                } 
            });
        oi.needTargetUpdate = false;
    }
    
    // Physijs mesh 재생성
    oi.reCreate_Physijs = function () {
        //oi.PhysicsOFF();
        oi.scene.simulate(undefined, 1);
        
        var assetRemove = [];
        oi.scene.traverse(function (e) {
            if (e.name.substring(0, 5) == "basic") {
                assetRemove.push(e);
            }
        });

        assetRemove.forEach(function (e) {

            var physiMesh = e.clone();
            physiMesh.uuid = e.uuid;

            if (physiMesh.name.substring(0, 5) === "basic")
                physiMesh.material = e.material.clone();

            oi.scene.remove(e);

        //  oi.Assets.interTarget.push(physiMesh);

            if (physiMesh.name === "basic1" || physiMesh.name === "basic3") { // sphere, cone
                physiMesh._physijs.radius = physiMesh.scale.x / 2;
            }

            oi.scene.add(physiMesh);
            physiMesh.mass = 0;
        });
        
        oi.PhysicsON();
    }
    
};


