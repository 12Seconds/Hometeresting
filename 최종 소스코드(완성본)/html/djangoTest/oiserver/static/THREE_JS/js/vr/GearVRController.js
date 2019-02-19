/**
 * @author servinlp
 */

THREE.GearVRController = function () {

	THREE.Object3D.call( this );

	var scope = this;
	var gamepad;

	var axes = [ 0, 0 ];
	var touchpadIsPressed = false;
	var triggerIsPressed = false;
	var angularVelocity = new THREE.Vector3();

	this.matrixAutoUpdate = true;
    
    this.moveForward = false;
    this.moveLeft = false;
    this.moveBackward = false;
    this.moveRight = false;

	function findGamepad() {

		var gamepads = navigator.getGamepads && navigator.getGamepads();

		for ( var i = 0; i < 4; i ++ ) {

			var gamepad = gamepads[ i ];

			if ( gamepad && ( gamepad.id === 'Gear VR Controller' || gamepad.id === 'Oculus Go Controller' ) ) {

				return gamepad;

			}

		}

	}

	this.getGamepad = function () {

		return gamepad;

	};

	this.getTouchpadState = function () {

		return touchpadIsPressed;

	};

	this.update = function () {

		gamepad = findGamepad();

		if ( gamepad !== undefined && gamepad.pose !== undefined ) {

			var pose = gamepad.pose;

			if ( pose === null ) return; // no user action yet

			//  orientation

			if ( pose.orientation !== null ) scope.quaternion.fromArray( pose.orientation );

			scope.updateMatrix();
			scope.visible = true;

			// angular velocity

			if ( pose.angularVelocity !== null && ! angularVelocity.equals( pose.angularVelocity ) ) {

				angularVelocity.fromArray( pose.angularVelocity );
				scope.dispatchEvent( { type: 'angularvelocitychanged', angularVelocity: angularVelocity } );

			}

			// axes (touchpad)
            
            this.moveForward = false;
            this.moveLeft = false;
            this.moveBackward = false;
            this.moveRight = false;
            
			if ( axes[ 0 ] !== gamepad.axes[ 0 ] ) {

				axes[ 0 ] = gamepad.axes[ 0 ];
                
                if(axes[0] < 0)
                    this.moveRight = true;
                else
                    this.moveLeft = true;
				
				scope.dispatchEvent( { type: 'axischanged', axes: axes } );

			}    
            
            if ( axes[ 1 ] !== gamepad.axes[ 1 ] ) {

				axes[ 1 ] = gamepad.axes[ 1 ];
                
                if(axes[1] < 0)
                    this.moveForward = true;
                else
                    this.moveBackward = true;
				
				scope.dispatchEvent( { type: 'axischanged', axes: axes } );

			}    

            
            // || axes[ 1 ] !== gamepad.axes[ 1 ]
            //axes[ 1 ] = gamepad.axes[ 1 ];

            /*
            Array.prototype.forEach.call(navigator.getGamepads(), function (activePad, padIndex) {
                if (activePad.connected) {
                    
                    if (activePad.id.includes("Gear VR")) {
                      // Process buttons and axes for the Gear VR touch panel
                      activePad.buttons.forEach(function (gamepadButton, buttonIndex) {
                        if (buttonIndex === 0 && gamepadButton.pressed && !state.lastButtons[buttonIndex]) {
                          // Handle tap
                        }
                        state.lastButtons[buttonIndex] = gamepadButton.pressed;
                      });

                      activePad.axes.forEach(function (axisValue, axisIndex) {
                            if (axisIndex === 0 && axisValue < 0 && state.lastAxes[axisIndex] >= 0) {
                              // Handle swipe right
                                this.moveRight = true;
                            } else if (axisIndex === 0 && axisValue > 0 && state.lastAxes[axisIndex] <= 0) {
                              // Handle swipe left
                                this.moveLeft = true;
                            } else if (axisIndex === 1 && axisValue < 0 && state.lastAxes[axisIndex] >= 0) {
                              // Handle swipe up
                                this.moveForward = true;
                            } else if (axisIndex === 1 && axisValue > 0 && state.lastAxes[axisIndex] <= 0) {
                              // Handle swipe down
                                this.moveBackward = true;
                            }
                            state.lastAxes[axisIndex] = axisValue;
                      });
                    } else {
                      // This is a connected Bluetooth gamepad which you may want to support in your VR experience
                    }
                }
            });
            */

			// button (touchpad)
            // 요기 건드려야되나??

			if ( touchpadIsPressed !== gamepad.buttons[ 0 ].pressed ) {

				touchpadIsPressed = gamepad.buttons[ 0 ].pressed;
				scope.dispatchEvent( { type: touchpadIsPressed ? 'touchpaddown' : 'touchpadup', axes: axes } );

			}


			// trigger

			if ( triggerIsPressed !== gamepad.buttons[ 1 ].pressed ) {

				triggerIsPressed = gamepad.buttons[ 1 ].pressed;
				scope.dispatchEvent( { type: triggerIsPressed ? 'triggerdown' : 'triggerup' } );

			}

		// app button not available, reserved for use by the browser

		} else {

			scope.visible = false;

		}

	};

	// DEPRECATED

	this.getTouchPadState = function () {

		console.warn( 'THREE.GearVRController: getTouchPadState() is now getTouchpadState()' );
		return touchpadIsPressed;

	};
    
    this.getTriggerBtnState = function(){
		return triggerIsPressed;
    };

	this.setHand = function () {

		console.warn( 'THREE.GearVRController: setHand() has been removed.' );

	};

};

THREE.GearVRController.prototype = Object.create( THREE.Object3D.prototype );
THREE.GearVRController.prototype.constructor = THREE.GearVRController;
