/**
 * 이 카메라는 Odd-Idea 에서 제작한 카메라로
 * FirstPersonControl, OrbitControl, FuctureFreeCamera를 바탕으로
 * 제작된 커스텀 카메라 입니다.
 */

/**
Copyright (c) 2016 fucture
Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:
The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

THREE.OddIdeaCamera = function ( camera, domElement ) {

	var oi = this;

	oi.oicam = camera;
	oi.oicam.lookAt ( new THREE.Vector3(0,0,0) );
	oi.domElement = ( domElement !== undefined ) ? domElement : document;
	oi.mouseDragOn = false;
	oi.speed = 0;
	oi.speedin = 1;
	oi.mousesens = 20;

	oi.decelerationMove = 0.5;
	oi.decelerationRotate = 0.7;

	oi.lastMovement = "";

	oi.rotationRightSpeed = 0;
	oi.rotationLeftSpeed = 0;
	oi.rotationDownSpeed = 0;
	oi.rotationUpSpeed = 0;

	oi.h = 0;
	oi.v = 0;

	Number.prototype.map = function ( in_min , in_max , out_min , out_max ) {
		return ( this - in_min ) * ( out_max - out_min ) / ( in_max - in_min ) + out_min;
	};

	if ( oi.domElement === document ) {
		oi.viewHalfX = window.innerWidth / 2;
		oi.viewHalfY = window.innerHeight / 2;
	} else {
		oi.viewHalfX = oi.domElement.offsetWidth / 2;
		oi.viewHalfY = oi.domElement.offsetHeight / 2;
		oi.domElement.setAttribute( 'tabindex', -1 );
	}

	oi.onMouseDown = function ( event ) {
		if ( oi.domElement !== document ) {
			oi.domElement.focus();
		}
		event.preventDefault();
		event.stopPropagation();
        
        switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
                case 2:
                    oi.mouseDragOn = true;
                    break;
			}
	};

	oi.onMouseUp = function ( event ) {
		event.preventDefault();
		event.stopPropagation();

			switch ( event.button ) {
				//case 0: intercept left mouse button; break;
				//case 2: intercept right mouse button;  break;
                case 2:
                    oi.mouseDragOn = false;
                    break;
			}
	};

	oi.onMouseMove = function ( event ) {

		if ( oi.domElement === document ) {
			oi.mouseX = event.pageX - oi.viewHalfX;
			oi.mouseY = event.pageY - oi.viewHalfY;
		} else {
			oi.mouseX = event.pageX - oi.domElement.offsetLeft - oi.viewHalfX;
			oi.mouseY = event.pageY - oi.domElement.offsetTop - oi.viewHalfY;
		}
	};

	oi.onKeyDown = function ( event ) {
		oi.speed = oi.speedin;
		switch( event.keyCode ) {
			case 87: /*W*/ oi.moveForward = true; oi.lastMovement = "moveForward"; break;
			case 65: /*A*/ oi.moveLeft = true; oi.lastMovement = "moveLeft"; break;
			case 83: /*S*/ oi.moveBackward = true; oi.lastMovement = "moveBackward"; break;
			case 68: /*D*/ oi.moveRight = true; oi.lastMovement = "moveRight"; break;
			case 81: /*Q*/ oi.moveUp = true; oi.lastMovement = "moveUp"; break;
			case 69: /*E*/ oi.moveDown = true; oi.lastMovement = "moveDown"; break;
            default: oi.lastMovement="freeze"; break;
		}
	};

	oi.onKeyUp = function ( event ) {
		switch( event.keyCode ) {
			case 87: /*W*/ oi.moveForward = false; break;
			case 65: /*A*/ oi.moveLeft = false; break;
			case 83: /*S*/ oi.moveBackward = false; break;
			case 68: /*D*/ oi.moveRight = false; break;
			case 81: /*Q*/ oi.moveUp = false; break;
			case 69: /*E*/ oi.moveDown = false; break;
            default: oi.freeze = !oi.freeze; break;
		}
	};

	oi.update = function() {
		makeRotations();
		//var vectorZ = ffc.freecam.worldToLocal(new THREE.Vector3(ffc.freecam.position.x, ffc.freecam.position.y, ffc.freecam.position.z + 1));
        
        var vectorZ = oi.oicam.worldToLocal(new THREE.Vector3(oi.oicam.position.x, oi.oicam.position.y+1, oi.oicam.position.z));
        
		oi.oicam.rotateOnAxis(vectorZ, oi.rotationLeftSpeed);
		oi.oicam.rotateOnAxis(vectorZ, -oi.rotationRightSpeed);
        
		oi.oicam.rotateOnAxis(new THREE.Vector3(1,0,0), oi.rotationUpSpeed);
		oi.oicam.rotateOnAxis(new THREE.Vector3(1,0,0), -oi.rotationDownSpeed);
		makeMovements(vectorZ);
	};

	function makeMovements(vectorZ){
		var hasMovement = false;
		if( oi.moveForward ){
			oi.oicam.translateZ ( -oi.speed );
			hasMovement = true;
		} else if( oi.moveBackward){
			oi.oicam.translateZ ( oi.speed );
			hasMovement = true;
		}
		if( oi.moveLeft ){
			oi.oicam.translateX( -oi.speed );
			hasMovement = true;
		} else if( oi.moveRight){
			oi.oicam.translateX( oi.speed );
			hasMovement = true;
		}
		if( oi.moveUp ){
			//ffc.freecam.translateOnAxis(vectorZ, ffc.speed);
            oi.oicam.translateY( oi.speed );
			hasMovement = true;
		} else if( oi.moveDown){
			//ffc.freecam.translateOnAxis(vectorZ, -ffc.speed);
            oi.oicam.translateY( -oi.speed );
			hasMovement = true;
		}
		if(!hasMovement) {
			decelerateMovement(vectorZ);
		}
	}

	function decelerateMovement(vectorZ){
		oi.speed *= oi.decelerationMove;
		switch( oi.lastMovement ) {
			case "moveForward":
				oi.oicam.translateZ ( -oi.speed );
				break;
			case "moveLeft":
				oi.oicam.translateX( -oi.speed );
				break;
			case "moveBackward":
				oi.oicam.translateZ ( oi.speed );
				break;
			case "moveRight":
				oi.oicam.translateX( oi.speed );
				break;
			case "moveUp":
                oi.oicam.translateY( oi.speed );
				break;
			case "moveDown":
                oi.oicam.translateY( -oi.speed );
				break;
		}
	}

	function makeRotations(){
		if(oi.mouseDragOn == true){
            // 좌우 드래그
			var differX = oi.previousMouseX - oi.mouseX;
            
			if (oi.previousMouseX - oi.mouseX < 0)
			{
				oi.rotationRightSpeed = differX.map(-100, -1, 0.2, 0.005);
				oi.h -= oi.rotationRightSpeed;
			}
			if (oi.previousMouseX - oi.mouseX > 0)
			{
				oi.rotationLeftSpeed = differX.map(1, 100, 0.005, 0.2);
				oi.h += oi.rotationLeftSpeed;
			}
            
            // 위아래 드래그
			var differY = oi.previousMouseY - oi.mouseY;
			if (oi.previousMouseY - oi.mouseY < 0)
			{
				oi.rotationDownSpeed = differY.map(-100, -1, 0.2, 0.005);
				oi.v -= oi.rotationDownSpeed;
			}
			if (oi.previousMouseY - oi.mouseY > 0)
			{
				oi.rotationUpSpeed = differY.map(1, 100, 0.01, 0.3);
				oi.v += oi.rotationUpSpeed;
			}
            
		}

		if (oi.rotationRightSpeed > 0.0001)
		{
			oi.rotationRightSpeed *= oi.decelerationRotate;
		}
		else
		{
			oi.rotationRightSpeed = 0;
		}
		if (oi.rotationLeftSpeed > 0.0001)
		{
			oi.rotationLeftSpeed *= oi.decelerationRotate;
		}
		else
		{
			oi.rotationLeftSpeed = 0;
		}
		if (oi.rotationDownSpeed > 0.0001)
		{
			oi.rotationDownSpeed *= oi.decelerationRotate;
		}
		else
		{
			oi.rotationDownSpeed = 0;
		}
		if (oi.rotationUpSpeed > 0.0001)
		{
			oi.rotationUpSpeed *= oi.decelerationRotate;
		}
		else
		{
			oi.rotationUpSpeed = 0;
		}

		oi.h -= oi.rotationRightSpeed;
		oi.h += oi.rotationLeftSpeed;

		oi.v -= oi.rotationDownSpeed;
		oi.v += oi.rotationUpSpeed;

		oi.previousMouseX = oi.mouseX;
		oi.previousMouseY = oi.mouseY;
	}
    /*
	oi.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	oi.domElement.addEventListener( 'mousemove', bind( oi, oi.onMouseMove ), false );
	oi.domElement.addEventListener( 'mousedown', bind( oi, oi.onMouseDown ), false );
	oi.domElement.addEventListener( 'mouseup', bind( oi, oi.onMouseUp ), false );
	oi.domElement.addEventListener( 'keydown', bind( oi, oi.onKeyDown ), false );
	oi.domElement.addEventListener( 'keyup', bind( oi, oi.onKeyUp ), false );

    */
    window.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	window.addEventListener( 'mousemove', bind( oi, oi.onMouseMove ), false );
	window.addEventListener( 'mousedown', bind( oi, oi.onMouseDown ), false );
	window.addEventListener( 'mouseup', bind( oi, oi.onMouseUp ), false );
	window.addEventListener( 'keydown', bind( oi, oi.onKeyDown ), false );
	window.addEventListener( 'keyup', bind( oi, oi.onKeyUp ), false );

    

	function bind( scope, fn ) {
		return function () {
			fn.apply( scope, arguments );
		};
	}
};