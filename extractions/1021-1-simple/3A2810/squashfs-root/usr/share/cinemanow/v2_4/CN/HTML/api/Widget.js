//-----------------------------------------------------------------------------
// Widget.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
  
/**
 *@file           Widget.js
 *@brief
 *@author
 *@date         2009.02.17
 */
if (this.Common == null) { 
    this.Common = new Object();
}
if (this.Common.API == null) {
    this.Common.API = new Object();
}

// Define event enumeration
Common.API.EVENT_ENUM = {
	// Widget Event
	WIDGET_READY : "10",
	WIDGET_EXIT : "11",
	WIDGET_RETURN : "12",
	
	// Key Event
	KEY_REGIST : "20",
	KEY_UNREGIST : "21",
	KEY_IME_MODE : "22",
	KEY_REGIST_ALL : "23",
	KEY_UNREGIST_ALL : "24",
	KEY_REGIST_FULL_WIDGET : "25",
	KEY_REGIST_PART_WIDGET : "26"
}

Common.API.Widget = function(){
    
    var $THIS$ = this;
    
    /**
     * @brief
     * @remarks
     */    
    this.sendReadyEvent = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.WIDGET_READY, curWidget.id);
		sendWidgetEvent("", widgetEvent, false);
    }

    /**
     * @brief
     * @remarks
     */    
    this.sendExitEvent = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.WIDGET_EXIT, curWidget.id);
		sendWidgetEvent("", widgetEvent, false);
    }

    /**
     * @brief
     * @remarks
     */    
    this.sendReturnEvent = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.WIDGET_RETURN, curWidget.id);
		sendWidgetEvent("", widgetEvent, false);
    }
	
    /**
     * @brief            Regist Key
     * @remarks       Let the widget manager regist specific key
     */    
	this.registKey = function(pNumKeyCode) {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_REGIST, pNumKeyCode);
		sendWidgetEvent("", widgetEvent, true);
	}
	
    /**
     * @brief            Unregist Key
     * @remarks       Let the widget manager unregist specific key
     */    
	this.unregistKey = function(pNumKeyCode) {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_UNREGIST, pNumKeyCode);
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            Regist IME Key
     * @remarks       Let the widget manager regist IME key
     */    
	this.registIMEKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_IME_MODE, "true");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            Regist IME Key
     * @remarks       Let the widget manager regist IME key
     */    
	this.unregistIMEKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_IME_MODE, "true");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            
     * @remarks       
     */    
	this.registAllKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_REGIST_ALL, "false");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            
     * @remarks       
     */    
	this.unregistAllKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_UNREGIST_ALL, "false");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            
     * @remarks       
     */    
	this.registFullWidgetKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_REGIST_FULL_WIDGET, "false");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief            
     * @remarks       
     */    
	this.registPartWidgetKey = function() {
		var widgetEvent = new WidgetEvent(Common.API.EVENT_ENUM.KEY_REGIST_PART_WIDGET, "false");
		sendWidgetEvent("", widgetEvent, true);
	}

    /**
     * @brief 
     * @remarks
    */
    this.blockNavigation = function(event) {
        event.preventDefault();
    }

}

