<!-- This is an opera userjs for the creation of visual objects  -->
<!-- through oipfObjectFactory as specified in OIPF DAE 7.1.1.1. -->

/* Hide all helper functions under a single name, to avoid polluting the global
 * namespace */
var ooif_helper =
{
	createVisualObject: function(objectType) {
		if (oipfObjectFactory.isObjectSupported(objectType) == true) {
			element = document.createElement("object");
			element.setAttribute("type", objectType);
			return element;
		} else {
			throw {name: "TypeError"};
		}
	},

	fullscreen: function(video) {
		var style = video.style;
		var saved_state = {
			v: video,
			p: style.position,
			l: style.left,
			t: style.top,
			w: style.width,
			h: style.height
		};

		style.position = "fixed";
		style.left = "0px";
		style.top = "0px";
		style.width = "1280px";
		style.height = "720px";

		return saved_state;
	},

	restore: function(saved_state) {
		var style = saved_state.v.style;
		style.position = saved_state.p;
		style.left = saved_state.l;
		style.top = saved_state.t;
		style.width = saved_state.w;
		style.height = saved_state.h;
	}
};

oipfObjectFactory.createVideoBroadcastObject = function() {
    return ooif_helper.createVisualObject("video/broadcast");
};

oipfObjectFactory.createVideoMpegObject = function() {
    return ooif_helper.createVisualObject("video/mpeg");
};

if(location.hostname.indexOf('acetrax.com') != -1){
opera.addEventListener('AfterScript', function(userJSEvent){
	window.Vendor.exitFunction = function(){
		opera.sendPlatformMessage("ExitApp");
    }
},false);
}

<!-- This part adds support for key symbols as defined in Annex F of CEA-2014 -->
var KeyEvent = new Object();

