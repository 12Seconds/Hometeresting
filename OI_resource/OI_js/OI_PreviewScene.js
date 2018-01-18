/* OI PreviewScene Creator */
       
PreviewSceneLoader = function(domElement)
{
    var oi = this;
    oi.domE = domElement;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;

    oi.scene = new THREE.Scene();

    oi.speed=0;
    
    oi.camera = new THREE.PerspectiveCamera(45, oi.windowWidth/oi.windowHeight, 1, 1000);
    
    oi.renderer = new THREE.WebGLRenderer({ clearAlpha: 1, alpha:true });
    oi.renderer.setClearColor(0x5CD1E5);
    oi.renderer.setSize(oi.windowWidth,oi.windowHeight);
    oi.renderer.shadowMapEnabled = true;
    oi.renderer.shadowMapType = THREE.PCFSoftShadowMap;

    domElement.appendChild(oi.renderer.domElement);
    oi.camera.position.set(-30,10,30);
    oi.camera.lookAt(oi.scene);
    
    oi.txr_Loader = new THREE.TextureLoader();
    oi.wallpaper01 = oi.txr_Loader.load("OI_resource/asset/wallpaper/testpaper.jpg");

    oi.wallGeometry = new THREE.BoxGeometry(1, 1, 1);
    oi.wallMaterial = new THREE.MeshLambertMaterial({map:oi.wallpaper01, side:THREE.DoubleSide});
    
    // 광원 추가 -----------------------------------------------------------------------
    oi.PointLight = new THREE.PointLight(0xffffff);
    oi.PointLight.position.set(0,10,0);
    oi.PointLight.intensity = 0;
//    oi.scene.add(oi.PointLight);
      
    oi.spotLight = new THREE.SpotLight(0xffffff);
    oi.scene.add(oi.spotLight);
    oi.spotLight.position.set(0,10,0);
    oi.spotLight.castShadow = true;
    oi.spotLight.intensity = 1.5;
//    oi.spotLight.target.position = oi.target.position;
    
    // 함수들 --------------------------------------------------------------------------
    oi.rendering = function()
    {
        oi.renderer.render(oi.scene,oi.camera);
    }
    
     oi.update = function(){
        oi.windowWidth = domElement.clientWidth;
        oi.windowHeight = domElement.clientHeight;
        oi.camera.aspect = oi.windowWidth / oi.windowHeight;
        oi.camera.updateProjectionMatrix();
        oi.renderer.setSize(oi.windowWidth, oi.windowHeight);
    }
     
     oi.sceneReset = function()
     {
        var allChildren = oi.scene.children;
        var lastObj = allChildren[allChildren.length-1];
        if(lastObj.name=="viewAsset"){
            oi.scene.remove(lastObj);
        }
     }
     
     oi.moveCamera = function()
     {
         oi.speed += 0.05;
         oi.camera.position.x = (-20 * (Math.sin(oi.speed / 3)));
         oi.camera.position.z = (-20 * (Math.cos(oi.speed / 3)));
         oi.camera.lookAt(new THREE.Vector3(0,5,0));
         oi.spotLight.position.x = oi.camera.position.x+5;
         oi.spotLight.position.z = oi.camera.position.z-5;
         
     }
}