/* OI Scene Save & Load Manager */

SceneManager = function(userID)
{
    var oi = this;
    
    oi.user = userID;
  //  oi.Assets = oiAssets;
    
    /* Save Json */
    oi.sceneSave = function(scene)
    { 
        
        console.log(scene);
        //  console.log(obj.children[1].position.x);   *됨
                
        var sceneInfo = new Object();
        
        sceneInfo.level = 1;
        sceneInfo.owner = userID;
        sceneInfo.sceneID = userID+"-NS01"; // userid + Normal Scene 01, 02, 03 ...
      //sceneInfo.sceneType = "normal";

        var assetArray = new Array();

       // assetArray.push(); // ??...왜있지
        
        $.each(scene.children, function(key, value){
            
            if(scene.children[key].name!=""){ // 씬의 차일드중 이름이 공백이 아닌 에셋이면 저장
                var s_obj = new Object();
                var tmp1, tmp2, tmp3;
                
                console.log(scene.children[key].name);
                
                s_obj.name = scene.children[key].name;
                
                tmp1 = JSON.stringify(scene.children[key].position.x);
                tmp2 = JSON.stringify(scene.children[key].position.y);
                tmp3 = JSON.stringify(scene.children[key].position.z);
                
                s_obj.position = tmp1+","+tmp2+","+tmp3;
                
                tmp1 = JSON.stringify(scene.children[key].rotation.x);
                tmp2 = JSON.stringify(scene.children[key].rotation.y);
                tmp3 = JSON.stringify(scene.children[key].rotation.z);
                
                s_obj.rotation = tmp1+","+tmp2+","+tmp3;
                
                tmp1 = JSON.stringify(scene.children[key].scale.x);
                tmp2 = JSON.stringify(scene.children[key].scale.y);
                tmp3 = JSON.stringify(scene.children[key].scale.z);
                
                s_obj.scale = tmp1+","+tmp2+","+tmp3;
                
                assetArray.push(s_obj);
            }
        });
    
        sceneInfo.assets = assetArray;
        
        var Info = JSON.stringify(sceneInfo, null, "\t");
        console.log(Info);
        
        localStorage.setItem('myStorage', Info);
        
        // 테스트용 클리어 함수
<<<<<<< HEAD
        oi.sceneReset(scene);
=======
       // oi.sceneReset(scene);
        
        
        
>>>>>>> dev_Bae
    }

    /* load Json */ // 테스트용, room type에 따른 씬 로드 수정 필요 
    oi.sceneLoad = function(oii)
    {   
        var s_obj = JSON.parse(localStorage.getItem('myStorage')); // s_obj : scene obeject
        console.log(s_obj);
        console.log(s_obj.sceneID);
        
       
        var XYZ = s_obj.assets[0].position;
        console.log(XYZ);

        var jbSplit = XYZ.split(',');
        for ( var i in XYZ ) {
            console.log(jbSplit[i]);
          //  document.write( '<p>' + jbSplit[i] + '</p>' );
        }
    
        /* //되는거1
        $.each(s_obj.assets, function(index, value){
            oii.dic.assetDic[s_obj.assets[index].name].then(function(obj){
                
            var tmp, position, scale, rotation; // XYZ parsing
                
            tmp = s_obj.assets[index].position;
            position = tmp.split(',');
            tmp = s_obj.assets[index].scale;
            scale = tmp.split(',');
            tmp = s_obj.assets[index].rotation;
            rotation = tmp.split(',');
            
            var newAsset = obj.clone();
            newAsset.position.set(Number(position[0]),Number(position[1]),Number(position[2])); 
            newAsset.rotation.set(Number(rotation[0]),Number(rotation[1]),Number(rotation[2]));
            newAsset.scale.set(Number(scale[0]),Number(scale[1]),Number(scale[2]));
                        
            newAsset.name = s_obj.assets[index].name;
                        
            oii.Assets.interTarget.push(newAsset);
            oii.mainRoom.scene.add(newAsset);
            });
         
        });
        */
        /////////////
         //되는거 2
        s_obj.assets.forEach(
            function addNumber(value) {
             // console.log(value.position); 
                var tmp, position, scale, rotation; // XYZ parsing

                tmp = value.position;
                console.log('포지션'+tmp);
                position = tmp.split(',');
                console.log('x:'+position[0]+'y:'+position[1]+'z:'+position[2]);   
                
                tmp = value.rotation;
                console.log(tmp);
                rotation = tmp.split(',');
                
                tmp = value.scale;
                console.log(tmp);
                scale = tmp.split(',');
                
                oii.dic.assetDic[value.name].then(function(obj){
                    var newAsset = obj.clone();
                    newAsset.position.set(Number(position[0]),Number(position[1]),Number(position[2])); 
                    newAsset.rotation.set(Number(rotation[0]),Number(rotation[1]),Number(rotation[2]));
                    newAsset.scale.set(Number(scale[0]),Number(scale[1]),Number(scale[2]));
                    newAsset.name = value.name;

                    oii.Assets.interTarget.push(newAsset);
                    oii.mainRoom.scene.add(newAsset);
                });
            }
        );

    }
    
    // 테스트용 클리어 함수
    oi.sceneReset = function(scene)
    {
        var size = scene.children.length;
        for(var i=1; i<=size;i++)
        {
            scene.remove(scene.children[1]); // scene.children[0] 은 기본 골격 그룹
        }
    }
    
}