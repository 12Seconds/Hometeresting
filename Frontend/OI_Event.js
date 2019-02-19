/* OI Event functions */

OI_Event = function (document, Assets, Preview, Dic, customCam, mainRoom, testPlay, frameEvent, videoEvent, oiRTC) {
    var oi = this;
    var _eventHandlers = {};
    
    oi.document = document;
    oi.Assets = Assets;
    oi.dic = Dic;
    oi.customCam = customCam;
    oi.mainRoom = mainRoom;
    oi.testPlay = testPlay;
    
    oi.isAssetAllocate = false; // 배치버튼 누르면 true로
    oi.isAssetModifying = false; // 수정버튼(에셋) 누르면 true로
    oi.isVisiting = false;
	oi.isMultiplaying = false;
    oi.isTargetSetting = false;
    oi.X_target;
    
    oi.needLoading = false;

    oi.needTargetUpdate = false;
    oi.nowRoomdata;
    
    //송식
    oi.isDetailEditing = false;
    oi.isMycontents = false;

    // get DIV ========================================================
    
    // asset Explore div ------------------------------------
    oi.assetExplore = oi.document.getElementById("assetExpList");
    oi.assetExploreArray = [];

    // 추가 버튼 div -----------------------------------------
    oi.divAddButton = oi.document.getElementById("addtoScene");

    // 공통 div -------------------------------------------------
    oi.divButton = oi.document.getElementById("button");
    oi.divSideinfo = oi.document.getElementById("sideinfo");

    oi.divContent = oi.document.getElementById("content");

    // 홈메뉴 div -----------------------------------------------
    oi.divHomeMenu = oi.document.getElementById("homeMenue");
    oi.divIcons = [];
    for (var i = 0; i < 8; i++) {
        oi.divIcons[i] = oi.document.getElementById("iconLo" + (i + 1));
    }

    // 에셋 APP div ---------------------------------------------
    oi.assetapp = oi.document.getElementById("asset");
    // 에셋 카테고리 div -----------------------------------------
    oi.divAssetCategory = oi.document.getElementById("assetCategory");
    oi.divCategory = [];
    for (var i = 0; i < 4; i++) {
        oi.divCategory[i] = oi.document.getElementById("categoryLo" + (i + 1));
    }

    // 에셋리스트 div --------------------------------------------
    oi.divAssetList = oi.document.getElementById("assetList");
    oi.Preview = Preview;
    oi.divBackArrow = oi.document.getElementById("backArrow");
    oi.divBucketList = oi.document.getElementById("bucketList");
    oi.divFurns = [];
    oi.divOrnas = [];
    oi.divStrucs = [];
    oi.divTemp;
    oi.selectedDiv = null;
    oi.selectedAsset = null;
    oi.isCtrl = false;
    
    // Ctrl+c event 변수
    oi.isCopy = false;
    oi.copyAsset = null;
    oi.g_copyAsset = [];
    oi.copyCnt = 0;
    
    // G key ---> group 변수
    oi.groupAsset = [];
    oi.isGroup = false;
    oi.gKeyPress = false;
    
    // 에셋의 Outline을 위한 변수
    oi.composer = new THREE.EffectComposer(oi.mainRoom.renderer);
    oi.renderPass = new THREE.RenderPass( oi.mainRoom.scene, oi.mainRoom.camera );
    oi.composer.addPass( oi.renderPass );
    oi.outlinePass = new THREE.OutlinePass( new THREE.Vector2( oi.mainRoom.windowWidth, oi.mainRoom.windowHeight ), 
                                           oi.mainRoom.scene, oi.mainRoom.camera );
    oi.composer.addPass( oi.outlinePass );
    
    oi.effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
    oi.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / oi.mainRoom.windowWidth, 1 / oi.mainRoom.windowHeight );
    oi.effectFXAA.renderToScreen = true;
    oi.composer.addPass( oi.effectFXAA );
    
    oi.outlinePass.edgeStrength = 3;
    oi.outlinePass.edgeGlow = 1;
    oi.outlinePass.edgeThickness = 2;
    oi.outlinePass.pulsePeriod = 3;
    oi.outlinePass.visibleEdgeColor.set('#a02727');
    oi.outlinePass.hiddenEdgeColor.set('#ede8e6');

    oi.textureLen = 25;

    // 공통 div Event =====================================================================
    
    oi.GoHOME = function () {
        // alert("go home");   
        var delDiv = oi.document.getElementById("bucketList");
        while (delDiv.firstChild) {
            delDiv.removeChild(delDiv.firstChild);
        }
        oi.divFurns = [];
        oi.divOrnas = [];
        oi.divStrucs = [];
        oi.Preview.sceneReset();
        oi.selectedDiv = null;;
    }

    oi.blockClick = function (event) { // contextmenu block
        event.preventDefault();
        if (event.target.id != "") { // canvas
            oi.customCam.mouseDragOn = false;
        }
    }

    oi.blockDiv = function (event) { // All Div Block and Opacity transparent
        oi.assetapp.style.visibility = 'hidden';

    }

    oi.unblockDiv = function (event) { // All Div unBlock
        var assetRemove = [];
        oi.mainRoom.scene.traverse(function (e) {
            if (e.getObjectByName("traceAsset"))
                assetRemove.push(e);
        });
        assetRemove.forEach(function (e) {
            oi.mainRoom.scene.remove(e);
        });

        oi.isAssetAllocate = false;
        oi.assetapp.style.visibility = 'visible';
        oi.document.removeEventListener('click', oi.assetAllocate, false);
    }

    // 공통 div Event End =====================================================================

    // 홈메뉴 div Event =====================================================================


    // 홈메뉴 div Event End =====================================================================

    // 에셋카테고리 및 리스트 div Event =====================================================================
    
    // 이미지 preload
    var preloadImage = [];
    for(var i=0; i<oi.textureLen; i++){
        preloadImage.push("static/OI_resource/texture/" + i + ".jpg");
    }
    
    function preload(imageArray, index) {
        index = index || 0;
        if (imageArray && imageArray.length > index) {
            var img = new Image ();
            img.onload = function() {
                preload(imageArray, index + 1);
            }
            img.src = preloadImage[index];
        }
    }
    
    /* images is an array with image metadata */
    preload(preloadImage);

    // Asset Click Event (ScreenShot) ---------------------
    oi.assetClick = function (event) {
        var targetDiv = event.target;
        //console.log(targetDiv);

        if (targetDiv.children.length > 0) { // 부모 노드 클릭 이벤트
            if (targetDiv.scrollState) {
                targetDiv.scrollState = false;
                targetDiv.style.height = "30px";
                for (var i = 0; i < targetDiv.children.length; i++) {
                    targetDiv.children[i].style.display = "none";
                }
            } else {
                targetDiv.scrollState = true;
                var len = targetDiv.children.length * 150 + 40
                targetDiv.style.height = len+"px";
                for (var i = 0; i < targetDiv.children.length; i++) {
                    targetDiv.children[i].style.display = "block";
                }
            }
        } else // 에셋 스크린샷 div 선택
        {
            oi.selectedDiv = targetDiv;
            oi.dic.assetDic[targetDiv.id].then(function (obj) {
                oi.Preview.sceneReset();

                var viewAsset = obj.clone();

                if(viewAsset.name.substring(0,5)==="basic")
                    viewAsset.material = obj.material.clone();
                else if(viewAsset.name==="frame"){
                    var mat;
                    for(var j=0; j<obj.children.length; j++){
                        //console.log(obj.children[j]);
                        for(var k=0; k<obj.children[j].children.length; k++){
                            //obj.children[j].children[k].parent = obj;
                            if(obj.children[j].children[k] instanceof THREE.Mesh){
                                mat = obj.children[j].children[k].material;
                                viewAsset.children[j].children[k].material = mat.clone();
                            }
                        }
                    }
                    
                }

                viewAsset.position.set(0, 2, 0);
                viewAsset.scale.set(8, 8, 8);
                viewAsset.name = "viewAsset";
                oi.Preview.scene.add(viewAsset);
            });
        }
    }

    // Asset Click Event ( To Modify ) ---------------------
    oi.clickToModify = function (event) {
        
        if(event.which==1){
        
        if (!oi.isAssetAllocate && !oi.isTargetSetting) {
            var mouseVector = new THREE.Vector3();
            var raycaster = new THREE.Raycaster();

            mouseVector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5); // z = 0.5 important!
            mouseVector.unproject(oi.mainRoom.camera);
            raycaster.set(oi.mainRoom.camera.position, mouseVector.sub(oi.mainRoom.camera.position).normalize());

            var interTarget = oi.Assets.interTarget.slice(0);
            //oi.mainRoom.floor,oi.mainRoom.ceiling,oi.mainRoom.wall_01,oi.mainRoom.wall_02
            
            /*
            interTarget.splice(interTarget.indexOf(oi.mainRoom.floor), 1);
            interTarget.splice(interTarget.indexOf(oi.mainRoom.ceiling), 1);
            interTarget.splice(interTarget.indexOf(oi.mainRoom.wall_01), 1);
            interTarget.splice(interTarget.indexOf(oi.mainRoom.wall_02), 1);
            */

            
            var intersects = raycaster.intersectObjects(interTarget, true);

            if (intersects.length > 0) {
                
                console.log(oi.selectedAsset);
                // 송식
                if(intersects[0].object.name!=="cam_cube0"){
                    oi.mainRoom.scene.remove( oi.mainRoom.helper );
                    oi.mainRoom.scene.remove( oi.mainRoom.helper2 );
                }
                //console.log(intersects[0].object.parent.parent);
                //console.log(intersects[0].object.name.substring(0,5));
                if(intersects[0].object.name.substring(0,5)==="basic")
                    oi.selectedAsset = intersects[0].object;
                else
                    oi.selectedAsset = intersects[0].object.parent.parent;
                
                if (oi.selectedAsset.parent !== null) {
                    oi.isAssetModifying = true;
                    oi.mainRoom.control.attach(oi.selectedAsset);
                    oi.mainRoom.scene.add(oi.mainRoom.control);
                    oi.mainRoom.control.setMode("translate");
                    
                    oi.detailsChange(); // 송식
                    
                    if(!oi.isGroup){
                        var selectedObjects = [];
                        selectedObjects.push(oi.selectedAsset);
                        oi.outlinePass.selectedObjects = selectedObjects;
                    }
                    else{
                        // G키를 누르고 있지 않은 상태에서
                        // 그룹 상태에서 그룹이 아닌 다른 에셋을 눌렀을 경우
                        // 그룹이 풀리도록 설정
                        if(!oi.gKeyPress){
                            var elseGroup = false;
                            for(var i=0; i<oi.groupAsset.length; i++){
                                if(oi.selectedAsset===oi.groupAsset[i]){
                                    elseGroup = false;
                                    break;
                                }
                                else
                                    elseGroup = true;
                            }
                            if(elseGroup){
                                // 그룹 clear
                                oi.groupAsset = [];
                                oi.isGroup = false;
                                oi.detailsChange();
                                oi.mainRoom.control.groupClear();
                                oi.outlinePass.selectedObjects = [];
                                
                                // 선택한 에셋 outline
                                var selectedObjects = [];
                                selectedObjects.push(oi.selectedAsset);
                                oi.outlinePass.selectedObjects = selectedObjects;
                            }
                        }
                    }
                }

                if (oi.isCtrl) {}
            }
        }
        
        if (oi.isTargetSetting){
            var mouseVector = new THREE.Vector3();
            var raycaster = new THREE.Raycaster();

            mouseVector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5); // z = 0.5 important!
            mouseVector.unproject(oi.mainRoom.camera);
            raycaster.set(oi.mainRoom.camera.position, mouseVector.sub(oi.mainRoom.camera.position).normalize());

            var interTarget = oi.Assets.interTarget.slice(0);
            var intersects = raycaster.intersectObjects(interTarget, true);

            if (intersects.length > 0) {
                if(intersects[0].object.name.substring(0,5)==="basic")
                    var target = intersects[0].object;
                else
                    var target = intersects[0].object.parent.parent;
                if (target.parent !== null) {
                    oi.X_target.target = target;
                    console.log("타겟 설정 완료");
                    console.log(oi.X_target);
                    console.log(target);
                    
                    $("#details").css("display","block");
                    $("#target_msg").css("display","none");
                    oi.isTargetSetting = false;
                    oi.X_target = null;
                }
            }
        }
        
        }
    }

    // isAssetAllocate 변수 값 바꾸는 버튼 이벤트
    oi.addButtonClick = function (event) {
        var target = event.target;

        if (oi.selectedDiv !== null) {
            if (target.id == "iconimg" && oi.isAssetAllocate == false) {
                oi.isAssetAllocate = true;
                oi.blockDiv();
            }
        }

    }

    // Asset Allocate Mouse Move Event -----------
    //oi.Assets.interTarget.push(oi.mainRoom.floor, oi.mainRoom.ceiling, oi.mainRoom.wall_01, oi.mainRoom.wall_02);
    oi.Assets.interTarget.push(oi.mainRoom.floor);
    oi.onMouseMove = function (event) {
        if (oi.isAssetAllocate) { // if 에셋 배치버튼 누르면
            var mouseVector = new THREE.Vector3();
            var raycaster = new THREE.Raycaster();

            mouseVector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5); // z = 0.5 important!
            mouseVector.unproject(mainRoom.camera);
            raycaster.set(mainRoom.camera.position, mouseVector.sub(mainRoom.camera.position).normalize());

            var intersects = raycaster.intersectObjects(oi.Assets.interTarget, true);

            //송식

          //  if( oi.mainRoom.helpr !== undefined)
                oi.mainRoom.scene.remove(oi.mainRoom.helper);

            if( oi.mainRoom.helper2 !== undefined)
                oi.mainRoom.scene.remove(oi.mainRoom.helper2);
            
            if (intersects.length > 0) {
                //console.log(oi.selectedDiv);
                var points = intersects[0].point;

                oi.dic.assetDic[oi.selectedDiv.id].then(function (obj) {
                    var traceAsset = obj.clone();

                    if(traceAsset.name.substring(0,5)==="basic")
                        traceAsset.material = obj.material.clone();
                    else if(traceAsset.name==="frame"){
                        var mat;
                        for(var j=0; j<obj.children.length; j++){
                            //console.log(obj.children[j]);
                            for(var k=0; k<obj.children[j].children.length; k++){
                                //obj.children[j].children[k].parent = obj;
                                if(obj.children[j].children[k] instanceof THREE.Mesh){
                                    mat = obj.children[j].children[k].material;
                                    traceAsset.children[j].children[k].material = mat.clone();
                                }
                            }
                        }

                    }

                    traceAsset.position.set(points.x - 1.5, points.y + 1.5, points.z + 1.5);

                    traceAsset.scale.set(10, 10, 10);

                    traceAsset.name = "traceAsset";
                    oi.mainRoom.scene.add(traceAsset);
                    
                    //송식
                    //console.log(obj.name);
                    if(obj.name==="light_point"){
                        oi.mainRoom.helper = new THREE.PointLightHelper(traceAsset, 0.1);
                        oi.mainRoom.helper.name = "L_helper";
                      //  oi.mainRoom.helper2 = new THREE.CameraHelper( traceAsset.shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                      //  oi.mainRoom.helper2.dispose();
                      //  oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(obj.name==="light_spot"){
                        oi.mainRoom.helper = new THREE.SpotLightHelper(traceAsset);
                        oi.mainRoom.helper.name = "L_helper";
                 //       oi.mainRoom.helper2 = new THREE.CameraHelper( traceAsset.shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                 //       oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(obj.name==="light_directional"){
                        oi.mainRoom.helper = new THREE.DirectionalLightHelper(traceAsset);
                        oi.mainRoom.helper.name = "L_helper";
                    //    oi.mainRoom.helper2 = new THREE.CameraHelper( traceAsset.shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                       // oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    
                });

                var assetRemove = [];
                oi.mainRoom.scene.traverse(function (e) {
                    if (e.getObjectByName("traceAsset"))
                        assetRemove.push(e);
                });
                assetRemove.forEach(function (e) {
                    oi.mainRoom.scene.remove(e);
                });
            }
            oi.document.addEventListener('click', oi.assetAllocate, false); // 에셋 배치 함수
        }
    }

    oi.assetAllocate = function (event) {
        if (oi.isAssetAllocate) {
            var mouseVector = new THREE.Vector3();
            var raycaster = new THREE.Raycaster();

            mouseVector.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5); // z = 0.5 important!
            mouseVector.unproject(mainRoom.camera);
            raycaster.set(mainRoom.camera.position, mouseVector.sub(mainRoom.camera.position).normalize());

            var intersects = raycaster.intersectObjects(oi.Assets.interTarget, true);

            if (intersects.length > 0) {
                var points = intersects[0].point;

                oi.dic.assetDic[oi.selectedDiv.id].then(function (obj) {
                    var newAsset = obj.clone();

                    if(newAsset.name.substring(0,5)==="basic")
                        newAsset.material = obj.material.clone();
                    else if(newAsset.name==="frame"){
                    
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

                    }

                    newAsset.position.set(points.x - 1.5, points.y + 1.5, points.z + 1.5);

                    newAsset.scale.set(10, 10, 10);

                    newAsset.name = oi.selectedDiv.id;
                    
                    if(newAsset.name.substring(0,5)==="basic"){
                        newAsset.mass = 0;
                    }
                    
                    oi.Assets.interTarget.push(newAsset);
                    oi.mainRoom.scene.add(newAsset);
                    oi.exploreUpdate();
                    
                    //송식 
                    oi.mainRoom.scene.remove( oi.mainRoom.helper );
                    if(oi.mainRoom.helper2!==undefined)
                        oi.mainRoom.scene.remove(oi.mainRoom.helper2);
                });
            }
            oi.unblockDiv();
        }
    }

    // Furniture Tab -------------------
    oi.categoryLo1Click = function () {

        oi.divAssetCategory.style.display = 'none';
        var path = "OI_resource/asset/furniture/";

        for (var i = 0; i < oi.Assets.furnNames.length; i++) {
            oi.divFurns[i] = oi.document.createElement('DIV'); // DIV 객체 생성
            oi.divFurns[i].setAttribute('id', oi.Assets.furnNames[i]); // id 지정
            oi.divFurns[i].innerHTML = oi.Assets.furnNames[i]; // 객체에 포함할 텍스트

            if(oi.divFurns[i].innerHTML==="tv"){
                oi.divFurns[i].setAttribute("style", "background-color:rgba(255,200,0,0.7);" +
                    // "overflow-y:auto;" +
                    "width:100%; height: 30px;" +
                    "border-width:2px; border-color:gray; border-style:solid");
            }
            else{
            oi.divFurns[i].setAttribute("style", "background-color:rgba(" + i * 40 + ",206,250,0.7);" +
                // "overflow-y:auto;" +
                "width:100%; height: 30px;" +
                "border-width:2px; border-color:gray; border-style:solid");
            }

            oi.divBucketList.appendChild(oi.divFurns[i]); // body의 자식 노드로 첨부 (필수)

            oi.divFurns[i].scrollState = false;

            var asset = oi.Assets.furnNames[i];

            for (var j = 0; j < oi.Assets.furnCnts[i]; j++) {
                oi.divTemp = oi.document.createElement('DIV');
                oi.divTemp.scrollState = false;
                oi.divTemp.setAttribute('id', oi.Assets.furnNames[i] + j);
                var assetid = oi.Assets.furnNames[i] + j;
                oi.divTemp.setAttribute("style", "width : 70%; height: 150px;" +
                    "margin:5 auto;" +
                    "border-radius: 1em 1em 1em 1em;");
                oi.divTemp.innerHTML = '<img id="' + assetid + '" class ="iconimg" src ="static/' + path + asset + '/' + asset + j + '/' + asset + '.png">';
                oi.divTemp.style.display = "none";
                oi.divFurns[i].appendChild(oi.divTemp);
            }

            // oi.divFurns[i] Click Event
            oi.divFurns[i].addEventListener('click', bind(oi, oi.assetClick), false);
        }
        oi.divAssetList.style.display = "block";
        oi.Preview.update();
    }

    // Ornament Tab ---------------------
    oi.categoryLo2Click = function () // 장식품 탭 클릭
    {

        oi.divAssetCategory.style.display = 'none';
        var path = "OI_resource/asset/ornament/";

        for (var i = 0; i < oi.Assets.ornaNames.length; i++) {
            oi.divOrnas[i] = oi.document.createElement('DIV'); // DIV 객체 생성
            oi.divOrnas[i].setAttribute('id', oi.Assets.ornaNames[i]); // id 지정
            oi.divOrnas[i].innerHTML = oi.Assets.ornaNames[i]; // 객체에 포함할 텍스트

            if(oi.divOrnas[i].innerHTML==="frame"){
                oi.divOrnas[i].setAttribute("style", "background-color:rgba(255,200,0,0.7);" +
                    // "overflow-y:auto;" +
                    "width:100%; height: 30px;" +
                    "border-width:2px; border-color:gray; border-style:solid");
            }
            else{
            oi.divOrnas[i].setAttribute("style", "background-color:rgba(" + i * 40 + ",206,250,0.7);" +
                // "overflow-y:auto;" +
                "width:100%; height: 30px;" +
                "border-width:2px; border-color:gray; border-style:solid");
            }

            oi.divBucketList.appendChild(oi.divOrnas[i]); // body의 자식 노드로 첨부 (필수)

            oi.divOrnas[i].scrollState = false;

            var asset = oi.Assets.ornaNames[i];

            for (var j = 0; j < oi.Assets.ornaCnts[i]; j++) {
                oi.divTemp = oi.document.createElement('DIV');
                oi.divTemp.setAttribute('id', oi.Assets.ornaNames[i] + j);
                var assetid = oi.Assets.ornaNames[i] + j;
                oi.divTemp.setAttribute("style", "width : 70%; height: 150px;" +
                    "margin:5 auto;" +
                    "border-radius: 1em 1em 1em 1em;");
                oi.divTemp.innerHTML = '<img id="' + assetid + '" class ="iconimg" src ="static/' + path + asset + '/' + asset + j + '/' + asset + '.png">';
                oi.divTemp.style.display = "none";
                oi.divOrnas[i].appendChild(oi.divTemp);
            }

            // oi.divOrnas[i] Click Event
            oi.divOrnas[i].addEventListener('click', bind(oi, oi.assetClick), false);
        }
        oi.divAssetList.style.display = 'block';
        oi.Preview.update();
    }

    // Structure Tab ---------------------
    oi.categoryLo3Click = function () // 구조 탭 클릭
    {

        oi.divAssetCategory.style.display = 'none';
        var path = "OI_resource/asset/structure/";

        for (var i = 0; i < oi.Assets.strucNames.length; i++) {
            
            if(i==2) continue; // cam_cube 에셋은 div 생성 안함
            
            oi.divStrucs[i] = oi.document.createElement('DIV'); // DIV 객체 생성
            oi.divStrucs[i].setAttribute('id', oi.Assets.strucNames[i]); // id 지정
            oi.divStrucs[i].innerHTML = oi.Assets.strucNames[i]; // 객체에 포함할 텍스트

            oi.divStrucs[i].setAttribute("style", "background-color:rgba(" + i * 40 + ",206,250,0.7);" +
                // "overflow-y:auto;" +
                "width:100%; height: 30px;" +
                "border-width:2px; border-color:gray; border-style:solid");
            oi.divBucketList.appendChild(oi.divStrucs[i]); // body의 자식 노드로 첨부 (필수)

            oi.divStrucs[i].scrollState = false;

            var asset = oi.Assets.strucNames[i];

            for (var j = 0; j < oi.Assets.strucCnts[i]; j++) {
                oi.divTemp = oi.document.createElement('DIV');
                oi.divTemp.setAttribute('id', oi.Assets.strucNames[i] + j);
                var assetid = oi.Assets.strucNames[i] + j;
                oi.divTemp.setAttribute("style", "width : 70%; height: 150px;" +
                    "margin:5 auto;" +
                    "border-radius: 1em 1em 1em 1em;");
                oi.divTemp.innerHTML = '<img id="' + assetid + '" class ="iconimg" src ="static/' + path + asset + '/' + asset + j + '/' + asset + '.png">';
                oi.divTemp.style.display = "none";
                oi.divStrucs[i].appendChild(oi.divTemp);
            }

            // oi.divStrucs[i] Click Event
            oi.divStrucs[i].addEventListener('click', bind(oi, oi.assetClick), false);
        }
        oi.divAssetList.style.display = 'block';
        oi.Preview.update();
    }

    oi.assetBackArrow = function () {
        //alert("backArrow");
        oi.divAssetCategory.style.display = "block";
        oi.divAssetList.style.display = 'none';

        var delDiv = oi.document.getElementById("bucketList");
        while (delDiv.firstChild) {
            delDiv.removeChild(delDiv.firstChild);
        }
        oi.divFurns = [];
        oi.divOrnas = [];
        oi.divStrucs = [];
        oi.Preview.sceneReset();
        oi.selectedDiv = null;
    }

    oi.onDocumentKeyUp = function (event) {
        switch (event.keyCode) {

            case 27: // ESC Key
                if (oi.isAssetAllocate) {
                    oi.unblockDiv();
                }
                
                if(oi.isTargetSetting){
                    $("#details").css("display","block");
                    $("#target_msg").css("display","none");
                    oi.isTargetSetting = false;
                    oi.X_target = null;
                }
                
                // 그룹 clear
                oi.groupAsset = [];
                oi.isGroup = false;
                oi.mainRoom.control.groupClear();
                oi.outlinePass.selectedObjects = [];
                
                oi.g_copyAsset = [];
                oi.copyAsset = null;
                oi.isCopy = false;

                oi.selectedAsset = null;
                
                //송식 , 헬퍼 clear
                oi.mainRoom.scene.remove( oi.mainRoom.helper );
                if(oi.mainRoom.helper2!==undefined)
                    oi.mainRoom.scene.remove(oi.mainRoom.helper2);
               // oi.detailsClear();
                //oi.detailsChange(); // 송식
                
                break;
                
            case 71: //G key
                oi.gKeyPress = false;                
                break;
                
                                        
            case 13: // Enter
                oiRTC.chatFunction();
                break;
                
            case 82: // R key
                //console.log($("#cubeOriginPos").val());
                var originPos = JSON.parse($("#cubeOriginPos").val());
                if($("#tpEventStatus").val()==="true"){
                    oi.mainRoom.cam_cube.__dirtyPosition=true;
                    oi.mainRoom.cam_cube.position.copy(originPos);
                }
                break;
        }

        if (oi.isAssetModifying) {

            switch (event.keyCode) {

                case 32: // Space bar
                    oi.mainRoom.control.setSpace(oi.mainRoom.control.space === "local" ? "world" : "local");
                    break;

                case 90: // Z
                    oi.mainRoom.control.setMode("translate");
                    break;

                case 88: // X
                    if(!oi.isGroup){
                        if(oi.selectedAsset.name.substring(0,5)!=="light")
                            oi.mainRoom.control.setMode("rotate");
                    }
                    else{
                        var isLight = false;
                        for(var i=0; i<oi.groupAsset.length; i++){
                            if(oi.groupAsset[i].name.substring(0,5)==="light"){
                                isLight = true;
                                break;
                            }
                        }
                        if(!isLight)
                            oi.mainRoom.control.setMode("rotate");
                    }
                    break;

                case 67: // C
                    if(event.ctrlKey){

                        if(oi.isGroup){ // 그룹 에셋 복사
                            oi.g_copyAsset = oi.groupAsset;
                        }
                        else{
                            oi.copyAsset = oi.selectedAsset;
                        }
                        oi.isCopy = true;
                        oi.copyCnt = 0;
                        console.log("ctrl+c");
                    }
                    else
                    {
                        if(!oi.isGroup)
                        {
                            if(oi.selectedAsset.name.substring(0,5)!=="light")
                            {
                                // basic1 is sphere
                                if(oi.selectedAsset.name==="basic1")
                                    oi.mainRoom.control.setMode("scale3");
                                else if(oi.selectedAsset.name==="basic2" || oi.selectedAsset.name==="basic3")
                                    oi.mainRoom.control.setMode("scale2");
                                else
                                    oi.mainRoom.control.setMode("scale");  
                            }
                        }
                        else
                        {
                            var isLight = false;
                            
                            for(var i=0; i<oi.groupAsset.length; i++){
                                if(oi.groupAsset[i].name.substring(0,5)==="light"){
                                    isLight = true;
                                    break;
                                }
                            }
                            
                            if(!isLight){
                                var isBasic = false;
                                var isSphere = false;
                                for(var i=0; i<oi.groupAsset.length; i++){
                                    if(oi.groupAsset[i].name==="basic1"){
                                        isSphere = true;
                                        break;
                                    }
                                    if(oi.groupAsset[i].name==="basic2" || oi.groupAsset[i].name==="basic3"){
                                        isBasic = true;
                                    }
                                }

                                if(isSphere)
                                    oi.mainRoom.control.setMode("scale3");
                                else if(isBasic)
                                    oi.mainRoom.control.setMode("scale2");
                                else
                                    oi.mainRoom.control.setMode("scale"); 
                            }
                        }   
                        
                    }
                    break;
                
                case 86: // V
                    if(event.ctrlKey){
                        if(oi.isCopy){
                            oi.copyCnt += 1;
                            console.log("ctrl+v");
                            
                            //console.log(oi.g_copyAsset);
                            if(oi.isGroup){ // 그룹 에셋 붙여넣기  
                                var pos = [];
                                var g_copy = [];
                                for(var i=0; i<oi.g_copyAsset.length; i++){
                                    pos[i] = new THREE.Vector3();
                                    pos[i].copy(oi.g_copyAsset[i].position);
                                    g_copy[i] = oi.g_copyAsset[i].clone();

                                    if(g_copy[i].name.substring(0,5)==="basic")
                                        g_copy[i].material = oi.g_copyAsset[i].material.clone();
                                    else if(g_copy[i].name==="frame"){
                    
                                        var mat;
                                        for(var j=0; j<oi.g_copyAsset[i].children.length; j++){
                                            //console.log(obj.children[j]);
                                            for(var k=0; k<oi.g_copyAsset[i].children[j].children.length; k++){
                                                //obj.children[j].children[k].parent = obj;
                                                if(oi.g_copyAsset[i].children[j].children[k] instanceof THREE.Mesh){
                                                    mat = oi.g_copyAsset[i].children[j].children[k].material;
                                                    g_copy[i].children[j].children[k].material = mat.clone();
                                                }
                                            }
                                        }

                                    }

                                    g_copy[i].position.set(pos[i].x,pos[i].y+5+oi.copyCnt,pos[i].z);
                                    oi.mainRoom.scene.add(g_copy[i]);
                                    oi.Assets.interTarget.push(g_copy[i]);
                                }
                                
                                // 붙여넣기 된 그룹 에셋들을 선택된 에셋들로 변경     
                                oi.mainRoom.control.groupClear();
                                oi.mainRoom.control.detach();
                                
                                oi.selectedAsset = g_copy[g_copy.length-1];
                                oi.mainRoom.control.attach(oi.selectedAsset);

                                oi.mainRoom.control.groupAsset(g_copy);
                                oi.outlinePass.selectedObjects = g_copy;
                            }
                            
                            else{
                                //console.log(oi.copyAsset);
                                if (oi.copyAsset !== null) {
                                    var pos = oi.copyAsset.position;
                                    var copyAsset = oi.copyAsset.clone();

                                    if(copyAsset.name.substring(0,5)==="basic")
                                        copyAsset.material = oi.copyAsset.material.clone();
                                    else if(copyAsset.name==="frame"){
                    
                                        var mat;
                                        for(var j=0; j<oi.copyAsset.children.length; j++){
                                            //console.log(obj.children[j]);
                                            for(var k=0; k<oi.copyAsset.children[j].children.length; k++){
                                                //obj.children[j].children[k].parent = obj;
                                                if(oi.copyAsset.children[j].children[k] instanceof THREE.Mesh){
                                                    mat = oi.copyAsset.children[j].children[k].material;
                                                    copyAsset.children[j].children[k].material = mat.clone();
                                                }
                                            }
                                        }

                                    }

                                    copyAsset.position.set(pos.x, pos.y + 5 + oi.copyCnt, pos.z);
                                    oi.mainRoom.scene.add(copyAsset);
                                    oi.Assets.interTarget.push(copyAsset);

                                    oi.mainRoom.control.attach(copyAsset);
                                    oi.selectedAsset = copyAsset;
                                    
                                    oi.detailsChange(); // 송식
                                    
                                    var selectedObjects = [];
                                    selectedObjects.push(oi.selectedAsset);
                                    oi.outlinePass.selectedObjects = selectedObjects;
                                }
                            }
                            
                            oi.exploreUpdate();
                            
                            oi.isAssetModifying = true;
                            
                        }
                    }
                    break;

                case 27: // ESC
                    oi.mainRoom.control.setMode("translate");
                    oi.mainRoom.control.detach();
                    oi.mainRoom.scene.remove(oi.mainRoom.control);
                    oi.isAssetModifying = false;
                    oi.exploreUpdate();
                    oi.selectedAsset = null;
                    
                    oi.detailsClear();
                    oi.detailsChange(); // 송식

                    break;

                case 46: // Delete
                    //송식
                    if(oi.selectedAsset.name!=="cam_cube0"){
                        
                        if(oi.isGroup){ // 그룹 삭제
                            for(var i=0; i<oi.groupAsset.length; i++){
                                oi.mainRoom.scene.remove(oi.groupAsset[i]);

                                oi.Assets.interTarget.splice(oi.Assets.interTarget.indexOf(oi.groupAsset[i]),1);
                            }

                            // 그룹 clear
                            oi.groupAsset = [];
                            oi.isGroup = false;
                            oi.mainRoom.control.groupClear();
                            oi.outlinePass.selectedObjects = [];

                        }
                        else{
                            oi.mainRoom.scene.remove(oi.selectedAsset);
                            oi.Assets.interTarget.splice(oi.Assets.interTarget.indexOf(oi.selectedAsset),1);
                        }

                        oi.isAssetModifying = false;
                        oi.mainRoom.control.detach();
                        oi.mainRoom.scene.remove(oi.mainRoom.control);
                        oi.mainRoom.scene.remove(oi.mainRoom.helper); //송식
                        if(oi.mainRoom.helper2!==undefined)
                            oi.mainRoom.scene.remove(oi.mainRoom.helper2);
                        oi.selectedAsset = null;
                        oi.exploreUpdate();
                    }
                    break;

                    /*
                case 17: // Ctrl
                    oi.isCtrl = false;
                    break;
                    */

            }
        }
    }

    oi.onDocumentKeyDown = function(event)
    {
        
        switch(event.keyCode){
            case 71: // G
                
                //console.log("group");
                oi.gKeyPress = true;
                if(oi.selectedAsset !== null){

                    oi.isGroup = false;
                    if(oi.groupAsset.length !== 0){
                        var overlap = false;
                        for(var i=0; i<oi.groupAsset.length; i++){
                            if(oi.selectedAsset.uuid === oi.groupAsset[i].uuid){ // 중복 에셋 그룹핑 방지
                                oi.selectedAsset = null;
                                overlap = true;
                                break;
                            }
                            else
                                overlap = false;
                        }
                        if(!overlap){ // 배열에 중복된 에셋이 없다면 그룹핑 배열에 push
                            oi.groupAsset.push(oi.selectedAsset);
                            oi.selectedAsset = null;
                            
                            console.log(oi.groupAsset);
                            oi.mainRoom.control.groupAsset(oi.groupAsset);
                            oi.outlinePass.selectedObjects = oi.groupAsset;
                        }
                        
                        if(oi.groupAsset.length>1){
                            oi.isGroup = true;
                            oi.detailsChange();
                        }         
                            
                    }
                    else{ // 최초 그룹핑 에셋
                        oi.groupAsset.push(oi.selectedAsset);
                        oi.selectedAsset = null;
                    }
                }
                
                break;
        }
        
    }

    //$("#modifyExit").off("click");
    $("#modifyExit").click(function () {
        //$("#basic_details").css("display", "none");
        oi.iconLo6Click();
        // $("#details").css("display","none");
        // oi.isDetailEditing = false;
    });
     //에셋 편집 아이콘
    oi.iconLo6Click = function () // 디테일 함수
    {/*
        var sceneManager = new SceneManager("user1");
        sceneManager.sceneLoad(oi);*/
        if(oi.isDetailEditing){
            oi.isDetailEditing = false;
            $("#details").toggle("fold", {}, "slow");
            oi.detailsClear();
            oi.detailsChange();
            oi.customCam.attachEvent();
        }
        else{
            oi.isDetailEditing = true;
            oi.detailsChange();
            $("#details").toggle("fold", {}, "slow");
         /*   if(oi.mainRoom.control.object==null){
                $("#default_details").css("display","block");
            }
            else{
                console.log(oi.mainRoom.control.object.name);
                var name=oi.mainRoom.control.object.name;
                $("#basic_details").css("display","none");
                $("#light_details").css("display","none");
                $("#default_details").css("display","none");
                if(name.substr(0,5)=="basic"){
                    $("#basic_details").css("display","block");
                }
                else if(name.substr(0,5)=="light"){
                    $("#light_details").css("display","block");
                }
                else{
                    $("#no_details").css("display","block");
                }
            }*/
        }
    }
    
    // 디테일 common 초기화
    oi.init_detail_position = function(){
        $("#position_x").val(oi.selectedAsset.position.x);
        $("#position_y").val(oi.selectedAsset.position.y);
        $("#position_z").val(oi.selectedAsset.position.z);
    }
    oi.init_detail_rotation = function(){
        $("#rotation_x").val(oi.selectedAsset.rotation.x);
        $("#rotation_y").val(oi.selectedAsset.rotation.y);
        $("#rotation_z").val(oi.selectedAsset.rotation.z);
    }
    oi.init_detail_scale = function(){
        $("#scale_x").val(oi.selectedAsset.scale.x);
        $("#scale_y").val(oi.selectedAsset.scale.y);
        $("#scale_z").val(oi.selectedAsset.scale.z);
    }
    
    // XYZ 위치 디테일
    $("#position_x").on("input change", function(){ oi.change_detail_position('x','position_x'); });
    $("#position_y").on("input change", function(){ oi.change_detail_position('y','position_y'); });
    $("#position_z").on("input change", function(){ oi.change_detail_position('z','position_z'); });
    oi.change_detail_position = function(axis, textbox){
        var pos_div = document.getElementById(textbox);
        
        if(axis==='x')
            oi.selectedAsset.position.x = Number(pos_div.value);
        else if(axis==='y')
            oi.selectedAsset.position.y = Number(pos_div.value);
        else if(axis==='z')
            oi.selectedAsset.position.z = Number(pos_div.value);
        
        oi.mainRoom.control.detach();
        oi.mainRoom.control.attach(oi.selectedAsset);
        oi.mainRoom.scene.add(oi.mainRoom.control);
        oi.mainRoom.control.setMode("translate");
    }
    
    // XYZ 회전 디테일
    $("#rotation_x").on("input change", function(){ oi.change_detail_rotation('x','rotation_x'); });
    $("#rotation_y").on("input change", function(){ oi.change_detail_rotation('y','rotation_y'); });
    $("#rotation_z").on("input change", function(){ oi.change_detail_rotation('z','rotation_z'); });
    oi.change_detail_rotation = function(axis, textbox){
        var rot_div = document.getElementById(textbox);
        var degree = Number(rot_div.value);;
        if(axis==='x')
            oi.selectedAsset.rotation.x = degree*Math.PI/180;
        else if(axis==='y')
            oi.selectedAsset.rotation.y = degree*Math.PI/180;
        else if(axis==='z')
            oi.selectedAsset.rotation.z = degree*Math.PI/180;
        
        oi.mainRoom.control.detach();
        oi.mainRoom.control.attach(oi.selectedAsset);
        oi.mainRoom.scene.add(oi.mainRoom.control);
        oi.mainRoom.control.setMode("rotate");
    }
    
    // XYZ 크기 디테일
    $("#scale_x").on("input change", function(){ oi.change_detail_scale('x','scale_x'); });
    $("#scale_y").on("input change", function(){ oi.change_detail_scale('y','scale_y'); });
    $("#scale_z").on("input change", function(){ oi.change_detail_scale('z','scale_z'); });
    oi.change_detail_scale = function(axis, textbox){
        var scale_div = document.getElementById(textbox);
        
        if(axis==='x')
            oi.selectedAsset.scale.x = Number(scale_div.value);
        else if(axis==='y')
            oi.selectedAsset.scale.y = Number(scale_div.value);
        else if(axis==='z')
            oi.selectedAsset.scale.z = Number(scale_div.value);
        
        oi.mainRoom.control.detach();
        oi.mainRoom.control.attach(oi.selectedAsset);
        oi.mainRoom.scene.add(oi.mainRoom.control);
        oi.mainRoom.control.setMode("scale");
    }
    
    
    // 에셋 투명도 디테일
    oi.init_detail_transparent = function(){
        console.log("투명도 콘솔");
        var name = oi.selectedAsset.name;
        
      if(name.substr(0,5)==="basic"){ // 베이직 에셋 투명도 
        $("#tr_check")[0].checked = oi.selectedAsset.material.transparent;
        $("#op_val").val(oi.selectedAsset.material.opacity);
        
        if(oi.selectedAsset.material.transparent){
            if(!oi.isGroup)
                $("#op_div").css("display", "block");
            }
        else
            $("#op_div").css("display", "none");
      }
      else{ // 이외 에셋
          $("#tr_check")[0].checked = oi.selectedAsset.userData.transparent;
          $("#op_val").val(oi.selectedAsset.userData.opacity);
          
            if(oi.selectedAsset.userData.transparent){
                if(!oi.isGroup)
                    $("#op_div").css("display", "block");
                }
            else
                $("#op_div").css("display", "none");
        }
        
        
    }

    $("#op_val").on("change mousemove",  function(){ oi.change_detail_opacity(); });
    
    oi.change_detail_opacity = function(){
        console.log("오파씨티 값 변경");
        var name = oi.selectedAsset.name;
        
        if(!oi.isGroup){
            if(name.substr(0,5)==="basic"){
                oi.selectedAsset.material.opacity = $("#op_val").val();
            }
            else{
                var obj = oi.selectedAsset;
                var mat;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            mat = obj.children[j].children[k].material;
                            mat.opacity = $("#op_val").val();
                            oi.selectedAsset.userData.opacity = $("#op_val").val();
                        }
                    }
                }
            }
        }
    }
    
    $("#tr_check").change(function(){
        var name = oi.selectedAsset.name;
        
        if(this.checked){
            if(!oi.isGroup){
                $("#op_div").css("display","block");
                
                if(name.substring(0,5)==="basic"){
                    oi.selectedAsset.material.transparent = true;

                    $("#op_val").val(oi.selectedAsset.material.opacity);
                }
                else{
                    var obj = oi.selectedAsset;
                    var mat;
                    for(var j=0; j<obj.children.length; j++){
                        for(var k=0; k<obj.children[j].children.length; k++){
                            if(obj.children[j].children[k] instanceof THREE.Mesh){
                                mat = obj.children[j].children[k].material;
                                mat.transparent = true;
                                oi.selectedAsset.userData.transparent = true;
                            }
                        }
                    }
                    $("#op_val").val(oi.selectedAsset.userData.opacity);
                }
            }
        }
        else{
            if(name.substring(0,5)==="basic"){
                oi.selectedAsset.material.transparent = false;
                 oi.selectedAsset.material.opacity = 1;
            }
            else{
                var obj = oi.selectedAsset;
                var mat;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            mat = obj.children[j].children[k].material;
                            mat.transparent = false;
                            mat.opacity = 1;
                            oi.selectedAsset.userData.transparent = false;
                            oi.selectedAsset.userData.opacity = 1;
                        }
                    }
                }
            }
            $("#op_val").val(1);
            $("#op_div").css("display","none");
        }
    })
     
    
    
    oi.detailsClear = function(){
        $("#basic_details").css("display","none");
        $("#light_details").css("display","none");
        $("#default_details").css("display","none");
        $("#no_details").css("display","none");
        $("#common_details").css("display","none");
        $("#transparent_details").css("display","none");
        $("#d_position").css("display","none");
        $("#d_rotation").css("display","none");
        $("#d_scale").css("display","none");
        
    }
    oi.detailsChange = function(){
         oi.detailsClear();
        if(oi.isDetailEditing){         
            if(oi.mainRoom.control.object==null){
                $("#default_details").css("display","block");
            }
            else{

            //    oi.detailsClear();

                if(!oi.isGroup){ // 그룹이 아닌 경우
                    var name=oi.mainRoom.control.object.name;


                    // 빛 에셋 디테일 편집 lights details
                    if(name.substr(0,5)==="light"){
                        // 색상
                        oi.initSpectrum(); 

                        // 세부
                        $("#light_intensity").css("display", "block");
                        if(name.substr(5,1)==="0") // pointLight
                        {
                            oi.initValue(0);
                            $("#light_distance").css("display", "block");
                            $("#light_angle").css("display", "none");
                            $("#light_target").css("display", "none");
                        }
                        else if(name.substr(5,1)==="1") // spotLight
                        {
                            oi.initValue(1);
                            $("#light_distance").css("display", "block");
                            $("#light_angle").css("display", "block");
                            $("#light_target").css("display", "block");
                        }
                        else if(name.substr(5,1)==="2") // directionalLight 
                        {
                            oi.initValue(2);
                            $("#light_distance").css("display", "none");
                            $("#light_angle").css("display", "none");
                            $("#light_target").css("display", "block");    
                        }

                        $("#light_details").css("display","block");
                    }

                    // 베이직 에셋 디테일 편집
                    else if(name.substr(0,5)=="basic"){
                        $("#basic_details").css("display","block");

                        oi.initSpectrum(); // 색상 변경

                        // 텍스쳐 샘플들
                        var textureDiv = document.getElementById('textures');
                        for (var i = 0; i < oi.textureLen; i++) {
                            var div = document.createElement('img');
                            div.setAttribute("src", "static/OI_resource/texture/" + i + ".jpg");
                            textureDiv.appendChild(div);
                        }

                        Galleria.run('.galleria2');

                        Galleria.ready(function (options) {

                            this.bind('image', function (e) {
                                $("#basic_texture").val(e.imageTarget.src);
                            });
                        });

                        $("#basic_texture_change").click(function () {

                            if(!oi.isGroup){
                                if (oi.selectedAsset !== null && oi.selectedAsset.name.substring(0, 5) === "basic") {
                                    var selectedTexture = oi.selectedAsset.material;
                                    var textureLoader = new THREE.TextureLoader();
                                    selectedTexture.map = textureLoader.load($("#basic_texture").val());
                                    selectedTexture.needsUpdate = true;

                                    selectedTexture.map.minFilter = THREE.LinearFilter;

                                    // 송식
                                    var tmp = $("#basic_texture").val(); //e.imageTarget.src;
                                    var start = tmp.indexOf("z/");
                                    var end   = tmp.lastIndexOf(".");
                                    tmp = tmp.substr(start+2,end);
                                    selectedTexture.map.name=tmp;
                                    //console.log(e.imageTarget.src);
                                    //console.log("매테뤼얼");
                                    //console.log(oi.selectedAsset.material);
                                    //console.log(oi.selectedAsset.material.map);
                                }
                                else if(oi.selectedAsset!==null && oi.selectedAsset.name.substring(0,5)!=="basic"){
                                    console.log("basic 에셋만 편집 가능함");
                                }
                                else if(oi.selectedAsset===null){
                                    console.log("편집할 에셋을 선택");
                                } 
                            }
                            else{
                                var isBasic = true;
                                for(var i=0; i<oi.groupAsset.length; i++){
                                    if(oi.groupAsset[i].name.substring(0, 5)!=="basic"){
                                        isBasic = false;
                                        console.log("basic 에셋만 편집 가능함");
                                        break;
                                    }
                                }

                                if(isBasic){
                                    for(var i=0; i<oi.groupAsset.length; i++){
                                        var selectedTexture = oi.groupAsset[i].material;
                                        var textureLoader = new THREE.TextureLoader();
                                        selectedTexture.map = textureLoader.load($("#basic_texture").val());
                                        selectedTexture.needsUpdate = true;

                                        selectedTexture.map.minFilter = THREE.LinearFilter;

                                        // 송식
                                        var tmp = $("#basic_texture").val();
                                        var start = tmp.indexOf("z/");
                                        var end   = tmp.lastIndexOf(".");
                                        tmp = tmp.substr(start+2,end);
                                        selectedTexture.map.name=tmp;
                                    }
                                }
                            }
                        });
                    }

                    oi.init_detail_position();
                    oi.init_detail_rotation();
                    oi.init_detail_scale();

                    $("#d_position").css("display", "block");

                    $("#common_details").css("display","block"); // x y z 좌표

                    if(name.substr(0,5)!=="light"){
                        oi.init_detail_transparent();
                        $("#transparent_details").css("display","block"); // 투명도
                        $("#d_rotation").css("display","block");
                        $("#d_scale").css("display","block");
                    }
                }
                else{ // 그룹인 경우, 클리어 된 상태
                    var isBasic = true;
                    for(var i=0; i<oi.groupAsset.length; i++){
                        if(oi.groupAsset[i].name.substring(0,5) !== "basic")
                            isBasic = false;
                    }

                    if(isBasic){
                        $("#basic_details").css("display","block");

                        oi.initSpectrum(); // 색상 변경

                        // 텍스쳐 샘플들
                        var textureDiv = document.getElementById('textures');
                        for (var i = 0; i < oi.textureLen; i++) {
                            var div = document.createElement('img');
                            div.setAttribute("src", "static/OI_resource/texture/" + i + ".jpg");
                            textureDiv.appendChild(div);
                        }

                        Galleria.run('.galleria2');

                        Galleria.ready(function (options) {

                            this.bind('image', function (e) {
                                $("#basic_texture").val(e.imageTarget.src);
                            });
                        });

                        $("#basic_texture_change").click(function () {

                            if(!oi.isGroup){
                                if (oi.selectedAsset !== null && oi.selectedAsset.name.substring(0, 5) === "basic") {
                                    var selectedTexture = oi.selectedAsset.material;
                                    var textureLoader = new THREE.TextureLoader();
                                    selectedTexture.map = textureLoader.load($("#basic_texture").val());
                                    selectedTexture.needsUpdate = true;

                                    selectedTexture.map.minFilter = THREE.LinearFilter;

                                    // 송식
                                    var tmp = $("#basic_texture").val();
                                    var start = tmp.indexOf("z/");
                                    var end   = tmp.lastIndexOf(".");
                                    tmp = tmp.substr(start+2,end);
                                    selectedTexture.map.name=tmp;
                                    //console.log(e.imageTarget.src);
                                    //console.log("매테뤼얼");
                                    //console.log(oi.selectedAsset.material);
                                    //console.log(oi.selectedAsset.material.map);
                                }
                                else if(oi.selectedAsset!==null && oi.selectedAsset.name.substring(0,5)!=="basic"){
                                    console.log("basic 에셋만 편집 가능함");
                                }
                                else if(oi.selectedAsset===null){
                                    console.log("편집할 에셋을 선택");
                                } 
                            }
                            else{
                                var isBasic = true;
                                for(var i=0; i<oi.groupAsset.length; i++){
                                    if(oi.groupAsset[i].name.substring(0, 5)!=="basic"){
                                        isBasic = false;
                                        console.log("basic 에셋만 편집 가능함");
                                        break;
                                    }
                                }

                                if(isBasic){
                                    for(var i=0; i<oi.groupAsset.length; i++){
                                        var selectedTexture = oi.groupAsset[i].material;
                                        var textureLoader = new THREE.TextureLoader();
                                        selectedTexture.map = textureLoader.load($("#basic_texture").val());
                                        selectedTexture.needsUpdate = true;

                                        selectedTexture.map.minFilter = THREE.LinearFilter;

                                        // 송식
                                        var tmp = $("#basic_texture").val();
                                        var start = tmp.indexOf("z/");
                                        var end   = tmp.lastIndexOf(".");
                                        tmp = tmp.substr(start+2,end);
                                        selectedTexture.map.name=tmp;
                                    }
                                }
                            }
                        });
                    }
                    else{
                        $("#no_details").css("display","block");
                    }
                }
            } //
        }
    }
    
    oi.initSpectrum = function () // 스펙트럼 초기화 함수
    {
        // 색상 변경 (스펙트럼 시작) ----
        $(".full").spectrum({
            color: "#ECC",
            showInput: true,
            className: "full-spectrum",
            showInitial: true,
            showPalette: false,
            showSelectionPalette: true,
            maxSelectionSize: 10,
            preferredFormat: "hex",
            localStorageKey: "spectrum.demo",
            move: function (color) {},
            show: function () {},
            beforeShow: function (color) {
                //console.log(color.toHexString());
            },
            hide: function () {

            },
            change: function (color) {
                if (!oi.isGroup) {
                    
                    if(oi.selectedAsset === null){ alert("편집할 에셋을 선택하세요."); }
                    else{
                        if(oi.selectedAsset.name.substring(0, 5) === "basic"){
                            oi.selectedAsset.material.color.setHex("0x" + color.toHex());
                        }
                        else if(oi.selectedAsset.name.substring(0, 5) === "light"){
                            oi.selectedAsset.color.setHex("0x"+color.toHex());
                        }
                        //else{ alert("색상을 지정할 수 없는 에셋입니다."); }
                    }

                } else {
                    var isBasic = true;
                    for (var i = 0; i < oi.groupAsset.length; i++) {
                        if (oi.groupAsset[i].name.substring(0, 5) !== "basic") {
                            isBasic = false;
                            alert("basic 에셋만 편집 가능함");
                            break;
                        }
                    }

                    if (isBasic) {
                        for (var i = 0; i < oi.groupAsset.length; i++) {
                            oi.groupAsset[i].material.color.setHex("0x" + color.toHex());
                        }
                    }
                }
            },
            palette: [
                                ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)",
                                "rgb(204, 204, 204)", "rgb(217, 217, 217)", "rgb(255, 255, 255)"],
                                ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
                                "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
                                ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
                                "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
                                "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
                                "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
                                "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
                                "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
                                "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
                                "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
                                "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
                                "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
                            ]
        });
        // 색상 변경 스펙트럼 끝
    }
    
    oi.initValue = function(type) // type 0-point , 1-spot , 2-directional 
    {  
        $("#intensity").val(oi.selectedAsset.intensity);
        $("#intensity_val").val(oi.selectedAsset.intensity);
        
        if(type!==2){
            $("#distance").val(oi.selectedAsset.distance);
            $("#distance_val").val(oi.selectedAsset.distance);
        }
        if(type===1){
            $("#angle").val(oi.selectedAsset.angle);
            $("#angle_val").val(oi.selectedAsset.angle);
        }
        $("#intensity").on("change mousemove",  function(){ oi.printValue('intensity','intensity_val'); }); // 되는거
        $("#distance").on("change mousemove",  function(){ oi.printValue('distance','distance_val'); });
        $("#angle").on("change mousemove",  function(){ oi.printValue('angle','angle_val'); });
        
        $("#setTarget").on("click", function(){ oi.setLightTarget(); });
        
        if(type===0){
       //     $("#intensity").change(oi.printValue('intensity','intensity_val'));
      //      $("#distance").change(oi.printValue('distance','distance_val'));
        }
        
        
    }
    // 조명 디테일 값
    oi.printValue = function(sliderID, textbox) {
        var x = document.getElementById(textbox);
        var y = document.getElementById(sliderID);
        x.value = y.value;
        
        // 에셋 값 변경 추가
        if(sliderID==='intensity'){
            oi.selectedAsset.intensity = y.value;
        }
        else if(sliderID==='distance'){
            oi.selectedAsset.distance = y.value;
        }
        else if(sliderID==='angle'){
            oi.selectedAsset.angle = y.value;
            oi.mainRoom.helper.update();
        }
    }
    // 조명 타겟 설정
    oi.setLightTarget = function(){
        
        oi.isTargetSetting = true;
        oi.X_target = oi.selectedAsset;
        $("#details").css("display","none");
        $("#target_msg").css("display","block");

    }
    // 조명 타겟 업데이트
    oi.targetUpdate = function(){
        oi.nowRoomdata.assets.forEach(
        function addNumber(value) {
            var light, target;

            if(value.name==="light1" || value.name==="light2")
            {           
                if(value.target!==""){

                    //console.log(oii.mainRoom.scene.children.length);
                    $.each(oi.mainRoom.scene.children, function(key, value2){
                        
                       if(oi.mainRoom.scene.children[key].uuid===value.uuid){
                            light = oi.mainRoom.scene.children[key]; // 조명 찾기
                           }
                       if(oi.mainRoom.scene.children[key].uuid===value.target)
                            target = oi.mainRoom.scene.children[key]; // 조명 찾기
                            
                    }); 

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
                    light.target = target; // 연결
                    
                    oi.needTargetUpdate = false;
                }
            } 
        });
    }
   /* 
    oi.loading = function()
    {
        console.log("로오딩");     
        var percent = Math.floor((oi.MainRoom.scene.children.length / oi.nowRoomData.assets.lenth) * 100);
        var width = percent.toString()+"%";

        $("#loading-bar").css("width", width);

        if(percent===100){    
            oi.needLoading = false;
            $("#loading").css("display","none");
        }
    }
    */
    
