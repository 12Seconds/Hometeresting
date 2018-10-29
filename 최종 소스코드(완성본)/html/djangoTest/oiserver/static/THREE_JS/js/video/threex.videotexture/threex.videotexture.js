var THREEx = THREEx || {}

THREEx.VideoTexture	= function(url){
	// create the video element
	var video	= document.createElement('video');
	video.width	= 320;
	video.height	= 240;
	video.autoplay	= false;
	video.loop	= false;
	video.src	= url;
	// expose video as this.video
	this.video	= video

	// create the texture
	var texture	= new THREE.Texture( video );
    
    // 추가
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
	// expose texture as this.texture
	this.texture	= texture

	/**
	 * update the object
	 */
	this.update	= function(){
		if( video.readyState !== video.HAVE_ENOUGH_DATA )	return;
		texture.needsUpdate	= true;
	}

	/**
	 * destroy the object
	 */
	this.destroy	= function(){
		video.pause()
	}
}