/* OI VRScene Creator */

VR_SceneLoader = function(domElement)
{
    var oi = this;
    oi.prevTime = performance.now();
    oi.domE = domElement;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;

    oi.nowRoomData;
    oi.needLoading = false;
    oi.needTargetUpdate = false;

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
        
        oi.camera.getWorldDirection( cameraDirection );
    
        //oi.dummyCube.quaternion.copy(oi.camera.quaternion);
  
        if ( oi.controller.getTouchpadState() === true ) {
            //oi.dummyCube.translateZ(-1);
            oi.dummyCube.position.z += cameraDirection.z * (3*delta);
            oi.dummyCube.position.x += cameraDirection.x * (3*delta);
            oi.dummyCube.position.y += cameraDirection.y * (3*delta);
        }
        
        oi.controller.position.copy(oi.cam_cube.position);
        
        oi.prevTime = time;
        
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
            oi.reCreate_Physijs();
            oi.targetUpdate();
            //$('#oiEventLoading').val("false");
            
            oi.dummyCube.position.set(oi.cam_cube.position.x,
                                    oi.cam_cube.position.y+7,
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


