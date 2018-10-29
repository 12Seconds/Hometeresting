/* OI SIDE HUD Creator */

OI_SIDE_HUD = function(domElement)
{
    var oi = this;
    oi.windowWidth = domElement.clientWidth;
    oi.windowHeight = domElement.clientHeight;
    oi.scene = new THREE.Scene();
    oi.camera = new THREE.OrthographicCamera(-oi.windowWidth/2, oi.windowWidth/2, oi.windowHeight/2, -oi.windowHeight/2, 0.1, 1500);
    oi.camera.position.z = 10;
    
    oi.renderer = new THREE.WebGLRenderer({ clearAlpha: 1, alpha:true });
    oi.renderer.setClearColor(0xEEEEEE);
    oi.renderer.setSize(oi.windowWidth,oi.windowHeight);
    oi.renderer.shadowMapEnabled = true;
    oi.renderer.shadowMapType = THREE.PCFSoftShadowMap;
//  oi.renderer.autoClear = false;

    domElement.appendChild(oi.renderer.domElement);
    
    
    oi.txr_Loader = new THREE.TextureLoader();
    oi.mainMenuTexture = oi.txr_Loader.load("OI_resource/customHud/MainMenu.png");
    oi.assetListTexture = oi.txr_Loader.load("OI_resource/customHud/assetList.png");
    oi.shopIconTexture = oi.txr_Loader.load("OI_resource/customHud/shopIcon.png");
    
    oi.NellIconTexture = oi.txr_Loader.load("OI_resource/customHud/nell.jpg");
    oi.BugiIconTexture = oi.txr_Loader.load("OI_resource/customHud/bugi.jpg");
    oi.EeveeIconTexture = oi.txr_Loader.load("OI_resource/customHud/eevee.png");
    
    // main Menu
    oi.mainMenuMaterial = new THREE.SpriteMaterial({
        map:oi.mainMenuTexture,
        transparent:true,
        opacity:0.2
    });

    oi.mainMenuMesh = new THREE.Sprite(oi.mainMenuMaterial);
            
    oi.mainMenuMesh.scale.set(oi.windowWidth,oi.windowHeight,1);
            
////////////////////////////////////////////////////////////////
    // AssetList
    oi.AssetListMaterial = new THREE.SpriteMaterial({
        map:oi.assetListTexture,
        transparent:true,
        opacity:0.5
    });
    oi.AssetListMesh = new THREE.Sprite(oi.AssetListMaterial);
            
    oi.AssetListMesh.scale.set(oi.windowWidth,oi.windowHeight,1);
    oi.AssetListMesh.position.set( oi.windowWidth - oi.windowHeight*0.5,   
                                   oi.windowHeight2 - oi.mainMenuHeight*0.5, 1 );    
            
    oi.AssetListMesh.visible=false;
////////////////////////////////////////////////////////////////
 
    
/* -- Application Icons -- */
    
    oi.Icons = []; // 아이콘들을 배열로 저장
    oi.IconGroup = new THREE.Group(); // 앱 아이콘들을 묶는 그룹
    oi.AppCnt = 0;
    oi.IconPosX = oi.windowWidth*0.2;
    oi.IconPosY = oi.windowHeight*0.4;
    
    function XYposToggle() // 아이콘 추가시 좌표를 지정해주는 함수
    {
        oi.AppCnt++;
        if(oi.AppCnt%2)
        {
            oi.IconPosX = oi.windowWidth*-0.2;
            oi.IconPosY = oi.IconPosY-oi.windowHeight/7.5-10;
        }
        else
            oi.IconPosX = oi.IconPosX+oi.windowHeight/7.5+30;
    }
// 원래위치  position.set(oi.windowWidth*-0.2,oi.windowHeight*0.2,1);

    
    function createApp(MeshName, Texture) // 앱 아이콘메시를 생성하고 추가하는 함수
    {
        XYposToggle();
        var IconGeometry = new THREE.CircleGeometry(oi.windowHeight/15, 50, Math.PI*2, Math.PI*2);
        var IconMaterial = new THREE.MeshBasicMaterial({
        map:Texture,
        side:THREE.DoubleSide,  
        transparent:true,
        opacity:1,
        depthTest:false,
        });
        
        oi.Icons.push(new THREE.Mesh(IconGeometry, IconMaterial));
        oi.Icons[oi.Icons.length-1].position.x = oi.IconPosX;
        oi.Icons[oi.Icons.length-1].position.y = oi.IconPosY;
        oi.Icons[oi.Icons.length-1].name = "MeshName";
        
        oi.IconGroup.add(oi.Icons[oi.Icons.length-1]);
    }
    
    // 앱 아이콘 추가하는 부분
    createApp("shopIconMesh", oi.shopIconTexture);
    createApp("nellIconMesh", oi.NellIconTexture);
    createApp("bugiIconMesh", oi.BugiIconTexture);
    createApp("eeveeIconMesh", oi.EeveeIconTexture);
    
//  oi.Icons[0].position.x = 0; 각 메시들을 배열로 접근하기 테스트, 됨
    
/* ----------------------- */
''
    oi.sceneGroup = new THREE.Group();
    oi.sceneGroup.add(oi.mainMenuMesh, oi.AssetListMesh);
    
    oi.scene.add(oi.sceneGroup, oi.IconGroup);
    
    //oi.IconGroup.visible=false;
    
    
   
    // update function (resize)
    oi.update = function()
    {
        oi.windowWidth = domElement.clientWidth;
        oi.windowHeight = domElement.clientHeight;
        oi.renderer.setSize(oi.windowWidth, oi.windowHeight);
        oi.camera.updateProjectionMatrix();
      //SideHud.camera.aspect = (SideHud.windowWidth/2)/(SideHud.windowHeight/2);
      //SideHud.camera.updateProjectionMatrix();
    }
}

