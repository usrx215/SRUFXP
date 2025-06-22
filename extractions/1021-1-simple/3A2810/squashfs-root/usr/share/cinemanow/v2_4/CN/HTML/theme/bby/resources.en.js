//-----------------------------------------------------------------------------
// resources.en.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
application.resource = {
	"modalConfig":{
		"default":{ "width":"345px", "left":"308px", "top":"200px" },
		"message_parentalcontrols":{"width":"450px", "left":"256px", "top":"200px"},
		"legal" : { "width":"625px", "left":"168px", "top":"100px", "height":"340px"},
		"uvtermsofservice" : { "width":"450px", "left":"258px", "top":"60px", "height":"420px"},
		"eula" : { "width":"625px", "left":"168px", "top":"100px", "height":"340px"},
        "message_error_askabouthd" : {
            "width":"960px",
            "height":"540px",
            "left":"0px",
            "top":"0px"
        },
		"message_error_connectiontooslow_player" : {
            "width":"960px",
            "height":"540px",
            "left":"0px",
            "top":"0px"
        },
		"changeuserpopup" : {
			"width":"325px",
			"height":"175px",
			"left":"318px",
			"top":"140px"
		},
		"imagepopup" : {
	        "width":"425px",
	        "height":"220px",
	        "left":"268px",
	        "top":"140px"
        },
        "confirmpopup" : {
			"width":"390px",
			"height":"auto",
			"left":"285px",
			"top":"125px",
			"text-align":"center",
			"visibility":"hidden"
		},	
		"speedpopup" : {
			"width":"430px",
			"height":"310px",
			"left":"260px",
			"top":"114px",
			"text-align":"center"
		},	
		"systemstatuspopup" : {
			"width":"430px",
			"height":"215px",
			"left":"260px",
			"top":"166px",
			"text-align":"center"
		},	
		"pinpopup" : {
			"width":"600px",
			"height":"302px",
			"left":"180px",
			"top":"126px",
			"text-align":"center"
		},		
		"ratepopup" : {
			"width":"437px",
			"height":"228px",
			"left":"261px",
			"top":"156px"
		},		
		"giftcard" : {
			"width":"615px",
			"height":"455px",
			"left":"173px",
			"top":"60px"
		},		
		"envchange" : {
			"width":"425px",
			"height":"380px",
			"left":"268px",
			"top":"80px"
		},
		"activate" : {
			"display":"none"
		},
		"activate_show5" : {
			"width":"536px",
			"height":"420px",
			"left":"210px",
			"top":"59px",
			"display":"block"
		},
	 	"activate_show6" : {
			"width":"638px",
			"height":"420px",
			"left":"158px",
			"top":"59px",
			"display":"block"
		},
	 	"activate_show7" : {
			"width":"740px",
			"height":"420px",
			"left":"98px",
			"top":"59px",
			"display":"block"
		},															
		"message_error_default" : { "width":"480px", "left":"240px", "top":"200px" },
		"message_error_purchase" : { "width":"545px", "left":"207px", "top":"200px" },
		"message_error_playback" : { "width":"385px", "left":"288px", "top":"200px" },
		"message_system_details" : { "width":"545px", "left":"207px", "top":"200px" },
		"message_content":{ "width":"400px", "left":"280px" },
		"message_content_callback":{ "width":"500px", "left":"230px" },
		"message_d2d_content":{ "width":"545px", "height":"400px", "left":"207px", "top" : "69px" },
		"message_exit":{ "width":"445px", "left":"260px" },
		"message_return":{ "width":"445px", "left":"260px" },
		"message_okcancel":{ "width":"545px", "left":"207px" },
		"message_okcancel_vert": { "width":"468px", "left":"240px", "top":"88px"},
        "message_three_button_vert": { "width":"468px", "left":"249px", "top":"88px"},
		"message_restart": { "width":"545px", "left":"207px" },
		"message_alreadyownuv" : { "width":"545px", "left":"207px" },
		"message_region_reset":{ "width":"545px", "left":"207px" },	
		"message_region_notdefault":{ "width":"545px", "left":"207px" },	
		"payment_table_popup":{ "width":"545px", "left":"207px" },		
		"audiopopup" :{"width":"545px","top":"65px","left":"207px","height":"410px"}			
	},
	"animation": {
		"wheel": {
			"options": {
				"duration": 200,
				"fps": 50,
				"link": "cancel",
				"transition": "Fx.Transitions.Sine.easeIn"
			},
			"properties": {
				"primary": {
					"focus":"#ffffff",
					"color":"#ffffff"
				},
				"secondary": {
					"color":"#585858"
				},
				"tertiary": {
					"color":"#373737"
				}
			}
		},
		"grid": {
			"similar":{
				"left":"150px"
			},
			"browse":{
				"left":"150px"
			},
			"options":{
				"duration": 300,
				"fps": 50,
				"transition": "Fx.Transitions.Sine.EaseIn"
			}
		}
	},
	"td_similar":{
		"s_audience": "Similar Audience",
		"s_mood": "Similar Mood",
		"s_plot": "Similar Plot",
		"s_test": "Similar Test",
		"s_time": "Similar Time/Period",
		"s_place": "Similar Place",
		"s_praise": "Similar Praise",
		"m_cast_crew": "Cast and Crew",
		"s_all": "Similar Movies",
		"s_all_TV_Show": "Similar TV Shows",
		"s_genres": "Similar Genre"
	},
	"td_moreinfo": {
		
		"m_cast_bios": "Cast Biographies",
		"m_images": "Images",
		"r_critics": "Critic Reviews",
		"r_user_revs": "User Reviews",
		"m_credits": "Credits",
		"m_technical_details": "Technical Details"
	},
	"td_reviews": {
		"r_critics": "Critic Reviews",
		"r_user_revs": "User Reviews"
	},
	"review_enum": {
		"r_critics": "CritictsReview",
		"r_user_revs": "UserReview"
	},
	"copyrightString":"&copy; 2013 Rovi Corporation. All Rights Reserved.",
	"gift_card_poup_heading_purchase_path": "Enter gift card or coupon.",
	"gift_card_poup_heading":"Enter Gift Card.",
	"gift_card_error_message":"Gift cards must be redeemed on a PC.<br /><span class='grey'>Go to <span class='link'>www.cinemanow.com/bbgiftcard</span> to redeem your gift card.</span>",
	"all_episodes" : "Details",
	"unwatched_episodes" : "Unwatched Episodes",
	"episodes" : "Episodes",
	"legal_title" : "LEGAL INFORMATION",
	"terms_title" : "TERMS OF SERVICE",
	"privacy_title" : "PRIVACY POLICY",
	"eula_title" : "END-USER LICENSE AGREEMENT",
	"wish_list_success" : "Add to Wish List Successful",
	"wish_list_fail" : "Add to Wish List Unsuccessful",
	"switch_user_notsetup" : "<strong>You need to configure parental controls for your account before using this feature. </strong><div class=\"content\">Go to <span class=\"url\">www.cinemanow.com/parent</span> to configure parental controls.</div>",
	"loading_enum": {
        "downloadingupdate"     : "Downloading Update...",
        "installingupdate"      : "Installing Update...",
        "loadingwishlist"       : "Loading Wish List...",
		"orderprocessing"       : "Processing Order...",
		"giftcard"              : "Validating Code...",
        "pin"                   : "Validating PIN...",
		"searching_donotuse"    : "Searching...",
		"wishlistadd"           : "Adding to Wish List...",
        "wishlistremove"        : "Removing from Wish List...",
		"library"               : "Loading My Library...",
		"loading"               : "Loading Videos...",
		"playback"              : "Loading Video...",
		"tvloading"             : "Loading TV Shows...",
		"loadinggeneric"        : "Loading...",
		"busy"                  : "Loading...",
		"activation"            : "Activating Device..."
	},
	"buy_text": {
		"TV_Show" : "Buy Series",
		"TV_Season" : "Buy Season",
		"TV_Episode" : "Buy Episode"
	},
	"unavailable_messages": {
		"NotAvailable_HoldBack" : { 
			"Message" : "This video became unavailable on {Date} due to content provider licensing restrictions.",
			"Content" : "It may become available again; please check back later."
		},  
		"NotAvailable_LicensorRestricted" : { 
			"Message" : "This video is currently unavailable for this device due to content provider licensing restrictions.",
			"Content" : "It may become available again; please check back later."
		},  
		"NotAvailable_NotArrived" : {
			"Message" : "This video is currently unavailable for this device.",
			"Content" : "It may become available; please check back later."
		},  
		"NotAvailable_In_This_Store" : { 
			"Message" : "This video is not licensed for playback from within this application due to content provider licensing restrictions.",
			"Content" : "It can only be played within [Retailer 1, Retailer 2, and Retailer 3 etc] applications."
		},  
		"NotAvailable_In_This_Territory" : { 
			"Message" : "This video is not licensed for playback from within this territory.",
			"Content" : "It can only be played within [Territory 1, Territory 2, and Territory 3 etc]."
		},
        "UV_Unavailable" : {
            "Message" : "This UltraViolet title is not available for playback from CinemaNow.",
            "Content" : "For details on where you can watch this title, go to www.uvvu.com"
        },
        "NotAvailable_Pre_Ordered" : {
			"Message" : "You pre-ordered this movie on {PurchaseDate}.",
			"Content" : "It is due to become available for playback on {Date}."
        },
		"NotAvailable_Aired_Episode" : {
			"Message" : "You bought a season pass on {PurchaseDate} which included this episode.",
			"Content" : "It is due to become available for playback on {Date}."
		}
	},
	"ownership_state" : {
		"title" : {
			"Bought_SD" : "You already own this movie.",  
			"Bought_HD" : "You already own this movie in HD.",  
			"Active_Rental_SD" : "Your current rental of this movie is still active.",  
			"Active_Rental_HD" : "Your current HD rental of this movie is still active.",  
			"Expired_Rental_SD" : "You previously rented this movie, but it has expired.",  
			"Expired_Rental_HD" : "You previously rented this movie in HD, but it has expired."
		},  
		"tv_title" : {
			"Bought_SD" : "You already own this episode.",  
			"Bought_HD" : "You already own this episode in HD.",  
			"TV_Own_Some_Episodes" : "You already own some episodes in this season.",  
			"TV_Own_Season_SD" : "You already own this season.",  
			"TV_Own_Season_HD" : "You already own this season in HD."
		}  
	},
	"currency_symbol":"$",
	"tax_string":"<span class=\"white\"> * </span> See email confirmation for applicable taxes",
	"title_availability":{
		"rent_not_available": "Rent&nbsp;not<br/>available",
		"buy_not_available": "Buy&nbsp;not<br/>available"
	},
	"checkout_messages": {
        "uv_error" : {
            "Title": "Checkout",
            "Message": "",
            "Content": "For more info, go to <span class='white'>www.uvvu.com</span>",
            "OK": "",
            "Footer": "",
            "Cancel": "Close"
        },
		"purchase_error":{
			"Title" : "Checkout",
			"Message" : "A network error occurred while processing this order: <br /> \"##title##\"",
			"Content" : "Please check your library, and see if this order was added. <br /> If it appears in the library and you have received an email receipt, the order was processed successfully. ",
			"OK" : "Go to My Library",
            "Footer": "",
			"Cancel" : "Close"
		},
		"Invalid_SKU_Or_Purchase_Option_ID" : { 
			"Title" : "Checkout",
			"Message" : "Your order cannot be completed.",
			"Content" : "This video is no longer available to buy and/or rent.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/store/support</span> and type the following error code in the search box: <span class=\"errorCode\">1 {m}</span>",
			"Cancel" : "Cancel"
		},
		"Rental_Warning" : { 
			"Title" : "Checkout",
			"Message" : "You are about to start watching \"##name##\".",
			"Content" : "If you start this video now, you have ##rentalperiod## hours to finish watching, and will only be able to watch it on this device.<br /><br />Do you want to proceed?",
			"Footer": "",
			"OK" : "YES",
			"Cancel" : "NO"
		},
		"User_Credit_Card_Security_Code_Is_Invalid" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card security code (CVV) is currently missing from your account.",
			"Content" : "You'll need to provide a valid credit card security code in order to proceed with your purchase.<br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">4 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"User_Credit_Card_Number_Is_Invalid" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card number is not valid.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">5 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"User_Credit_Card_Not_On_File_And_User_Does_Not_Have_Sufficient_Prepaid_Funds_For_This_Transaction" : { 
			"Title" : "Checkout",
			"Message" : "Your current coupon/gift card balance is not enough for this order.",
			"Content" : "You'll need to provide a valid credit card in order to proceed with your purchase.<br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">12 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"User_Credit_Card_Not_On_File" : { 
			"Title" : "Checkout",
			"Message" : "No credit card has been added to your account.",
			"Content" : "You'll need to provide a valid credit card in order to proceed with <br />your purchase.<br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">11 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"Transaction_Failed_Please_Verify_Credit_Card" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card could not be charged.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">7 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"User_Credit_Card_Is_Expired" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card has expired.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">6 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"Daily_Spending_Limit_Reached" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card could not be charged.",
			"Content" : "You have exceeded your credit card's spending limit.<br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">8 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"Credit_Card_Declined" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card could not be charged.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">7 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"Daily_Transaction_Limit_Reached" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card could not be charged.",
			"Content" : "You have exceeded your credit card's spending limit.<br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">9 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"AVS_Fail" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card address on file is invalid.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">10 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Close"
		},
		"User_Address_Is_Invalid" : { 
			"Title" : "Checkout",
			"Message" : "Your credit card address on file is invalid.",
			"Content" : "Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">3 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel"
		},
		"Title_ID_Not_Found" : { 
			"Title" : "Checkout",
			"Message" : "Your order cannot be completed.",
			"Content" : "This video is no longer available to buy and/or rent.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">1 {m}</span>",
			"Cancel" : "Cancel"
		},
		"Invalid_User_ID" : { 
			"Title" : "Checkout",
			"Message" : "Your order cannot be completed.",
			"Content" : "Your user account has been removed or deleted. Go to <span class=\"url\">www.cinemanow.com/billing</span> to create a new account.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2 {m}</span>",
			"Cancel" : "Cancel"
		},
		"no_internet" : { 
			"Title" : "Checkout",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512 {m}</span>",
			"OK" : "Try Again",
			"OK_Action": "retry",
			"Cancel" : "Cancel",
			"Cancel_Action": "",
			"MessageType" : "message_error_default"	
		},
		"socket_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2013 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"
		},
		"system_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"
		},
		"system_incorrecttime" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Your device's time or date is set incorrectly. Please check your settings and restart the application.",
			"Footer": "Having trouble? Go to <span class=\"url\">www.cinemanow.com/support</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_default"			
		}
		
	},
    "merch_messages": {
        "genre_unavailable": {
            "Message": "Error",
            "Content": "Sorry, this genre is temporarily unavailable.",
            "Close": "Close"
        }
    },
	"system_messages":{
		"region_error":{
			"MessageType": "message_content_callback",
			"Message":"CinemaNow is not available in this region.",
			"Close": "Exit"
		},
		"application_error":{
			"MessageType": "message_content",
			"Message":"Application Error.",
			"Close": "Exit"
		},
		"region_moved":{
			"MessageType": "message_region_reset",
			"Message":"This device has been moved outside of the region in which it was previously launched.",
			"Content":"Titles available in the CinemaNow store and your library vary based on region. Titles that you may have purchased from CinemaNow outside of your current region will currently not be available for playback.",
			"OK": "Continue",
			"Close": "Exit"
		},
		"region_notdefault":{
			"MessageType": "message_region_notdefault",
			"Message":"This device has been moved outside of the default region.",
			"Content":"Titles available in the CinemaNow store and your library vary based on region. Titles that you may have purchased from CinemaNow outside of your current region will currently not be available for playback.",
			"OK": "Continue",
			"Close": "Exit"
		},
		"region_moved_notallowed":{
			"MessageType": "message_content_callback",
			"Message":"CinemaNow is not available in this region.",
			"Content":"",
			"Close": "Exit"
		},
		"no_internet" : { 
			"Title" : "Checkout",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512 {m}</span>",
			"OK" : "Try Again",
			"OK_Action": "retry",
			"Cancel" : "Cancel",
			"Cancel_Action": "",
			"MessageType" : "message_error_default"	
		},
		"timeout_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2012 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"	
		},
		"socket_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2013 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"	
		},
		"system_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"	
		}
	},
    "already_purchased" : {
        "Title" : "Checkout",
        "Message" : "You already own this title in your CinemaNow library.",
        "Content" : "Select <span class=\"white\">'Play'</span> to play the title. If you select <span class=\"white\">'Purchase Again'</span>, your credit card on file will be charged for the full amount of the title's purchase price.",
        "OK" : "Purchase Again",
        "Cancel" : "Cancel",
        "Action": "Play"
    },
    "uv_responses": {
        "Inactive": {
            "code":"122",
            "status" : "AcctNotAvailable",
            "settingsPanelMessage" :"Your CinemaNow account is not currently linked to an UltraViolet account. Go to ##UvLink## to link an UltraViolet account to your CinemaNow account and enable access to your UltraViolet Digitial Collection."
        },
        "BlockedTOU": {
            "code":"205",
            "status" : "BlockedTOU",
            "settingsPanelMessage" :"Your UltraViolet account is blocked. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection."
        },
        "Archived": {
            "code":"210",
            "status" : "Archived",
            "settingsPanelMessage": "Your UltraViolet account is not active. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection."
        },
        "Inactive ": {
            "code":"331",
            "status" : "Inactive",
            "settingsPanelMessage" :"Your UltraViolet account is inactive. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection."

        },
        "Server_Error": {
            "code":"551",
            "status" : "Server Error",
            "settingsPanelMessage" :"There was a Server Error (551). UltraViolet features are not currently accessible. Please try again later."
        }
    },
    "uv_messages": {
        "account_Pending": {
            "Message" : "Your UltraViolet account is pending",
            "Content" : "You must verify your account to watch UltraViolet content. Verify your UltraViolet account by confirming your email address in the email that was sent to <span class='white'>{email}</span>.<br/><br/>If you don't see the message in your inbox, check your junk or spam folder.",
            "OK" : "Resend Email from UltraViolet", // TODO: we need the API method to send email - "Resend Email from UltraViolet",
            "Cancel" : "Close"
        },
        "account_BlockedTOU": {
            "Message" : "Your UltraViolet account is blocked",
            // TODO: we need the blocked TOU verbaige;
            "Content" : "Your UltraViolet account has been blocked since the UltraViolet Terms of Use have been updated since you last accepted them.<br/><br/>Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and then select 'Try Again'.",
            "OK" : "Try Again",
            "Cancel" : "Close"
        },
        "account_Inactive": {
            "Message" : "There is a problem with your UltraViolet account.",
            "Content" : "To purchase UltraViolet content, you must have a valid UltraViolet account. Please sign in to your UltraViolet account at www.uvvu.com for more information on your account status. Once you have resolved your account, select 'Try Again' to complete the checkout process.",
            "OK" : "Try Again",
            "Cancel" : "Not Now"
        },
        "account_default": {
            "Message" : "There is a problem with your UltraViolet account.",
            "Content" : "To purchase UltraViolet content, you must have a valid UltraViolet account. Please sign in to your UltraViolet account at www.uvvu.com for more information on your account status. Once you have resolved your account, select <span class=\"white\">'Try Again'</span> to complete the checkout process.",
            "OK" : "Try Again",
            "Cancel" : "Not Now"
        },
        "account_Expired": {
            "Message" : "Your UltraViolet account has expired",
            "Content" : "Because of the added benefits and additional rights that come with UltraViolet content, you'll need to link an UltraViolet account to your CinemaNow account to complete this purchase.<br/><br/>Your UV account has expired. Go to <span class=\"white\">www.cinemanow.com/account</span> to complete your account linking and then select <span class=\"white\">Try Again</span>.",
            "OK" : "Try Again",
            "Cancel" : "Not Now"
        },
        "account_AcctNotAvailable" : {
            "Message" : "Your UltraViolet account is not linked to your CinemaNow account",
            "Content" : "You selected a movie that comes with UltraViolet rights, allowing you to stream and download across multiple devices. You'll be able to access your purchased movies immediately after linking your UltraViolet account to your CinemaNow account.<br/><br/>Go to <span class=\"white\">www.cinemanow.com/account</span> to link your UltraViolet account or create a new one and then select 'Try Again'.",
            "OK" : "Try Again",
            "Cancel" : "Not Now"
        },
        "account_Server_Error": {
           "Message" : "There is a problem.",
           "Content" : "There was a Server Error (551). UltraViolet features are not currently accessible. Please try again later.",
           "OK" : "Try Again",
           "Cancel" : "Close"
        },
        "already_own" : {
            "Message" : "You already own this title in your CinemaNow library.",
            "Content" : "Select <span class=\"white\">'Play'</span> to play the title. If you select <span class=\"white\">'Purchase Again'</span>, your credit card on file will be charged for the full amount of the title's purchase price.",
            "OK" : "Purchase Again",
            "Cancel" : "Cancel",
            "Action" : "Play"
        },
        "HD_unavailable" : {
            "Title" : "Unable to Playback in HD.",
            "Message" : "You have HD rights to this title in your UltraViolet Digital Collection, but it is currently unavailable in HD on this device.",
            "Content" : "Do you want to watch in standard definition instead?",
            "OK" : "Play in SD",
            "Cancel" : "Close"
        },
        "technical_details": {
            "uv_library_view": "Your UltraViolet rights for this title are:",
            "uv_store_view": "UltraViolet rights are included with the purchase of this title, including:"
        },
        "success": {
            "Message": "Your UltraViolet account has been successfully ##status##.",
            "OK" : "Continue"
        },

        "settingsPanel": {
            "UVDeviceInactive":"CinemaNow is not currently activated on this device. Go to ##Activate## to activate CinemaNow and link to an existing UltraViolet account or create a new one.",
            "UVNotSupported": "Your CinemaNow account is not currently linked to an UltraViolet account. Go to ##UvLink## to link an UltraViolet account to your CinemaNow account and enable access to your UltraViolet Digitial Collection.",
            "Active": "Your CinemaNow account is currently linked to an UltraViolet account enabling access to your UltraViolet Digital Collection.",
            "Pending": "Your UltraViolet account is pending. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection.",
            "Deleted": "Your UltraViolet account has been deleted. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection.",
            "Suspended": "Your UltraViolet account has been suspended. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection.",
            "BlockedTOU": "Your UltraViolet account has been blocked since the UltraViolet Terms of Use have been updated since you last accepted them. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection",
            "Archived": "Your UltraViolet account is not active. Please log into your UltraViolet account at www.uvvu.com for more information",
            "Unlinking" : "Your UltraViolet account is not active. Please log into your UltraViolet account at www.uvvu.com for more information",
            "Inactive" : "Your UltraViolet account is inactive. Please sign in to your UltraViolet account at www.uvvu.com to resolve your account issue and enable access to your UltraViolet Digital Collection.",
            "Server Error" : "There was a Server Error (551). UltraViolet features are temporarily inaccessible. Please try again later.",
            "Status" : {
                "Active" : "Linked to CinemaNow (Expires on ##expiration##)",
                "Pending" : "Pending",
                "AcctNotAvailable" : "Account Not Available",
                "Unlinking" : "Unlinking",
                "BlockedTOU" : "Blocked due to UltraViolet Terms of Use update",
                "Archived" : "Inactive",
                "Suspended" : "Suspended",
                "Deleted" : "Deleted",
                "Inactive" : "Inactive",
                "Server Error" : "Server Error"
            }

        },
        "helpString" : "For details on where you can watch this title, go to <span class=\"white\">www.uvvu.com</span>",
        "uvTermsOfService" : {
            "ChangedMessage" : "The UltraViolet Terms of Use has changed",
            "UnacceptedMessage" : "UltraViolet Terms of Use",
            "Content" : "To purchase, access or playback UltraViolet content, you must accept the latest UltraViolet Terms of Use.",
            "OK" : "Accept UltraViolet Terms of Use",
            "Close" : "Not Now"
        }
    },
    "d2d_messages" : {
        "invalid" : {
            "Message" : "The disc you inserted could not be validated",
            "Content" : "You need to load the original disc that was used to qualify for the Disc to Digital Purchase",
            "OK" : "OK"
        },
        "already_own" : {
            "Message" : "We have found a similar title in your library",
            "Content" : "You have chosen to buy <span class=\"white\">##title##</span> via Disc to Digital, but you already have <span class=\"white\">##libTitle##</span> in your library. Do you still want to purchase <span class=\"white\">##title##</span> for $##price##?",
            "OK" : "Continue",
            "Cancel" : "Cancel"
        }
    },
	"store_messages":{
		"no_internet" : { 
			"Title" : "Checkout",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512 {m}</span>",
			"OK" : "Try Again",
			"OK_Action": "retry",
			"Cancel" : "Cancel",
			"Cancel_Action": "",
			"MessageType" : "message_error_default"	
		},
		"timeout_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2012 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType": "message_error_default"
		},
		"socket_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2013 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType": "message_error_default"
		},
		"system_error" : { 
			"Title" : "Checkout",
			"Message" : "Unable to contact the server.",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550 {m}</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"	
		},
		"Title_ID_Not_Found":{
			"Title" : "Error",
			"Message" : "We're sorry, the title no longer exists or you are trying to play the title from a geographical location that is not supported.",
			"Content" : "Currently, you can only play CinemaNow titles within the United States. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <br /><span class=\"errorCode\">515 {m}</span>",
			"Cancel" : "OK",
			"MessageType" : "message_content_callback"
		},
		"Similar_Titles_Not_Found":{
			"Title" : "Error",
			"Message" : "Similar titles not found.",
			"Content" : "No results were found.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <br /><span class=\"url\">{responseCode} {m}</span>",
			"Cancel" : "Cancel",
			"MessageType" : "message_content_callback"
		}
	},
	"testing_messages": {
        "connectionHeading" : "<span class=\"white\">Connection Type: ##type##</span><br/>",
        "storeHeading" : "<span class=\"white\">Store Connection: ##status##</span><br/>",
        "activationHeading" : "<span class=\"white\">Activation Status: ##status##</span><br/>",
	    "defaultString": "Errors",
	    "connected": "No Errors",
	    "notActivated": "Not Activated",
	    "activated": "Activated",
	    "testingBandwidth": "1 of 6 Testing Bandwidth",
	    "bwMessage": {
        	"SpeedResult1": "A sustained bandwidth of ##speed## Mbps is too slow to watch streaming videos at high quality. We recommend upgrading your Internet connection. ",
        	"SpeedResult2": "Good News! A sustained bandwidth of ##speed## Mbps will be sufficient to watch streaming videos at high quality. You might consider upgrading your Internet connection in order to view HD videos at the highest quality.",
            "SpeedResult3": "Good News! A sustained bandwidth of ##speed## Mbps is excellent. You can view HD videos at the highest quality. "
        },
        "connectionInfo" : {
            "None": "You are not connnected to the internet.",
            "Wireless" : "Wireless is typically slower than a wired connection. Try a wired connection for faster performance."
            },
        "activationInfo" : "You will be able to buy and rent movies if you activate.",
        "storeInfo": "The server is not responding.",
	    "connectionType": {
	        "none": "None",
	        "wireless": "Wireless",
	        "wired": "Wired",
	        "unknown": "Unknown"
	    },
	    "show_details": {
      	    "Title": "System Status Check Details",
        	"connectionType": "",
        	"connectionInfo": "",
        	"storeConnection": "",
        	"Cancel" : "Close",
        	"MessageType" : "message_system_details"
        }
	},
	"player_messages":{
		"connectiontooslow_error": {
			"Title": "Video Playback",
			"Message": "Your Internet connection is too slow to instantly stream this video.",
			"Content": "We recommend that you upgrade your Internet connection to enable instant streaming.",
			"OK": "Continue",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_connectiontooslow"
		},
		"connectiontooslow_error_sd": {
			"Title": "Video Playback",
			"Message": "Your Internet connection is too slow to instantly stream SD video.",
			"Content": "We recommend that you upgrade your Internet connection to enable instant SD streaming.",
			"OK": "Continue",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_connectiontooslow"
		},
		"connectiontooslow_error_hd": {
			"Title": "Video Playback",
			"Message": "Your Internet connection is too slow to instantly stream HD video.",
			"Content": "We recommend that you upgrade your Internet connection to enable instant streaming.",
			"OK": "Continue",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_connectiontooslow"
		},
		"connectiontooslow_error_player": {
			"Title": "Video Playback",
			"Message": "Your Internet connection is currently too slow to stream this video.",
			"Content": "<p>Other connected devices sharing your Internet connection may be downloading large files, or there may be heavy Internet usage in your local area.</p><p>We recommend that you upgrade your Internet connection so you can enjoy instant streaming without interruptions:</p><p>For a good video experience, we recommend 4 Mbps.<br/>For the best HD or 3D experience, we recommend at least 8 Mbps.</p>",
			"OK": "Stop",
			"Cancel": "Continue",
			"MessageType" : "message_error_connectiontooslow_player"
		},
        "askabouthdswap_error": {
            "Title": "Video Playback",
            "Message": "Your Internet connection is currently too slow to stream this video in HD.<br/>For the best HD experience, we recommend at least 8 Mbps",
            "Content":"If your connection speed is at least 8 Mbps, there may be heavy Internet usage in your local area or other devices sharing your Internet connection may be downloading large files. Cancel any downloads in progress or other operations that use bandwidth and then try resuming in HD.",
            "Footer": "OTHER OPTIONS<br/>If your connection speed is slower than 8 Mbps, consider upgrading your Internet connection so you can enjoy instant HD streaming without interruptions. For now, you can resume your program in SD to help ensure there will be no further interruptions. You may also choose to stop playback and resume later.",
            "TryAgain":"Resume in HD",
            "OK": "Continue in SD",
            "Cancel" : "Stop Playback",
            "MessageType" : "message_error_askabouthd"
        },
		"no_internet" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512</span>",
			"OK" : "Try Again",
			"OK_Action": "retry",
			"Cancel" : "Cancel",
			"Cancel_Action": "",
			"MessageType" : "message_error_default"	
		},
		"OnNetworkDisconnected" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"
		},
		"OnConnectionFailed" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to connect to the Internet.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">512</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"		
		},
		"timeout_error" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to contact the server.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2012</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"		
		},
		"socket_error" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to contact the server.",
			"Content" : "Make sure your network connection is active and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">2013</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"		
		},
		"system_error" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. We have encountered a technical playback error.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnRenderError" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. We have encountered a technical playback error.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnStreamNotFound" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. We have encountered a technical playback error.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnStreamNotFound_trailer" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to playback trailer.",
			"Content": "The trailer is currently unavailable. Please try again later.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnAuthenticationFailed" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to connect to license server.",
			"Content" : "Please check your Internet connection, and try again.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_default"
		},
		"OnWideVineError_550" : { 
			"Title" : "Video Playback",
			"Message" : "Unable to contact the server. ",
			"Content" : "Please retry in a few minutes.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_default"
		},
        "OnWideVineError_2004" : {
            "Title" : "Video Playback",
            "Message" : "Unable to contact the server. ",
            "Content" : "Please retry in a few minutes.",
            "Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">550</span>",
            "Cancel" : "OK",
            "MessageType" : "message_error_default"
        },
		"OnWideVineError_513" : { 
			"Title" : "Video Playback",
			"Message" : "This title cannot be watched at this moment because it is currently playing on another device simultaneously.",
			"Content" : "The same title cannot be watched simultaneously on more than one device due to content licensing restrictions. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">513</span>",
			"Cancel" : "OK"	,
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_514" : { 
			"Title" : "Video Playback",
			"Message" : "No credit card has been added to your account.",
			"Content" : "You'll need to provide a valid credit card in order to proceed with playback. <br /><br />Go to <span class=\"url\">www.cinemanow.com/billing</span> to update your billing information.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">514</span>",
			"OK" : "Try Again",
			"Cancel" : "Cancel",
			"MessageType" : "message_error_default"	
		},
		"OnWideVineError_515" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, the title no longer exists or you are trying to play the title from a geographical location that is not supported.",
			"Content" : "Currently, you can only play CinemaNow titles within the United States.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">515</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"	
		},
		"OnWideVineError_516" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. It appears this title cannot be played at your current geographic location due to content owner restrictions.",
			"Content": "Currently, you can only play CinemaNow titles within the United States.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">516</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"	
		},
		"OnWideVineError_517" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. We have encountered a technical error.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">517</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"		
		},
		"OnWideVineError_520" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, the title you are trying to stream is not available or on a different device.",
			"Content" : "Please reactivate this device with your CinemaNow account and retry. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">520</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_521" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, the title you are trying to stream is not available or on a different device.",
			"Content" : "Please reactivate this device with your CinemaNow account and retry. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">521</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_522" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, your rental has expired or your title is no longer available for streaming.",
			"Content" : "Please re-purchase the title and retry in a few minutes. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">522</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_523" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, your user name with this device cannot be matched.",
			"Content" : "Please reactivate this device with your CinemaNow account. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">523</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_524" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry. It appears this video cannot be watched on this device because you have used up all your available licenses.",
			"Content" : "You will need to stop playback from other devices, remove the video, or repurchase it. ",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">524</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_525" : { 
			"Title" : "Video Playback",
			"Message" : "We're sorry, the title was not found.",
			"Content" : "Please reactivate your device or update its software.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">525</span>",
			"Cancel" : "OK",
			"MessageType" : "message_error_playback"
		},
		"OnWideVineError_570" : { 
			"Title" : "Video Playback",
			"Message" : "Your account has been locked.",
			"Footer": "Still having trouble? Please go to <span class=\"url\">www.cinemanow.com/support</span> and type the following error code in the search box: <span class=\"errorCode\">570</span>",
			"Cancel" : "OK",			
			"MessageType" : "message_error_playback"
		}
	},
    "lib_d2d_info" :{
        "title" : "How to start the Disc to Digital process.",
        "step1": "Insert a DVD that you own into your device while CinemaNow is running.",
        "step2" : "CinemaNow will locate if there is a Disc to Digital offer for your Disc Media Type.",
        "step3" : "If your Disk Media Title appears as an offer in the CinemaNow store. follow the simple on-screen instructions."
    },
	"show_play_error":{
		"Not_Owned": {
			"Title":"",
			"Message":"You do not own this movie."
		},
		"Bought_SD":{
			"Title":"",
			"Message":"You already own this movie."
		},
		"Bought_HD":{
			"Title":"",
			"Message":"You already own this movie in HD."
		},
		"Active_Rental_SD":{
			"Title":"",
			"Message":"Your current rental of this movie is still active. "
		},
		"Active_Rental_HD":{
			"Title":"",
			"Message":"Your current HD rental of this movie is still active."
		},
		"Expired_Rental_SD":{
			"Title":"",
			"Message":"You previously rented this movie, but it has expired."
		},
		"Expired_Rental_HD":{
			"Title":"",
			"Message":"You previously rented this movie in HD, but it has expired."
		},
		"TV_Own_Some_Episodes":{
			"Title":"",
			"Message":""
		},
		"TV_Own_Season_SD":{
			"Title":"",
			"Message":""
		},
		"TV_Own_Season_HD":{
			"Title":"",
			"Message":""
		}
	},
	"confirmation" : {
		"buy" : {
			"Movie":"BUY",
			"TV_Season " : "BUY SEASON",
			"TV_Episode" : "BUY EPISODE"
		},
		"rent" : "RENT for {Period} Hrs",
		"hd" : " in HD"
	},
	"processing_strings":{
		"search_donotuse":"Searching..."
	},
	"activation_messages":{
		"success":{
			"Message":"<strong class=\"white\">Device activated successfully.</strong>",
			"Title":"",
			"OK":"OK"
		}
	},
	"LibMasterWheelOptions": {
		"Movies": "Movies",  
		"Movie_Rentals": "Movie Rentals",  
		"HD_Movies": "HD Movies",  
		"TV_Shows": "TV Shows",  
		"HD_TV_Shows": "HD TV Shows",
        "UV_Movies" : "My<br/>UltraViolet",
        "D2D_Movies" : "Disc to<br/>Digital"
	},
	"LibSlaveWheelOptions": {
		"All": "All",  
		"Never_Watched": "Never<br/>Watched",  
		"Unavailable": "Unavailable",  
		"Expired": "Expired",  
		"Expiring_Soon": "Expiring<br/>Soon",
        "Info" : "Info",
        "UltraViolet": "UltraViolet",
		"Action": "Action",
		"Adventure": "Adventure",
		"Animation": "Animation",
		"Comedy": "Comedy",
		"Drama": "Drama",
		"Family": "Family",
		"Horror": "Horror",
		"Reality": "Reality",
		"Romance": "Romance",
		"Sci-Fi": "Sci-Fi",
		"Sports": "Sports",
		"Thriller": "Thriller",
		"Westerns": "Westerns",
		"Animation and Cartoons": "Animation and Cartoons",
		"Food and Leisure": "Food and Leisure",
		"Home and Garden": "Home and Garden",
		"Music": "Music",
		"Reality and Game Shows": "Reality and Game Shows",
		"Other": "Other"
	},
	"SettingsWheelOptionStrings": {
		"General":"General",
		"Audio":"Audio",
		"Family":"Family",
		"Debug":"Test Setup Page",
		"Library":"My Library",
		"Activate": "Activate<br />Device",
		"GiftCards": "Gift Cards",
        "UV"    : "UltraViolet<br/>Account",
		"About": "About",
		"Format":"Format",
		"Parental":"Parental<br/>Controls",
		"RequirePIN": "Require PIN for Purchases",
		"RoxioNow": "Account Linking",
		"DeviceInfo":"Device Info",
		"ChangeEnvironment":"Change Environment",
		"ConfigurationValues":"Configuration Values",
		"AudioSupport":"Change Audio Format Support",
		"SystemStatus":"System Status"			
	},
	"HelpWheelOptionStrings": {
		"GettingStarted":"Getting<br />Started",
		"BrowsingStore":"Browsing the Store",
		"Searching":"Searching",
		"WishList":"Wish List",
		"Library":"My Library",
		"ParentalControls": "Parental<br/>Controls",
		"OnscreenControls": "On-screen Controls",
		"CustomerSupport": "Customer Support",
		"RentingBuying":"Renting or Buying",
        "Ultraviolet":"UltraViolet"
	},
	"support_strings": {
		"Support": "Having trouble? Go to <span class=\"url\">www.cinemanow.com/support</span>",
		"ErrorCode": "Error code: "
	},
	"pinPopup":{
		"left":"202"
	},
	"titleview_strings":{
		"Duration_Concat": " / ",
		"Starring_Concat_Length":"130"
	}
};

// Create response codes
(function() {
    var response;

    application.resource.uv_responseCodes = {};
    for (response in application.resource.uv_responses) {
        if (application.resource.uv_responses.hasOwnProperty(response)) {
            application.resource.uv_responseCodes[application.resource.uv_responses[response].code] = application.resource.uv_responses[response];
        }
    }
}());

