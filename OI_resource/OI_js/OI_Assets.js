/* OI Assets Loading */

AssetsLoader = function()
{
    var oi = this;
    oi.interTarget = [];

    // Furniture ===============================================================
    oi.furnNames = ["bed","chair","lamp","shelf","sofa","table","tv"];
    oi.furnCnts = [2, 2, 2, 2, 2, 2, 2];
                
    // Bed -------------
    oi.bedAsset = [];
    oi.bedCnt = oi.furnCnts[0];
            
    for(var i=0; i<oi.bedCnt; i++){
        oi.bedAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/bed/bed" + i + "/bed.json",function(obj){
                //obj.name = "";
                obj.userData.name = "asset";
                obj.userData.assetName = "bed";
                //console.log(obj.userData);
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    //console.log(obj.children[j]);
                    for(var k=0; k<obj.children[j].children.length; k++){
                        //obj.children[j].children[k].parent = obj;
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    

    // Chair -------------
    oi.chairAsset = [];
    oi.chairCnt = oi.furnCnts[1];
            
    for(var i=0; i<oi.chairCnt; i++){
        oi.chairAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/chair/chair" + i + "/chair.json",function(obj){
                obj.name = "chair";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Lamp -------------
    oi.lampAsset = [];
    oi.lampCnt = oi.furnCnts[2];
    
    for(var i=0; i<oi.lampCnt; i++){
        oi.lampAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/lamp/lamp" + i + "/lamp.json",function(obj){
                obj.name = "lamp";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Shelf -------------
    oi.shelfAsset = [];
    oi.shelfCnt = oi.furnCnts[3];
    
    for(var i=0; i<oi.shelfCnt; i++){
        oi.shelfAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/shelf/shelf" + i + "/shelf.json",function(obj){
                obj.name = "shelf";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Sofa -------------
    oi.sofaAsset = [];
    oi.sofaCnt = oi.furnCnts[4];
            
    for(var i=0; i<oi.sofaCnt; i++){
        oi.sofaAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/sofa/sofa" + i + "/sofa.json",function(obj){
                obj.name = "sofa";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                //oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Table -------------
    oi.tableAsset = [];
    oi.tableCnt = oi.furnCnts[5];
    
    for(var i=0; i<oi.tableCnt; i++){
        oi.tableAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/table/table" + i + "/table.json",function(obj){
                obj.name = "table";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // TV -------------
    oi.tvAsset = [];
    oi.tvCnt = oi.furnCnts[6];
    
    for(var i=0; i<oi.tvCnt; i++){
        oi.tvAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/furniture/tv/tv" + i + "/tv.json",function(obj){
                obj.name = "tv";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Ornament ===============================================================
    oi.ornaNames = ["amp","guitar"];
    oi.ornaCnts = [0,0];
    
    // Amp -------------
    oi.ampAsset = [];
    oi.ampCnt = oi.ornaCnts[0];
    
    for(var i=0; i<oi.ampCnt; i++){
        oi.ampAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/ornament/amp/amp" + i + "/amp.json",function(obj){
                obj.name = "amp";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }

    // Guitar -------------
    oi.guitarAsset = [];
    oi.guitarCnt = oi.ornaCnts[1];
    
    for(var i=0; i<oi.guitarCnt; i++){
        oi.guitarAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/ornament/guitar/guitar" + i + "/guitar.json",function(obj){
                obj.name = "guitar";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
    
    // Structure ===============================================================
    oi.strucNames = ["door"];
    oi.strucCnts = [1];
    
    // Door -------------
    oi.doorAsset = [];
    oi.doorCnt = oi.strucCnts[0];
    
    for(var i=0; i<oi.doorCnt; i++){
        oi.doorAsset[i] = new Promise(function(resolve,reject){
            var loader = new THREE.ObjectLoader();
            loader.load("OI_resource/asset/structure/door/door" + i + "/door.json",function(obj){
                obj.name = "door";
                obj.userData.name = "asset";
                // Smooth Shading ---------------------------------------
                var geo;
                for(var j=0; j<obj.children.length; j++){
                    for(var k=0; k<obj.children[j].children.length; k++){
                        if(obj.children[j].children[k] instanceof THREE.Mesh){
                            geo = obj.children[j].children[k].geometry;
                            geo.computeFaceNormals();
                            geo.mergeVertices()
                            geo.computeVertexNormals();
                        }
                    }
                }
                // ------------------------------------------------------
                oi.interTarget.push(obj);
                resolve(obj);
            });
        });
    }
        
    
}