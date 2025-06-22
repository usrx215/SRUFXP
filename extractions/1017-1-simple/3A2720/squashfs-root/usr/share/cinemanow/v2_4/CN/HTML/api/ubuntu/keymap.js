//-----------------------------------------------------------------------------
// keymap.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
//
// Ubuntu Key Values Map
//
if (this.Common == null) {
    this.Common = new Object();
}
if (this.Common.API == null) {
    this.Common.API = new Object();
}

Common.API.TVKeyValue = function(){    
    var $THIS$ = this;
    
    this.KEY_TOOLS = 75;
    this.KEY_MUTE = 0;
    this.KEY_RETURN = 8;
    this.KEY_UP = 38;
    this.KEY_DOWN = 40;
    this.KEY_LEFT = 37;
    this.KEY_RIGHT = 39;
    this.KEY_WHEELDOWN = 29469;
    this.KEY_WHEELUP = 29468;
    this.KEY_ENTER = 13;
    this.KEY_INFO = 31;
    this.KEY_EXIT = 27;
    this.KEY_RED = 65;
    this.KEY_GREEN = 20;
    this.KEY_YELLOW = 21;
    this.KEY_BLUE = 22;
    this.KEY_INFOLINK = 147;
    this.KEY_RW = 65;		// a: Rewind
    this.KEY_PAUSE = 87;    // w: Pause
    this.KEY_FF = 68;       // d: Fast forward
    this.KEY_PLAY = 83;     // s: Play
    this.KEY_STOP = 88;     // x: Stop
    this.KEY_FF_ = 67;      // c: Jump forward
    this.KEY_REWIND_ = 90;  // z: Jump backward
    this.KEY_CC_TOGGLE = 84;  // t: Toggle Closed Caption
    this.KEY_1 = 49;
    this.KEY_2 = 50;
    this.KEY_3 = 51;
    this.KEY_4 = 52;
    this.KEY_5 = 53;
    this.KEY_6 = 54;
    this.KEY_7 = 55;
    this.KEY_8 = 56;
    this.KEY_9 = 57;
    this.KEY_0 = 48;
    this.KEY_EMPTY = 0;
	this.KEY_PAGE_UP = 33;
    this.KEY_PAGE_DOWN = 34;
    
    this.KEY_PRECH = 259;
    this.KEY_SOURCE = 222;
    this.KEY_CHLIST = 84;
    this.KEY_MENU = 262;
    this.KEY_WLINK = 115;
    this.KEY_CC = 118;
    this.KEY_CONTENT = 261;
    this.KEY_FAVCH = 256;
    this.KEY_REC = 192;
    this.KEY_EMODE = 148;
    this.KEY_DMA = 260;
    
    this.KEY_PANEL_CH_UP= 105;
    this.KEY_PANEL_CH_DOWN = 106;
    this.KEY_PANEL_VOL_UP = 203;
    this.KEY_PANEL_VOL_DOWN = 204;
    this.KEY_PANEL_ENTER = 309;
    this.KEY_PANEL_SOURCE = 612;
    this.KEY_PANEL_MENU = 613;
    this.KEY_PANEL_POWER = 614;
	
	// Added by ck1.seo@samsung.com
	// For all key regist
	// 3 April 2009
	this.KEY_POWER = 76;
	this.KEY_TV = 77;
	this.KEY_VOL_UP = 7;
	this.KEY_VOL_DOWN = 11;
	this.KEY_CH_UP = 68;
	this.KEY_CH_DOWN = 65;
	this.KEY_TTX_MIX = 650;
	this.KEY_GUIDE = 651;
	this.KEY_SUBTITLE = 652;
	this.KEY_ASPECT = 653;
	this.KEY_DOLBY_SRR = 654;
	this.KEY_MTS = 655;
}