// 		
    oi.sceneSaveCommit = function () // 테스트 저장 함수
    {
    	// 씬 메니저를 호출하여 씬을 저장
        var sceneManager = new SceneManager("user1");
        oi.customCam.attachEvent();
        sceneManager.sceneSave(oi.mainRoom.scene);
    }

    // Scene Explore
    oi.exploreUpdate = function () {
        
        // 초기화 작업
        if(oi.assetExploreArray.length !== 0){
            for(var i=0; i<oi.assetExploreArray.length; i++){
                if(oi.assetExploreArray[i]!==undefined){
                    oi.assetExplore.removeChild(oi.assetExploreArray[i]);
                }
            }  
        }
        oi.assetExploreArray = [];
        var tmpExploreArray = [];

        // li 태그 셋팅
        for(var i=0; i<oi.mainRoom.scene.children.length; i++){
            var name = oi.mainRoom.scene.children[i].name;
            if (name !== "" && name !=="L_helper") {
                oi.assetExploreArray[i] = oi.document.createElement('li');
                oi.assetExploreArray[i].setAttribute("id", oi.mainRoom.scene.children[i].uuid);
                oi.assetExploreArray[i].setAttribute("class", "assetExploreArray list-group-item list-group-item-action");

               // oi.assetExploreArray[i].addEventListener("mouseover", bind(oi, oi.exploreOver), false);
                oi.assetExploreArray[i].addEventListener("mousedown", bind(oi, oi.exploreClick), false);
                
                var cnt=0;
                var assetName = oi.mainRoom.scene.children[i].name.replace(/[0-9]/gi,"");
                tmpExploreArray[i] = assetName;
                
                for(var j=0; j<tmpExploreArray.length; j++){
                    if(tmpExploreArray[j] === assetName)
                        cnt++;
                }
                oi.assetExploreArray[i].innerHTML = assetName+cnt;
                oi.assetExplore.appendChild(oi.assetExploreArray[i]);
            }

            //console.log(oi.assetExploreArray[i]);
        }

    }
    
    oi.exploreClick = function(event){
        if (!oi.gKeyPress) { // 일반 클릭 G 키가 눌려있지 않은 상태
            for (var i = 0; i < oi.mainRoom.scene.children.length; i++) {

                if (oi.mainRoom.scene.children[i].uuid === event.target.id) {
                    
                    
                    //console.log(oi.mainRoom.scene.children[i].name);
                    
                    //송식
                    oi.mainRoom.scene.remove( oi.mainRoom.helper );
                    oi.mainRoom.scene.remove( oi.mainRoom.helper2 );

                    if(oi.mainRoom.scene.children[i].name==="light0"){ // point_light
                       
                        oi.mainRoom.helper = new THREE.PointLightHelper(oi.mainRoom.scene.children[i], 0.1);
                        oi.mainRoom.helper.name = "L_helper";
                       // oi.mainRoom.helper2 = new THREE.CameraHelper( traceAsset.shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                     //   oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(oi.mainRoom.scene.children[i].name==="light1"){ // spot_light
    
                        oi.mainRoom.helper = new THREE.SpotLightHelper(oi.mainRoom.scene.children[i]);
                        oi.mainRoom.helper.name = "L_helper";
                    //    oi.mainRoom.helper2 = new THREE.CameraHelper( oi.mainRoom.scene.children[i].shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                    //    oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(oi.mainRoom.scene.children[i].name==="light2"){ // directional_light
                        oi.mainRoom.helper = new THREE.DirectionalLightHelper(oi.mainRoom.scene.children[i]);
                        oi.mainRoom.helper.name = "L_helper";
                        //oi.mainRoom.helper2 = new THREE.CameraHelper( oi.mainRoom.scene.children[i].shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                        //oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    
                    oi.mainRoom.control.attach(oi.mainRoom.scene.children[i]);
                    oi.mainRoom.scene.add(oi.mainRoom.control);
                    oi.mainRoom.control.setMode("translate");
                    oi.selectedAsset = oi.mainRoom.scene.children[i];
                    oi.isAssetModifying = true;
                    
                    oi.detailsChange(); // 송식
                    
                    if(!oi.isGroup){
                        // 마우스로 그 에셋을 클릭한 효과를 냄
                        var selectedObjects = [];
                        selectedObjects.push(oi.selectedAsset);
                        oi.outlinePass.selectedObjects = selectedObjects;
                    }
                    else{
                        // G키를 누르지 않은 상태에서 에셋 익스플로를 누른 경우
                        var elseGroup = false;
                        
                        for (var i = 0; i < oi.groupAsset.length; i++) {
                            if (oi.selectedAsset === oi.groupAsset[i]) {
                                elseGroup = false;
                                break;
                            } 
                            else
                                elseGroup = true;
                        }

                        if (elseGroup) {
                            // 그룹 clear
                            oi.groupAsset = [];
                            oi.isGroup = false;
                            oi.detailsChange();
                            oi.mainRoom.control.groupClear();
                            oi.outlinePass.selectedObjects = [];

                            // 선택한 에셋 outline
                            var selectedObjects = [];
                            selectedObjects.push(oi.selectedAsset);
                            oi.outlinePass.selectedObjects = selectedObjects;
                        }
                        else{
                            break;
                        }
                    }

                }
            }
        }
        else{ // G 키가 눌려져 있는 상태
            for (var i = 0; i < oi.mainRoom.scene.children.length; i++) {

                if (oi.mainRoom.scene.children[i].uuid === event.target.id) {
                    
                   /* //송식
                    oi.mainRoom.scene.remove( oi.mainRoom.helper );
                   // if(oi.mainRoom.scene.children[i].name.substring(0,5)==="light"){
                      if(oi.mainRoom.scene.children[i].name==="light1" || oi.mainRoom.scene.children[i].name==="light2"){
                        oi.mainRoom.helper = new THREE.CameraHelper( oi.mainRoom.scene.children[i].shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                    } */
                    
                    //송식
                    oi.mainRoom.scene.remove( oi.mainRoom.helper );
                    oi.mainRoom.scene.remove( oi.mainRoom.helper2 );

                    if(oi.mainRoom.scene.children[i].name==="light0"){ // point_light
                        oi.mainRoom.helper = new THREE.PointLightHelper(oi.mainRoom.scene.children[i], 0.1);
                        oi.mainRoom.helper.name = "L_helper";
                       // oi.mainRoom.helper2 = new THREE.CameraHelper( traceAsset.shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                     //   oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(oi.mainRoom.scene.children[i].name==="light1"){ // spot_light
                        oi.mainRoom.helper = new THREE.SpotLightHelper(oi.mainRoom.scene.children[i]);
                        oi.mainRoom.helper.name = "L_helper";
                      //  oi.mainRoom.helper2 = new THREE.CameraHelper( oi.mainRoom.scene.children[i].shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                      //  oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    if(oi.mainRoom.scene.children[i].name==="light2"){ // directional_light
                        oi.mainRoom.helper = new THREE.DirectionalLightHelper(oi.mainRoom.scene.children[i]);
                        oi.mainRoom.helper.name = "L_helper";
                     //   oi.mainRoom.helper2 = new THREE.CameraHelper( oi.mainRoom.scene.children[i].shadow.camera );
                        oi.mainRoom.scene.add( oi.mainRoom.helper );
                     //   oi.mainRoom.scene.add( oi.mainRoom.helper2 );
                    }
                    
                    oi.mainRoom.control.attach(oi.mainRoom.scene.children[i]);
                    oi.mainRoom.scene.add(oi.mainRoom.control);
                    oi.selectedAsset = oi.mainRoom.scene.children[i];
                    oi.isAssetModifying = true;                        
                    
                    oi.isGroup = false;
                    if(oi.groupAsset.length !== 0){
                        var overlap = false;
                        for(var i=0; i<oi.groupAsset.length; i++){
                            if(oi.selectedAsset.uuid === oi.groupAsset[i].uuid){ // 중복 에셋 그룹핑 방지
                                oi.selectedAsset = null;
                                overlap = true;
                                break;
                            }
                            else
                                overlap = false;
                        }
                        
                        if(!overlap){ // 배열에 중복된 에셋이 없다면 그룹핑 배열에 push
                            oi.groupAsset.push(oi.selectedAsset);
                            oi.selectedAsset = null;
                            
                            console.log(oi.groupAsset);
                            oi.mainRoom.control.groupAsset(oi.groupAsset);
                            oi.outlinePass.selectedObjects = oi.groupAsset;
                            
                            if(oi.groupAsset.length>1){
                                oi.isGroup = true;
                                oi.detailsChange();
                            }
                            break;
                        }
                        else{
                            if(oi.groupAsset.length>1){
                                oi.isGroup = true;
                                oi.detailsChange();
                            }
                            break;
                        }
  
                    }
                    else{ // 최초 그룹핑 에셋
                        oi.groupAsset.push(oi.selectedAsset);
                        oi.selectedAsset = null;
                        oi.outlinePass.selectedObjects = oi.groupAsset;
                        break;
                    }
                }
            }
        }

    } // Explore click 끝
    
    //  아이콘 이벤트 함수
    // 마이 페이지
    oi.Icon_1_Out = function (event) {
        // oi.divIcons[0].style.opacity = '1';
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity || event.target.style.opacity = '1';
        if(!oi.isMultiplaying)
        	$("#iconimg1").attr("src","static/OI_resource/images/test/icon/iconimg1.png");
    }
    oi.Icon_1_Over = function () {
       if(!oi.isMultiplaying)
        $("#iconimg1").attr("src","static/OI_resource/images/test/icon/iconimg1_hover.png");
    }
    // 에셋
    oi.Icon_2_Out = function (event) {
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
       // event.srcElement.style.opacity = '1';
        if(!testPlay.isplaying && !oi.isVisiting && !oi.isMultiplaying)
            $("#iconimg2").attr("src","static/OI_resource/images/test/icon/iconimg2.png");
    }
    oi.Icon_2_Over = function () {
        if(!testPlay.isplaying && !oi.isVisiting && !oi.isMultiplaying)
            $("#iconimg2").attr("src","static/OI_resource/images/test/icon/iconimg2_hover.png");
    }
    // 에셋 익스플로러
    oi.Icon_3_Out = function (event) {
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
     //   event.srcElement.style.opacity = '1';
        if(!testPlay.isplaying && !oi.isMultiplaying)
            $("#iconimg3").attr("src","static/OI_resource/images/test/icon/iconimg3.png");
    }
    oi.Icon_3_Over = function () {
        if(!testPlay.isplaying && !oi.isMultiplaying)
            $("#iconimg3").attr("src","static/OI_resource/images/test/icon/iconimg3_hover.png");
    }
    // 테스트 플레이 & 에디트 모드
    oi.Icon_4_Out = function (event) {
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity = '1';
        if(testPlay.isplaying && !oi.isMultiplaying){ $("#iconimg4").attr("src","static/OI_resource/images/test/icon/iconimg4_1.png"); }
        else if(!testPlay.isplaying && !oi.isMultiplaying) { $("#iconimg4").attr("src","static/OI_resource/images/test/icon/iconimg4.png"); }
    }
    oi.Icon_4_Over = function () {
        if(testPlay.isplaying && !oi.isMultiplaying){ $("#iconimg4").attr("src","static/OI_resource/images/test/icon/iconimg4_hover1.png"); }
        else if(!testPlay.isplaying && !oi.isMultiplaying) { $("#iconimg4").attr("src","static/OI_resource/images/test/icon/iconimg4_hover.png"); }
    }
    // 세이브
    oi.Icon_5_Out = function (event) {
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity = '1';
        if(!testPlay.isplaying && !oi.isVisiting && !oi.isMultiplaying)
            $("#iconimg5").attr("src","static/OI_resource/images/test/icon/iconimg5.png");
    }
    oi.Icon_5_Over = function () {
        if(!testPlay.isplaying && !oi.isVisiting && !oi.isMultiplaying)
            $("#iconimg5").attr("src","static/OI_resource/images/test/icon/iconimg5_hover.png");
    }
    // 디테일
    oi.Icon_6_Out = function (event) {
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity = '1';
        if(!testPlay.isplaying && !oi.isMultiplaying)
            $("#iconimg6").attr("src","static/OI_resource/images/test/icon/iconimg6.png");
    }
    oi.Icon_6_Over = function () {
        if(!testPlay.isplaying && !oi.isMultiplaying)
            $("#iconimg6").attr("src","static/OI_resource/images/test/icon/iconimg6_hover.png");
    }
    
    // 멀티플레이
    oi.Icon_7_Out = function (event) {
        // oi.divIcons[0].style.opacity = '1';
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity || event.target.style.opacity = '1';
        if(!oi.isMultiplaying)
        	$("#iconimg7").attr("src","static/OI_resource/images/test/icon/iconimg7.png");
    }
    oi.Icon_7_Over = function () {
        if(!oi.isMultiplaying)
            $("#iconimg7").attr("src","static/OI_resource/images/test/icon/iconimg7_hover.png");
    }
    
    // RTC
    oi.Icon_8_Out = function (event) {
        // oi.divIcons[0].style.opacity = '1';
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity || event.target.style.opacity = '1';
        $("#iconimg8").attr("src","static/OI_resource/images/test/icon/iconimg8.png");
    }
    oi.Icon_8_Over = function () {
        $("#iconimg8").attr("src","static/OI_resource/images/test/icon/iconimg8_hover.png");
    }
    
    
    // 아이콘 클릭 피드백 효과
    oi.IconDown = function (event) {
        
        var e = event.srcElement || event.target;
        e.style.opacity = '0.6';
        //console.log(event.srcElement.id);
      //  event.srcElement.style.opacity = '0.6';
        //oi.divIcons[1].style.opacity = '0.6';
    }
    oi.IconUp = function (event) {
       // oi.divIcons[1].style.opacity = '1';
        var e = event.srcElement || event.target;
        e.style.opacity = '1';
      //  event.srcElement.style.opacity = '1';
    }

    oi.addButtonOver = function () {
        oi.divAddButton.style.opacity = '0.8';
    }
    oi.addButtonOut = function () {
        oi.divAddButton.style.opacity = '1';
    }
    oi.addButtonDown = function () {
        oi.divAddButton.style.opacity = '1';
    }
    oi.addButtonUp = function () {
        oi.divAddButton.style.opacity = '0.8';
    }

    oi.backArrowOver = function () {
        oi.divBackArrow.style.opacity = '0.8';
    }
    oi.backArrowOut = function () {
        oi.divBackArrow.style.opacity = '1';
    }
    oi.backArrowDown = function () {
        oi.divBackArrow.style.opacity = '1';
    }
    oi.backArrowUp = function () {
        oi.divBackArrow.style.opacity = '0.8';
    }


    oi.Category1Over = function () {
        oi.divCategory[0].style.opacity = '0.8';
    }
    oi.Category1Out = function () {
        oi.divCategory[0].style.opacity = '1';
    }
    oi.Category1Down = function () {
        oi.divCategory[0].style.opacity = '1';
    }
    oi.Category1UP = function () {
        oi.divCategory[0].style.opacity = '0.8';
    }

    oi.Category2Over = function () {
        oi.divCategory[1].style.opacity = '0.8';
    }
    oi.Category2Out = function () {
        oi.divCategory[1].style.opacity = '1';
    }
    oi.Category2Down = function () {
        oi.divCategory[1].style.opacity = '1';
    }
    oi.Category2UP = function () {
        oi.divCategory[1].style.opacity = '0.8';
    }

    oi.Category3Over = function () {
        oi.divCategory[2].style.opacity = '0.8';
    }
    oi.Category3Out = function () {
        oi.divCategory[2].style.opacity = '1';
    }
    oi.Category3Down = function () {
        oi.divCategory[2].style.opacity = '1';
    }
    oi.Category3UP = function () {
        oi.divCategory[2].style.opacity = '0.8';
    }
    
    
    // 아이콘 Enabled, disabled 함수
    oi.iconEnable = function(div){
        var name = "#"+div;
        $(name).attr("src","static/OI_resource/images/test/icon/"+div+".png");
        //console.log($(name));
        //$(name).parent().bind('click');
        //$(name).bind('click');
        
        $(name).off('click');
        $(name).click(false);
        if(name==="#iconimg1"){
            $(name).click(oi.iconLo1Click);
            $(name).click(mySpaceAppToggle);
        }
        else if(name==="#iconimg2"){
            $(name).click(assetAppToggle);
        }
        else if(name==="#iconimg3"){
            $(name).click(oi.exploreUpdate);
            $(name).click(ExploreAppToggle);
        }
        else if(name==="#iconimg4"){
            $(name).click(oi.modeChange);
        }
        else if(name==="#iconimg5"){
            $(name).click(function(){
                if(!testPlay.isplaying){
                    document.getElementById('myModal').style.display = "block";
                    oi.customCam.dettachEvent();    // input 태그에 커서 정상작동
                    $("#roomName").focus();
                }
            });
        }
        else if(name==="#iconimg6"){
            $(name).click(oi.iconLo6Click);
        }
        else if(name==="#iconimg7"){
            $(name).click(playWindowToggle);
        }
            
        
        //$("#iconLo2").prop("disabled", false);
        
    }

    oi.iconDisable = function(div){
        var name = "#"+div;
        $(name).attr("src","static/OI_resource/images/test/icon/"+div+"_ban.png");
        
        $(name).off('click');
        $(name).click(false);
        //$(name).off('click');
        //$(name).parent().unbind('click');
        
        //$("#iconLo2").prop("disabled", true);
    }
    
    // 모드 전환
    oi.modeChange = function(){

        if(testPlay.isplaying){
            console.log("끄기");
            
            oi.Assets.interTarget = [];
            oi.mainRoom.scene.children.forEach(function(obj){
                oi.Assets.interTarget.push(obj);
            });
            oi.outlinePass.selectedObjects = [];

            oi.mainRoom.camera.position.set(-30,20,30);
            testPlay.isplaying=false;
            $("#playing_val").attr("value","false");
            testPlay.dettachEvent();
            oi.customCam.attachEvent();
            
            oi.selectedAsset = null;
           
            // 싱글 편집모드에서의 편집모드복귀 
			if(!oi.isVisiting){
                oi.iconEnable("iconimg2");
                oi.iconEnable("iconimg5");
                oi.iconEnable("iconimg3");
                oi.iconEnable("iconimg6");
            } 
            // 싱글 방문모드에서의 편집모드복귀 
            if(oi.isVisiting){
                oi.iconEnable("iconimg3");
                oi.iconEnable("iconimg6");
            }
            
            $("#blocker").css("display", "none");
            $("#instructions").css("display", "none");
            $("#crosshair").css("display","none");
            
            $("#playFrameDiv").css("display", "none");
            
            oi.mainRoom.PhysicsOFF();
            
            // 비디오 제거
            videoEvent.ClearVideoFcts();

        }
        else{
            console.log("켜기");

            oi.mainRoom.tp_camera.position.set(0,0,0);
            testPlay.controls.getObject().position.set(0,30,0);
            testPlay.isplaying=true;
            
            $("#playing_val").attr("value","true");

            oi.iconDisable("iconimg2");
            oi.iconDisable("iconimg3");
            oi.iconDisable("iconimg5");
            oi.iconDisable("iconimg6");
            
            
            $("#crosshair").css("display","block");
            $("#playFrameDiv").css("display", "none");

            $("#asset").css("display","none");
            
            oi.mainRoom.control.detach();
            oi.mainRoom.scene.remove(oi.mainRoom.control);
            oi.isAssetModifying = false;
            testPlay.isEvent = false;
            oi.outlinePass.selectedObjects = [];

            if(testPlay.havePointerLock){

                oi.customCam.dettachEvent();

                testPlay.attachEvent();

                testPlay.instructions.style.display = 'none';

                // Ask the browser to lock the pointer
                testPlay.element.requestPointerLock = testPlay.element.requestPointerLock || testPlay.element.mozRequestPointerLock || testPlay.element.webkitRequestPointerLock;
                testPlay.element.requestPointerLock();
            }
            oi.mainRoom.PhysicsON();
            oi.mainRoom.scene.simulate(undefined, 1);
            
            // Physijs mesh recreate
            var assetRemove = [];
            oi.mainRoom.scene.traverse(function (e) {
                if (e.name.substring(0,5)=="basic"){
                    assetRemove.push(e);
                }
            });

            assetRemove.forEach(function (e) {
                
                var physiMesh = e.clone();
				physiMesh.uuid = e.uuid;
  
            
                //console.log(physiMesh);

                if(physiMesh.name.substring(0,5)==="basic")
                    physiMesh.material = e.material.clone();

                oi.mainRoom.scene.remove(e);
                
                oi.Assets.interTarget.push(physiMesh);

               if(physiMesh.name==="basic1" || physiMesh.name==="basic3"){ // sphere, cone
                    physiMesh._physijs.radius = physiMesh.scale.x/2;
                }

                oi.mainRoom.scene.add(physiMesh);
                physiMesh.mass = 0;
            });
        }
    }

    // 멀티플레이 변수
    var socket;
    var sceneUsers = [];
    var myCharacter;
    var isStart;
    var doOnece;
    
    // 그 사람 방에 처음 놀러갔을 때 originCamCube 셋팅
    var originCamCube;
    
	oi.modeChange2 = function(){

       if(testPlay.isplaying){
            console.log("끄기2");

            oi.Assets.interTarget = [];
            oi.mainRoom.scene.children.forEach(function(obj){
                oi.Assets.interTarget.push(obj);
            });
            oi.outlinePass.selectedObjects = [];

            oi.mainRoom.camera.position.set(-30,20,30);
            testPlay.isplaying=false;
            $("#playing_val").attr("value","false");
            testPlay.dettachEvent();
            oi.customCam.attachEvent();
            
            // 싱글 편집모드에서의 편집모드복귀 
            if(!oi.isVisiting && !oi.isMultiplaying){
                oi.iconEnable("iconimg3");
                oi.iconEnable("iconimg6");
            }

            // 싱글 방문모드에서의 편집모드복귀 
			if(!oi.isVisiting && oi.isMultiplaying){
                oi.iconEnable("iconimg2");
                oi.iconEnable("iconimg5");
                oi.iconEnable("iconimg3");
                oi.iconEnable("iconimg6");
            }

         	// 멀티 방문모드에서의 편집모드복귀
         	if(!oi.isMultiplaying){
         		// 나가기 버튼 동작에서 oi.isMultiplaying 값을 false로 변경, 프로필룸 로딩후 modeChange 호출.
         		// 프로필 룸으로 다시 가기 때문에 나머지 메뉴 아이콘 활성화
         		oi.iconEnable("iconimg1");
         		oi.iconEnable("iconimg2");
         		oi.iconEnable("iconimg3");
         		oi.iconEnable("iconimg4");
         		oi.iconEnable("iconimg5");
         		oi.iconEnable("iconimg6");
                oi.iconEnable("iconimg7");
         	}
            
            $("#blocker").css("display", "none");
            $("#instructions").css("display", "none");
            $("#crosshair").css("display","none");
            
            $("#playFrameDiv").css("display", "none");

            
            $("#isMultiplaying").val("false");
           
            oi.mainRoom.PhysicsOFF();

        }
        else{ // 멀티플레이 방 생성하기 시작점 ---
            //console.log("켜기");
            oi.mainRoom.tp_camera.position.set(0,0,0);
            testPlay.controls.getObject().position.set(0,30,0);
            testPlay.isplaying=true;

            $("#playing_val").attr("value","true");
            $("#isMultiplaying").val("true");

            if(oi.isMultiplaying){
            	oi.iconDisable("iconimg1");
            	oi.iconDisable("iconimg4");
            }
            oi.iconDisable("iconimg2");
            oi.iconDisable("iconimg3");
           // oi.iconDisable("#iconimg4");
            oi.iconDisable("iconimg5");
            oi.iconDisable("iconimg6");

            $("#crosshair").css("display","block");
            $("#playFrameDiv").css("display", "none");

            $("#asset").css("display","none");
            
            oi.mainRoom.control.detach();
            oi.mainRoom.scene.remove(oi.mainRoom.control);
            oi.isAssetModifying = false;
            testPlay.isEvent = false;
            oi.outlinePass.selectedObjects = [];
            
            isStart = false;
            doOnece = false;
            var tmpInverval = setInterval(function(){

                if(!isStart){
                    if(oi.mainRoom.scene.children.length === oi.nowRoomdata.assets.length+2){

                        // Physijs mesh recreate
                        var assetRemove = [];

                        for(var i=0; i<oi.mainRoom.scene.children.length; i++){
                            //console.log(oi.mainRoom.scene.children[i]);
                            if(oi.mainRoom.scene.children[i].name.substring(0,5)==="basic")
                                assetRemove.push(oi.mainRoom.scene.children[i]);
                        }

                        assetRemove.forEach(function (e) {
                            var physiMesh = e.clone();
                            physiMesh.uuid = e.uuid;

                            if(physiMesh.name.substring(0,5)==="basic")
                                physiMesh.material = e.material.clone();

                            oi.mainRoom.scene.remove(e);

                            oi.Assets.interTarget.push(physiMesh);

                            if(physiMesh.name==="basic1" || physiMesh.name==="basic3"){ // sphere, cone
                                physiMesh._physijs.radius = physiMesh.scale.x/2;
                            }

                            oi.mainRoom.scene.add(physiMesh);
                            physiMesh.mass = 0;
                        });

                        oi.mainRoom.PhysicsON();
                        oi.mainRoom.scene.simulate(undefined, 1);

                        isStart = true;

                    }
                }

                if(isStart){ // 멀티플레이 소켓 시나리오 시작
                    
                    if(!doOnece){
                        
                        originCamCube = mainRoom.cam_cube;
                        
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
                                rotZ : originCamCube.rotation.z,
                            //    colorR : Math.floor(Math.random() * 255)/255,
                            //    colorG : Math.floor(Math.random() * 255)/255,
                            //    colorB : Math.floor(Math.random() * 255)/255
                                colorR : Math.random(),
                                colorG : Math.random(),
                                colorB : Math.random()
                                
                            }
                            socket.emit('roomKey', info);
                            //console.log("룸키인포 : ", info);
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
                                rotZ : originCamCube.rotation.z,
                             //   colorR : Math.floor(Math.random() * 255)/255,
                              //  colorG : Math.floor(Math.random() * 255)/255,
                             //   colorB : Math.floor(Math.random() * 255)/255
                                colorR : Math.random(),
                                colorG : Math.random(),
                                colorB : Math.random()
                            }
                            socket.emit('roomKey', info);
                            //console.log("룸키인포 : ", info);
                        }

                        socket.on('joinRoom', function(users){
                            // 해당 Key에 접속되어 있는 모든 유저들 정보
                            console.log(users);

                            // player 초기화
                            sceneUsers = [];
                            myCharacter = null;
                            var playerRemove = [];
                            mainRoom.scene.traverse(function (e) {
                                if (e.getObjectByName("cam_cube0"))
                                    playerRemove.push(e);
                            });

                            //console.log(playerRemove);

                            playerRemove.forEach(function (e) {
                                if(e.name==="cam_cube0")
                                    mainRoom.scene.remove(e);
                            });

                            // 해당 key에 접속되어 있는 user들 생성
                            for(var i=0; i<users.length; i++){
                            //    var txr_Loader = new THREE.TextureLoader();
                            //    var cam_paper = txr_Loader.load(users[i].userImage);

                                var ccMaterial = new THREE.MeshLambertMaterial({/*map:cam_paper,*/
                                                                                side:THREE.DoubleSide});
                              //  var ccMaterial = new THREE.MeshLambertMaterial();
                              //  ccMaterial.color.setRGB(users[i].colorR, users[i].colorG, users[i].colorB);
                                
                                var cam_cube = new Physijs.BoxMesh(new THREE.BoxGeometry(3,3,3),
                                                                   ccMaterial);
                             //   cam_cube.material.color.setRGB(0.7, 0.1, 0.1);
                                cam_cube.material.color.setRGB(Number(users[i].colorR), Number(users[i].colorG), Number(users[i].colorB));

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
                                mainRoom.scene.add(cam_cube);
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
                            mainRoom.cam_cube = myCharacter;

                            $("#myKey").val(myCharacter.myKey.split('_')[0]);
                            $("#hostKey").val(myCharacter.hostKey.split('_')[0]);
                            frameEvent.setSocket(socket);
                        });
                        
                        // 멀티플레이 프레임 이벤트
                        socket.on('frameUpdate',function(frameInfo){
                            var updateAsset = [];
                            //console.log(frameInfo);
                            oi.mainRoom.scene.traverse(function (e) {
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
                            	mUpdate.sceneSave(oi.mainRoom.scene);
                            	//console.log($("#userNickName").val());
                            }
                        });
     
                        // 내 캐릭터를 제외한 멀티플레이 포지션 및 로테이션 업데이트
                        socket.on('posUpdate', function(userData){

                            mainRoom.scene.traverse(function (e) {
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
                            mainRoom.scene.traverse(function (e) {
                                if (e.myKey === userData.myKey){
                                    playerRemove.push(e);
                                }
                            });
                            playerRemove.forEach(function (e) {
                                mainRoom.scene.remove(e);
                            });

                            for(var i=0; i<sceneUsers.length; i++){
                                if(sceneUsers[i].myKey === userData.myKey){
                                    sceneUsers.splice(i,1);
                                    break;
                                }
                            }

                        });
                        
                        // 멀티 플레이 나가기 버튼
                        $('#mulExit').off("click");
                        $('#mulExit').click(function(){
                            
                            $("#mulExit").css("display","none");
                            
                            testPlay.isplaying = true;
                            oi.isMultiplaying = false;
                            $("#isMultiplaying").val("false");

                            isStart = false;
                            doOnece = false;

                            // 기존에 있던 모든 player들 모두 삭제
                            // player 초기화
                            sceneUsers = [];
                            myCharacter = null;
                            $('#multiCreate').val("false");
                            
                            var prfileRoomData = $('#prfileRoomData').val();
                            var sceneManager = new SceneManager("user1");
                            sceneManager.sceneLoad(oi, prfileRoomData);
                            
                            socket.disconnect();
                            
                            clearInterval(tmpInverval);
                            oi.mainRoom.PhysicsOFF();
                            oi.modeChange2();
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
                }
            },12);
                
        }
    }

    // 멀티플레이 
/*        oi.iconLo7Click = function ()
    {
        console.log("멀티플레이 버튼 클릭");

    }*/
    
    // 에셋카테고리 및 리스트 div Event End =====================================================================

    // Add Event Listener ===========================================================================

    // 공통 Event Listener -------------------------- 

    oi.divContent.addEventListener('mousedown', bind(oi, oi.clickToModify), false);

    oi.divButton.addEventListener('contextmenu', bind(oi, oi.blockClick), false);
    oi.divContent.addEventListener('contextmenu', bind(oi, oi.blockClick), false);
    oi.divSideinfo.addEventListener('contextmenu', bind(oi, oi.blockClick), false);
    oi.document.addEventListener('mousemove', bind(oi, oi.onMouseMove), false);
    oi.document.addEventListener('keyup', oi.onDocumentKeyUp, false);
    oi.document.addEventListener('keydown',oi.onDocumentKeyDown, false);


    // 디테일 함수
    oi.divIcons[5].addEventListener("click", bind(oi, oi.iconLo6Click), false);
    
    // 멀티플레이 
  //  oi.divIcons[6].addEventListener("click", bind(oi, oi.iconLo7Click), false);
    
    // 에셋 익스플로러
    oi.divIcons[2].addEventListener("click", bind(oi, oi.exploreUpdate), false);
    
    // 모드 전환
    oi.divIcons[3].addEventListener("click", bind(oi, oi.modeChange), false);
    
    // 에셋 카테고리 및 리스트 Event Listener -------------------
    oi.divCategory[0].addEventListener('click', bind(oi, oi.categoryLo1Click), false); // furniture category
    oi.divCategory[1].addEventListener('click', bind(oi, oi.categoryLo2Click), false); // ornament category
    oi.divCategory[2].addEventListener('click', bind(oi, oi.categoryLo3Click), false); // structure category
    oi.divBackArrow.addEventListener('click', bind(oi, oi.assetBackArrow), false); // asset list back arrow
    oi.divAddButton.addEventListener('click', bind(oi, oi.addButtonClick), false); // 에셋 배치 버튼
    
    // 아이콘 오버 + 아웃 효과  Event Listener ------------------------

    // 메뉴 아이콘 이미지 ------------------------------------------------------------------
    // 마이페이지
    oi.divIcons[0].addEventListener('mouseover', bind(oi, oi.Icon_1_Over), false);
    oi.divIcons[0].addEventListener('mouseout', bind(oi, oi.Icon_1_Out), false);
    oi.divIcons[0].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[0].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 에셋 
    oi.divIcons[1].addEventListener('mouseover', bind(oi, oi.Icon_2_Over), false);
    oi.divIcons[1].addEventListener('mouseout', bind(oi, oi.Icon_2_Out), false);
    oi.divIcons[1].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[1].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 에셋 익스플로러
    oi.divIcons[2].addEventListener('mouseover', bind(oi, oi.Icon_3_Over), false);
    oi.divIcons[2].addEventListener('mouseout', bind(oi, oi.Icon_3_Out), false);
    oi.divIcons[2].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[2].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 테스트 플레이 & 에디트 모드
    oi.divIcons[3].addEventListener('mouseover', bind(oi, oi.Icon_4_Over), false);
    oi.divIcons[3].addEventListener('mouseout', bind(oi, oi.Icon_4_Out), false);
    oi.divIcons[3].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[3].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 세이브
    oi.divIcons[4].addEventListener('mouseover', bind(oi, oi.Icon_5_Over), false);
    oi.divIcons[4].addEventListener('mouseout', bind(oi, oi.Icon_5_Out), false);
    oi.divIcons[4].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[4].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 디테일
    oi.divIcons[5].addEventListener('mouseover', bind(oi, oi.Icon_6_Over), false);
    oi.divIcons[5].addEventListener('mouseout', bind(oi, oi.Icon_6_Out), false);
    oi.divIcons[5].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[5].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // 멀티플레이
    oi.divIcons[6].addEventListener('mouseover', bind(oi, oi.Icon_7_Over), false);
    oi.divIcons[6].addEventListener('mouseout', bind(oi, oi.Icon_7_Out), false);
    oi.divIcons[6].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[6].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    // RTC
    oi.divIcons[7].addEventListener('mouseover', bind(oi, oi.Icon_8_Over), false);
    oi.divIcons[7].addEventListener('mouseout', bind(oi, oi.Icon_8_Out), false);
    oi.divIcons[7].addEventListener('mousedown', bind(oi, oi.IconDown), false);
    oi.divIcons[7].addEventListener('mouseup', bind(oi, oi.IconUp), false);
    
    
    // ---------------------------------------------------------------------------------
    //-추가 버튼
    oi.divAddButton.addEventListener('mouseover', bind(oi, oi.addButtonOver), false);
    oi.divAddButton.addEventListener('mouseout', bind(oi, oi.addButtonOut), false);
    oi.divAddButton.addEventListener('mousedown', bind(oi, oi.addButtonDown), false);
    oi.divAddButton.addEventListener('mouseup', bind(oi, oi.addButtonUp), false);
    //- 뒤로가기 버튼
    oi.divBackArrow.addEventListener('mouseover', bind(oi, oi.backArrowOver), false);
    oi.divBackArrow.addEventListener('mouseout', bind(oi, oi.backArrowOut), false);
    oi.divBackArrow.addEventListener('mousedown', bind(oi, oi.backArrowDown), false);
    oi.divBackArrow.addEventListener('mouseup', bind(oi, oi.backArrowUp), false);

    //- 카테고리 버튼
    oi.divCategory[0].addEventListener('mouseover', bind(oi, oi.Category1Over), false);
    oi.divCategory[0].addEventListener('mouseout', bind(oi, oi.Category1Out), false);
    oi.divCategory[0].addEventListener('mousedown', bind(oi, oi.Category1Down), false);
    oi.divCategory[0].addEventListener('mouseup', bind(oi, oi.Category1Up), false);

    oi.divCategory[1].addEventListener('mouseover', bind(oi, oi.Category2Over), false);
    oi.divCategory[1].addEventListener('mouseout', bind(oi, oi.Category2Out), false);
    oi.divCategory[1].addEventListener('mousedown', bind(oi, oi.Category2Down), false);
    oi.divCategory[1].addEventListener('mouseup', bind(oi, oi.Category2Up), false);

    oi.divCategory[2].addEventListener('mouseover', bind(oi, oi.Category3Over), false);
    oi.divCategory[2].addEventListener('mouseout', bind(oi, oi.Category3Out), false);
    oi.divCategory[2].addEventListener('mousedown', bind(oi, oi.Category3Down), false);
    oi.divCategory[2].addEventListener('mouseup', bind(oi, oi.Category3Up), false);

    //    oi.divCategory[3].addEventListener('mouseover',bind(oi,oi.Category4Over),false);
    //    oi.divCategory[3].addEventListener('mouseout',bind(oi,oi.Category4Out),false);
    //    oi.divCategory[3].addEventListener('mousedown',bind(oi,oi.Category4Down),false);
    //    oi.divCategory[3].addEventListener('mouseup',bind(oi,oi.Category4Up),false);

    //modal event
    var modal = document.getElementById('myModal');
    var deleteModal = document.getElementById('deleteModal');
    // Get the button that opens the modal
    var btn = document.getElementById("iconLo5");


    
    //click save button event
    var saveCommit = document.getElementById("saveCommit");
    saveCommit.addEventListener("click", bind(oi, oi.sceneSaveCommit), false); 
    
    var roomNameInput = document.getElementById("roomName");
    
    // 씬 세이브 아이콘 클릭 ->모달 생성
    btn.onclick = function(event) {
        if(!testPlay.isplaying){
            modal.style.display = "block";
            oi.customCam.dettachEvent();    // input 테그에 커서 정상작동
            $("#roomName").focus();

            //console.log("close Btn click!!");
            $(".saveMClose").off("click");
            $(".saveMClose").click(function(){
	            oi.customCam.attachEvent();
	            modal.style.display = "none";
            });
        }
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
       
        //console.log(event);
        
        if(oi.isDetailEditing){
            if(event.path[1].id == "content"){
                oi.customCam.attachEvent();
            }
            else
            {  
                for (var i=0;i<event.path.length;i++){
                    if(event.path[i] !== null && event.path[i].id ==="details")
                        oi.customCam.dettachEvent();
                }
            }
        }
        
        if (event.target == modal) {            // target is modal
            oi.customCam.attachEvent();
            modal.style.display = "none";
        }
        else if (event.target == deleteModal)
        {
            deleteModal.style.display="none";
        }
        else if(event.target.className == 'joinRoom')  // load room event section
        {
            var roomName = event.target.title;
            $.ajax({                            // 버튼을 클릭하면 <새로고침> 없이 ajax로 서버와 통신하겠다.
            type: "POST",                   // 데이터를 전송하는 방법을 지정
            url: "/doLoad/",                // 통신할 url을 지정
            data: {"selectedRoomName": roomName },      //, 'csrfmiddlewaretoken': '{{ csrf_token }}'}, // 서버로 데이터 전송시 옵션
            dataType: "json",                           // 서버측에서 전송한 데이터를 어떤 형식의 데이터로서 해석할 것인가를 지정,
                                                            // 서버측에서 전송한 Response 데이터 형식 (json)                                               
            success: function(response){                // 통신 성공시 
                        //alert("성공적으로 데이터를 받아왔습니다.");
                        //console.log("roomdata : "+response.roomdata);
                        var sceneManager = new SceneManager("user1");
                        sceneManager.sceneLoad(oi, response.roomdata);
                        oi.isVisiting = false;
                        $("#isVisiting").val("false");
                
                        // 메뉴 버튼들 초기화
                        oi.iconEnable("iconimg1");
                        oi.iconEnable("iconimg2");
                        oi.iconEnable("iconimg3");
                        oi.iconEnable("iconimg4");
                        oi.iconEnable("iconimg5");
                        oi.iconEnable("iconimg6");
                        oi.iconEnable("iconimg7");
                
                    },
            error: function(request, status, error){    // 통신 실패시
                        //alert("데이터 저장에 실패했습니다.");
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
            });
        }
        else if(event.target.id =='renameBtn')
        {
            console.log("hihi i'm renameBtn :"+event.target.parentNode.title);
            oi.customCam.dettachEvent();    // input 테그에 커서 정상작동
            $(event.target.children).toggle('clip');

            $(event.target.children).keypress(function (e) {
                if (e.which == 13){
                    var rename = $(event.target.children).val();
                    var oldName = event.target.parentNode.title;
                    
                    $.ajax({                            
                    type: "POST",                   
                    url: "/doRename/",               
                    data: {"rename": rename,
                            "oldName":oldName },      
                    dataType: "json",                           
                                                                                                                 
                    success: function(response){        
                                console.log("이름 바꾸기 성공 !");
                                $(event.target.parentNode).html(rename+"<div class = 'profileBtn'></div><div class = 'deleteBtn'></div><div class = 'renameBtn'><input type='text' class ='roomName'></div>");       
                                oi.customCam.attachEvent();
                            },
                    error: function(request, status, error){    
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                            },
                    });
                }
            });
        }
        else if(event.target.className =='profileBtn')
        {
            console.log("hihi i'm profileBtn ");
            var roomName = event.target.parentNode.title;

             $.ajax({               

                    type: "POST",                   
                    url: "/doProfile/",               
                    data: {"roomName": roomName},
                    dataType: "json",                           
                                                                                                                 
                    success: function(response){        
                                
                                if(response.returndata=='success')
                                { 
                                    console.log("프로필 룸으로 설정 성공 !");
                                    $(event.target).css("background-color","yellow")
                                }
                                    
                                else if (response.returndata=='change')
                                { 
                                    console.log("프로필 룸으로 설정 해제 !"); 
                                    $(event.target).css("background-color","white")
                                }
                                else
                                {
                                    console.log("이미 다른 방이 프로필로 설정되어 있습니다.")
                                }
                            },
                                    
                    error: function(request, status, error){    
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                            },
            });
        }
        else if(event.target.id =='deleteBtn')
        {
        	$('#yesBtn').off('click');
            $('#noBtn').off('click');
            $('#MExit').off('click');
             
            var roomName = event.target.parentNode.title;

            $('#deleteRoomName').html("Delete target : "+roomName);
            $('#deleteModal').css("display","block");

            $('#yesBtn').click(function(){
            $.ajax({               

                    type: "POST",                   
                    url: "/doDelete/",               
                    data: {"roomName": roomName},
                    dataType: "json",                           
                                                                                                                 
                    success: function(response){        
                                console.log("삭제 성공!");
                                $(event.target.parentNode).css("display","none");
                                $('#deleteModal').css("display","none");
                            },
                                    
                    error: function(request, status, error){    
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                            },
                });
            })
            $('#noBtn').click(function(){
                $('#deleteModal').css("display","none");
             })
            $('#MExit').click(function(){
                $('#deleteModal').css("display","none");
             })
             
        }
        else if(event.target.id =='newRoomImg')
        {
            
            $('#yesBtn').off('click');
            $('#noBtn').off('click');
            $('#MExit').off('click');

            $("#deleteRoomName").html("지금 편집중인 방이 삭제될 수 있습니다.");
            $('#deleteModal').css("display","block");

            $('#yesBtn').click(function(){
                var planeRoom = $('#planeRoom').val();
                console.log("hohoho2");
                var sceneManager = new SceneManager("user1");
                $("mulExit").css("display","none");
                sceneManager.sceneLoad(oi, planeRoom);
                $('#deleteModal').css("display","none");
             })
            $('#noBtn').click(function(){
                $('#deleteModal').css("display","none");
             })
            $('#MExit').click(function(){
                $('#deleteModal').css("display","none");
             })
        }
        else if(event.target.parentNode.id == 'listPlate')
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
                        var sceneManager = new SceneManager("user1");
                        sceneManager.sceneLoad(oi, response.roomdata);
                        oi.customCam.attachEvent();
                        $("#playWindow").css("display","none");
                        $("#mulExit").css("display","none");

                        oi.iconDisable("iconimg2");
                        oi.iconDisable("iconimg5");
                        oi.isVisiting = true;
                        $("#isVisiting").val("true");
                     
                        oi.isMycontents = false;
                    },
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
            });
        }
        else if(event.target.parentNode.id == "roomBtn"||event.target.parentNode.parentNode.id == "roomBtn")
        {
        	//기존에 달린 이벤트 지운다
        	$('#yesBtn').off('click');
            $('#noBtn').off('click');
            $('#MExit').off('click');

            // 모달 생성
            $('#deleteModal').css("display","block");

            $("#deleteRoomName").html("멀티 플레이 방을 생성합니다.");
            //각 버튼 이벤트
            
            var roomCreate = function(response){                 
                var sceneManager = new SceneManager("user1");
                sceneManager.sceneLoad(oi, response.roomdata);
                oi.customCam.attachEvent();
                $("#creatWindow").css("display","none");
                $("#playWindow").css("display","none");
                $("#mulExit").css("display","block");

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

                oi.iconDisable("iconimg1");
                oi.iconDisable("iconimg2");
                oi.iconDisable("iconimg3");
                oi.iconDisable("iconimg4");
                oi.iconDisable("iconimg5");
                oi.iconDisable("iconimg6");
                oi.iconDisable("iconimg7");

                oi.isMultiplaying = true;
                $("#isMultiplaying").val("true");

                oi.isMycontents = false;

                // 멀티 플레이 시작
                testPlay.isplaying = false;
                $('#multiCreate').val("true");
                var modeChangeInterval = setInterval(function(){
                    if(!oi.needLoading){
                        oi.modeChange2();
                        clearInterval(modeChangeInterval);
                    }
                },500);
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
                
                testPlay.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document ||
 										'webkitPointerLockElement' in document;

                if(testPlay.havePointerLock){
                    oi.customCam.dettachEvent();

                    testPlay.attachEvent();

                    testPlay.instructions.style.display = 'none';

                    // Ask the browser to lock the pointer
                    testPlay.element.requestPointerLock = testPlay.element.requestPointerLock || 
                                                            testPlay.element.mozRequestPointerLock ||
                                                             testPlay.element.webkitRequestPointerLock;
                    testPlay.element.requestPointerLock();

                }

                $('#deleteModal').css("display","none");

             });
            
            $('#noBtn').click(function(){
                $('#deleteModal').css("display","none");
             });
            $('#MExit').click(function(){
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
                $("#searchingName").attr("title",searchingName);
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
                
                testPlay.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document ||
                                        'webkitPointerLockElement' in document;

                if(testPlay.havePointerLock){
                    oi.customCam.dettachEvent();

                    testPlay.attachEvent();

                    testPlay.instructions.style.display = 'none';

                    // Ask the browser to lock the pointer
                    testPlay.element.requestPointerLock = testPlay.element.requestPointerLock || 
                                                            testPlay.element.mozRequestPointerLock ||
                                                             testPlay.element.webkitRequestPointerLock;
                    testPlay.element.requestPointerLock();

                }

                $('#deleteModal').css("display","none");

            });

            var roomJoin = function(response){                 
                var sceneManager = new SceneManager("user1");
                sceneManager.sceneLoad(oi, response.roomdata);
                oi.customCam.attachEvent();
                $("#creatWindow").css("display","none");
                $("#playWindow").css("display","none");
                $("#mulExit").css("display","block");

                $("#hostKey").val(response.hostKey);
                

                oi.iconDisable("iconimg1");
                oi.iconDisable("iconimg2");
                oi.iconDisable("iconimg3");
                oi.iconDisable("iconimg4");
                oi.iconDisable("iconimg5");
                oi.iconDisable("iconimg6");
                oi.iconDisable("iconimg7");

                oi.isMultiplaying = true;
                $("#isMultiplaying").val("true");

                oi.isMycontents = false;

                // 멀티 플레이 시작
                testPlay.isplaying = false;
                $('#multiCreate').val("false");
                var modeChangeInterval = setInterval(function(){
                    if(!oi.needLoading){
                        oi.modeChange2();
                        clearInterval(modeChangeInterval);
                    }
                },500);
           };
        }
        else if(event.target.id=="postDelete")	//게시글 삭제 버튼
        {
            if(!oi.isMultiplaying){
                if(!oi.isVisiting){
                    var postNum = event.target.parentNode.title;
                    console.log("삭제될 글 번호는 : " + postNum);
                    //ajax 시작
                    $.ajax({               
                    type: "POST",                   
                    url: "/doPostDelete/",               
                    data: {"psotNum": postNum },
                    dataType: "json",                           

                    success: function(response){        
                                console.log("글 지워져따");
                                alert(response.result);
                            },

                    error: function(request, status, error){    
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                            },
                    });
                    //ajax 끝
                    postRefreshFunc();
                }
                else{
                    alert("다른 사람의 방에 방문하신 경우에는 게시글 삭제가 불가능 합니다");
                }
            }
            else{
                if($('#multiCreate').val()==="true"){
                    var postNum = event.target.parentNode.title;
                    console.log("삭제될 글 번호는 : " + postNum);
                    //ajax 시작
                    $.ajax({               
                    type: "POST",                   
                    url: "/doPostDelete/",               
                    data: {"psotNum": postNum },
                    dataType: "json",                           

                    success: function(response){        
                                console.log("글 지워져따");
                                alert(response.result);
                            },

                    error: function(request, status, error){    
                                console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                console.log("ajax 실패");
                            },
                    });
                    //ajax 끝
                    postRefreshFunc();
                }
                else{
                    alert("방의 주인만 게시글을 삭제할 수 있습니다.");
                }
            }
        }
        else if(event.target.id=="postLike")	//게시글 좋아요
        {
        	var postNum = event.target.parentNode.title;
        	console.log("삭제될 글 번호는 : " + postNum);
        	//ajax 시작
        	$.ajax({               
            type: "POST",                   
            url: "/doPostLike/",               
            data: {"psotNum": postNum },
            dataType: "json",                           
                                                                                                         
            success: function(response){        
                        console.log("좋아요 대따");
                    },
                            
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        	});
        	//ajax 끝
        	postRefreshFunc();
        }
        else if (event.target.id=="postComment") //댓글 달기 버튼
        {
        	var postNum = event.target.parentNode.title;
        	// 선택된 게시판글의 primarykey 를 저장
        	$("#selectedpostNum").val(postNum);
            $("#boardComment").css("display","block");

            commentRefresh(postNum);

        }
        else if (event.target.id=="BCDelete") //댓글 삭제하기
        {
            if(!oi.isMultiplaying){
                if(!oi.isVisiting){
                    var postNum = $("#selectedpostNum").val();
                    var commentNum = event.target.parentNode.title;
                    // 선택된 게시판글의 primarykey 를 저장
                    $.ajax({               
                        type: "POST",                   
                        url: "/doCommentDelete/",              
                        data: {"postNum":postNum,"commentNum" : commentNum},
                        dataType: "json",                           

                        success: function(response){        
                                    console.log("댓글 지우기 성공 !: ");
                                    commentRefresh(postNum);
                                },

                        error: function(request, status, error){    
                                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                    console.log("ajax 실패");
                                },
                    });
                }
                else{
                    alert("다른 사람의 방에 방문하신 경우에는 댓글 삭제가 불가능 합니다");
                }
            }
            else{
                if($('#multiCreate').val()==="true"){
                    var postNum = $("#selectedpostNum").val();
                    var commentNum = event.target.parentNode.title;
                    // 선택된 게시판글의 primarykey 를 저장
                    $.ajax({               
                        type: "POST",                   
                        url: "/doCommentDelete/",              
                        data: {"postNum":postNum,"commentNum" : commentNum},
                        dataType: "json",                           

                        success: function(response){        
                                    console.log("댓글 지우기 성공 !: ");
                                    commentRefresh(postNum);
                                },

                        error: function(request, status, error){    
                                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                    console.log("ajax 실패");
                                },
                    });
                }
                else{
                    alert("방의 주인만 댓글을 삭제할 수 있습니다.");
                }
            }
        }
    }
    
    //modal event end

    //Load button Testpalce#####################

    

    oi.iconLo1Click = function()
    {
        $.ajax({                            // 버튼을 클릭하면 <새로고침> 없이 ajax로 서버와 통신하겠다.
        type: "POST",                   // 데이터를 전송하는 방법을 지정
        url: '/doLoadSearch/',                // 통신할 url을 지정
        data: { },      //, 'csrfmiddlewaretoken': '{{ csrf_token }}'}, // 서버로 데이터 전송시 옵션
        dataType: "json",                           // 서버측에서 전송한 데이터를 어떤 형식의 데이터로서 해석할 것인가를 지정,
                                                    // 서버측에서 전송한 Response 데이터 형식 (json)                                               
        success: function(response){                // 통신 성공시 
                    //alert("성공적으로 데이터를 받아왔습니다.");
                    //console.log("ajax 성공 : " + response.roomName);
                    $("#showMyspaces").append("<div id='newRoom'><img id='newRoomImg' src='/static/OI_resource/images/newRoomImg.png'></div>");  //방 새로만들기 버튼 추가

                    for (var i=0;i<response.roomName.length;i++){
                        $("#showMyspaces").append("<div class = 'joinRoom' title ='" +response.roomName[i] +"'>"+ response.roomName[i] +"<div class = 'profileBtn'></div><div id='deleteBtn' class = 'deleteBtn badge badge-pill badge-secondary'>Delete</div><div id='renameBtn' class = 'renameBtn badge badge-pill badge-secondary'>Rename<input type='text' class ='roomName'></div></div>"); // id 가 방 이름인 div 생성
                    
                    $("div[title="+response.PFRoomName+"]").children().first().css("background-color","yellow");
                    }
                },
        error: function(request, status, error){    // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                    console.log("ajax 실패");
                },
        });
    }
    
    oi.divIcons[0].addEventListener("click", bind(oi, oi.iconLo1Click), false); // Load 버튼


    // 이미지 파일 업로드 부분 #############################################
    $(document).on('click', '#image_send', function () {
        var form = $('#uploadForm')[0];
        var formData = new FormData(form);

        if($('#id_file')[0].files.length==0)
        {
            alert("파일을 선택해 주세요 !");
            return;
        }

        for(var i=0; i<$('#id_file')[0].files.length; i++)
        {
            formData.append("fileObj", $("#id_file")[0].files[i]);
        }

        $.ajax({
            url: '/doLoadImage/',
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                alert("이미지 업로드 성공");
                //console.log("hihi : "+ data.hihi);
            },
            error: function(request, status, error){    // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                    console.log("ajax 실패");
            },

        });
    });

    // 비디오 파일 업로드 부분 #############################################
    $(document).on('click', '#video_send', function () {
        //form 테그
        var form = $('#vUploadForm')[0];
        var formData = new FormData(form);
        //input 테그
        if($('#id_vFile')[0].files.length==0)
        {
            alert("파일을 선택해 주세요 !");
            return;
        }

        for(var i=0; i<$('#id_vFile')[0].files.length; i++)
        {
            formData.append("fileObj", $("#id_vFile")[0].files[i]);
        }

        $.ajax({
            url: '/doLoadVideo/',
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            success: function (data) {
                alert("비디오 업로드 성공");
                //console.log("hihi : "+ data.hihi);
            },
            error: function(request, status, error){    // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                    console.log("ajax 실패");
            },
        });
    });

    // create nick name
        //save button
    $("#nicknameSave").click(function(){
        console.log("nicknameSave!!");
        var nickname = $("#userNickNameinput").val();
        $.ajax({               

            type: "POST",                   
            url: "/doNicknameSave/",               
            data: {"nickname": nickname},
            dataType: "json",                           
                                                                                                         
            success: function(response){        
                        console.log("ajax 성공");
                        if(response.responseMsg =="success" )
                        {
                            console.log("성공적으로 저장되었습니다.");
                            oi.customCam.attachEvent();
                            alert("닉네임이 성공적으로 생성되었습니다.");
                            $("#nickModal").css("display","none");
                            $("#userNickName").val(nickname);
                        }
                        else{
                            console.log("닉네임이 중복되었거나 다른 오류 입니다.");
                            alert("이미 있는 닉네임 입니다. 다시 입력해 주세요");
                        }
                    },
                            
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });
    });
    // 뒤로가기 버튼 클릭시 이전 페이지로 이동
    $(".modalBack").click(function(){
        console.log("back button");
        history.back();
    });

    // 유저의 아이디로 방을 검색
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
                        	// 기존에 있던 child 모두 지움
                         	//$("#showJoinroom").empty(); 
                         	// 기본 검색창 다시 추가
                         	//$("#showJoinroom").append('<span>방 검색</span><input id="searchRoom" type="text" placeholder="other User Name"><span id="dosearch">검색하기</span><br><div id="searchingName" title="'+searchNick+'">'+searchNick+' 님의 방 목록</div>');
                        	
                        	//$("#bodyupdate").remove();
                        	$(".listPlate").remove();


                        	$("#searchingName").html(searchNick+" 님의 방 목록");
                            $("#searchingName").attr("title",searchNick);

							/*var tbody = oi.document.createElement("tbody");
                            tbody.setAttribute("id","showJoinroom");*/
                        	for (var i=0;i<response.searchedRoomList.length;i++)
                        	{
                        	    //$("#showJoinroom").append('<div class="listPlate" title="'+response.searchedRoomList[i]+'">'+response.searchedRoomList[i]+'</div>');
                                //$("#showJoinroom").append('<tr id ="listPlate" class="listPlate table-primary" title="'+response.searchedRoomList[i]+'"><th scope="row">"'+i+'"</th><td>"'+response.searchedRoomList[i]+'"</td></tr>');

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

	//멀티플레이 룸 만들기 버튼
	$("#makeMulRoom").click(function(){
		$("#creatWindow").css("display","block");
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
        	$("#creatWindow").css("display","none");
        });
    });

    // 게시판 관련 이벤트
        // 댓글 새로고침 함수
    var commentRefresh = function(postNum){
    	console.log("postNum : " + postNum)
        $.ajax({               
            type: "POST",                   
            url: "/getComment/",              
            data: {"postNum":postNum},
            dataType: "json",                           
                                                                                                         
            success: function(response){        
                        console.log("댓글 불러오기 성공 !: "+ response);
                    	$("#BCBody").empty();
                    	for(var i=0 ;i<response.authorName.length;i++)
                    	{

	                        $("#BCBody").append('<div id="BCItem" class="alert alert-dismissible alert-info" title="'+response.commentNum[i]+'"><button id="BCDelete" type="button" class="close" data-dismiss="alert">&times;</button><div id="BCContents">'+response.commentData[i]+'</div><footer id="BCAuthor" class="blockquote-footer">'+response.authorName[i]+'</footer></div>');                    		
                    	}
                    },
                            
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });
    }

    	// 게시글 새로고침 함수 
    var postRefreshFunc = function(){

    	if($("#isVisiting").val()==="true" || oi.isMultiplaying === true)
            hostNick = $("#searchingName").attr("title");
        else
            hostNick = $("#userNickName").val();

        console.log("닉네임 누구냐 : "+hostNick)

        $.ajax({                            
        type: "POST",                   
        url: '/getPost/',                
        data: {"hostNick" : hostNick },      
        dataType: "json",                           
                                                                                                  
        success: function(response){                
        			// console.log("받아온 데이터 : " + response);
        			// console.log("받아온 데이터 : " + response.postTitle[0]);
        			// console.log("받아온 데이터 : " + response.postContent[0]);
        			// console.log("받아온 데이터 : " + response.postDate[0]);
                	console.log("이미지 경로 : "+response.imageName)
                	$("#bordList").empty();
        			for(var i=0; i<response.postTitle.length;i++)
        			{

                        if(response.imageName[i]=='') // 이미지가 없을경우
                        {
                            $("#bordList").append('<div id="boardItem" class="card border-primary mb-3"><div class="card-body"><span id="postNum" class="badge badge-light">'+response.postNum[i]+'</span><h4 id="postName" class="card-title">'+response.postTitle[i]+'</h4><p id="postContents" class="card-text">'+response.postContent[i]+'</p></div><div class="card-header" title="'+response.postNum[i]+'"><span id="postDelete" class="badge badge-info">Delete</span> <small id="postDate" class="text-muted">'+response.postDate[i]+'</small><small id="postAuthor" class="text-muted">'+hostNick+'</small> <span id="postLike" class="badge badge-info">좋아요 '+response.postLike[i]+'</span> <span id="postComment" class="badge badge-info">댓글</span></div>');
                        }
                        else // 이미지가 있을경우
                        {

                            var imageUrl = 'media/'+response.imageName[i]
                            $("#bordList").append('<div id="boardItem" class="card border-primary mb-3"><div class="card-body"><span id="postNum" class="badge badge-light">'+response.postNum[i]+'</span><h4 id="postName" class="card-title">'+response.postTitle[i]+'</h4><div id="cardImageContents"><img class="cardImage" src="'+imageUrl+'" alt="Card image"></div><p id="postContents" class="card-text">'+response.postContent[i]+'</p></div><div class="card-header" title="'+response.postNum[i]+'"><span id="postDelete" class="badge badge-info">Delete</span> <small id="postDate" class="text-muted">'+response.postDate[i]+'</small><small id="postAuthor" class="text-muted">'+hostNick+'</small> <span id="postLike" class="badge badge-info">좋아요 '+response.postLike[i]+'</span> <span id="postComment" class="badge badge-info">댓글</span></div>');
                        
                        }
        			}     
                },
        error: function(request, status, error){    // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                    console.log("ajax 실패");
                },
        });
    }
        //게시판 닫기
    $("#blackBordExit").click(function(){
        $("#blackBoard").css("display","none");
        testPlay.isEvent = false;
        testPlay.attachEvent();
        testPlay.element.requestPointerLock = testPlay.element.requestPointerLock || testPlay.element.mozRequestPointerLock || testPlay.element.webkitRequestPointerLock;
        testPlay.element.requestPointerLock();
    });
        //글쓰기 버튼 
    $("#makePost").click(function(){
        if(!oi.isMultiplaying && !oi.isVisiting)
            $("#postForm").css("display","block");
        else
            alert("방문 중에는 글을 쓸 수 없습니다");
    });
        //글 목록 새로고침
    $("#postRefresh").click(function(){
    	postRefreshFunc();
    });


    //글 저장 버튼
    $("#postFormSave").click(function(){
    	var form = $('#postUploadForm')[0];
        var formData = new FormData(form);
        //input 테그

        for(var i=0; i<$('#postImage')[0].files.length; i++)
        {
            formData.append("fileObj", $("#postImage")[0].files[i]);
        }

        formData.append("postTitle",$("#postTitle").val());
        formData.append("postContent",$("#postContent").val());

        console.log("폼 시리얼라이즈 데이터 : "+ formData);
   		$.ajax({
            url: '/doPostSave/',
            data: formData,
            processData: false,

            contentType: false,
            type: 'POST',
            success: function (data) {
                alert("게시글 업로드 성공");
                // console.log("hihi post return: "+ data.title);
                // console.log("content "+ data.contents);
                // console.log("test "+ data.test);
                $("#postForm").css("display","none");
             
                $("#postUploadForm")[0].reset();

            },
            error: function(request, status, error){    // 통신 실패시
                    //alert("데이터 저장에 실패했습니다.");
                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                    console.log("ajax 실패");
            },
        });

        postRefreshFunc();
    });
        //글 저장 취소 버튼
    $("#postFormExit").click(function(){
        $("#postForm").css("display","none");
    });
        //댓글창 버튼 - 윈도우 이벤트에 
        //댓글창 닫기 버튼
    $("#BCExit").click(function(){
        $("#boardComment").css("display","none");
    });
        //댓글 생성 버튼
    $("#BCCreate").click(function(){
        $("#commentForm").css("display","block");
        $("#commentContent").focus();
    });
        //댓글 생성창 닫기 버튼
    $("#commentFormExit").click(function(){
        $("#commentForm").css("display","none");
    });
        //댓글 달기 버튼
    $("#commentFormSave").click(function(){

        var commentData = $("#commentContent").val();
        var postNum = $("#selectedpostNum").val();
        $.ajax({               
            type: "POST",                   
            url: "/doCommentSave/",              
            data: {"commentData": commentData,"postNum":postNum},
            dataType: "json",                           
                                                                                                         
            success: function(response){        
                        console.log("성공적으로 저장되었습니다.");
		                $("#commentForm").css("display","none");
		                $("#commentUploadForm")[0].reset();
		                commentRefresh(postNum);	                
                    },
                            
            error: function(request, status, error){    
                        console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                        console.log("ajax 실패");
                    },
        });

    });
    // 게시판 관련 이벤트 끝

    // oi_UI 에서 넘어옴
        function mySpaceAppClose(){
            $("#showMyspaces").empty();
            oi.customCam.attachEvent();
            $( "#ww" ).hide( "fold", {}, "slow" );
        }

        function mySpaceAppToggle() {
            $("#showMyspaces").empty();
            $("#ww").toggle("fold");
        };
        
         $("#iconLo1").on("click", function () {
             mySpaceAppToggle();
         });
        
        $("#mySpaceExit").on("click", function () {
             mySpaceAppClose();
         });
    
        //oi.ui에서 넘어옴2 윈도우 draggable 이벤트
        $("#asset").draggable();
        $("#asset").resizable({
            aspectRatio: 16 / 9,
            minHeight: 400,
            minWidth: 400,
            containment: "#content"
        });

        $("#assetExplore").draggable();
        $("#ww").draggable();
        $("#details").draggable();
        $("#playWindow").draggable();
        $("#creatWindow").draggable();

        $("#playFrameDiv").draggable();
        $("#playVideoDiv").draggable();
        $("#blackBoard").draggable();
        // 게시판 드래거블
        $("#commentForm").draggable();
        $("#boardComment").draggable();

        // 오른쪽 메뉴 여닫기-----------------------------------------
        $(function () {
            function menutoggle() {
                var options = {};
                options = {
                    direction: "right"
                };
                $("#sideinfo").toggle("fade", options, 500);
                //$("#button").toggleClass("buttonCloseLo", 500);
            };
            $("#button").on("click", function () {
                menutoggle();
            });
        });


        // 에셋 샵
        //$(function () {
            function assetAppClose() {
                $("#asset").hide("fold", {}, "slow");
            }

            function assetAppToggle() {
                //if ($("#playing_val").val() == "false")
                $("#asset").toggle("fold");
            };

            $("#iconLo2").on("click", function () {
                assetAppToggle();
            });

            $("#assetWindowExit").on("click", function () {
                assetAppClose();
            });
       // })

        // 에셋 익스플로러
       // $(function () {
            function ExploreAppClose() {
                $("#assetExplore").hide("fold", {}, "slow");
            }

            function ExploreAppToggle() {
               // if ($("#playing_val").val() == "false")
                $("#assetExplore").toggle("fold");
            };

            $("#iconLo3").on("click", function () {
            	$("#explorer_exit").off("click");
                $("#explorer_exit").on("click", function () {
                    ExploreAppClose();
                });
                ExploreAppToggle();
            });


       // })
        // 멀티 플레이 버튼
            function playWindowClose() {
            $("#playWindow").hide("fold", {}, "slow");
            }

            function playWindowToggle() {
               // if ($("#playing_val").val() == "false")
            $("#playWindow").toggle("fold");

            if(oi.isMycontents == false)
                {
                    oi.customCam.dettachEvent();
                    oi.isMycontents = true;
                    console.log("hihi" + $("#multiRoomList"));
                //현재 생성되어있는 멀티플레이 룸 들을 받아온다
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

                    // 멀티 플레이 방 새로고침 버튼

	                $("#mulRoomRefresh").off("click");
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

                }
            else
                {
                    oi.isMycontents = false;
                    oi.customCam.attachEvent();
                }
            };

            $("#iconLo7").on("click", function () {
                playWindowToggle();
            });

            $("#playWindow_exit").on("click", function () {
                playWindowClose();
            });
    
    
            function RTCWindowToggle() {
                $("#RTCWindow").toggle("fold");
               // console.log("되는겨마는겨");
            };
    
            $("#iconLo8").on("click", function(){
               // RTCWindowToggle();
                 $("#RTCWindow").toggle("fold");
                 if(oiRTC.isRTCWindow===false){
                     oiRTC.isRTCWindow = true;
                     oi.customCam.dettachEvent(); 
                 }
                 else{
                     oiRTC.isRTCWindow = false;
                     oi.customCam.attachEvent();
                 }
            });
    
            $("#RTCWindow").draggable();
    
            $("#RTCExit").on("click", function(){
                $("#RTCWindow").hide("fold", {}, "slow");
                oiRTC.isRTCWindow = false;
                oi.customCam.attachEvent();
            });
    
    function bind(scope, fn) {
        return function () {
            fn.apply(scope, arguments);
        };
    }
}