KeyEvent.VK_UNDEFINED = KeyboardEvent.DOM_VK_UNDEFINED;
Event.prototype.VK_UNDEFINED = KeyboardEvent.DOM_VK_UNDEFINED;
KeyEvent.VK_CANCEL = KeyboardEvent.DOM_VK_CANCEL;
Event.prototype.VK_CANCEL = KeyboardEvent.DOM_VK_CANCEL;
KeyEvent.VK_BACK_SPACE = KeyboardEvent.DOM_VK_BACKSPACE;
Event.prototype.VK_BACK_SPACE = KeyboardEvent.DOM_VK_BACKSPACE;
KeyEvent.VK_TAB = KeyboardEvent.DOM_VK_TAB;
Event.prototype.VK_TAB = KeyboardEvent.DOM_VK_TAB;
KeyEvent.VK_CLEAR = KeyboardEvent.DOM_VK_CLEAR;
Event.prototype.VK_CLEAR = KeyboardEvent.DOM_VK_CLEAR;
KeyEvent.VK_ENTER = KeyboardEvent.DOM_VK_ENTER;
Event.prototype.VK_ENTER = KeyboardEvent.DOM_VK_ENTER;
KeyEvent.VK_SHIFT = KeyboardEvent.DOM_VK_SHIFT;
Event.prototype.VK_SHIFT = KeyboardEvent.DOM_VK_SHIFT;
KeyEvent.VK_CONTROL = KeyboardEvent.DOM_VK_CTRL;
Event.prototype.VK_CONTROL = KeyboardEvent.DOM_VK_CTRL;
KeyEvent.VK_ALT = KeyboardEvent.DOM_VK_ALT;
Event.prototype.VK_ALT = KeyboardEvent.DOM_VK_ALT;
KeyEvent.VK_PAUSE = KeyboardEvent.DOM_VK_PAUSE;
Event.prototype.VK_PAUSE = KeyboardEvent.DOM_VK_PAUSE;
KeyEvent.VK_CAPS_LOCK = KeyboardEvent.DOM_VK_CAPS_LOCK;
Event.prototype.VK_CAPS_LOCK = KeyboardEvent.DOM_VK_CAPS_LOCK;
KeyEvent.VK_KANA = KeyboardEvent.DOM_VK_KANA;
Event.prototype.VK_KANA = KeyboardEvent.DOM_VK_KANA;
KeyEvent.VK_FINAL = KeyboardEvent.DOM_VK_FINAL;
Event.prototype.VK_FINAL = KeyboardEvent.DOM_VK_FINAL;
KeyEvent.VK_KANJI = KeyboardEvent.DOM_VK_KANJI;
Event.prototype.VK_KANJI = KeyboardEvent.DOM_VK_KANJI;
KeyEvent.VK_ESCAPE = KeyboardEvent.DOM_VK_ESCAPE;
Event.prototype.VK_ESCAPE = KeyboardEvent.DOM_VK_ESCAPE;
KeyEvent.VK_CONVERT = KeyboardEvent.DOM_VK_CONVERT;
Event.prototype.VK_CONVERT = KeyboardEvent.DOM_VK_CONVERT;
KeyEvent.VK_NONCONVERT = KeyboardEvent.DOM_VK_NONCONVERT;
Event.prototype.VK_NONCONVERT = KeyboardEvent.DOM_VK_NONCONVERT;
KeyEvent.VK_ACCEPT = KeyboardEvent.DOM_VK_ACCEPT;
Event.prototype.VK_ACCEPT = KeyboardEvent.DOM_VK_ACCEPT;
KeyEvent.VK_MODECHANGE = KeyboardEvent.DOM_VK_MODECHANGE;
Event.prototype.VK_MODECHANGE = KeyboardEvent.DOM_VK_MODECHANGE;
KeyEvent.VK_SPACE = KeyboardEvent.DOM_VK_SPACE;
Event.prototype.VK_SPACE = KeyboardEvent.DOM_VK_SPACE;
KeyEvent.VK_PAGE_UP = KeyboardEvent.DOM_VK_PAGEUP;
Event.prototype.VK_PAGE_UP = KeyboardEvent.DOM_VK_PAGEUP;
KeyEvent.VK_PAGE_DOWN = KeyboardEvent.DOM_VK_PAGEDOWN;
Event.prototype.VK_PAGE_DOWN = KeyboardEvent.DOM_VK_PAGEDOWN;
KeyEvent.VK_END = KeyboardEvent.DOM_VK_END;
Event.prototype.VK_END = KeyboardEvent.DOM_VK_END;
KeyEvent.VK_HOME = KeyboardEvent.DOM_VK_HOME;
Event.prototype.VK_HOME = KeyboardEvent.DOM_VK_HOME;
KeyEvent.VK_LEFT = KeyboardEvent.DOM_VK_LEFT;
Event.prototype.VK_LEFT = KeyboardEvent.DOM_VK_LEFT;
KeyEvent.VK_UP = KeyboardEvent.DOM_VK_UP;
Event.prototype.VK_UP = KeyboardEvent.DOM_VK_UP;
KeyEvent.VK_RIGHT = KeyboardEvent.DOM_VK_RIGHT;
Event.prototype.VK_RIGHT = KeyboardEvent.DOM_VK_RIGHT;
KeyEvent.VK_DOWN = KeyboardEvent.DOM_VK_DOWN;
Event.prototype.VK_DOWN = KeyboardEvent.DOM_VK_DOWN;
//KeyEvent.VK_COMMA =
//Event.prototype.VK_COMMA =
//KeyEvent.VK_PERIOD =
//Event.prototype.VK_PERIOD =
//KeyEvent.VK_SLASH =
//Event.prototype.VK_SLASH =
KeyEvent.VK_0 = KeyboardEvent.DOM_VK_0;
Event.prototype.VK_0 = KeyboardEvent.DOM_VK_0;
KeyEvent.VK_1 = KeyboardEvent.DOM_VK_1;
Event.prototype.VK_1 = KeyboardEvent.DOM_VK_1;
KeyEvent.VK_2 = KeyboardEvent.DOM_VK_2;
Event.prototype.VK_2 = KeyboardEvent.DOM_VK_2;
KeyEvent.VK_3 = KeyboardEvent.DOM_VK_3;
Event.prototype.VK_3 = KeyboardEvent.DOM_VK_3;
KeyEvent.VK_4 = KeyboardEvent.DOM_VK_4;
Event.prototype.VK_4 = KeyboardEvent.DOM_VK_4;
KeyEvent.VK_5 = KeyboardEvent.DOM_VK_5;
Event.prototype.VK_5 = KeyboardEvent.DOM_VK_5;
KeyEvent.VK_6 = KeyboardEvent.DOM_VK_6;
Event.prototype.VK_6 = KeyboardEvent.DOM_VK_6;
KeyEvent.VK_7 = KeyboardEvent.DOM_VK_7;
Event.prototype.VK_7 = KeyboardEvent.DOM_VK_7;
KeyEvent.VK_8 = KeyboardEvent.DOM_VK_8;
Event.prototype.VK_8 = KeyboardEvent.DOM_VK_8;
KeyEvent.VK_9 = KeyboardEvent.DOM_VK_9;
Event.prototype.VK_9 = KeyboardEvent.DOM_VK_9;
//KeyEvent.VK_SEMICOLON =
//Event.prototype.VK_SEMICOLON =
//KeyEvent.VK_EQUALS =
//Event.prototype.VK_EQUALS =
KeyEvent.VK_A = KeyboardEvent.DOM_VK_A;
Event.prototype.VK_A = KeyboardEvent.DOM_VK_A;
KeyEvent.VK_B = KeyboardEvent.DOM_VK_B;
Event.prototype.VK_B = KeyboardEvent.DOM_VK_B;
KeyEvent.VK_C = KeyboardEvent.DOM_VK_C;
Event.prototype.VK_C = KeyboardEvent.DOM_VK_C;
KeyEvent.VK_D = KeyboardEvent.DOM_VK_D;
Event.prototype.VK_D = KeyboardEvent.DOM_VK_D;
KeyEvent.VK_E = KeyboardEvent.DOM_VK_E;
Event.prototype.VK_E = KeyboardEvent.DOM_VK_E;
KeyEvent.VK_F = KeyboardEvent.DOM_VK_F;
Event.prototype.VK_F = KeyboardEvent.DOM_VK_F;
KeyEvent.VK_G = KeyboardEvent.DOM_VK_G;
Event.prototype.VK_G = KeyboardEvent.DOM_VK_G;
KeyEvent.VK_H = KeyboardEvent.DOM_VK_H;
Event.prototype.VK_H = KeyboardEvent.DOM_VK_H;
KeyEvent.VK_I = KeyboardEvent.DOM_VK_I;
Event.prototype.VK_I = KeyboardEvent.DOM_VK_I;
KeyEvent.VK_J = KeyboardEvent.DOM_VK_J;
Event.prototype.VK_J = KeyboardEvent.DOM_VK_J;
KeyEvent.VK_K = KeyboardEvent.DOM_VK_K;
Event.prototype.VK_K = KeyboardEvent.DOM_VK_K;
KeyEvent.VK_L = KeyboardEvent.DOM_VK_L;
Event.prototype.VK_L = KeyboardEvent.DOM_VK_L;
KeyEvent.VK_M = KeyboardEvent.DOM_VK_M;
Event.prototype.VK_M = KeyboardEvent.DOM_VK_M;
KeyEvent.VK_N = KeyboardEvent.DOM_VK_N;
Event.prototype.VK_N = KeyboardEvent.DOM_VK_N;
KeyEvent.VK_O = KeyboardEvent.DOM_VK_O;
Event.prototype.VK_O = KeyboardEvent.DOM_VK_O;
KeyEvent.VK_P = KeyboardEvent.DOM_VK_P;
Event.prototype.VK_P = KeyboardEvent.DOM_VK_P;
KeyEvent.VK_Q = KeyboardEvent.DOM_VK_Q;
Event.prototype.VK_Q = KeyboardEvent.DOM_VK_Q;
KeyEvent.VK_R = KeyboardEvent.DOM_VK_R;
Event.prototype.VK_R = KeyboardEvent.DOM_VK_R;
KeyEvent.VK_S = KeyboardEvent.DOM_VK_S;
Event.prototype.VK_S = KeyboardEvent.DOM_VK_S;
KeyEvent.VK_T = KeyboardEvent.DOM_VK_T;
Event.prototype.VK_T = KeyboardEvent.DOM_VK_T;
KeyEvent.VK_U = KeyboardEvent.DOM_VK_U;
Event.prototype.VK_U = KeyboardEvent.DOM_VK_U;
KeyEvent.VK_V = KeyboardEvent.DOM_VK_V;
Event.prototype.VK_V = KeyboardEvent.DOM_VK_V;
KeyEvent.VK_W = KeyboardEvent.DOM_VK_W;
Event.prototype.VK_W = KeyboardEvent.DOM_VK_W;
KeyEvent.VK_X = KeyboardEvent.DOM_VK_X;
Event.prototype.VK_X = KeyboardEvent.DOM_VK_X;
KeyEvent.VK_Y = KeyboardEvent.DOM_VK_Y;
Event.prototype.VK_Y = KeyboardEvent.DOM_VK_Y;
KeyEvent.VK_Z = KeyboardEvent.DOM_VK_Z;
Event.prototype.VK_Z = KeyboardEvent.DOM_VK_Z;
//KeyEvent.VK_OPEN_BRACKET =
//Event.prototype.VK_OPEN_BRACKET =
//KeyEvent.VK_BACK_SLASH =
//Event.prototype.VK_BACK_SLASH =
//KeyEvent.VK_CLOSE_BRACKET =
//Event.prototype.VK_CLOSE_BRACKET =
KeyEvent.VK_NUMPAD0 = KeyboardEvent.DOM_VK_NUMPAD0;
Event.prototype.VK_NUMPAD0 = KeyboardEvent.DOM_VK_NUMPAD0;
KeyEvent.VK_NUMPAD1 = KeyboardEvent.DOM_VK_NUMPAD1;
Event.prototype.VK_NUMPAD1 = KeyboardEvent.DOM_VK_NUMPAD1;
KeyEvent.VK_NUMPAD2 = KeyboardEvent.DOM_VK_NUMPAD2;
Event.prototype.VK_NUMPAD2 = KeyboardEvent.DOM_VK_NUMPAD2;
KeyEvent.VK_NUMPAD3 = KeyboardEvent.DOM_VK_NUMPAD3;
Event.prototype.VK_NUMPAD3 = KeyboardEvent.DOM_VK_NUMPAD3;
KeyEvent.VK_NUMPAD4 = KeyboardEvent.DOM_VK_NUMPAD4;
Event.prototype.VK_NUMPAD4 = KeyboardEvent.DOM_VK_NUMPAD4;
KeyEvent.VK_NUMPAD5 = KeyboardEvent.DOM_VK_NUMPAD5;
Event.prototype.VK_NUMPAD5 = KeyboardEvent.DOM_VK_NUMPAD5;
KeyEvent.VK_NUMPAD6 = KeyboardEvent.DOM_VK_NUMPAD6;
Event.prototype.VK_NUMPAD6 = KeyboardEvent.DOM_VK_NUMPAD6;
KeyEvent.VK_NUMPAD7 = KeyboardEvent.DOM_VK_NUMPAD7;
Event.prototype.VK_NUMPAD7 = KeyboardEvent.DOM_VK_NUMPAD7;
KeyEvent.VK_NUMPAD8 = KeyboardEvent.DOM_VK_NUMPAD8;
Event.prototype.VK_NUMPAD8 = KeyboardEvent.DOM_VK_NUMPAD8;
KeyEvent.VK_NUMPAD9 = KeyboardEvent.DOM_VK_NUMPAD9;
Event.prototype.VK_NUMPAD9 = KeyboardEvent.DOM_VK_NUMPAD9;
KeyEvent.VK_MULTIPLY = KeyboardEvent.DOM_VK_MULTIPLY;
Event.prototype.VK_MULTIPLY = KeyboardEvent.DOM_VK_MULTIPLY;
KeyEvent.VK_ADD = KeyboardEvent.DOM_VK_ADD;
Event.prototype.VK_ADD = KeyboardEvent.DOM_VK_ADD;
KeyEvent.VK_SEPARATER = KeyboardEvent.DOM_VK_SEPARATOR;
Event.prototype.VK_SEPARATER = KeyboardEvent.DOM_VK_SEPARATOR;
KeyEvent.VK_SUBTRACT = KeyboardEvent.DOM_VK_SUBTRACT;
Event.prototype.VK_SUBTRACT = KeyboardEvent.DOM_VK_SUBTRACT;
KeyEvent.VK_DECIMAL = KeyboardEvent.DOM_VK_DECIMAL;
Event.prototype.VK_DECIMAL = KeyboardEvent.DOM_VK_DECIMAL;
KeyEvent.VK_DIVIDE = KeyboardEvent.DOM_VK_DIVIDE;
Event.prototype.VK_DIVIDE = KeyboardEvent.DOM_VK_DIVIDE;
KeyEvent.VK_F1 = KeyboardEvent.DOM_VK_F1;
Event.prototype.VK_F1 = KeyboardEvent.DOM_VK_F1;
KeyEvent.VK_F2 = KeyboardEvent.DOM_VK_F2;
Event.prototype.VK_F2 = KeyboardEvent.DOM_VK_F2;
KeyEvent.VK_F3 = KeyboardEvent.DOM_VK_F3;
Event.prototype.VK_F3 = KeyboardEvent.DOM_VK_F3;
KeyEvent.VK_F4 = KeyboardEvent.DOM_VK_F4;
Event.prototype.VK_F4 = KeyboardEvent.DOM_VK_F4;
KeyEvent.VK_F5 = KeyboardEvent.DOM_VK_F5;
Event.prototype.VK_F5 = KeyboardEvent.DOM_VK_F5;
KeyEvent.VK_F6 = KeyboardEvent.DOM_VK_F6;
Event.prototype.VK_F6 = KeyboardEvent.DOM_VK_F6;
KeyEvent.VK_F7 = KeyboardEvent.DOM_VK_F7;
Event.prototype.VK_F7 = KeyboardEvent.DOM_VK_F7;
KeyEvent.VK_F8 = KeyboardEvent.DOM_VK_F8;
Event.prototype.VK_F8 = KeyboardEvent.DOM_VK_F8;
KeyEvent.VK_F9 = KeyboardEvent.DOM_VK_F9;
Event.prototype.VK_F9 = KeyboardEvent.DOM_VK_F9;
KeyEvent.VK_F10 = KeyboardEvent.DOM_VK_F10;
Event.prototype.VK_F10 = KeyboardEvent.DOM_VK_F10;
KeyEvent.VK_F11 = KeyboardEvent.DOM_VK_F11;
Event.prototype.VK_F11 = KeyboardEvent.DOM_VK_F11;
KeyEvent.VK_F12 = KeyboardEvent.DOM_VK_F12;
Event.prototype.VK_F12 = KeyboardEvent.DOM_VK_F12;
KeyEvent.VK_DELETE = KeyboardEvent.DOM_VK_DELETE;
Event.prototype.VK_DELETE = KeyboardEvent.DOM_VK_DELETE;
KeyEvent.VK_NUM_LOCK = KeyboardEvent.DOM_VK_NUM_LOCK;
Event.prototype.VK_NUM_LOCK = KeyboardEvent.DOM_VK_NUM_LOCK;
KeyEvent.VK_SCROLL_LOCK = KeyboardEvent.DOM_VK_SCROLL_LOCK;
Event.prototype.VK_SCROLL_LOCK = KeyboardEvent.DOM_VK_SCROLL_LOCK;
KeyEvent.VK_PRINTSCREEN = KeyboardEvent.DOM_VK_PRINTSCREEN;
Event.prototype.VK_PRINTSCREEN = KeyboardEvent.DOM_VK_PRINTSCREEN;
KeyEvent.VK_INSERT = KeyboardEvent.DOM_VK_INSERT;
Event.prototype.VK_INSERT = KeyboardEvent.DOM_VK_INSERT;
KeyEvent.VK_HELP = KeyboardEvent.DOM_VK_HELP;
Event.prototype.VK_HELP = KeyboardEvent.DOM_VK_HELP;
KeyEvent.VK_META = KeyboardEvent.DOM_VK_META;
Event.prototype.VK_META = KeyboardEvent.DOM_VK_META;
//KeyEvent.VK_BACK_QUOTE = KeyboardEvent.DOM_VK_BACK_QUOTE;
//Event.prototype.VK_BACK_QUOTE = KeyboardEvent.DOM_VK_BACK_QUOTE;
//KeyEvent.VK_QUOTE = KeyboardEvent.DOM_VK_QUOTE;
//Event.prototype.VK_QUOTE = KeyboardEvent.DOM_VK_QUOTE;
KeyEvent.VK_RED = KeyboardEvent.DOM_VK_RED;
Event.prototype.VK_RED = KeyboardEvent.DOM_VK_RED;
KeyEvent.VK_GREEN = KeyboardEvent.DOM_VK_GREEN;
Event.prototype.VK_GREEN = KeyboardEvent.DOM_VK_GREEN;
KeyEvent.VK_YELLOW = KeyboardEvent.DOM_VK_YELLOW;
Event.prototype.VK_YELLOW = KeyboardEvent.DOM_VK_YELLOW;
KeyEvent.VK_BLUE = KeyboardEvent.DOM_VK_BLUE;
Event.prototype.VK_BLUE = KeyboardEvent.DOM_VK_BLUE;
KeyEvent.VK_GREY = KeyboardEvent.DOM_VK_GREY;
Event.prototype.VK_GREY = KeyboardEvent.DOM_VK_GREY;
KeyEvent.VK_BROWN = KeyboardEvent.DOM_VK_BROWN;
Event.prototype.VK_BROWN = KeyboardEvent.DOM_VK_BROWN;
KeyEvent.VK_POWER = KeyboardEvent.DOM_VK_POWER;
Event.prototype.VK_POWER = KeyboardEvent.DOM_VK_POWER;
KeyEvent.VK_DIMMER = KeyboardEvent.DOM_VK_DIMMER;
Event.prototype.VK_DIMMER = KeyboardEvent.DOM_VK_DIMMER;
KeyEvent.VK_WINK = KeyboardEvent.DOM_VK_WINK;
Event.prototype.VK_WINK = KeyboardEvent.DOM_VK_WINK;
KeyEvent.VK_REWIND = KeyboardEvent.DOM_VK_REWIND;
Event.prototype.VK_REWIND = KeyboardEvent.DOM_VK_REWIND;
KeyEvent.VK_STOP = KeyboardEvent.DOM_VK_STOP;
Event.prototype.VK_STOP = KeyboardEvent.DOM_VK_STOP;
KeyEvent.VK_EJECT_TOGGLE = KeyboardEvent.DOM_VK_EJECT_TOGGLE;
Event.prototype.VK_EJECT_TOGGLE = KeyboardEvent.DOM_VK_EJECT_TOGGLE;
KeyEvent.VK_PLAY = KeyboardEvent.DOM_VK_PLAY;
Event.prototype.VK_PLAY = KeyboardEvent.DOM_VK_PLAY;
KeyEvent.VK_RECORD = KeyboardEvent.DOM_VK_RECORD;
Event.prototype.VK_RECORD = KeyboardEvent.DOM_VK_RECORD;
KeyEvent.VK_FAST_FWD = KeyboardEvent.DOM_VK_FAST_FWD;
Event.prototype.VK_FAST_FWD = KeyboardEvent.DOM_VK_FAST_FWD;
KeyEvent.VK_PLAY_SPEED_UP = KeyboardEvent.DOM_VK_PLAY_SPEED_UP;
Event.prototype.VK_PLAY_SPEED_UP = KeyboardEvent.DOM_VK_PLAY_SPEED_UP;
KeyEvent.VK_PLAY_SPEED_DOWN = KeyboardEvent.DOM_VK_PLAY_SPEED_DOWN;
Event.prototype.VK_PLAY_SPEED_DOWN = KeyboardEvent.DOM_VK_PLAY_SPEED_DOWN;
KeyEvent.VK_PLAY_SPEED_RESET = KeyboardEvent.DOM_VK_PLAY_SPEED_RESET;
Event.prototype.VK_PLAY_SPEED_RESET = KeyboardEvent.DOM_VK_PLAY_SPEED_RESET;
KeyEvent.VK_RECORD_SPEED_NEXT = KeyboardEvent.DOM_VK_RECORD_SPEED_NEXT;
Event.prototype.VK_RECORD_SPEED_NEXT = KeyboardEvent.DOM_VK_RECORD_SPEED_NEXT;
KeyEvent.VK_GO_TO_START = KeyboardEvent.DOM_VK_GO_TO_START;
Event.prototype.VK_GO_TO_START = KeyboardEvent.DOM_VK_GO_TO_START;
KeyEvent.VK_GO_TO_END = KeyboardEvent.DOM_VK_GO_TO_END;
Event.prototype.VK_GO_TO_END = KeyboardEvent.DOM_VK_GO_TO_END;
KeyEvent.VK_TRACK_PREV = KeyboardEvent.DOM_VK_TRACK_PREV;
Event.prototype.VK_TRACK_PREV = KeyboardEvent.DOM_VK_TRACK_PREV;
KeyEvent.VK_TRACK_NEXT = KeyboardEvent.DOM_VK_TRACK_NEXT;
Event.prototype.VK_TRACK_NEXT = KeyboardEvent.DOM_VK_TRACK_NEXT;
KeyEvent.VK_RANDOM_TOGGLE = KeyboardEvent.DOM_VK_RANDOM_TOGGLE;
Event.prototype.VK_RANDOM_TOGGLE = KeyboardEvent.DOM_VK_RANDOM_TOGGLE;
KeyEvent.VK_CHANNEL_UP = KeyboardEvent.DOM_VK_CHANNEL_UP;
Event.prototype.VK_CHANNEL_UP = KeyboardEvent.DOM_VK_CHANNEL_UP;
KeyEvent.VK_CHANNEL_DOWN = KeyboardEvent.DOM_VK_CHANNEL_DOWN;
Event.prototype.VK_CHANNEL_DOWN = KeyboardEvent.DOM_VK_CHANNEL_DOWN;
KeyEvent.VK_STORE_FAVORITE_0 = KeyboardEvent.DOM_VK_STORE_FAVORITE_0;
Event.prototype.VK_STORE_FAVORITE_0 = KeyboardEvent.DOM_VK_STORE_FAVORITE_0;
KeyEvent.VK_STORE_FAVORITE_1 = KeyboardEvent.DOM_VK_STORE_FAVORITE_1;
Event.prototype.VK_STORE_FAVORITE_1 = KeyboardEvent.DOM_VK_STORE_FAVORITE_1;
KeyEvent.VK_STORE_FAVORITE_2 = KeyboardEvent.DOM_VK_STORE_FAVORITE_2;
Event.prototype.VK_STORE_FAVORITE_2 = KeyboardEvent.DOM_VK_STORE_FAVORITE_2;
KeyEvent.VK_STORE_FAVORITE_3 = KeyboardEvent.DOM_VK_STORE_FAVORITE_3;
Event.prototype.VK_STORE_FAVORITE_3 = KeyboardEvent.DOM_VK_STORE_FAVORITE_3;
KeyEvent.VK_RECALL_FAVORITE_0 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_0;
Event.prototype.VK_RECALL_FAVORITE_0 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_0;
KeyEvent.VK_RECALL_FAVORITE_1 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_1;
Event.prototype.VK_RECALL_FAVORITE_1 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_1;
KeyEvent.VK_RECALL_FAVORITE_2 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_2;
Event.prototype.VK_RECALL_FAVORITE_2 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_2;
KeyEvent.VK_RECALL_FAVORITE_3 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_3;
Event.prototype.VK_RECALL_FAVORITE_3 = KeyboardEvent.DOM_VK_RECALL_FAVORITE_3;
KeyEvent.VK_CLEAR_FAVORITE_0 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_0;
Event.prototype.VK_CLEAR_FAVORITE_0 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_0;
KeyEvent.VK_CLEAR_FAVORITE_1 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_1;
Event.prototype.VK_CLEAR_FAVORITE_1 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_1;
KeyEvent.VK_CLEAR_FAVORITE_2 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_2;
Event.prototype.VK_CLEAR_FAVORITE_2 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_2;
KeyEvent.VK_CLEAR_FAVORITE_3 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_3;
Event.prototype.VK_CLEAR_FAVORITE_3 = KeyboardEvent.DOM_VK_CLEAR_FAVORITE_3;
KeyEvent.VK_SCAN_CHANNELS_TOGGLE = KeyboardEvent.DOM_VK_SCAN_CHANNELS_TOGGLE;
Event.prototype.VK_SCAN_CHANNELS_TOGGLE = KeyboardEvent.DOM_VK_SCAN_CHANNELS_TOGGLE;
KeyEvent.VK_PINP_TOGGLE = KeyboardEvent.DOM_VK_PINP_TOGGLE;
Event.prototype.VK_PINP_TOGGLE = KeyboardEvent.DOM_VK_PINP_TOGGLE;
KeyEvent.VK_SPLIT_SCREEN_TOGGLE = KeyboardEvent.DOM_VK_SPLIT_SCREEN_TOGGLE;
Event.prototype.VK_SPLIT_SCREEN_TOGGLE = KeyboardEvent.DOM_VK_SPLIT_SCREEN_TOGGLE;
KeyEvent.VK_DISPLAY_SWAP = KeyboardEvent.DOM_VK_DISPLAY_SWAP;
Event.prototype.VK_DISPLAY_SWAP = KeyboardEvent.DOM_VK_DISPLAY_SWAP;
KeyEvent.VK_SCREEN_MODE_NEXT = KeyboardEvent.DOM_VK_SCREEN_MODE_NEXT;
Event.prototype.VK_SCREEN_MODE_NEXT = KeyboardEvent.DOM_VK_SCREEN_MODE_NEXT;
KeyEvent.VK_VIDEO_MODE_NEXT = KeyboardEvent.DOM_VK_VIDEO_MODE_NEXT;
Event.prototype.VK_VIDEO_MODE_NEXT = KeyboardEvent.DOM_VK_VIDEO_MODE_NEXT;
KeyEvent.VK_VOLUME_UP = KeyboardEvent.DOM_VK_VOLUME_UP;
Event.prototype.VK_VOLUME_UP = KeyboardEvent.DOM_VK_VOLUME_UP;
KeyEvent.VK_VOLUME_DOWN = KeyboardEvent.DOM_VK_VOLUME_DOWN;
Event.prototype.VK_VOLUME_DOWN = KeyboardEvent.DOM_VK_VOLUME_DOWN;
KeyEvent.VK_MUTE = KeyboardEvent.DOM_VK_MUTE;
Event.prototype.VK_MUTE = KeyboardEvent.DOM_VK_MUTE;
KeyEvent.VK_SURROUND_MODE_NEXT = KeyboardEvent.DOM_VK_SURROUND_MODE_NEXT;
Event.prototype.VK_SURROUND_MODE_NEXT = KeyboardEvent.DOM_VK_SURROUND_MODE_NEXT;
KeyEvent.VK_BALANCE_RIGHT = KeyboardEvent.DOM_VK_BALANCE_RIGHT;
Event.prototype.VK_BALANCE_RIGHT = KeyboardEvent.DOM_VK_BALANCE_RIGHT;
KeyEvent.VK_BALANCE_LEFT = KeyboardEvent.DOM_VK_BALANCE_LEFT;
Event.prototype.VK_BALANCE_LEFT = KeyboardEvent.DOM_VK_BALANCE_LEFT;
KeyEvent.VK_FADER_FRONT = KeyboardEvent.DOM_VK_FADER_FRONT;
Event.prototype.VK_FADER_FRONT = KeyboardEvent.DOM_VK_FADER_FRONT;
KeyEvent.VK_FADER_REAR = KeyboardEvent.DOM_VK_FADER_REAR;
Event.prototype.VK_FADER_REAR = KeyboardEvent.DOM_VK_FADER_REAR;
KeyEvent.VK_BASS_BOOST_UP = KeyboardEvent.DOM_VK_BASS_BOOST_UP;
Event.prototype.VK_BASS_BOOST_UP = KeyboardEvent.DOM_VK_BASS_BOOST_UP;
KeyEvent.VK_BASS_BOOST_DOWN = KeyboardEvent.DOM_VK_BASS_BOOST_DOWN;
Event.prototype.VK_BASS_BOOST_DOWN = KeyboardEvent.DOM_VK_BASS_BOOST_DOWN;
KeyEvent.VK_INFO = KeyboardEvent.DOM_VK_INFO;
Event.prototype.VK_INFO = KeyboardEvent.DOM_VK_INFO;
KeyEvent.VK_GUIDE = KeyboardEvent.DOM_VK_GUIDE;
Event.prototype.VK_GUIDE = KeyboardEvent.DOM_VK_GUIDE;
KeyEvent.VK_TELETEXT = KeyboardEvent.DOM_VK_TELETEXT;
Event.prototype.VK_TELETEXT = KeyboardEvent.DOM_VK_TELETEXT;
KeyEvent.VK_SUBTITLE = KeyboardEvent.DOM_VK_SUBTITLE;
Event.prototype.VK_SUBTITLE = KeyboardEvent.DOM_VK_SUBTITLE;
KeyEvent.VK_BACK = KeyboardEvent.DOM_VK_BACK;
Event.prototype.VK_BACK = KeyboardEvent.DOM_VK_BACK;
KeyEvent.VK_MENU = KeyboardEvent.DOM_VK_MENU;
Event.prototype.VK_MENU = KeyboardEvent.DOM_VK_MENU;
KeyEvent.VK_PLAY_PAUSE = KeyboardEvent.DOM_VK_PLAY_PAUSE;
Event.prototype.VK_PLAY_PAUSE = KeyboardEvent.DOM_VK_PLAY_PAUSE;


