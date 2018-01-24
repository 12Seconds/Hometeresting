/* OI MainScene Creator */
       
MainSceneLoader = function(domElement)
{
    var oi = this;
    
    oi.domE = domElement;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;

    //oi.scene = new THREE.Scene();
    oi.scene = new Physijs.Scene;
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
    
    oi.renderer = new THREE.WebGLRenderer({ clearAlpha: 1, alpha:true });
    oi.renderer.setClearColor(0xEEEEEE);
    oi.renderer.setSize(oi.windowWidth,oi.windowHeight);
    oi.renderer.shadowMapEnabled = true;
    oi.renderer.shadowMapType = THREE.PCFSoftShadowMap;
//  oi.renderer.autoClear = false;
    
    domElement.appendChild(oi.renderer.domElement);
    oi.camera.position.set(-30,20,30);

    oi.control = new THREE.TransformControls( oi.camera, oi.renderer.domElement );
    
    oi.txr_Loader = new THREE.TextureLoader();
    oi.wallpaper01 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper.jpg");
    
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
        .8, // high friction
        .4 // low restitution
    );
            
    // 공간 생성 -----------------------------------------------------------------------
    
    oi.floor = new Physijs.BoxMesh(
        new THREE.BoxGeometry(50,1,50),
        oi.pyWallMaterial,
        0 // mass
    );
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
   // oi.scene.add(oi.PointLight);

   // oi.structureG.add(oi.floor, oi.ceiling, oi.wall_01, oi.wall_02, oi.PointLight);
    
    oi.floor.name = "basic_cube0";

    oi.scene.add(oi.floor);
    oi.scene.add(oi.PointLight);
    oi.scene.simulate();
    
  // update function (resize)
    oi.update = function(){
        oi.windowWidth = domElement.clientWidth;
        oi.windowHeight = domElement.clientHeight;
        oi.camera.aspect = oi.windowWidth / oi.windowHeight;
        oi.camera.updateProjectionMatrix();
        oi.renderer.setSize(oi.windowWidth, oi.windowHeight);
    }

};


