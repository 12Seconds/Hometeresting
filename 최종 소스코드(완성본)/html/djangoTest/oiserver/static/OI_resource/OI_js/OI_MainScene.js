/* OI MainScene Creator */

MainSceneLoader = function(domElement)
{
    var oi = this;
    
    oi.domE = domElement;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;

    //oi.scene = new THREE.Scene();
    oi.scene = new Physijs.Scene;
 //   oi.scene = new Physijs.Scene({ reportsize: 50, fixedTimeStep: 1 / 20 });
    oi.scene.setGravity(new THREE.Vector3(0,-30,0));
    
    /*
    // 플레이 모드가 되면 달아주어야 하는 이벤트
    oi.scene.addEventListener(
        'update',
        function() {
            oi.scene.simulate( undefined, 1 );
        }
    );
    */
    
    oi.camera = new THREE.PerspectiveCamera(45, oi.windowWidth/oi.windowHeight, 1, 1000);
    oi.tp_camera = new THREE.PerspectiveCamera(45, oi.windowWidth/oi.windowHeight, 1, 1000);
    
    oi.renderer = new THREE.WebGLRenderer({ clearAlpha: 1, alpha:true });
    oi.renderer.setClearColor(0xEEEEEE);
    
    //oi.renderer = new THREE.WebGLRenderer();
  //  oi.renderer.setClearColor(0xEEEEEE);
    
    oi.renderer.setSize(oi.windowWidth,oi.windowHeight);
    //oi.renderer.shadowMapEnabled = true;
    oi.renderer.shadowMapType = THREE.PCFSoftShadowMap;
//  oi.renderer.autoClear = false;
    
    domElement.appendChild(oi.renderer.domElement);
    oi.camera.position.set(-30,20,30);
    oi.tp_camera.rotation.set(0,0,0);
    
    oi.control = new THREE.TransformControls( oi.camera, oi.renderer.domElement );
    
    oi.txr_Loader = new THREE.TextureLoader();
    oi.wallpaper01 = oi.txr_Loader.load("/static/OI_resource/asset/wallpaper/testpaper.jpg");
    
    /*
    oi.wallpaper02 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper2.jpg");
    oi.wallpaper03 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper3.jpg");
    oi.wallpaper04 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper4.jpg");
    oi.wallpaper05 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper5.jpg");
    
    oi.structureG = new THREE.Group(); // 벽 등 구조물 그룹화
    */
    
    //oi.wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    
    oi.wallMaterial = new THREE.MeshLambertMaterial({map:oi.wallpaper01, side:THREE.DoubleSide});
    
    /*
    oi.wallMaterial2 = new THREE.MeshLambertMaterial({map:oi.wallpaper02, side:THREE.DoubleSide});
    oi.wallMaterial3 = new THREE.MeshLambertMaterial({map:oi.wallpaper03, side:THREE.DoubleSide});
    oi.wallMaterial4 = new THREE.MeshLambertMaterial({map:oi.wallpaper04, side:THREE.DoubleSide});
    oi.wallMaterial5 = new THREE.MeshLambertMaterial({map:oi.wallpaper05, side:THREE.DoubleSide});
    */
    
    oi.pyWallMaterial = Physijs.createMaterial(
        oi.wallMaterial,
        .0, // high friction
        .9 // low restitution
    );
            
    // 공간 생성 -----------------------------------------------------------------------
    
    oi.floor = new Physijs.BoxMesh(
        new THREE.BoxGeometry(1,1,1),
        oi.pyWallMaterial,
        0 // mass
    );
    oi.floor.scale.set(500,1,500);
    oi.floor.name = "basic0";
    /*
    oi.floor = new THREE.Mesh(oi.wallGeometry, oi.wallMaterial3);
    oi.floor.scale.set(100,0.2,100);
    oi.floor.castShadow = true;
    //oi.scene.add(oi.floor);
    
    oi.ceiling = new THREE.Mesh(oi.wallGeometry, oi.wallMaterial4);
    oi.ceiling.scale.set(100,0.2,100);
    oi.ceiling.position.y = 50;
    //oi.scene.add(oi.ceiling);
            
    oi.wall_01 = new THREE.Mesh(oi.wallGeometry, oi.wallMaterial5);
    oi.wall_01.scale.set(100,50,0.2);
    oi.wall_01.position.z = -50;
    oi.wall_01.position.y = 25;
    //oi.scene.add(oi.wall_01);
            
    oi.wall_02 = new THREE.Mesh(oi.wallGeometry, oi.wallMaterial5);
    oi.wall_02.scale.set(0.2,50,100);
    oi.wall_02.position.x = 50;
    oi.wall_02.position.y = 25;
    //oi.scene.add(oi.wall_02);
    */
        
    // 축 추가
    /*
    oi.axes = new THREE.AxisHelper(15);
    oi.scene.add(oi.axes);
    */
    // 광원 추가 -----------------------------------------------------------------------
    oi.PointLight = new THREE.PointLight(0xffffff);
    oi.PointLight.position.set(0,50,0);
    oi.PointLight.intensity = 1;
    oi.PointLight.name = "light0";
   // oi.scene.add(oi.PointLight);

   // oi.structureG.add(oi.floor, oi.ceiling, oi.wall_01, oi.wall_02, oi.PointLight);

    
    // 송식
    oi.spotLight = new THREE.SpotLight(0xffffff);
    oi.spotLight.position.set(0, 600, 0);
    oi.spotLight.castShadow = true;

    // oi.spotLight.target = oi.floor;
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

    oi.scene.add( oi.helper );
    oi.scene.add( oi.helper2);

    // ambient light
    oi.ambientLight;
    
    oi.scene.add(oi.floor);
    //oi.scene.add(oi.PointLight);
    oi.scene.simulate();
    
  // update function (resize)
    oi.update = function(){
        oi.windowWidth = domElement.clientWidth;
        oi.windowHeight = domElement.clientHeight;
        
        oi.camera.aspect = oi.windowWidth / oi.windowHeight;
        oi.camera.updateProjectionMatrix();
        
        oi.tp_camera.aspect = oi.windowWidth / oi.windowHeight;
        oi.tp_camera.updateProjectionMatrix();
        
        oi.renderer.setSize(oi.windowWidth, oi.windowHeight);
    }

    
    
    /* Test Play */
    /*
    oi.ccGeometry = new THREE.BoxGeometry(4,4,4);
    oi.ccMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
    oi.cam_cube = new THREE.Mesh(oi.ccGeometry, oi.ccMaterial);
    
    oi.scene.add(oi.cam_cube);
    */
    
    oi.cam_paper = oi.txr_Loader.load("/static/OI_resource/images/user.png");
    
    oi.ccMaterial = new THREE.MeshLambertMaterial({map:oi.cam_paper, side:THREE.DoubleSide});
   // oi.wallMaterial = new THREE.MeshLambertMaterial({map:oi.wallpaper01, side:THREE.DoubleSide});

    oi.cam_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),oi.ccMaterial/* 0 /* mass */);
    
        
    // 백업
    //oi.ccMaterial = new THREE.MeshLambertMaterial({color: 0x00ff00});
    //oi.cam_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),oi.ccMaterial/* 0 /* mass */);
    
    
  //  oi.cam_cube = new Physijs.SphereMesh(new THREE.SphereGeometry( 2, 32, 32 ),oi.ccMaterial/* 0 /* mass */);

 //   oi.cam_cube.visible=false;
    oi.cam_cube.name = "cam_cube0";
    
    oi.cam_cube.__dirtyPosition=true;
    oi.cam_cube.__dirtyRotation=true;
    
    oi.cam_cube.position.set(0,10,0);
    oi.cam_cube.setCcdMotionThreshold(0.01);
    oi.cam_cube.setCcdSweptSphereRadius(1.5);
    oi.scene.add(oi.cam_cube);

    // test
    
//    oi.test_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),oi.ccMaterial/* 0 /* mass */);
//    oi.test_cube.position.set(30,10,30);

//    oi.test_cube.name = "";
//    oi.scene.add(oi.test_cube);
    
    console.log(oi.test_cube);
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
};


