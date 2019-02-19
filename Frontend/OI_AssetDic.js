    /* OI Asset Dictionary functions */

OI_AssetDic = function (Assets)
{
    var oi = this;
    oi.Assets = Assets;
    oi.assetDic = {};
    
    // Furniture Dictionary --------------------------------
    for(var i=0; i<oi.Assets.furnNames.length; i++){
        var targetAsset = oi.Assets.furnNames[i];
 
        switch(targetAsset){ // dictionary ( ex ---> bed0 Mapping oi.Assets.bedAsset[0] )
            case "bed":
                for(var j=0; j<oi.Assets.bedCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.bedAsset[j];
                }
                break;
                
            case "chair":
                for(var j=0; j<oi.Assets.chairCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.chairAsset[j];
                }
                break;
            
            case "lamp":
                for(var j=0; j<oi.Assets.lampCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.lampAsset[j];
                }
                break;
                
            case "shelf":
                for(var j=0; j<oi.Assets.shelfCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.shelfAsset[j];
                }
                break;
            
            case "sofa":
                for(var j=0; j<oi.Assets.sofaCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.sofaAsset[j];
                }
                break;
            
            case "table":
                for(var j=0; j<oi.Assets.tableCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.tableAsset[j];
                }
                break;
                
            case "tv":
                for(var j=0; j<oi.Assets.tvCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.tvAsset[j];
                }
                break;
        }
    }
    
    // Ornament Dictionary --------------------------------
    for(var i=0; i<oi.Assets.ornaNames.length; i++){
        var targetAsset = oi.Assets.ornaNames[i];
        
        switch(targetAsset){  // dictionary ( ex ---> amp0 Mapping oi.Assets.ampAsset[0] )
            case "frame":
                for(var j=0; j<oi.Assets.frameCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.frameAsset[j];
                }
                break;
            case "board":
                for(var j=0; j<oi.Assets.boardCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.boardAsset[j];
                }
                break;
                /*
            case "amp":
                for(var j=0; j<oi.Assets.ampCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.ampAsset[j];
                }
                break;
                
            case "guitar":
                for(var j=0; j<oi.Assets.guitarCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.guitarAsset[j];
                }
                break;
                */
        }
    }
    
    // Structure Dictionary --------------------------------
    for(var i=0; i<oi.Assets.strucNames.length; i++){
        var targetAsset = oi.Assets.strucNames[i];
        
        switch(targetAsset){  // dictionary ( ex ---> door0 Mapping oi.Assets.doorAsset[0] )
            case "door":
                for(var j=0; j<oi.Assets.doorCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.doorAsset[j];
                }
                break;
            case "basic":
                for(var j=0; j<oi.Assets.basicCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.basicAsset[j];
                }
                break;
            case "cam_cube":
                for(var j=0; j<oi.Assets.camCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.camCubeAsset[j];
                }
                break;
            case "light":
                for(var j=0; j<oi.Assets.lightCnt; j++){
                    oi.assetDic[targetAsset+j] = oi.Assets.lightAsset[j];
                }
                break;    
        }
    }
    
    // cam_cube
    
    
}