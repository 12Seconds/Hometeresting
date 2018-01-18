    /* OI Event functions */

    OI_Event = function (document, Assets, Preview, Dic, customCam, mainRoom)
    {
        var oi = this;
        var _eventHandlers = {};
        
        oi.document = document;
        oi.Assets = Assets;
        oi.dic = Dic;
        oi.customCam = customCam;
        oi.mainRoom = mainRoom;
        
        oi.isAssetAllocate = false; // 배치버튼 누르면 true로
        oi.isAssetModifying = false; // 수정버튼(에셋) 누르면 true로
        
        // get DIV ========================================================

        // 추가 버튼 div -----------------------------------------
        oi.divAddButton = oi.document.getElementById("addtoScene");
        
        // 공통 div -------------------------------------------------
        oi.divButton = oi.document.getElementById("button");
        oi.divSideinfo = oi.document.getElementById("sideinfo");
      
        oi.divContent = oi.document.getElementById("content");

        // 홈메뉴 div -----------------------------------------------
        oi.divHomeMenu = oi.document.getElementById("homeMenue");
        oi.divIcons = [];
        for(var i=0; i<7; i++)
        {
            oi.divIcons[i] = oi.document.getElementById("iconLo"+(i+1));
        }

        // 에셋 APP div ---------------------------------------------
        oi.assetapp = oi.document.getElementById("asset");
        // 에셋 카테고리 div -----------------------------------------
        oi.divAssetCategory = oi.document.getElementById("assetCategory");
        oi.divCategory = [];
        for(var i=0; i<4; i++)
        {
            oi.divCategory[i] = oi.document.getElementById("categoryLo"+(i+1));
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

        // 공통 div Event =====================================================================



        oi.GoHOME = function()
        {
           // alert("go home");   
            var delDiv = oi.document.getElementById("bucketList");
            while(delDiv.firstChild){
                delDiv.removeChild(delDiv.firstChild);
            }
            oi.divFurns = [];
            oi.divOrnas = [];
            oi.divStrucs = [];
            oi.Preview.sceneReset();
            oi.selectedDiv = null;;
        }
        
        oi.blockClick = function(event){ // contextmenu block
            event.preventDefault();
            if(event.target.id != ""){ // canvas
                oi.customCam.mouseDragOn = false;
            } 
        }
        
        oi.blockDiv = function(event){ // All Div Block and Opacity transparent
            oi.assetapp.style.visibility = 'hidden';

        }
        
        oi.unblockDiv = function(event){  // All Div unBlock
            var assetRemove = [];
            oi.mainRoom.scene.traverse(function(e){
            if(e.getObjectByName("traceAsset"))
                    assetRemove.push(e);
            });
            assetRemove.forEach(function(e){
                oi.mainRoom.scene.remove(e);
            });

            oi.isAssetAllocate=false;
            oi.assetapp.style.visibility = 'visible';
            oi.document.removeEventListener('click',oi.assetAllocate,false);
        }

        // 공통 div Event End =====================================================================

        // 홈메뉴 div Event =====================================================================


        // 홈메뉴 div Event End =====================================================================

        // 에셋카테고리 및 리스트 div Event =====================================================================

        // Asset Click Event (ScreenShot) ---------------------
        oi.assetClick = function(event)
        {
            var targetDiv = event.target;
            //console.log(targetDiv);

            if(targetDiv.children.length > 0){ // 부모 노드 클릭 이벤트
                if(targetDiv.scrollState){
                    targetDiv.scrollState = false;
                    targetDiv.style.height = "7%";
                    for(var i=0; i<targetDiv.children.length; i++){
                        targetDiv.children[i].style.display = "none";
                    }
                }
                else{
                    targetDiv.scrollState = true;
                    targetDiv.style.height = "90%";
                    for(var i=0; i<targetDiv.children.length; i++){
                        targetDiv.children[i].style.display = "block";
                    }
                }
            }
            else // 에셋 스크린샷 div 선택
            {
                oi.selectedDiv = targetDiv;
                oi.dic.assetDic[targetDiv.id].then(function(obj){
                    oi.Preview.sceneReset();
                    var viewAsset = obj.clone();
                    viewAsset.position.set(0,2,0);
                    viewAsset.scale.set(8,8,8);
                    viewAsset.name = "viewAsset";
                    oi.Preview.scene.add(viewAsset);
                });  
            }
        }
        
        // Asset Click Event ( To Modify ) ---------------------
        oi.clickToModify = function(event){
            if(!oi.isAssetAllocate){
                var mouseVector = new THREE.Vector3();
                var raycaster = new THREE.Raycaster();
                
                mouseVector.set( ( event.clientX / window.innerWidth ) * 2 - 1,
                                - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 ); // z = 0.5 important!
                mouseVector.unproject( oi.mainRoom.camera );
                raycaster.set( oi.mainRoom.camera.position, mouseVector.sub( oi.mainRoom.camera.position ).normalize() );
                
                var interTarget = oi.Assets.interTarget.slice(0);
                //oi.mainRoom.floor,oi.mainRoom.ceiling,oi.mainRoom.wall_01,oi.mainRoom.wall_02
                interTarget.splice(interTarget.indexOf(oi.mainRoom.floor),1);
                interTarget.splice(interTarget.indexOf(oi.mainRoom.ceiling),1);
                interTarget.splice(interTarget.indexOf(oi.mainRoom.wall_01),1);
                interTarget.splice(interTarget.indexOf(oi.mainRoom.wall_02),1);

                var intersects = raycaster.intersectObjects(interTarget, true);
    
                if (intersects.length > 0){
                    //console.log(intersects[0].object.parent.parent);
                    oi.selectedAsset = intersects[0].object.parent.parent;
                    if(oi.selectedAsset.parent!==null){
                        oi.isAssetModifying = true;
                        oi.mainRoom.control.attach(intersects[0].object.parent.parent);
                        oi.mainRoom.scene.add(  oi.mainRoom.control );
                    }
                    
                    if(oi.isCtrl){
                    }
                }
            }
        }
        
        // isAssetAllocate 변수 값 바꾸는 버튼 이벤트
          oi.addButtonClick = function(event)
        {
            var target = event.target;
              
            if(oi.selectedDiv !== null){
                if(target.id =="iconimg" && oi.isAssetAllocate==false)
                {
                    oi.isAssetAllocate=true;
                    oi.blockDiv();
                }
            }

        }
        
        // Asset Allocate Mouse Move Event -----------
        oi.Assets.interTarget.push(oi.mainRoom.floor,oi.mainRoom.ceiling,oi.mainRoom.wall_01,oi.mainRoom.wall_02);
        oi.onMouseMove = function(event){
            if(oi.isAssetAllocate){ // if 에셋 배치버튼 누르면
                var mouseVector = new THREE.Vector3();
                var raycaster = new THREE.Raycaster();
                
                mouseVector.set( ( event.clientX / window.innerWidth ) * 2 - 1,
                                - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 ); // z = 0.5 important!
                mouseVector.unproject( mainRoom.camera );
                raycaster.set( mainRoom.camera.position, mouseVector.sub( mainRoom.camera.position ).normalize() );
                
                var intersects = raycaster.intersectObjects(oi.Assets.interTarget, true);
                
                if (intersects.length > 0){
                    //console.log(oi.selectedDiv);
                    var points = intersects[0].point;
                    
                    oi.dic.assetDic[oi.selectedDiv.id].then(function(obj){
                        var traceAsset = obj.clone();
                        traceAsset.position.set(points.x-1.5, points.y+1.5, points.z+1.5); 

                        traceAsset.scale.set(10,10,10);
                        
                        traceAsset.name = "traceAsset";
                        oi.mainRoom.scene.add(traceAsset);
                    });
                    
                    var assetRemove = [];
                    oi.mainRoom.scene.traverse(function(e){
                        if(e.getObjectByName("traceAsset"))
                            assetRemove.push(e);
                    });
                    assetRemove.forEach(function(e){
                        oi.mainRoom.scene.remove(e);
                    });
                }
                oi.document.addEventListener('click',oi.assetAllocate,false); // 에셋 배치 함수
            }
        }
        
        oi.assetAllocate = function(event){
            if(oi.isAssetAllocate){
                var mouseVector = new THREE.Vector3();
                var raycaster = new THREE.Raycaster();
                
                mouseVector.set( ( event.clientX / window.innerWidth ) * 2 - 1,
                                - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 ); // z = 0.5 important!
                mouseVector.unproject( mainRoom.camera );
                raycaster.set( mainRoom.camera.position, mouseVector.sub( mainRoom.camera.position ).normalize() );
                
                var intersects = raycaster.intersectObjects(oi.Assets.interTarget, true);
                
                if (intersects.length > 0){
                    var points = intersects[0].point;
                    
                    oi.dic.assetDic[oi.selectedDiv.id].then(function(obj){
                        var newAsset = obj.clone();
                        newAsset.position.set(points.x-1.5, points.y+1.5, points.z+1.5); 

                        newAsset.scale.set(10,10,10);
                        
                        newAsset.name = oi.selectedDiv.id;
                        
                        oi.Assets.interTarget.push(newAsset);
                        oi.mainRoom.scene.add(newAsset);
                    });
                }
                oi.unblockDiv();
            }
            
        }

        // Furniture Tab -------------------
        oi.categoryLo1Click = function()
        {
           
            oi.divAssetCategory.style.display='none';
            var path = "OI_resource/asset/furniture/";

            for(var i=0; i<oi.Assets.furnNames.length;i++)
            {
                oi.divFurns[i] = oi.document.createElement('DIV'); // DIV 객체 생성
                oi.divFurns[i].setAttribute('id',oi.Assets.furnNames[i]); // id 지정
                oi.divFurns[i].innerHTML=oi.Assets.furnNames[i]; // 객체에 포함할 텍스트

                oi.divFurns[i].setAttribute("style", "background-color:rgba("+i*40+",206,250,0.7);"+
                                                     "overflow-y:auto;"+
                                                     "width:99%; height: 7%;"+
                                                     "border-width:2px; border-color:gray; border-style:solid");
                oi.divBucketList.appendChild(oi.divFurns[i]); // body의 자식 노드로 첨부 (필수)

                oi.divFurns[i].scrollState = false;

                var asset = oi.Assets.furnNames[i];

                for(var j=0; j<oi.Assets.furnCnts[i]; j++)
                {
                    oi.divTemp = oi.document.createElement('DIV');
                    oi.divTemp.scrollState = false;
                    oi.divTemp.setAttribute('id',oi.Assets.furnNames[i]+j);
                    var assetid = oi.Assets.furnNames[i]+j; 
                    oi.divTemp.setAttribute("style","width : 70%; height: 37%;"+
                                                     "margin:5 auto;"+
                                                     "border-radius: 1em 1em 1em 1em;");
                    oi.divTemp.innerHTML='<img id="'+assetid+'" class ="iconimg" src ="'+path+asset+'/'+asset+j+'/'+asset+'.png">';
                    oi.divTemp.style.display = "none";
                    oi.divFurns[i].appendChild(oi.divTemp);
                }

                // oi.divFurns[i] Click Event
                oi.divFurns[i].addEventListener('click',bind(oi,oi.assetClick),false);
            }
            oi.divAssetList.style.display='block';
            oi.Preview.update();
        }

        // Ornament Tab ---------------------
        oi.categoryLo2Click = function() // 장식품 탭 클릭
        {
           
            oi.divAssetCategory.style.display='none';
            var path = "OI_resource/asset/ornament/";

            for(var i=0; i<oi.Assets.ornaNames.length;i++)
            {
                oi.divOrnas[i] = oi.document.createElement('DIV'); // DIV 객체 생성
                oi.divOrnas[i].setAttribute('id',oi.Assets.ornaNames[i]); // id 지정
                oi.divOrnas[i].innerHTML=oi.Assets.ornaNames[i]; // 객체에 포함할 텍스트

                oi.divOrnas[i].setAttribute("style", "background-color:rgba("+i*40+",206,250,0.7);"+
                                                     "overflow-y:auto;"+
                                                     "width:99%; height: 7%;"+
                                                     "border-width:2px; border-color:gray; border-style:solid");
                oi.divBucketList.appendChild(oi.divOrnas[i]); // body의 자식 노드로 첨부 (필수)

                oi.divOrnas[i].scrollState = false;

                var asset = oi.Assets.ornaNames[i];

                for(var j=0; j<oi.Assets.ornaCnts[i]; j++)
                {
                    oi.divTemp = oi.document.createElement('DIV');
                    oi.divTemp.setAttribute('id',oi.Assets.ornaNames[i]+j);
                    var assetid = oi.Assets.ornaNames[i]+j; 
                    oi.divTemp.setAttribute("style", "width : 70%; height: 35%;"+
                                                     "margin:5 auto;"+
                                                     "border-radius: 1em 1em 1em 1em;");
                    oi.divTemp.innerHTML='<img id="'+assetid+'" class ="iconimg" src ="'+path+asset+'/'+asset+j+'/'+asset+'.png">';
                    oi.divTemp.style.display = "none";
                    oi.divOrnas[i].appendChild(oi.divTemp);
                }

                // oi.divOrnas[i] Click Event
                oi.divOrnas[i].addEventListener('click',bind(oi,oi.assetClick),false);
            }
            oi.divAssetList.style.display='block';
            oi.Preview.update();
        }

        // Structure Tab ---------------------
        oi.categoryLo3Click = function() // 구조 탭 클릭
        {
           
            oi.divAssetCategory.style.display='none';
            var path = "OI_resource/asset/structure/";

            for(var i=0; i<oi.Assets.strucNames.length;i++)
            {
                oi.divStrucs[i] = oi.document.createElement('DIV'); // DIV 객체 생성
                oi.divStrucs[i].setAttribute('id',oi.Assets.strucNames[i]); // id 지정
                oi.divStrucs[i].innerHTML=oi.Assets.strucNames[i]; // 객체에 포함할 텍스트

                oi.divStrucs[i].setAttribute("style", "background-color:rgba("+i*40+",206,250,0.7);"+
                                                     "overflow-y:auto;"+
                                                     "width:99%; height: 7%;"+
                                                     "border-width:2px; border-color:gray; border-style:solid");
                oi.divBucketList.appendChild(oi.divStrucs[i]); // body의 자식 노드로 첨부 (필수)

                oi.divStrucs[i].scrollState = false;

                var asset = oi.Assets.strucNames[i];

                for(var j=0; j<oi.Assets.strucCnts[i]; j++)
                {
                    oi.divTemp = oi.document.createElement('DIV');
                    oi.divTemp.setAttribute('id',oi.Assets.strucNames[i]+j);
                    var assetid = oi.Assets.strucNames[i]+j;
                    oi.divTemp.setAttribute("style", "width : 70%; height: 35%;"+
                                                     "margin:5 auto;"+
                                                     "border-radius: 1em 1em 1em 1em;");
                     oi.divTemp.innerHTML='<img id="'+assetid+'" class ="iconimg" src ="'+path+asset+'/'+asset+j+'/'+asset+'.png">';
                    oi.divTemp.style.display = "none";
                    oi.divStrucs[i].appendChild(oi.divTemp);
                }

                // oi.divStrucs[i] Click Event
                oi.divStrucs[i].addEventListener('click',bind(oi,oi.assetClick),false);
            }
            oi.divAssetList.style.display='block';
            oi.Preview.update();
        }

        oi.assetBackArrow = function(){
            //alert("backArrow");
            oi.divAssetCategory.style.display = "block";
            oi.divAssetList.style.display='none';

            var delDiv = oi.document.getElementById("bucketList");
            while(delDiv.firstChild){
                delDiv.removeChild(delDiv.firstChild);
            }
            oi.divFurns = [];
            oi.divOrnas = [];
            oi.divStrucs = [];
            oi.Preview.sceneReset();
            oi.selectedDiv = null;
        }
        
        oi.onDocumentKeyUp = function(event)
        {
             switch(event.keyCode)
             {

                    case 27: // ESC Key
                        if(oi.isAssetAllocate)
                        {
                            oi.unblockDiv();
                        }
                        break;
             }
            
            if(oi.isAssetModifying)
            {
                switch(event.keyCode)
                {
                    case 32: // Space bar
                    oi.mainRoom.control.setSpace( oi.mainRoom.control.space === "local" ? "world" : "local" );
                break; 
                        
                    case 90: // Z
                oi.mainRoom.control.setMode( "translate" );
                break;
                            
                case 88: // X
                oi.mainRoom.control.setMode( "rotate" );
                break;
                            
                case 67: // C
                oi.mainRoom.control.setMode( "scale" );
                break;
                    
                    case 27: // ESC
                    oi.mainRoom.control.setMode( "translate" );  
                    oi.mainRoom.control.detach();
                    oi.mainRoom.scene.remove( oi.mainRoom.control );
                    oi.isAssetModifying = false;
                    
                    break;
                        
                    case 46: // Delete
                        oi.mainRoom.scene.remove(oi.selectedAsset);
                        oi.isAssetModifying = false;
                        oi.mainRoom.control.detach();
                        oi.mainRoom.scene.remove( oi.mainRoom.control );
                        oi.selectedAsset = null;
                        break;
                        
                        /*
                    case 17: // Ctrl
                        oi.isCtrl = false;
                        break;
                        */
                        
                }
            }
        }
        
        /*
        oi.onDocumentKeyDown = function(event)
        {
            switch(event.keyCode){
                case 17: //Ctrl
                    oi.isCtrl = true;
                    break;
            }
        }
        */
        // SAVE & LOAD 임시 
        oi.iconLo5Click = function() // 테스트 저장 함수
        {
            var sceneManager = new SceneManager("user1");
            
            sceneManager.sceneSave(oi.mainRoom.scene);
        }
        
        oi.iconLo6Click = function() // 테스트 불러오기 함수
        {
            var sceneManager = new SceneManager("user1");
            
            sceneManager.sceneLoad(oi);
        }
        
        
        
      
        //  아이콘 이벤트 함수
        oi.IconOver = function(){ oi.divIcons[0].style.opacity='0.8';}
        oi.IconOut = function()  { oi.divIcons[0].style.opacity='1';}
        oi.IconDown = function() { oi.divIcons[0].style.opacity='1';}
        oi.IconUp = function()   { oi.divIcons[0].style.opacity='0.8';}
        
        oi.addButtonOver =function(){oi.divAddButton.style.opacity='0.8';}
        oi.addButtonOut =function(){oi.divAddButton.style.opacity='1';}
        oi.addButtonDown =function(){oi.divAddButton.style.opacity='1';}
        oi.addButtonUp =function(){oi.divAddButton.style.opacity='0.8';}

        oi.backArrowOver =function(){oi.divBackArrow.style.opacity='0.8';}
        oi.backArrowOut =function(){oi.divBackArrow.style.opacity='1';}
        oi.backArrowDown =function(){oi.divBackArrow.style.opacity='1';}
        oi.backArrowUp =function(){oi.divBackArrow.style.opacity='0.8';}

        
        oi.Category1Over =function(){oi.divCategory[0].style.opacity='0.8';}
        oi.Category1Out =function(){oi.divCategory[0].style.opacity='1';}
        oi.Category1Down =function(){oi.divCategory[0].style.opacity='1';}
        oi.Category1UP =function(){oi.divCategory[0].style.opacity='0.8';}

        oi.Category2Over =function(){oi.divCategory[1].style.opacity='0.8';}
        oi.Category2Out =function(){oi.divCategory[1].style.opacity='1';}
        oi.Category2Down =function(){oi.divCategory[1].style.opacity='1';}
        oi.Category2UP =function(){oi.divCategory[1].style.opacity='0.8';}
       
        oi.Category3Over =function(){oi.divCategory[2].style.opacity='0.8';}
        oi.Category3Out =function(){oi.divCategory[2].style.opacity='1';}
        oi.Category3Down =function(){oi.divCategory[2].style.opacity='1';}
        oi.Category3UP =function(){oi.divCategory[2].style.opacity='0.8';}
       
        
        
        // 에셋카테고리 및 리스트 div Event End =====================================================================

        // Add Event Listener ===========================================================================
        
        // 공통 Event Listener -------------------------- 
    
        oi.divContent.addEventListener('click',bind(oi,oi.clickToModify), false);
        
        oi.divButton.addEventListener( 'contextmenu', bind(oi,oi.blockClick), false );
        oi.divContent.addEventListener('contextmenu', bind(oi,oi.blockClick), false );
        oi.divSideinfo.addEventListener('contextmenu', bind(oi,oi.blockClick), false );
        oi.document.addEventListener('mousemove',bind(oi,oi.onMouseMove), false);
        oi.document.addEventListener('keyup',oi.onDocumentKeyUp, false);
        //oi.document.addEventListener('keydown',oi.onDocumentKeyDown, false);
        
        // SAVE & LOAD 임시
        oi.divIcons[4].addEventListener("click", bind( oi, oi.iconLo5Click), false);   // save 테스트 버튼
        oi.divIcons[5].addEventListener("click", bind( oi, oi.iconLo6Click), false);   // load 테스트 버튼
        
        
        
        
        
        // 에셋 카테고리 및 리스트 Event Listener -------------------
        oi.divCategory[0].addEventListener('click',bind(oi, oi.categoryLo1Click), false); // furniture category
        oi.divCategory[1].addEventListener('click',bind(oi, oi.categoryLo2Click), false); // ornament category
        oi.divCategory[2].addEventListener('click',bind(oi, oi.categoryLo3Click), false); // structure category
        oi.divBackArrow.addEventListener('click',bind(oi,oi.assetBackArrow),false); // asset list back arrow
        oi.divAddButton.addEventListener('click',bind(oi,oi.addButtonClick), false); // 에셋 배치 버튼
        // 아이콘 오버 + 아웃 효과  Event Listener ------------------------
      
        //-애셋 아이콘
        oi.divIcons[0].addEventListener('mouseover',bind(oi,oi.IconOver),false);
        oi.divIcons[0].addEventListener('mouseout',bind(oi,oi.IconOut),false);
        oi.divIcons[0].addEventListener('mousedown',bind(oi,oi.IconDown),false);
        oi.divIcons[0].addEventListener('mouseup',bind(oi,oi.IconUp),false);
        //-추가 버튼
        oi.divAddButton.addEventListener('mouseover',bind(oi,oi.addButtonOver),false);
        oi.divAddButton.addEventListener('mouseout',bind(oi,oi.addButtonOut),false);
        oi.divAddButton.addEventListener('mousedown',bind(oi,oi.addButtonDown),false);
        oi.divAddButton.addEventListener('mouseup',bind(oi,oi.addButtonUp),false);
        //- 뒤로가기 버튼
        oi.divBackArrow.addEventListener('mouseover',bind(oi,oi.backArrowOver),false);
        oi.divBackArrow.addEventListener('mouseout',bind(oi,oi.backArrowOut),false);
        oi.divBackArrow.addEventListener('mousedown',bind(oi,oi.backArrowDown),false);
        oi.divBackArrow.addEventListener('mouseup',bind(oi,oi.backArrowUp),false);
        
        //- 카테고리 버튼
        oi.divCategory[0].addEventListener('mouseover',bind(oi,oi.Category1Over),false);
        oi.divCategory[0].addEventListener('mouseout',bind(oi,oi.Category1Out),false);
        oi.divCategory[0].addEventListener('mousedown',bind(oi,oi.Category1Down),false);
        oi.divCategory[0].addEventListener('mouseup',bind(oi,oi.Category1Up),false);
        
        oi.divCategory[1].addEventListener('mouseover',bind(oi,oi.Category2Over),false);
        oi.divCategory[1].addEventListener('mouseout',bind(oi,oi.Category2Out),false);
        oi.divCategory[1].addEventListener('mousedown',bind(oi,oi.Category2Down),false);
        oi.divCategory[1].addEventListener('mouseup',bind(oi,oi.Category2Up),false);
        
        oi.divCategory[2].addEventListener('mouseover',bind(oi,oi.Category3Over),false);
        oi.divCategory[2].addEventListener('mouseout',bind(oi,oi.Category3Out),false);
        oi.divCategory[2].addEventListener('mousedown',bind(oi,oi.Category3Down),false);
        oi.divCategory[2].addEventListener('mouseup',bind(oi,oi.Category3Up),false);
        
    //    oi.divCategory[3].addEventListener('mouseover',bind(oi,oi.Category4Over),false);
    //    oi.divCategory[3].addEventListener('mouseout',bind(oi,oi.Category4Out),false);
    //    oi.divCategory[3].addEventListener('mousedown',bind(oi,oi.Category4Down),false);
    //    oi.divCategory[3].addEventListener('mouseup',bind(oi,oi.Category4Up),false);
        
        function bind( scope, fn ) {
          return function () {
             fn.apply( scope, arguments );
          };
       }
    }