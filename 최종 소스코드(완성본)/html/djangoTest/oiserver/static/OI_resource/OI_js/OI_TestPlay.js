/* OI TestPlay Driver */
/* Three.js의 Pointer Locker 예제인 misc_controls_pointerlock.html 문서를 참고, 수정하여 제작하였습니다. */

 OI_TestPlay = function (document, mainRoom, frameEvent, videoEvent)
 {
     var oi = this;
     
     oi.isplaying = false;
     
     oi.controls;
     oi.raycaster;
     
     oi.controlsEnabled = false;

     oi.moveForward = false;
     oi.moveBackward = false;
     oi.moveLeft = false;
     oi.moveRight = false;
     oi.canJump = false;
     oi.moveJump = false;
    
     oi.falling = false;
     oi.fframe = 0;
     
     oi.prevTime = performance.now();
     oi.velocity = new THREE.Vector3();
     
     oi.blocker = document.getElementById( 'blocker' );
     oi.instructions = document.getElementById( 'instructions' );
    // oi.havePointerLock= false;
     oi.havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
     
     oi.element = document.body;

     oi.pointerlockchange;
     oi.pointerlockerror;
     
     oi.instructionsClick;

     oi.raycaster = new THREE.Raycaster();
     oi.rayTarget = [];
     oi.isEvent = false;
     
     oi.playSelectedAsset = null;
     oi.prevPos = new THREE.Vector3();
     
    var iscollision=false;
     
     
     if ( oi.havePointerLock ) {
         // console.log(oi.havePointerLock);
        // oi.element = document.body;

         oi.pointerlockchange = function ( event ) {

        if ( document.pointerLockElement === oi.element || document.mozPointerLockElement === oi.element || document.webkitPointerLockElement === oi.element ) {

                oi.controlsEnabled = true;
				oi.controls.enabled = true;

				oi.blocker.style.display = 'none';

					} else {

						oi.controls.enabled = false;

						oi.blocker.style.display = '-webkit-box';
						oi.blocker.style.display = '-moz-box';
						oi.blocker.style.display = 'box';

						oi.instructions.style.display = '';
                        oi.dettachEvent();
					}

				};

				oi.pointerlockerror = function ( event ) {

					oi.instructions.style.display = '';

				};

          
                // console.log("before testplay event attached");
				// Hook pointer lock state change events
         /*
				document.addEventListener( 'pointerlockchange', oi.pointerlockchange, false );
				document.addEventListener( 'mozpointerlockchange', oi.pointerlockchange, false );
				document.addEventListener( 'webkitpointerlockchange', oi.pointerlockchange, false );

				document.addEventListener( 'pointerlockerror', oi.pointerlockerror, false );
				document.addEventListener( 'mozpointerlockerror', oi.pointerlockerror, false );
				document.addEventListener( 'webkitpointerlockerror', oi.pointerlockerror, false );
                console.log("after testplay event attached");
         */
				oi.instructions.addEventListener( 'click', function ( event ) {
					oi.instructions.style.display = 'none';
                    oi.attachEvent();
					// Ask the browser to lock the pointer
					oi.element.requestPointerLock = oi.element.requestPointerLock || oi.element.mozRequestPointerLock || oi.element.webkitRequestPointerLock;
					oi.element.requestPointerLock();

				}, false ); 
  
            
                /*
                oi.instructionsClick = function(event){
                    console.log("zzz");
                    oi.instructions.style.display = 'none';

                    // Ask the browser to lock the pointer
                    oi.element.requestPointerLock = oi.element.requestPointerLock || oi.element.mozRequestPointerLock || oi.element.webkitRequestPointerLock;
                    oi.element.requestPointerLock();

                }
                */
         
			} else {

				oi.instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

			}

            //oi.controls = new THREE.PointerLockControls( mainRoom.camera );
            oi.controls = new THREE.PointerLockControls(
              //  new THREE.PerspectiveCamera(45, mainRoom.windowWidth/mainRoom.windowHeight, 1, 1000)
                mainRoom.tp_camera
            );

		      mainRoom.scene.add( oi.controls.getObject() );

				var onKeyDown = function ( event ) {

					switch ( event.keyCode ) {

						case 38: // up
						case 87: // w
                         //   console.log("w눌렀다");
							oi.moveForward = true;
							break;

						case 37: // left
						case 65: // a
							oi.moveLeft = true; break;

						case 40: // down
						case 83: // s
							oi.moveBackward = true;
							break;

						case 39: // right
						case 68: // d
							oi.moveRight = true;
							break;

						case 32: // space
                          //  console.log("점프했다");
                         //   oi.velocity.y=300;
                            if(oi.canJump){
                                iscollision = false;
                                oi.moveJump = true;
                            }
                                
						//	mainRoom.cam_cube.setLinearVelocity.y=30;//(new THREE.Vector3(0, 30, 0));
							
							break;

					}

				};

				var onKeyUp = function ( event ) {

					switch( event.keyCode ) {

						case 38: // up
						case 87: // w
							oi.moveForward = false;
                   //         mainRoom.cam_cube.setLinearVelocity.z=0;//(new THREE.Vector3(0,0,0));
							break;

						case 37: // left
						case 65: // a
							oi.moveLeft = false;
                 //           mainRoom.cam_cube.setLinearVelocity.x=0;//(new THREE.Vector3(0,0,0));
							break;

						case 40: // down
						case 83: // s
							oi.moveBackward = false;
                 //           mainRoom.cam_cube.setLinearVelocity.z=0;//(new THREE.Vector3(0,0,0));
							break;

						case 39: // right
						case 68: // d
							oi.moveRight = false;
                  //          mainRoom.cam_cube.setLinearVelocity.x=0;//(new THREE.Vector3(0,0,0));
							break;

					}

				};


      //  oi.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
       // oi.velocity.y = 0;
     
     
     
     /* mainRoom cam_cube collisions */
 

     
     mainRoom.cam_cube.addEventListener('collision', function(object){
         //iscollision = true;
         //oi.canJump=true;
         oi.velocity.y=-30;
         
     });
     
     //oi.moveJump=true;
     //oi.fframe=19;
     //oi.falling=true;
   //  var lastPos=new THREE.Vector3();
   //  lastPos.copy(mainRoom.cam_cube.position);
   
      //oi.velocity.y = -30;
        oi.update = function () {
            
            // console.log(oi.controls.getObject().rotation);
            mainRoom.cam_cube.rotation.copy(oi.controls.getObject().rotation);
            mainRoom.cam_cube.__dirtyRotation = true;

            var time = performance.now();
            var delta = ( time - oi.prevTime ) / 100;
            
            var afterPos = new THREE.Vector3();
            afterPos.copy(mainRoom.cam_cube.position);
            var teleport = false;
            
            if( Math.abs(afterPos.x-oi.prevPos.x) > 3 || Math.abs(afterPos.z-oi.prevPos.z) > 3 ){
                // console.log("teleport!!");
                teleport = true;
            }
            
            if(!teleport){
                if(mainRoom.cam_cube._physijs.touches[0]==undefined && !oi.moveJump){
                    oi.velocity.y = -30;
                    oi.canJump=false;
                }
                else{
                    oi.canJump = true;
                    oi.velocity.y = 0;
                }

                oi.velocity.x -= oi.velocity.x * 10.0 * delta;
                oi.velocity.z -= oi.velocity.z * 10.0 * delta;

                var cameraLookVector = oi.controls.getDirection(new THREE.Vector3(0, 0, 0)).clone(); 

                if ( oi.moveForward ){
                    oi.velocity.x += cameraLookVector.x * (2000.0 * delta);
                    oi.velocity.z += cameraLookVector.z * (2000.0 * delta);
                } 
                if ( oi.moveBackward ){
                    oi.velocity.x -= cameraLookVector.x * (2000.0 * delta);
                    oi.velocity.z -= cameraLookVector.z * (2000.0 * delta);
                } 

                if ( oi.moveLeft ){
                    //oi.velocity.x -= (2000.0 * delta);
                    var vectorUp = new THREE.Vector3(0, 1, 0);
                    var coefficient = 2000.0*delta;
                    oi.velocity.x += (new THREE.Vector3().crossVectors(vectorUp,
                                                        cameraLookVector).normalize().multiplyScalar(coefficient)).x;
                    oi.velocity.z += (new THREE.Vector3().crossVectors(vectorUp,
                                                        cameraLookVector).normalize().multiplyScalar(coefficient)).z;
                } 
                if ( oi.moveRight ){
                    //oi.velocity.x += 2000.0 * delta;
                    var vectorUp = new THREE.Vector3(0, -1, 0);
                    var coefficient = 2000.0*delta;
                    oi.velocity.x += (new THREE.Vector3().crossVectors(vectorUp,
                                                        cameraLookVector).normalize().multiplyScalar(coefficient)).x;
                    oi.velocity.z += (new THREE.Vector3().crossVectors(vectorUp,
                                                        cameraLookVector).normalize().multiplyScalar(coefficient)).z;
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
                    oi.controls.getObject().position.x = mainRoom.cam_cube.position.x;
                    oi.controls.getObject().position.y = mainRoom.cam_cube.position.y+15;
                    oi.controls.getObject().position.z = mainRoom.cam_cube.position.z;
                }

            //    lastPos.copy(mainRoom.cam_cube.position);

                // pointer lock ray ----

                oi.rayTarget = [];
                mainRoom.scene.children.forEach(function(obj){
                    oi.rayTarget.push(obj);
                });


                mainRoom.cam_cube.setCcdMotionThreshold(0.01);
                mainRoom.cam_cube.setCcdSweptSphereRadius(1.5);
            }
            else{
                oi.velocity.x = oi.velocity.z = 0;
                oi.moveBackward = oi.moveForward = oi.moveJump = oi.moveLeft = oi.moveRight = false
            }

                 mainRoom.cam_cube.setLinearVelocity(new THREE.Vector3(oi.velocity.x * delta,
                                        oi.velocity.y,
                                        oi.velocity.z * delta));

            oi.prevTime = time;
            oi.prevPos.copy(mainRoom.cam_cube.position);

        }

        var onAssetClick = function ( event ) {
            if(oi.havePointerLock) {
                oi.raycaster.set( oi.controls.getObject().position,
                                 oi.controls.getDirection(new THREE.Vector3()) );
                var intersects = oi.raycaster.intersectObjects( oi.rayTarget, true );
                //console.log(intersects);
                
                if(intersects[0].object.parent.parent !== null && 
                   intersects[0].object.parent.parent.userData.name==="eventAsset"/* &&
                   intersects[0].distance<100*/) {
                    
                    oi.velocity.x = oi.velocity.y = oi.velocity.z = 0;
                    oi.moveForward = oi.moveBackward = oi.moveLeft = oi.moveRight = oi.moveJump = false;

                    oi.isEvent = true;
                    
                    oi.controls.enabled = false;
                    oi.dettachEvent();
                    
                    oi.playSelectedAsset = intersects[0].object.parent.parent;

                    //$("playAssetDiv").css("display", "block");
        
                    // 액자
                    if(intersects[0].object.parent.parent.name.substring(0,2)==="fr"){
                        $("#playFrameDiv").css("display", "block");
                    
                        if($('#isMultiplaying').val() === "true"){ // 멀티 플레이 모드에서 액자 클릭

                            frameEvent.multiFrame(oi.playSelectedAsset);
                        }
                        else{ // 싱글 플레이 모드에서 액자 클릭
                        
                            frameEvent.tpFrame(oi.playSelectedAsset);
                        }
                    }
                    
                    // TV
                    if(intersects[0].object.parent.parent.name.substring(0,2)==="tv"){
                        $("#playVideoDiv").css("display", "block");
                        /*
                        if($('#isMultiplaying').val() === "true"){ // 멀티 플레이 모드에서 TV 클릭 (예비용)
                            videoEvent.multiVideo(oi.playSelectedAsset); }
                        else{ // 싱글 플레이 모드에서 TV 클릭 videoEvent.tpVideo(oi.playSelectedAsset); }
                        */
                        
                        videoEvent.tpVideoInit(oi.playSelectedAsset);
                        
                    }
                    
                    // 입간판
                    if(intersects[0].object.parent.parent.name.substring(0,2)==="bo"){

                        if($("#isVisiting").val()==="true" || $('#isMultiplaying').val() === "true")
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
                                    if(response.postTitle.length == 0)
                                    {
                                        $("#bordList").append('<div id="boardItem" class="card border-primary mb-3"><div class="card-body"><span id="postNum" class="badge badge-light">999</span><h4 id="postName" class="card-title">게시판 기능에 어서오세요 !</h4><div id="cardImageContents"><img class="cardImage" src="static/OI_resource/images/jewel_purple.png" alt="Card image"></div><p id="postContents" class="card-text">글 쓰기 버튼을 통해서 자신의 이야기를 남겨 보세요</p></div><div class="card-header" title="postnum"><small id="postDate" class="text-muted">2018-05-28</small><small id="postAuthor" class="text-muted">관리자 드림</small></div></div>');
                                    }
                                    for(var i=0; i<response.postTitle.length;i++)
                                    {
                                        if(response.imageName[i]=='') // 이미지가 없을경우
                                        {
                                            $("#bordList").append('<div id="boardItem" class="card border-primary mb-3"><div class="card-body"><span id="postNum" class="badge badge-light">'+response.postNum[i]+'</span><h4 id="postName" class="card-title">'+response.postTitle[i]+'</h4><p id="postContents" class="card-text">'+response.postContent[i]+'</p></div><div class="card-header" title="'+response.postNum[i]+'"><span id="postDelete" class="badge badge-info">Delete</span> <small id="postDate" class="text-muted">'+response.postDate[i]+'</small><small id="postAuthor" class="text-muted">'+hostNick+'</small> <span id="postLike" class="badge badge-info">좋아요 '+response.postLike[i]+'</span> <span id="postComment" class="badge badge-info">댓글</span></div></div>');
                                        }
                                        else // 이미지가 있을경우
                                        {
                                            var imageUrl = 'media/'+response.imageName[i]
                                            $("#bordList").append('<div id="boardItem" class="card border-primary mb-3"><div class="card-body"><span id="postNum" class="badge badge-light">'+response.postNum[i]+'</span><h4 id="postName" class="card-title">'+response.postTitle[i]+'</h4><div id="cardImageContents"><img class="cardImage" src="'+imageUrl+'" alt="Card image"></div><p id="postContents" class="card-text">'+response.postContent[i]+'</p></div><div class="card-header" title="'+response.postNum[i]+'"><span id="postDelete" class="badge badge-info">Delete</span> <small id="postDate" class="text-muted">'+response.postDate[i]+'</small><small id="postAuthor" class="text-muted">'+hostNick+'</small> <span id="postLike" class="badge badge-info">좋아요 '+response.postLike[i]+'</span> <span id="postComment" class="badge badge-info">댓글</span></div></div>');                            
                                        }
                                    }     
                                },
                        error: function(request, status, error){    // 통신 실패시
                                    //alert("데이터 저장에 실패했습니다.");
                                    console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error); // 에러시에 디버깅 내용 포함시키기
                                    console.log("ajax 실패");
                                },
                        });
                        $("#blackBoard").css("display", "block");
                    }

                    document.exitPointerLock();
                    
                }
                else {}
            }
        };

     
        oi.divExit = function(){
            oi.isEvent = false;
            
            $("#playFrameDiv").css("display", "none");
            $("#playVideoDiv").css("display", "none");
            
            oi.controls.enabled = true;

            oi.attachEvent();
            // Ask the browser to lock the pointer

            oi.element.requestPointerLock = oi.element.requestPointerLock ||
                                            oi.element.mozRequestPointerLock ||
                                            oi.element.webkitRequestPointerLock;
            oi.element.requestPointerLock();
        }
     
        $("#playFrameExit").click(function() {
            oi.divExit();
        });
        $("#playVideoExit").click(function() {
            oi.divExit();
        });
    
     
    
        oi.attachEvent = function(){
            document.addEventListener( 'pointerlockchange', oi.pointerlockchange, false );
            document.addEventListener( 'mozpointerlockchange', oi.pointerlockchange, false );
            document.addEventListener( 'webkitpointerlockchange', oi.pointerlockchange, false );

            document.addEventListener( 'pointerlockerror', oi.pointerlockerror, false );
            document.addEventListener( 'mozpointerlockerror', oi.pointerlockerror, false );
            document.addEventListener( 'webkitpointerlockerror', oi.pointerlockerror, false );

            document.addEventListener( 'keydown', onKeyDown, false );
            document.addEventListener( 'keyup', onKeyUp, false );

            document.addEventListener('mousedown',onAssetClick,false);
            
    //      oi.instructions.addEventListener( 'click', oi.instructionsClick, false);
            $("#tpEventStatus").val("true");
            console.log("test play event attached");
        }
    
        oi.dettachEvent = function(){
            document.removeEventListener( 'pointerlockchange', oi.pointerlockchange, false );
            document.removeEventListener( 'mozpointerlockchange', oi.pointerlockchange, false );
            document.removeEventListener( 'webkitpointerlockchange', oi.pointerlockchange, false );

            document.removeEventListener( 'pointerlockerror', oi.pointerlockerror, false );
            document.removeEventListener( 'mozpointerlockerror', oi.pointerlockerror, false );
            document.removeEventListener( 'webkitpointerlockerror', oi.pointerlockerror, false );

            document.removeEventListener( 'keydown', onKeyDown, false );
            document.removeEventListener( 'keyup', onKeyUp, false );

            document.removeEventListener('mousedown',onAssetClick,false);
            
        //  oi.instructions.removeEventListener( 'click', oi.instructionsClick, false);
            $("#tpEventStatus").val("false");
            console.log("test play event dettached");
        }
  

        
 }