<!-- The following piece of code is required for XML StreamEvent support in HbbTV -->

HTMLObjectElement.prototype.addStreamEventListener = function(targetURL, eventName, listener)
{
	if (typeof(this.type) != 'string' || this.type != 'video/broadcast')
		return;

	if (targetURL.indexOf('http://')<0 && targetURL.indexOf('https://')<0 && (targetURL.indexOf('dvb://')>=0 || window.location.toString().indexOf('dvb://')>= 0))
		return this.internalAddStreamEventListener(targetURL, eventName, listener);

	var xhr = new XMLHttpRequest();

	xhr.open("GET", targetURL, false);

	try
	{
		xhr.send(null);
	}
	catch(e)
	{
		var error = new Object();
		error.name = '';
		error.data = '';
		error.text = '';
		error.status = 'error';
		listener(error);
		return;
	}

	var parser = new DOMParser();
	var xdoc = parser.parseFromString(xhr.responseText, "text/xml");

	var dsmccObjects = xdoc.getElementsByTagName('dsmcc_object');
	if (dsmccObjects.length <= 0)
		return;

	var dsmccObject = dsmccObjects[0];
	var componentTag = dsmccObject.getAttribute('component_tag') || dsmccObject.getAttributeNS('urn:dvb:mis:dsmcc:2009', 'component_tag');
	if (!componentTag)
		return;

	var streamEventId = null;
	var streamEvents = dsmccObject.getElementsByTagName('stream_event');

	for (var i = 0; i < streamEvents.length; i++)
	{
		if (eventName == streamEvents[i].getAttribute('stream_event_name') || streamEvents[i].getAttributeNS('urn:dvb:mis:dsmcc:2009', 'stream_event_name'))
		{
			var streamEventId = streamEvents[i].getAttribute('stream_event_id') || streamEvents[i].getAttributeNS('urn:dvb:mis:dsmcc:2009', 'stream_event_id');
			break;
		}
	}

	if (!streamEventId)
		return;

	return this.internalAddXMLStreamEventListener(eventName, parseInt(streamEventId), parseInt(componentTag), listener);
}
