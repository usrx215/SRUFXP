//-----------------------------------------------------------------------------
// Plugin.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
 
/**
 *@file            PlugIn.js
 *@brief         TV PlugIn 함수를 rapping 한 파일
 *@author      삼성 SDS, ESDM개발, 김성태선임
 *@date         2009.03.24
 */
if (this.Common == null) {
    this.Common = new Object();
}
if (this.Common.API == null) {
    this.Common.API = new Object();
}

Common.API.Plugin = function(){
    var $THIS$ = this;
    var $TVMW_PLUGIN$ = document.getElementById("pluginObjectTVMW");
    var bWatchDog = true;
    
    var PLR_TRUE = 1;
    var PLR_FALSE = 0;
	var PL_CMN_INFO_VERSION = 0;
    
	var Plugin = {
		TVMW : {		'nEnum' : 0,		'Object' : null,		'strVersion' : null		},
		VIDEO : {		'nEnum' : 1,		'Object' : null,		'strVersion' : null		}
	}
	
	function checkInit(pEnumPlugin) {
		var bRetValue = false;
		switch(pEnumPlugin) {
			case Plugin.TVMW.nEnum : 
				if (Plugin.TVMW.Object) {
					bRetValue = true;
				}
				break;
			case Plugin.VIDEO.nEnum :
				if (Plugin.VIDEO.Object) {
					bRetValue = true;
				}
				break;
			default : 
				break;
		}
		if (!bRetValue) {
			bRetValue = init(pEnumPlugin);
		}
		return bRetValue;
	}
	
	function init(pEnumPlugin) {
		var bRetValue = true;
		switch(pEnumPlugin) {
			case Plugin.TVMW.nEnum : 
				Plugin.TVMW.Object = document.getElementById("pluginObjectTVMW");
				if (!Plugin.TVMW.Object) {
					bRetValue = false;
				} else {
					Plugin.TVMW.strVersion = Plugin.TVMW.Object.GetPluginInfo(PL_CMN_INFO_VERSION);
				}
				break;
			case Plugin.VIDEO.nEnum:
				Plugin.VIDEO.Object  = document.getElementById("pluginObjectVideo");
				if (!Plugin.VIDEO.Object) {
					bRetValue = false;
				} else {
					Plugin.VIDEO.strVersion = Plugin.VIDEO.Object.GetPluginInfo(PL_CMN_INFO_VERSION);
				}
				break;
			default : 
				break;
		}
		if (!bRetValue) {
			alert("Common.API.PlugIn >> Plugin is not embeded yet. Check out index.html", 0);
		}
		return bRetValue;
	}
	
    /**
     * @brief             WatchDog 기능을 On 한다.
     * @remarks       WatchDog 기능을 On 한다.
     */
    this.setOnWatchDog = function(){
		if (!checkInit(Plugin.TVMW.nEnum)) return;
        alert("Common.API.PlugIn >> setOnWatchDog");
        if (!bWatchDog) {
            Plugin.TVMW.Object.SetWatchDog(PLR_TRUE);
        }
        bWatchDog = true;
    }
    
    /**
     * @brief             WatchDog 기능을 On 한다.
     * @remarks       WatchDog 기능을 On 한다.
     */
    this.setOffWatchDog = function(){
		if (!checkInit(Plugin.TVMW.nEnum)) return;
        alert("Common.API.PlugIn >> setOffWatchDog");
        if (bWatchDog) {
            Plugin.TVMW.Object.SetWatchDog(PLR_FALSE);
        }
        bWatchDog = false;
    }
	
    /**
     * @brief			Set OSDState On
     * @remarks		Set OSDState On
     */
	this.setOnOSDState = function(left, top, width, height){
		if (!checkInit(Plugin.VIDEO.nEnum)) return;
        if (Plugin.VIDEO.strVersion > "VIDEO-0002") {
            var handlerKeyword = "$" + left + top + width + height + "$";
            if (this.SetOSDStateHandler.check(handlerKeyword, PLR_TRUE)) {
                var nHandler = this.SetOSDStateHandler.getHandler(handlerKeyword);
				alert("Common.API.PlugIn >> setOnWatchDog - nHandler : " + nHandler + ", SetOSDState : " + left + ", " + top + ", " + width + ", " + height);
                Plugin.VIDEO.Object.SetOSDState(nHandler, left, top, width, height, PLR_TRUE);
            }
        } else if (Plugin.VIDEO.strVersion == "VIDEO-0002"){
			$PLUGIN$.SetOSDState(left, top, width, height, option);
		}
    }
	
    /**
     * @brief			Set OSDState Off
     * @remarks		Set OSDState Off
     */
	this.setOffOSDState = function(left, top, width, height){
		if (!checkInit(Plugin.VIDEO.nEnum)) return;
        if (Plugin.VIDEO.strVersion > "VIDEO-0002") {
            var handlerKeyword = "$" + left + top + width + height + "$";
            if (this.SetOSDStateHandler.check(handlerKeyword, PLR_FALSE)) {
				var nHandler = this.SetOSDStateHandler.getHandler(handlerKeyword);
				alert("Common.API.PlugIn >> setOffWatchDog - nHandler : " + nHandler + ", SetOSDState : " + left + ", " + top + ", " + width + ", " + height);
				Plugin.VIDEO.Object.SetOSDState(nHandler, left, top, width, height, PLR_FALSE);
				this.SetOSDStateHandler.removeHandler(handlerKeyword);
			}
        } else if (Plugin.VIDEO.strVersion == "VIDEO-0002"){
			$PLUGIN$.SetOSDState(left, top, width, height, PLR_FALSE);
		}
    }

    /**
     * @brief			SetOSDStateHandler
     * @remarks
     */
    this.SetOSDStateHandler = {
        handlerPool : new Array(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,20),
        pool: new Object(),

	    /**
	     * @brief			SetOSDStateHandler
	     * @remarks
	     */
        getHandler: function(keywordHandler){
            var retHandler = this.pool[keywordHandler];
            if (retHandler != null) {
                return retHandler;
            }
            else {
                return 0;
            }
        },

	    /**
	     * @brief			SetOSDStateHandler
	     * @remarks
	     */
		removeHandler : function(keywordHandler) {
			var handlerItem = this.pool[keywordHandler];
			this.handlerPool.push(handlerItem);
			delete this.pool[keywordHandler];
		},
		
	    /**
	     * @brief			SetOSDStateHandler
	     * @remarks
	     */
        check: function(keywordHandler, option){
			var bRetValue = null;
            switch (option) {
                case PLR_TRUE:
					var handlerValue = this.handlerPool.pop();
                    if (this.pool[keywordHandler] == null) {
						// Error handling for no handler pool
                        this.pool[keywordHandler] = (handlerValue != null) ? handlerValue : 0;
                        bRetValue = true;
                    }
                    else bRetValue = false;
                     break;
                case PLR_FALSE:
                    if (this.pool[keywordHandler] == null) 
						bRetValue = false;
                    else 
						bRetValue = true;
                    break;
				default :
					alert("SetOSDStateHandler > option is invalid");
					bRetValue = false;
					break;
            }
			return bRetValue;
        }
    }
	
}
