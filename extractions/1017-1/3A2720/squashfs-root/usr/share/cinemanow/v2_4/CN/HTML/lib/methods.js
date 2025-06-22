//-----------------------------------------------------------------------------
// methods.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author Rovi
 * Web Service Calls
 */

$cn.methods.DEBUG = false;

// TODO: move initBrowserMethods into its own files, and only include if asked for
// this should not go into production
function initAuthMethodOverrides() {
/*	
	log.write('Building browser overrides ... ');
	application.EndPoints['auth'] = "api/orbit/auth/default.ashx"; 
	application.EndPoints['browse'] = "api/orbit/browse/default.ashx";
	application.EndPoints['commerce'] = "api/orbit/commerce/default.ashx";
	application.EndPoints['library'] = "api/orbit/library/default.ashx";
	application.EndPoints['search'] = "api/orbit/search/default.ashx";
	application.EndPoints['stream'] = "api/orbit/stream/default.ashx";
	application.EndPoints['titledata'] = "api/orbit/titledata/default.ashx";
	application.EndPoints['util'] = "api/orbit/util/default.ashx";
	application.EndPoints['wishlist'] = "api/orbit/wishlist/default.ashx";
    application.EndPoints['uvTerms'] = "https://my.uvvu.com/Consent/Text/US/urn:dece:agreement:EndUserLicenseAgreement/html/Current/";

	$cn.methods.getTitleListing = function(titleID, info, callback){
		alert('test');
		var d = {
					data: {"id":"6_getFullSummary","result":{"releaseYear":"2012","bonusAssets":[{"bonusAssetID":689356,"profile":"STANDARD","bonusType":"Trailer"}],"availableProducts":[{"skuID":443530,"purchaseType":"buy","price":19.95,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264","availableAudioProfiles":[]}],"expireDateUTC":"2022-12-31T08:00:00.0000000-08:00","promoText":"","rentalPeriod":0,"isUV":"False"},{"skuID":443532,"purchaseType":"rent","price":3.99,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264","availableAudioProfiles":[]}],"expireDateUTC":"2012-08-08T07:00:00.0000000-07:00","promoText":"","rentalPeriod":24,"isUV":"False"}],"directors":"Michael Sucsy","actors":"Scott Speedman, Rachel Mcadams, Jessica Mcnamee, Channing Tatum, Sam Neill, Jessica Lange","writers":"","producers":"","copyright":"2012 Screen Gems, Inc. and Spyglass Entertainment Funding, LLC. All Rights Reserved.","ratingReason":"Rated PG-13 for an accident scene, sexual content, partial nudity and some language.","wheelItems":["m_technical_details"],"mPAARating":"PG13","synopsys":"Against all odds, young man must win back his wife's love after she loses her memory in a car accident..","metaValues":[{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"IsTHXMediaDirectorEnabled","keyValue":"False"},{"keyName":"IsTHXMediaDirectorEnabledForTrailer","keyValue":"False"},{"keyName":"IsFlashAccessDownloadAvailable","keyValue":"False"},{"keyName":"HD","keyValue":"False"},{"keyName":"CHVRSRating","keyValue":"NR"},{"keyName":"BBFCRating","keyValue":"NR"},{"keyName":"HasUV","keyValue":"False"},{"keyName":"ClipAuthor","keyValue":"SONY PICTURES ENTERTAINMENT"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour ,44 minutes"},{"keyName":"AirDate","keyValue":"4/6/2012 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":true,"buyPrice":19.95,"rentAvail":true,"rentPrice":3.99,"responseCode":0,"responseMessage":"Success","titleID":443529,"boxartPrefix":"the_vow_2012_4ba309c5_","name":"The Vow (2012)"}}
				};
		callback.call(self, d.data.result);
	}
	
	$cn.methods.getMerchandize = function(callback){	
	   var apiMethod = 'getMerchandize',
	       cb;
	       
	       cb = {
	       		data: {
	       			result: {    "id": "7_getMerchandize",    "result": {        "focusItem": {            "keyName": "FeaturedPromotion",            "keyValue": "443318"        },        "actionButtons": [            {                "text": "Continue to Store",                "actionKey": "Store",                "positionOnPage": 1            },            {                "text": "Go to My Library",                "actionKey": "MyLibrary",                "positionOnPage": 2            }        ],        "featuredPromotion": {            "titleID": 443318,            "boxartPrefix": "http://www.cinemanow.com/images/banners/377x148/haywire_29bd5a24_377.jpg",            "name": "Haywire"        },        "newCollections": [            {                "genreID": 11407,                "name": "Father's Day Collection",                "boxArtPrefix": "http://www.cinemanow.com/images/boxart/463/Promo_fatherday_2012_463.jpg"            },            {                "genreID": 12377,                "name": "Burn Notice",                "boxArtPrefix": "http://www.cinemanow.com/images/boxart/463/BurnNotice_FreePremiere_463.jpg"            }        ],        "newMovies": [            {                "titleID": 440089,                "boxartPrefix": "the_divide_14292e24_",                "name": "The Divide"            },            {                "titleID": 442925,                "boxartPrefix": "sherlock_holmes_a_game_of_adows_b42b6e58_",                "name": "Sherlock Holmes: A Game of Shadows"            },            {                "titleID": 443318,                "boxartPrefix": "haywire_29bd5a24_",                "name": "Haywire"            },            {                "titleID": 443325,                "boxartPrefix": "dixons_shame_92f89f1e_",                "name": "Shame"            }        ],        "newTVShows": [            {                "titleID": 445591,                "boxartPrefix": "journey_2_the_mysterious__sland_54982433_",                "name": "Journey 2: The Mysterious Island"            },            {                "titleID": 443325,                "boxartPrefix": "dixons_shame_92f89f1e_",                "name": "Shame"            },            {                "titleID": 442925,                "boxartPrefix": "sherlock_holmes_a_game_of_adows_b42b6e58_",                "name": "Sherlock Holmes: A Game of Shadows"            },            {                "titleID": 435543,                "boxartPrefix": "the_hangover_41e43dd4_",                "name": "The Hangover"            }        ],        "newCollectionHeader": "New Collections This Week",        "newMovieHeader": "New Movies",        "newTVShowHeader": "New Rentals",        "responseCode": 0,        "responseMessage": "Success"    }}
	       		}
	       }
	   	   
	   		$cn.data.Merch = cb.data.result;
	   		callback(cb.data.result);
	}
*/

    $cn.methods.pollForToken = function(callback) {
        log.write("automatic activation after a few, since we are not on a device");
        var result = {"id":"9_pollForToken","result":{"authToken":"a144df0b84615c62ac29b56509cb7778","deviceFriendlyName":"pp","emailAddress":"peng.litest001@rovicorp.com","adultPinEnabled":false,"parentPinEnabled":false,"purchasePinEnabled":false,"parentalControlsConfigured":false,"responseCode":0,"responseMessage":"Success"}}
        callback.call(this, result.result);
    };
		
	$cn.methods.getPurchasedTitle = function(passID, titleID, callback) {
		var buy = {
			data: {"id":"15_getPurchasedTitle","result":{"passID":1210171,"dateExpired":"2010-11-14T20:59:00.0000000-08:00","datePurchased":"2010-06-23T14:32:59.4370000-07:00","watchStatus":"WatchNow","streamPlayStatus":"stopped","streamStartTimeSeconds":4285,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2009","bonusAssets":[{"bonusAssetID":485468,"profile":"STANDARD","bonusType":"Trailer"}],"availableProducts":[{"skuID":381889,"purchaseType":"buy","price":19.95,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264"}],"expireDateUTC":"2010-11-14T08:00:00.0000000-08:00","promoText":"","rentalPeriod":0}],"directors":"Albert Hughes, Allen Hughes","actors":"Denzel Washington, Gary Oldman, Mila Kunis, Ray Stevenson, Jennifer Beals, Frances De La Tour, Michael Gambon","writers":"Gary Whitta","producers":"Joel Silver, Denzel Washington, Broderick Johnson, Andrew A. Kosove, David Valdes","copyright":"&copy; 2009 Alcon Film Fund, LLC","ratingReason":"","wheelItems":["m_cast_bios","m_cast_crew","m_credits","m_images","r_critics","r_user_revs","s_audience","s_mood","s_place","s_plot","s_praise","s_time"],"mPAARating":"R","synopsys":"In the not-too-distant future, some 30 years after the final war, a solitary man walks across the wasteland that was once America. A warrior not by choice but necessity, Eli (Denzel Washington) seeks only peace but, if challenged, will cut his attackers down before they realize their fatal mistake. It's not his life he guards so fiercely but his hope for the future; a hope he has carried and protected for 30 years and is determined to realize. Driven by this commitment and guided by his belief in something greater than himself, Eli does what he must to survive--and continue. Only one other man in this ruined world understands the power Eli holds, and is determined to make it his own: Carnegie (Gary Oldman), the self-appointed despot of a makeshift town of thieves and gunmen. Meanwhile, Carnegie's adopted daughter Solara (Mila Kunis) is fascinated by Eli for another reason: the glimpse he offers of what may exist beyond her stepfather's domain.","metaValues":[{"keyName":"HD","keyValue":"False"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 58 minutes."},{"keyName":"AirDate","keyValue":"6/15/2010 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"51Aud","keyValue":"False"},{"keyName":"HD","keyValue":"False"},{"keyName":"Extras","keyValue":"False"},{"keyName":"PromoString","keyValue":""},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":true,"buyPrice":19.95,"rentAvail":false,"rentPrice":0,"responseCode":0,"responseMessage":"Success","titleID":381888,"boxartPrefix":"the_book_of_eli_cbbd08c4_","name":"The Book of Eli"}}
		};
		var rent = {
				data:{
				    "id": "21_getPurchasedTitle",
				    "result": {
				        "passID": 7983526,
				        "dateExpired": "2022-12-31T00:00:00.0000000-08:00",
				        "datePurchased": "2011-12-02T18:12:50.0970000-08:00",
				        "watchStatus": "WatchNow",
				        "expirationMessage": "Expires 12/25/2012",
				        "streamPlayStatus": "stopped",
				        "streamStartTimeSeconds": 2281,
				        "storeLogoUrl": "http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png",
				        "isPassUV": true,
				        "releaseYear": "2011",
				        "bonusAssets": [
				            {
				                "bonusAssetID": 612974,
				                "profile": "STANDARD",
				                "bonusType": "Trailer"
				            }
				        ],
				        "availableProducts": [
				            {
				                "skuID": 422932,
				                "purchaseType": "rent",
				                "price": 4.99,
				                "availableAssets": [
				                    {
				                        "file_DRMProvider": "WIDEVINE",
				                        "file_AccessType": "STREAM",
				                        "file_FileProfile": "STANDARD",
				                        "file_VideoFormat": "H264",
				                        "availableAudioProfiles": []
				                    }
				                ],
				                "expireDateUTC": "2022-12-31T08:00:00.0000000-08:00",
				                "promoText": "",
				                "rentalPeriod": 48,
				                "isUV": "False"
				            }
				        ],
				        "directors": "Stephen Kay",
				        "actors": "",
				        "writers": "Donald Martin, Stephen Tolkin",
				        "producers": "",
				        "copyright": "2011 Sony Pictures Television Inc. All Rights Reserved.",
				        "ratingReason": "",
				        "wheelItems": [
				            "m_technical_details"
				        ],
				        "mPAARating": "NR",
				        "synopsys": "Seemingly flawless medical student Philip Markoff leads a double life and starts to descend into a twisted world of gambling, crime, battery and eventually murder, all while meeting his victims through Craigslist.",
				        "metaValues": [
				            {
				                "keyName": "TotalLicenses",
				                "keyValue": "1"
				            },
				            {
				                "keyName": "LicensesUsed",
				                "keyValue": "0"
				            },
				            {
				                "keyName": "LicensesRemaining",
				                "keyValue": "1"
				            },
				            {
				                "keyName": "LicensesDelivered",
				                "keyValue": "0"
				            },
				            {
				                "keyName": "IsTHXMediaDirectorEnabled",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "IsTHXMediaDirectorEnabledForTrailer",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "IsFlashAccessDownloadAvailable",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "HD",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "CHVRSRating",
				                "keyValue": "PG"
				            },
				            {
				                "keyName": "LoyaltyPointsForBuy",
				                "keyValue": "0"
				            },
				            {
				                "keyName": "LoyaltyPointsForRent",
				                "keyValue": "25"
				            },
				            {
				                "keyName": "HasUV",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "InUserWishlist",
				                "keyValue": "False"
				            },
				            {
				                "keyName": "RunTime",
				                "keyValue": "1 hour 28 minutes"
				            },
				            {
				                "keyName": "AirDate",
				                "keyValue": "10/12/2011 12:00:00 AM"
				            },
				            {
				                "keyName": "YourRating",
				                "keyValue": "4"
				            }
				        ],
				        "seasonTitleID": 0,
				        "showTitleID": 0,
				        "titleType": "Movie",
				        "buyAvail": false,
				        "buyPrice": 0,
				        "rentAvail": true,
				        "rentPrice": 4.99,
				        "responseCode": 0,
				        "responseMessage": "Success",
				        "titleID": 421827,
				        "boxartPrefix": "the_craigslist_killer_c80c0109_",
				        "name": "The Craigslist Killer"
				    }
				} 
				
				//{"id":"31_getPurchasedTitle","result":{"passID":1211189,"dateExpired":"2011-05-19T20:59:00.0000000-07:00","datePurchased":"2010-07-13T14:54:39.7230000-07:00","watchStatus":"WatchNow","expirationMessage":"Expires in 21 hr 8 m","streamPlayStatus":"stopped","streamStartTimeSeconds":7,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2010","bonusAssets":[{"bonusAssetID":492875,"profile":"STANDARD","bonusType":"Trailer"}],"availableProducts":[{"skuID":388095,"purchaseType":"rent","price":4.99,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264"},{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"HIGH_DEFINITION","file_VideoFormat":"H264"}],"expireDateUTC":"2011-05-19T07:00:00.0000000-07:00","promoText":"","rentalPeriod":24}],"directors":"Paul Field","actors":"Murray Cook, Jeff Fatt, Anthony Field, Sam Moran, Greg Page","writers":"","producers":"","copyright":"c) 2010 The Wiggles Pty Limited. The Wiggles logo, Dorothy the Dinosaur, Henry the Octopus, Captain Feathersword, Wags the Dog and Big Red Car are trademarks of The Wiggles Pty Limited.","ratingReason":"","wheelItems":["m_cast_bios","m_cast_crew","m_credits","m_images","r_critics","r_user_revs"],"mPAARating":"NR","synopsys":"The most successful children's entertainment group in the world has finally released a collection of their most loved songs, Hot Potatoes! The Best of The Wiggles. The Wiggles' songs have drawn millions of people over the years to see their live concerts. The New York Times called The Wiggles, the band that rocks the cradle and this is certainly true. They have set records for their sold out performances everywhere from Madison Square Garden in New York to the Hammersmith Apollo in London to their home town of Sydney, Australia. Their songs are instantly memorable and get you wiggling in seconds! Those same songs have seen music royalty line up to record music with the fab four of fun! We've picked the best for you to listen to!","metaValues":[{"keyName":"HD","keyValue":"True"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 20 minutes."},{"keyName":"AirDate","keyValue":"6/29/2010 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":false,"buyPrice":0,"rentAvail":true,"rentPrice":4.99,"responseCode":0,"responseMessage":"Success","titleID":388001,"boxartPrefix":"the_wiggles_hot_potatoes__ggles_c594d6e6_","name":"The Wiggles: Hot Potatoes! The Best Of The Wiggles"}}
			};	
		var expired = {
			data: {"id":"17_getPurchasedTitle","result":{"passID":1211189,"dateExpired":"2011-05-19T20:59:00.0000000-07:00","datePurchased":"2010-07-13T14:54:39.7230000-07:00","watchStatus":"ExpiredRental","expirationMessage":"Expired 7/14/2010","streamPlayStatus":"stopped","streamStartTimeSeconds":22,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2010","bonusAssets":[{"bonusAssetID":492875,"profile":"STANDARD","bonusType":"Trailer"}],"availableProducts":[{"skuID":388095,"purchaseType":"rent","price":4.99,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264"},{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"HIGH_DEFINITION","file_VideoFormat":"H264"}],"expireDateUTC":"2011-05-19T07:00:00.0000000-07:00","promoText":"","rentalPeriod":24}],"directors":"Paul Field","actors":"Murray Cook, Jeff Fatt, Anthony Field, Sam Moran, Greg Page","writers":"","producers":"","copyright":"c) 2010 The Wiggles Pty Limited. The Wiggles logo, Dorothy the Dinosaur, Henry the Octopus, Captain Feathersword, Wags the Dog and Big Red Car are trademarks of The Wiggles Pty Limited.","ratingReason":"","wheelItems":["r_critics","r_user_revs","m_credits","m_cast_bios","m_cast_crew","m_images","m_technical_details"],"mPAARating":"NR","synopsys":"The most successful children's entertainment group in the world has finally released a collection of their most loved songs, Hot Potatoes! The Best of The Wiggles. The Wiggles' songs have drawn millions of people over the years to see their live concerts. The New York Times called The Wiggles, the band that rocks the cradle and this is certainly true. They have set records for their sold out performances everywhere from Madison Square Garden in New York to the Hammersmith Apollo in London to their home town of Sydney, Australia. Their songs are instantly memorable and get you wiggling in seconds! Those same songs have seen music royalty line up to record music with the fab four of fun! We've picked the best for you to listen to!","metaValues":[{"keyName":"HD","keyValue":"True"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 20 minutes."},{"keyName":"AirDate","keyValue":"6/29/2010 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":false,"buyPrice":0,"rentAvail":true,"rentPrice":4.99,"responseCode":0,"responseMessage":"Success","titleID":388001,"boxartPrefix":"the_wiggles_hot_potatoes__ggles_c594d6e6_","name":"The Wiggles: Hot Potatoes! The Best Of The Wiggles"}}	
		};
		
		var notwatched = {
				data: {"id":"23_getPurchasedTitle","result":{"passID":1211257,"dateExpired":"2016-12-31T20:59:00.0000000-08:00","datePurchased":"2010-07-14T15:29:18.0630000-07:00","watchStatus":"WatchNow","expirationMessage":"","streamPlayStatus":"stopped","streamStartTimeSeconds":0,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2008","bonusAssets":[{"bonusAssetID":491966,"profile":"STANDARD","bonusType":"Trailer"}],"availableProducts":[{"skuID":386682,"purchaseType":"rent","price":3.99,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264"}],"expireDateUTC":"2010-12-13T08:00:00.0000000-08:00","promoText":"","rentalPeriod":24}],"directors":"Luis Eduardo Reyes","actors":"Silvia Navarro, Alan Estrada, Plutarco Haza, Rafael Amaya, Octavio Ocana, Shakti Urrutia","writers":"Luis Eduardo Reyes","producers":"Jorge Levy, Fernando Perez Gavilan, Pablo Martnez De Velasco","copyright":"&copy; MMVIII Lions Gate Films Inc., Videocine, S.A.de C.V., and Prinz Films. All Rights Reserved.","ratingReason":"","wheelItems":["r_critics","r_user_revs","m_credits","m_cast_bios","m_cast_crew","m_images","m_technical_details"],"mPAARating":"NR","synopsys":"Hanna makes a big mistake that puts her on a direct collision course with some eligible and not-so-eligible bachelors. Now, between her search for a new job and her hilarious forays into babysitting her best friend's son, Hanna has to find and retrieve \"lost money\" in this hilarious misadventure that proves romance happens where and when you least expect it.","metaValues":[{"keyName":"HD","keyValue":"False"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 39 minutes."},{"keyName":"AirDate","keyValue":"7/13/2010 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":false,"buyPrice":0,"rentAvail":true,"rentPrice":3.99,"responseCode":0,"responseMessage":"Success","titleID":338043,"boxartPrefix":"amor_letra_por_letra_431d97a6_","name":"Amor, Letra Por Letra"}}
		}
		
		var tv = {
			data: {"id":"23_getPurchasedTitle","result":{"passID":1212625,"dateExpired":"2010-11-03T00:00:00.0000000-07:00","datePurchased":"2010-08-05T15:30:16.4200000-07:00","watchStatus":"WatchNow","streamPlayStatus":"stopped","streamStartTimeSeconds":0,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2009","bonusAssets":[],"availableProducts":[{"skuID":368448,"purchaseType":"buy","price":1.99,"availableAssets":[{"file_DRMProvider":"WIDEVINE","file_AccessType":"STREAM","file_FileProfile":"STANDARD","file_VideoFormat":"H264"}],"expireDateUTC":"2010-11-03T07:00:00.0000000-07:00","promoText":"","rentalPeriod":0}],"directors":"Fred Toye","actors":"Elizabeth Mitchell, Morris Chestnut, Joel Gretsch, Lourdes Benedicto, Logan Huffman, Laura Vandervoort, Morena Baccarin","writers":"Diego Gutierrez, Christine Roum","producers":"Scott Peters, Jace Hall, Jeffrey Bell","copyright":"&trade; &amp; &copy; 2009 Warner Bros. Entertainment Inc.  All rights reserved.","ratingReason":"","wheelItems":["m_credits","m_cast_bios","m_cast_crew","m_technical_details"],"mPAARating":"NR","synopsys":"Chad reports from the Peace Ambassador Center as visas are issued to the first wave of Visitors, including Anna. Erica, paired with a V officer, begins tracking a death threat.","metaValues":[{"keyName":"TVSeasonHeader","keyValue":"V : Season 01"},{"keyName":"TVEpisodeHeader","keyValue":"Episode 03 : A Bright New Day"},{"keyName":"HD","keyValue":"False"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 0 minutes."},{"keyName":"AirDate","keyValue":"11/23/2009 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":367666,"showTitleID":367668,"titleType":"TV_Episode","buyAvail":true,"buyPrice":1.99,"rentAvail":false,"rentPrice":0,"responseCode":0,"responseMessage":"Success","titleID":368447,"boxartPrefix":"v__season_01__episode_03__w_day_a04116f8_","name":"A Bright New Day"}}
		}
		var unavailable = { 
			data: {"id":"24_getPurchasedTitle","result":{"passID":1204272,"dateExpired":"0001-01-01T00:00:00.0000000-08:00","datePurchased":"2010-04-09T10:21:55.6400000-07:00","watchStatus":"NotAvailable_HoldBack","streamPlayStatus":"stopped","streamStartTimeSeconds":0,"storeLogoUrl":"http://web1.cinemanow.com/img/BB_CN_logo_J_PSD_RGB.png","releaseYear":"2007","bonusAssets":[],"availableProducts":[],"directors":"","actors":"Daniel Tosh","writers":"","producers":"","copyright":"&copy;","ratingReason":"","wheelItems":["r_critics","r_user_revs","m_credits","m_cast_bios","m_cast_crew","m_technical_details"],"mPAARating":"NR","synopsys":"Comedy's chosen one, Daniel Tosh, has been healing the sick, stopping wars, helping underprivileged children... and filming Completely Serious, the single greatest hour in comedy.","metaValues":[{"keyName":"HD","keyValue":"False"},{"keyName":"InUserWishlist","keyValue":"False"},{"keyName":"RunTime","keyValue":"1 hour, 0 minutes."},{"keyName":"AirDate","keyValue":"5/30/2007 12:00:00 AM"},{"keyName":"YourRating","keyValue":"0"},{"keyName":"CriticsReview","keyValue":"12% liked it."},{"keyName":"Flixster Users","keyValue":"41% liked it."}],"seasonTitleID":0,"showTitleID":0,"titleType":"Movie","buyAvail":false,"buyPrice":0,"rentAvail":false,"rentPrice":0,"responseCode":0,"responseMessage":"Success","titleID":246511,"boxartPrefix":"daniel_tosh_completely_se_rious_db009af1_","name":"Daniel Tosh: Completely Serious"}}
		}
		
		$cn.utilities.adjustDate(rent.data.result, $cn.config.replacementPattern);
		callback.call(self, rent.data.result);
	}

	$cn.methods.verifyCode  = function(skuid, code, callback) {
		callback.call(self, {"giftCertificateBalance":2000,"discountAmount":99,"discountType":"Coupon","responseCode":0,"responseMessage":"Success"});
	}
	
	$cn.methods.getActivationString = function(callback) {
		setTimeout(function(){
			var code = Math.random() * 8999999;
			code += 1000000;
			code = parseInt(code);
			var r = {
				data: {"id":5,"result":code.toString()}
			}
			callback.call(self, r.data.result);
		}, 10);
	}
	
	$cn.methods.setupDevice = function(lastCacheTime, load, callback) {
		var r;

        switch ($cn.config.CurrentTheme) {
            case "dixons":
                r =  {
                    data: {"id":"1_setupDevice","result":{"sessionID":"93401f4b-6c71-4b26-b6b0-24a788d0eb47","configValues":[
                        {"keyName":"BandwithCheckURLSize","keyValue":"3757608"},
                        {"keyName":"AffId","keyValue":"12345"},
                        {"keyName":"ImageLoadTest","keyValue":"http://www.cinemanow.com/images/spacer.gif"},
                        {"keyName":"ParentalControlsConfigured","keyValue":"True"},
                        {"keyName":"ParentPinEnabled","keyValue":"False"},
                        {"keyName":"JinniEnable","keyValue":"False"},
                        {"keyName":"FlixsterEnable","keyValue":"False"},
                        {"keyName":"AdultPinEnabled","keyValue":"False"},{"keyName":"SessionLimitRows","keyValue":"30"},{"keyName":"SessionLimitMinutes","keyValue":"2"},{"keyName":"AllowAdult","keyValue":"False"},{"keyName":"AllowPlayboy","keyValue":"False"},{"keyName":"LastCacheLoadTimeUTC"},{"keyName":"ShouldUpdateCache","keyValue":"True"},{"keyName":"CountryID","keyValue":"1"},{"keyName":"ActivationURL","keyValue":"bestbuy.cinemanow.com/activate"},{"keyName":"DisplayEula","keyValue":"False"},{"keyName":"ShouldEnableTvNode","keyValue":"True"},{"keyName":"BandwithCheckURL","keyValue":"http://downloadtest.cinemanow.com.edgesuite.net/bumper1.vob"},{"keyName":"AuthTokenActive","keyValue":"False"}
                        ,{"keyName":"RecomendedGenreIds","keyValue":"10972,10991,11096"}
                        ,{"keyName":"DolbyEnable","keyValue":"False"}
                        ,{"keyName":"DTSEnable","keyValue":"False"}
                        ,{"keyName":"SystemUnavailableMessage","keyValue":"This is my test message"}
                        ,{"keyName": "RegionCode","keyValue": "eng"}
                        ,{"keyName": "AllowedRegions", "keyValue": "88,22,11"}
                        ,{"keyName": "CountryID", "keyValue": "82"}
                    ],"responseCode":0}}
                }
                break;
            case "bby":
            case "whitelabel":
                r = {
                    data: {"id":"2_setupDevice","result":{"sessionID":"d62760fd-3cef-4d3e-ad76-82ff0db79041","configValues":[{"keyName":"ParentPinEnabled","keyValue":"False"},{"keyName":"AdultPinEnabled","keyValue":"False"},{"keyName":"PurchasePinEnabled","keyValue":"False"},{"keyName":"ParentalControlsConfigured","keyValue":"False"},{"keyName":"SessionLimitRows","keyValue":"30"},{"keyName":"SessionLimitMinutes","keyValue":"2"},{"keyName":"AllowAdult","keyValue":"False"},{"keyName":"AllowPlayboy","keyValue":"False"},{"keyName":"RootMoodGenreID","keyValue":"10995"},{"keyName":"TVRootMoodGenreID","keyValue":"11040"},{"keyName":"RecomendedGenreIds","keyValue":"10972,10991,11096"},{"keyName":"ImageLoadTest","keyValue":"http://www.cinemanow.com/img/spacer.gif"},{"keyName":"FlixsterIcon","keyValue":""},{"keyName":"RottentomatoesIcon","keyValue":""},{"keyName":"JinniEnable","keyValue":"True"},{"keyName":"FlixsterEnable","keyValue":"True"},{"keyName":"BaselineEnable","keyValue":"True"},{"keyName":"DolbyEnable","keyValue":"True"},{"keyName":"DTSEnable","keyValue":"false"},{"keyName":"DolbyPlusEnable","keyValue":""},{"keyName":"DolbyStereoEnable","keyValue":""},{"keyName":"DTSStereoEnable","keyValue":""},{"keyName":"Dolby51TestFile","keyValue":""},{"keyName":"DTS51TestFile","keyValue":""},{"keyName":"DolbyStereoTestFile","keyValue":""},{"keyName":"DTSStereoTestFile","keyValue":""},{"keyName":"CountryID","keyValue":"1"},{"keyName":"CountryCode","keyValue":"usa"},{"keyName":"ClientIP","keyValue":"173.164.127.145"},{"keyName":"RegionCode","keyValue":"or"},{"keyName":"AllowedRegions","keyValue":"ab,aol,bc,mb,nb,nf,ns,nt,nu,on,pe,sk,yt,na,qc"},{"keyName":"LastCacheLoadTimeUTC","keyValue":"2012-06-28T19:47:02.0000000"},{"keyName":"ShouldUpdateCache","keyValue":"True"},{"keyName":"AffId","keyValue":"2314"},{"keyName":"ActivationURL","keyValue":"www.cinemanow.com/activate"},{"keyName":"EnableAccountLink","keyValue":"False"},{"keyName":"Account_Link_URL","keyValue":"www.roxionow.com/link"},{"keyName":"DisplayEula","keyValue":"False"},{"keyName":"ShouldEnableTvNode","keyValue":"True"},{"keyName":"BandwithCheckURL","keyValue":"http://downloadtest.cinemanow.com.edgesuite.net/bumper1.vob"},{"keyName":"MinimumHDNetworkSpeedMBPS","keyValue":"3.5"},{"keyName":"BandwithCheckURLSize","keyValue":"3757608"},{"keyName":"BandwidthCheckURLSize","keyValue":"3757608"},{"keyName":"GiftCardURL","keyValue":"www.cinemanow.com/bbgiftcard"},{"keyName":"AuthTokenActive","keyValue":"False"},{"keyName":"PollLibraryUpdateIntervalInSeconds","keyValue":"2"},{"keyName":"UVEnabled","keyValue":"False"}],"responseCode":0,"responseMessage":"Success"}}
                }
                break;
        }
		callback.call(self, r);
	}

	$cn.methods.lookupPurchaseDetailsForTitle = function(titleid, callback) {
		var r = {
			result: {"isAvailable":true, "passID":"0", "state":"Bought_SD", "responseCode":-1, "responseMessage":"Invalid API Key"}
		};
		
		callback.call(self, r.result);
	} 
	
	$cn.methods.checkIfTitleInLibrary = function(titleid, callback) {
		callback.call(self, false);
	}
	
	$cn.methods.getBillingInfo = function(callback) {

		var r =  {
				result: {"giftCertificateBalance":500,"responseCode":-1,"cCLast4":"1234","responseMessage":"Invalid API Key"}
			}
		callback.call(self, r.result);
	}
	
	$cn.methods.doPurchase = function(skuid, couponcode, callback) {
		var r =  {
				"result": {"passID":0,"responseCode":-1,"responseMessage":"Invalid API Key"}
			}
		callback.call(self, r.result);
		
	}
	
	$cn.methods.getGenres = function(titleType, callback) {
		var r = {"genres":[{"iD":10959,"name":"Action","visible":true,"parentId":0},{"iD":10960,"name":"Adventure","visible":true,"parentId":0},{"iD":10961,"name":"Animation","visible":true,"parentId":0},{"iD":10962,"name":"Comedy","visible":true,"parentId":0},{"iD":10963,"name":"Drama","visible":true,"parentId":0},{"iD":10964,"name":"Family","visible":true,"parentId":0},{"iD":10965,"name":"Horror","visible":true,"parentId":0},{"iD":10966,"name":"Romance","visible":true,"parentId":0},{"iD":10967,"name":"Sci-Fi","visible":true,"parentId":0},{"iD":10968,"name":"Thriller","visible":true,"parentId":0},{"iD":10969,"name":"Westerns","visible":true,"parentId":0}],"responseCode":0,"responseMessage":"Success"};
		callback.call(self, r.genres);
	}

	$cn.methods.getAvailMasterWheelOptions = function(callback) {
		var r = {
			"result": {
				"masterWheelOptionList": ["Movies", "TV_Shows", "Movie_Rentals", "HD_Movies"],
				"responseCode": 0
			}
		};
		callback.call(self, r.result);
	}
	$cn.methods.getAvailLibSlaveWheelOptionByMasterWheel = function(masterWheel, callback) {
		var r = {
			"slaveWheelOptionList": ["All", "Never_Watched", "Unavailable", "Expired", "Expiring_Soon"],
			"genreList": [{
				"iD": 10959,
				"name": "Action",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10960,
				"name": "Adventure",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10961,
				"name": "Animation",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10962,
				"name": "Comedy",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10963,
				"name": "Drama",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10964,
				"name": "Family",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10966,
				"name": "Romance",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10967,
				"name": "Sci-Fi",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 10968,
				"name": "Thriller",
				"visible": true,
				"parentId": 10954
			}, {
				"iD": 11070,
				"name": "Animation",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11073,
				"name": "Comedy",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11077,
				"name": "Drama",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11084,
				"name": "Reality",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11087,
				"name": "Sci-Fi",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11089,
				"name": "Sports",
				"visible": true,
				"parentId": 11062
			}, {
				"iD": 11093,
				"name": "Unscripted",
				"visible": true,
				"parentId": 11062
			}],
			"responseCode": 0,
			"responseMessage": "Success"
		};
		callback.call(self, r);
	}
	
	$cn.methods.getUserLibrary = function(genreId, filter1, filter2, callback) {
		var r = {
			"result": {
				"items": [{
					"passID": 7983526,
					"titleID": 421827,
					"boxartPrefix": "the_craigslist_killer_c80c0109_",
					"name": "The Craigslist Killer"
				}, {
					"passID": 1141057,
					"titleID": 375612,
					"boxartPrefix": "zoom_superheroes_",
					"name": "Zoom: Academy for Superheroes Zoom: Academy for Superheroes"
				}, {
					"passID": 1210171,
					"titleID": 381888,
					"boxartPrefix": "the_book_of_eli_cbbd08c4_",
					"name": "The Book of Eli"
				}, {
					"passID": 1208381,
					"titleID": 380431,
					"boxartPrefix": "avatar_a1ee5f9a_",
					"name": "Avatar"
				}, {
					"passID": 1144474,
					"titleID": 338330,
					"boxartPrefix": "van_helsing_a9793ba8_",
					"name": "Van Helsing"
				}, {
					"passID": 1141057,
					"titleID": 132184,
					"boxartPrefix": "zoom_superheroes_",
					"name": "Zoom: Academy for Superheroes Zoom: Academy for Superheroes"
				}, {
					"passID": 1141056,
					"titleID": 132184,
					"boxartPrefix": "zoom_superheroes_",
					"name": "Zoom: Academy for Superheroes"
				}, {
					"passID": 1140868,
					"titleID": 255028,
					"boxartPrefix": "magic_in_the_water_eeacf4ac_",
					"name": "Magic in the Water"
				}, {
					"passID": 1139654,
					"titleID": 26971,
					"boxartPrefix": "mirrormask_",
					"name": "MirrorMask"
				}],
				"responseCode": 0,
				"responseMessage": "Success"
			}
		};
		callback.call(self, r.result);
	}
	
	$cn.methods.getUserLibraryCounts = function(callback) {
		var r = {"id":"5_getUserLibraryCounts","result":{"libraryCounts":[{"keyName":"TotalTV","keyValue":"10"},{"keyName":"TotalMovies","keyValue":"174"},{"keyName":"TotalUnavailable","keyValue":"12"}],"responseCode":0,"responseMessage":"Success"}};
		var r1 = {"id":"93_getUserLibraryCounts","result":{"libraryCounts":[],"responseCode":31,"responseMessage":"AuthToken Not Available"}}
		callback.call(self, r.result.libraryCounts);
	}

	$cn.methods.checkUserWishListForItems = function(callback) {
		var r = {"result":true};
		callback.call(self, r.result);
	}

	$cn.methods.addItemToWishList = function(titleID, callback) {
		var r =  {"result": {"responseCode":0,"responseMessage":"Success"}}
		callback.call(self, r.result);
	}

	$cn.methods.getWishlist = function(filter, callback) {

		var empty = {
			"result": {
				"items": [],
				"responseCode": 0,
				"responseMessage": "Success"
			}
		};

		var r = {
			"result": {
				"items": [{
					"titleID": 387585,
					"boxartPrefix": "memphis_beat_bc0ce123_",
					"name": "Season 01"
				}, {
					"titleID": 387583,
					"boxartPrefix": "memphis_beat_bc0ce123_",
					"name": "Memphis Beat"
				}, {
					"titleID": 387580,
					"boxartPrefix": "memphis_beat__season_01___pilot_dee4c2c1_",
					"name": "Pilot"
				}, {
					"passID": 1141057,
					"titleID": 132184,
					"boxartPrefix": "zoom_superheroes_",
					"name": "Zoom: Academy for Superheroes Zoom: Academy for Superheroes"
				}, {
					"passID": 1141056,
					"titleID": 132184,
					"boxartPrefix": "zoom_superheroes_",
					"name": "Zoom: Academy for Superheroes Zoom: Academy for Superheroes"
				}, {
					"passID": 1140868,
					"titleID": 255028,
					"boxartPrefix": "magic_in_the_water_eeacf4ac_",
					"name": "Magic in the Water"
				}, {
					"passID": 1139654,
					"titleID": 26971,
					"boxartPrefix": "mirrormask_",
					"name": "MirrorMask"
				}, {
					"titleID": 375612,
					"boxartPrefix": "sherlock_holmes_15163820_",
					"name": "Sherlock Holmes"
				}, {
					"titleID": 377892,
					"boxartPrefix": "alvin_and_the_chipmunks_t_kquel_9ec1ca66_",
					"name": "Alvin and the Chipmunks: The Squeakquel Alvin and the Chipmunks: The Squeakquel"
				}, {
					"titleID": 374145,
					"boxartPrefix": "2012_403ab92b_",
					"name": "2012"
				}, {
					"titleID": 374691,
					"boxartPrefix": "imax_under_the_sea_4f9ead1e_",
					"name": "Under the Sea"
				}, {
					"titleID": 375605,
					"boxartPrefix": "the_blind_side_80b4e1eb_",
					"name": "The Blind Side"
				}, {
					"titleID": 375624,
					"boxartPrefix": "fantastic_mr_fox_46abb859_",
					"name": "Fantastic Mr. Fox"
				}],
				"responseCode": 0,
				"responseMessage": "Success"
			}
		};
		
		setTimeout(function(){
			callback.call(self, r.result);
		}, 500);
		
	}
	$cn.methods.removeItemFromWishList = function(titleID, callback) {
		var r = {"result":{"responseCode":0,"responseMessage":"Success"}};
		callback.call(self, r.result);
	}
}  

//----- Caching helper -----
$cn.methods.GetCacheKey = function(method, params, addparent) {
	var key = "Metadata|" + method + "|";
	if (addparent) {
	    key += ($cn.data.IsParent ? "1" : "0");
	}
	if (params) {
	    for (o in params) {
	        key += "," + params[o];
	    }
	}
	return key;
}

//----- BROWSE DATA CALLS ---------
$cn.methods.getNav = function(callback){	
   var apiMethod = 'getNavigation';
   webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, {}, this, callback, this.GetCacheKey(apiMethod, null, true));
}

$cn.methods.getMerchandize = function(callback){	
   var apiMethod = 'getMerchandize';
   
   webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, {}, this, function(cb){
   		$cn.data.Merch = cb.data.result;
   		callback.call(this, cb.data.result);
   });		 
}

$cn.methods.getBrowseForTitlesByGenreId = function(genreid, page, callback, filter) {
    var apiMethod = 'getBrowseList',
        params = {
	    	GenreID: genreid,
	        PageNum: page,
	        ItemsPerPage: $cn.data.PAGE_SIZE,
	        Sort: 'Standard',
	        ProfileFilter: 'none',
	        PurchaseType: (filter) ? filter : $cn.data.purchTypeFilter
    	};
	log.write("getBrowseForTitlesByGenreId Debug: Enter, calling getBrowseList with genreid " + genreid);
    webservices.makeAsyncRequest(application.EndPoints['browse'], 
    	apiMethod,
        params, 
    	this, 
    	function(result) {
    		log.write("getBrowseForTitlesByGenreId Debug: Back from getBrowseList for genreid " + genreid + " with " + result.data.result.items.length + "items");
	        if(result && !result.err && result.data && result.data.result) {
                 // Save the result in the titles page cache.
	            $cn.data.TitlesByGenrePages[page] = result;
	
	            var ids = [], ctr = 0;
	            for(ctr = 0; ctr < result.data.result.items.length; ctr++) {
	                ids[ctr] = result.data.result.items[ctr].titleID;
	            }
	
	            $cn.methods.getShortSummaryPlural(ids, function() {
	            	if ($cn.methods.DEBUG) log.write("getBrowseForTitlesByGenreId Debug: Invoking callback passing result with ids array:");
	            	if ($cn.methods.DEBUG) $cn.methods.dumpResultItems(result);
	                callback.call(this, result);
	            });
	        }
    	}, this.GetCacheKey(apiMethod, params, true));
};

$cn.methods.dumpResultItems = function(result) {
	if (result && result.data && result.data.result && result.data.result.items) {
	    var ids = [], ctr = 0;
	    for(ctr = 0; ctr < result.data.result.items.length; ctr++) {
	        ids[ctr] = result.data.result.items[ctr].titleID;
	    }
		log.write("dumpResultItems Debug: titleIds are " + log.dumpObj(ids));
	}
	else {
		log.write("dumpResultItems Debug: titleIds are EMPTY");
	}
};

$cn.methods.getTitlesByGenreId = function(genreid, page, callback, filter){
	log.write("getTitlesByGenreId Debug: Enter with genreid " + genreid);
	$cn.data.ContentIsFiltered = (!$cn.data.IsParent && $cn.data.ParentPinEnabled) ? true : false;
	
	//Don't cache the recommended genres
	var isRecommended = false;
	
	for(var i = 0; i < $cn.data.RecomendedGenreIds.length; i++) {
		if(parseInt($cn.data.RecomendedGenreIds[i]) == parseInt(genreid)) {
			isRecommended = true;
			break;
		}
	}
	if ($cn.methods.DEBUG) log.write("getTitlesByGenreId Debug: isRecommended is set to " + isRecommended);

    if (genreid != $cn.data.TitlesByGenreID) {
        // Reset the cached data.
        // For now, we're only going to keep one genre cached at a time, to keep memory
        // from growing unbounded. If we wanted to have multiple genres available, then 
        // we would need to have a container for genres (based on ID) with a nested
        // page container for each genre containing individual page results keyed off 
        // of the page numbers of the requests.
        //log.write('JN: getTitlesByGenreId - resetting genre');
        $cn.data.TitlesByGenreID = genreid;
        $cn.data.TitlesByGenrePages = {};
    }

	if(isRecommended || !$cn.data.TitlesByGenrePages[page]) {
		if ($cn.methods.DEBUG) log.write("getTitlesByGenreId Debug: Calling getBrowseForTitlesByGenreId (WS GetBrowseList) with genreid " + genreid);
		$cn.methods.getBrowseForTitlesByGenreId(genreid, page, callback, filter);
	}
	else {                           
		if ($cn.methods.DEBUG) log.write("getTitlesByGenreId Debug: Skipping WS GetBrowseList for genreid " + genreid + ", page " + page + " and invoking callback passing ids array:");
		if ($cn.methods.DEBUG) $cn.methods.dumpResultItems($cn.data.TitlesByGenrePages[page]);

        // We're using the cached values. Make sure we have the needed short summaries.
        // This is duplicated code from getBrowseForTitlesByGenreId. We should merge
        // that code somehow.
        var result = $cn.data.TitlesByGenrePages[page];
        var ids = [], ctr = 0;
        for(ctr = 0; ctr < result.data.result.items.length; ctr++) {
            ids[ctr] = result.data.result.items[ctr].titleID;
        }

        $cn.methods.getShortSummaryPlural(ids, function() {
        	if ($cn.methods.DEBUG) log.write("getBrowseForTitlesByGenreId Debug: Invoking callback passing cached result with ids array:");
    		callback.call(this, $cn.data.TitlesByGenrePages[page]);
        });
//          callback.call(this, $cn.data.TitlesByGenrePages[page]);
	}
};

$cn.methods.getBrowseListByCast = function(castid, page, callback){
	log.write("getBrowseListByCast Debug: Enter.");
    if(!$cn.data.TitlesByCast[castid + "-" + page]) {
        var apiMethod = 'getBrowseListByCast',
            params = {
                CastID: castid,
                PageNum: page,
                ItemsPerPage: $cn.data.PAGE_SIZE,
                Sort: 'Standard',
                ProfileFilter: 'none',
                PurchaseType: $cn.data.purchTypeFilter
            };
        webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
            $cn.methods.getSummariesForTheseIds(result, function() {
                if(result && !result.err && result.data && result.data.result) {
                    $cn.data.TitlesByCast[castid + "-" + page] = result;
                    callback.call(this, $cn.data.TitlesByCast[castid + "-" + page]);
                }
            });
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this, $cn.data.TitlesByCast[castid + "-" + page]);
    }
}

$cn.methods.getBrowseListByCastRole = function(castid, role, page, callback){
	log.write("getBrowseListByCastRole Debug: Enter.");
	var apiMethod = 'getBrowseListByCastRole',
	    params = { 
    	    CastID: castid,
    	    SearchOption: role,
            PageNum: page,
            ItemsPerPage: $cn.data.PAGE_SIZE,
            Sort: 'Standard',
            ProfileFilter: 'none',
            PurchaseType: $cn.data.purchTypeFilter
         };
    webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
    	 if(result && !result.err && result.data && result.data.result) {
             $cn.methods.getSummariesForTheseIds(result, function() {
                callback.call(this, result);
             });
	     }
     }, this.GetCacheKey(apiMethod, params, true));
}

$cn.methods.getBrowseListByGene = function(geneId, titleId, pageNum, callback){
	log.write("getBrowseListByGene Debug: Enter.");
    if(!$cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]) {
        var apiMethod = 'getBrowseListByGene',
            params = {
                GeneId: geneId,
                TitleId: titleId,
                PageNum: pageNum,
                ItemsPerPage: $cn.data.PAGE_SIZE,
                Sort: 'recommend',
                ProfileFilter: 'none',
                PurchaseType: $cn.data.purchTypeFilter
            };
        webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
            // TODO: getSummariesForTheseIds should be implemented here
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum] = result;
                callback.call(this, $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]);
            }
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this, $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]);
    }
}

$cn.methods.getBrowseListByGeneWithSimilarBy = function(geneId, titleId, pageNum, callback){
	log.write("getBrowseListByGeneWithSimilarBy Debug: Enter.");
    log.write("Method key: " + titleId + "-" + geneId + "-" + pageNum);
    if(!$cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]) {
        var apiMethod = 'getBrowseListByGeneWithSimilarBy',
            params = {
                GeneId: geneId,
                TitleId: titleId,
                PageNum: pageNum,
                ItemsPerPage: $cn.data.PAGE_SIZE,
                Sort: 'recommend',
                ProfileFilter: 'none',
                PurchaseType: $cn.data.purchTypeFilter
            };
        webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
            $cn.methods.getSummariesForTheseIds(result, function() {
                if(result && !result.err && result.data && result.data.result) {
                    // TODO: getSummariesForTheseIds should be implemented here
                    $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum] = result;
                    callback.call(this, $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]);
                }
            });
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this, $cn.data.TitlesBySimilar[titleId + "-" + geneId + "-" + pageNum]);
    }
}


$cn.methods.getGenesByWheelOptionPlural = function(titleId, callback){
	log.write("getGenesByWheelOptionPlural Debug: Enter.");
    if(!$cn.data.TitleRecommendations[titleId]) {
        var apiMethod = 'getGenesByWheelOptionPlural',
            params = {
                TitleId: titleId
            };
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data) {
                $cn.data.TitleRecommendations[titleId] = result.data.result;
                callback.call(this, result.data.result);
            }
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this, $cn.data.TitleRecommendations[titleId]);
    }
}

$cn.methods.getBrowseListBySimilar = function(similarby, titleid, page, category, callback){
	log.write("getBrowseListBySimilar Debug: Enter.");
    if(!$cn.data.TitlesBySimilar[titleid + "-" + similarby + "-" + category + "-" + page]) {
        var apiMethod = 'getBrowseListBySimilar',
            params = {
                SimilarBy: similarby,
                TitleID: titleid,
                CategoryID: category,
                PageNum: page,
                ItemsPerPage: 999,
                Sort: 'Standard',
                ProfileFilter: 'none',
                PurchaseType: $cn.data.purchTypeFilter
            };
        webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                // TODO: getSummariesForTheseIds should be implemented here
                $cn.data.TitlesBySimilar[titleid + "-" + similarby + "-" + category + "-" + page] = result;
                callback.call(this, $cn.data.TitlesBySimilar[titleid + "-" + similarby + "-" + category + "-" + page]);
            }
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this, $cn.data.TitlesBySimilar[titleid + "-" + page]);
    }
}

$cn.methods.getBundleListing = function(titleid, callback) {
	log.write("getBundleListing Debug: Enter.");
	var apiMethod = 'getBundleListing',
	    params = {TitleID: titleid};
    if(!$cn.data.getBundleListing[titleid]) {
        webservices.makeAsyncRequest(application.EndPoints['browse'], apiMethod, params, this, function(result){
            var titleIdsToGet = {};
            titleIdsToGet.data = {};
            titleIdsToGet.data.result = {};
            titleIdsToGet.data.result.items = result.data.result.bundleItems;
            $cn.methods.getSummariesForTheseIds(titleIdsToGet, function() {
                log.write("+++ getBundleListing after getShortSummaryPlural +++");
                $cn.data.getBundleListing[titleid] = result.data.result;
                callback.call(this, result.data.result);
            });
        }, this.GetCacheKey(apiMethod, params, true));
    }
    else {
        callback.call(this,$cn.data.getBundleListing[titleid]);
    }
}

$cn.methods.getBundleListingPurchased = function(titleid, callback) {
	log.write("getBundleListingPurchased Debug: Enter.");
    webservices.makeAsyncRequest(application.EndPoints['browse'], 'getBundleListingPurchased', {TitleID: titleid}, this, function(result){
        var titleIdsToGet = {};
        titleIdsToGet.data = {};
        titleIdsToGet.data.result = {};
        titleIdsToGet.data.result.items = result.data.result.bundleItems;
        $cn.methods.getSummariesForTheseIds(titleIdsToGet, function() {
            log.write("+++ getBundleListingPurchase after multiples +++");
            callback.call(this, result.data.result);
        });
    });
}

//------END BROWSE DATA CALLS-------


//------TITLE DATA CALLS-------
$cn.methods.getShortSummary = function(titleId, callback) {
    log.write("cn.methods.getShortSummary: Passed titleid is " + titleId);
    if(!$cn.data.TitleSummaryCache[titleId]) {
        var apiMethod = 'getShortSummary',
            params = { TitleID: titleId };
        webservices.killCurrentRequests();
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TitleSummaryCache[titleId] = result.data.result;

                //If there is a custom rating, override the default US rating
                if($cn.config.CustomRatingKey && $cn.config.CustomRatingKey != '' && $cn.data.CountryID == $cn.config.CustomRatingCountry){
                    var _rating = 'CR_' + $cn.utilities.getMeta($cn.config.CustomRatingKey, $cn.data.TitleSummaryCache[titleId].metaValues).replace(' ', '_').replace('+', '_Plus');
                    log.write("Custom Rating: " + _rating);
                    log.debug("Title: " + $cn.data.TitleSummaryCache[titleId].name + ", mPAARating: " + $cn.data.TitleSummaryCache[titleId].mPAARating + ", CHVRSRating:" +
                        $cn.utilities.getMeta("CHVRSRating", $cn.data.TitleSummaryCache[titleId].metaValues).replace(' ', '_').replace('+', '_Plus') +
                        ", BBFCRating: " + $cn.utilities.getMeta("BBFCRating", $cn.data.TitleSummaryCache[titleId].metaValues).replace(' ', '_').replace('+', '_Plus'));

                    //If there is a custom rating then overwrite the US rating
                    if(_rating != 'CR_'){
                        $cn.data.TitleSummaryCache[titleId].mPAARating = _rating;
                        log.debug("mPAARating changed to: " + _rating);
                    }

                    log.debug("############################");
                }

                //$cn.data.TitleSummaryCache[titleId].mPAARating = 'TVY';
                callback.call(this, $cn.data.TitleSummaryCache[titleId]);
            }
        }, this.GetCacheKey(apiMethod, params));
    } else {
        callback.call(this, $cn.data.TitleSummaryCache[titleId]);
    }
}

$cn.methods.getShortSummaryPlural = function(titleIds, callback) {

    log.write("cn.methods.getShortSummaryPlural: Passed titleids are " + titleIds);
    var cnt,
        cleanIds = [];

    //Only request titleids that are not already in cache
    for(cnt = 0; cnt < titleIds.length; cnt++){
        if(!$cn.data.TitleSummaryCache[titleIds[cnt]]){
            cleanIds[cleanIds.length] = titleIds[cnt];
        }
    }

    if(cleanIds.length > 0) {
        var apiMethod = 'getShortSummaryPlural',
            params = { TitleIDs: cleanIds.join() };
        webservices.killCurrentRequests();
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                result.data.result.each(function(item){
                    //If there is a custom rating, override the default US rating
                    if($cn.config.CustomRatingKey && $cn.config.CustomRatingKey != '' && $cn.data.CountryID == $cn.config.CustomRatingCountry){
                        item.mPAARating = $cn.utilities.getMeta($cn.config.CustomRatingKey, item.metaValues).replace('+', '_Plus');
                        item.mPAARating = "CR_" + item.mPAARating;
                    }
                    $cn.data.TitleSummaryCache[item.titleID] = item;
                });
                callback.call(this);
            }
        }, this.GetCacheKey(apiMethod, params));
    } else {
        callback.call(this);
    }
}


$cn.methods.getTitleListing = function(titleId, showPurchaseInfo, callback) {
    var apiMethod,
        apiParams;

    if(!$cn.data.TitleDetailCache[titleId] || showPurchaseInfo) {
        //[TODO] SUPPORT CA RATING SWITCH IN HERE
        apiMethod = 'getFullSummary';
        apiParams = {
            TitleID: titleId,
            IncludePurchaseData: showPurchaseInfo
        };

        webservices.killCurrentRequests();
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, apiParams, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                var _rating = '';

                // Adjust date if necessary
                $cn.utilities.adjustDate(result.data.result, $cn.config.replacementPattern);

                $cn.data.TitleDetailCache[titleId] = result.data.result;

                //If there is a custom rating, override the default US rating
                if($cn.config.CustomRatingKey && $cn.config.CustomRatingKey != '' && $cn.data.CountryID == $cn.config.CustomRatingCountry){
                    var _rating = 'CR_' + $cn.utilities.getMeta($cn.config.CustomRatingKey, $cn.data.TitleDetailCache[titleId].metaValues).replace(' ', '_').replace('+', '_Plus');
                    log.write("Custom Rating: " + _rating);

                    //If there is a custom rating then overwrite the US rating
                    if(_rating != 'CR_'){
                        $cn.data.TitleDetailCache[titleId].mPAARating = _rating;
                    }
                }

                callback.call(this, $cn.data.TitleDetailCache[titleId]);
            }
        });
    }
    else {
        callback.call(this,$cn.data.TitleDetailCache[titleId]);
    }
}

$cn.methods.getGenesByWheelOption = function(titleId, wheelOption, callback){
    var apiMethod = 'getGenesByWheelOption',
        params = {
            TitleID: titleId,
            WheelOption: wheelOption
        };
    webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
        if(result && !result.err && result.data && result.data.result) {
            callback.call(this, result.data.result);
        }
    }, this.GetCacheKey(apiMethod, params, true));
}

$cn.methods.getCastAndCrew = function(titleId, callback) {
    if(!$cn.data.TitleCastDetailCache[titleId]) {
        var apiMethod = 'getCastAndCrew',
            params = {TitleID: titleId};
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TitleCastDetailCache[titleId] = result.data.result;
                callback.call(this, $cn.data.TitleCastDetailCache[titleId]);
            }
        }, this.GetCacheKey(apiMethod, params));
    }
    else {
        callback.call(this,$cn.data.TitleCastDetailCache[titleId]);
    }
}

$cn.methods.getCastBio = function(castId, callback) {
    var apiMethod = 'getCastBio',
        params = {CastID: castId};
    webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
        if(result && !result.err && result.data && result.data.result) {
            callback.call(this, result.data.result);
        }
    }, this.GetCacheKey(apiMethod, params));
}

$cn.methods.getCastBios = function(titleId, callback) {
    var apiMethod = 'getCastBios',
        params = {TitleID: titleId};
    webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
        if(result && !result.err && result.data && result.data.result) {
            callback.call(this, result.data.result);
        }
    }, this.GetCacheKey(apiMethod, params));
}

$cn.methods.getCredits = function(titleId, callback) {
    if(!$cn.data.TitleCreditsCache[titleId]) {
        var apiMethod = 'getCredits',
            params = {TitleID: titleId};
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TitleCreditsCache[titleId] = result.data.result;
                callback.call(this, $cn.data.TitleCreditsCache[titleId]);
            }
        }, this.GetCacheKey(apiMethod, params));
    }
    else {
        callback.call(this,$cn.data.TitleCreditsCache[titleId]);
    }
}

$cn.methods.getImages = function(titleId, callback) {
    if(!$cn.data.TitleImagesCache[titleId]) {
        var apiMethod = 'getImages',
            params = {TitleID: titleId};
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TitleImagesCache[titleId] = result.data.result;
                callback.call(this, $cn.data.TitleImagesCache[titleId]);
            }
        }, this.GetCacheKey(apiMethod, params));
    }
    else {
        callback.call(this,$cn.data.TitleImagesCache[titleId]);
    }
}

$cn.methods.getTechnicalDetails = function(titleId, callback) {
    if(!$cn.data.TitleTechnicalDetailsCache[titleId]) {
        var apiMethod = 'getTechnicalDetails',
            params = {TitleId: titleId};
        webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
            if(result && !result.err) {
                $cn.data.TitleTechnicalDetailsCache[titleId] = result.data.result;
                callback.call(this, $cn.data.TitleTechnicalDetailsCache[titleId]);
            }
        }, this.GetCacheKey(apiMethod, params));
    }
    else {
        callback.call(this,$cn.data.TitleTechnicalDetailsCache[titleId]);
    }
}

$cn.methods.getReviews = function(titleId, filter, callback) {
    var apiMethod = 'getReviews',
        params = {TitleID: titleId, ReviewTypeFilter: filter};
    webservices.makeAsyncRequest(application.EndPoints['titledata'], apiMethod, params, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    }, this.GetCacheKey(apiMethod, params));
}

$cn.methods.getUpgradeOffers = function(titleId, callback) {
    webservices.makeAsyncRequest(application.EndPoints['titledata'], 'getUpgradeOffers', {TitleID: titleId}, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.rateTitle = function(titleId, rating, callback) {
    webservices.makeAsyncRequest(application.EndPoints['titledata'], 'rateTitle', {TitleID: titleId, Rating: rating}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result);
        }
    });
}

//------END TITLE DATA CALLS-------


//------SEARCH DATA CALLS-------
$cn.methods.getSearchTitle = function(query, searchoptions, callback) {
    log.write("+++ getSearchTitle +++");
    var senddata = {Query:query, SearchOption:searchoptions};
    webservices.killCurrentRequests();
    webservices.makeAsyncRequest(application.EndPoints['search'], 'searchTitle',  senddata, this, function(result){

        $cn.methods.getSummariesForTheseIds(result, function() {
            log.write("+++ getSearchTitle after getMultiples +++");
            $cn.data.TitleSearchCache["Search-" + query] = result.data.result;
            callback.call(this, $cn.data.TitleSearchCache["Search-" + query]);
        });

    });
}

$cn.methods.getSearchPerson = function(query, searchoptions, callback) {
    var senddata = {Query:query, SearchOption: searchoptions};

    webservices.killCurrentRequests();
    webservices.makeAsyncRequest(application.EndPoints['search'], 'searchPerson', senddata, this, function(result) {
        if(result && !result.err && result.data && result.data.result) {
            $cn.data.TitlePersonCache["SearchPerson-" + query] = result.data.result;
            callback.call(this, $cn.data.TitlePersonCache["SearchPerson-" + query]);
        }
    });
}
//------END SEARCH DATA CALLS-------


//------WISH LIST CALLS-------
$cn.methods.getWishlist = function(titleClass, callback) {
    webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'getWishlist',  {TitleTypeFilter:titleClass}, this, function(result){
        $cn.methods.getSummariesForTheseIds(result, function() {
            log.write("+++ getWishlist after multiples +++");
            callback.call(this, result.data.result);
        });
    });
}
$cn.methods.getWishlistExt = function(titleClass, callback) {
	webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'getWishlistExt',  {TitleTypeFilter:titleClass}, this, function(result){
		if(result && !result.err) {
			$cn.methods.getSummariesForTheseIds(result, function() {
				log.write("+++ getWishlistExt after getShortSummaryPlural +++");
				callback.call(this, result.data.result);
			});
		}
	});
}

$cn.methods.checkUserWishListForItems = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'checkUserWishListForItems',  {}, this, function(result){
        log.write("checkUserWishListForItems returned " + result.data.result);
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.addItemToWishList = function(titleID, callback) {
    webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'addItemToWishList',  {TitleID:titleID}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.removeAllItemsFromWishList = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'removeAllItemsFromWishList',  {}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.removeItemFromWishList = function(titleID, callback) {
    webservices.makeAsyncRequest(application.EndPoints['wishlist'], 'removeItemFromWishList',  {TitleID: titleID}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}
//------END WISH LIST CALLS-------


//------COMMERCE CALLS-------
$cn.methods.getBillingInfo = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'getBillingInfo',  {test:1}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.doPurchase = function(skuid, titleid, couponcode, callback) {

    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'doPurchase',  { "SKUID": skuid, "CouponCode": couponcode, "TitleID": titleid }, this, function(result){
        callback.call(this, result.data.result);
    });

}
$cn.methods.checkIfTitleInLibrary = function(titleid, callback) {
    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'checkIfTitleInLibrary',  { "TitleID": titleid }, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

// this method does NOT return isPassUv
$cn.methods.lookupPurchaseDetailsForTitle = function(titleid, callback) {
    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'lookupPurchaseDetailsForTitle',  { "TitleID": titleid }, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.verifyCode  = function(skuid, code, callback) {
    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'verifyCode',  { "SKUID" : skuid, "Code" : code }, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.applyGiftCode  = function(code, callback) {
    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'applyGiftCode',  { "Code" : code }, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.calcOrderTax = function(skuid, code, callback) {
	if ($cn.config.EnableTaxAPI){
	    webservices.makeAsyncRequest(application.EndPoints['commerce'], 'calcOrderTax', {"SKUID": skuid, "Code": code}, this, function(result) {
	        if(result && !result.err) {
	            callback.call(this, result.data.result);
	        }
	    });
	}
	else{
		calcOrderTaxDefault = new Object();
		calcOrderTaxDefault.subTotal = 0;
		calcOrderTaxDefault.tax = 0;
		calcOrderTaxDefault.errorHandled = false;
		callback.call(this, calcOrderTaxDefault);
	}
}
//------END COMMERCE CALLS---


//------AUTH CALLS-------
$cn.methods.pollForToken = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'pollForToken',  {test: 1}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
};

$cn.methods.verifyAuthToken = function(callback, doNotTriggerTimeouts) {
    if (application.authSupported) {
        // If authSupported verify the auth token
        webservices.makeAsyncRequest(application.EndPoints['auth'], 'verifyAuthToken',  {}, this, function(result){
            if(result && !result.err) {
                callback.call(this, result.data.result);
            }
        }, null, doNotTriggerTimeouts ? -1 : null);
    } 
    else {
        log.write("auto verifying::application.authSupported is false");
        callback.call(this, true);
    }
};

// TS: parental controls should moved into the model and subscribed to
$cn.methods.loadToken = function(callback, doNotTriggerTimeouts) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'loadToken',  {}, this, function(result){
        if(result && !result.err) {

            /* Auth Token delivered write auth file and set necessary values. This makes sure that all of the necessary data is synced when loadtoken is called. */
            //Set global properties for user
            $cn.data.AuthToken = result.data.result.authToken;
            $cn.data.AdultPinEnabled = result.data.result.adultPinEnabled;
            $cn.data.DeviceName = result.data.result.deviceFriendlyName ;
            $cn.data.UserEmailAddress = result.data.result.emailAddress;
            $cn.data.ParentalControlsConfigured = result.data.result.parentalControlsConfigured;

            application.saveAuthToken();

            callback.call(this, result.data.result);
        }
    }, null, doNotTriggerTimeouts ? -1 : null);
};

$cn.methods.getActivationString = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'getActivationString',  {test:1}, this, function(result){
        if(result && !result.err && result.data && result.data.result) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.checkParentPin = function(pin, callback) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'checkParentPin',  {PinCode:pin}, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.toggleParentPin = function(setting, callback) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'toggleParentPin',  {Setting:setting}, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.togglePurchasePin = function(setting, callback) {
    webservices.makeAsyncRequest(application.EndPoints['auth'], 'togglePurchasePin',  {Setting:setting}, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    });
}
//------END AUTH CALLS-------

//------UV CALLS-------------

$cn.methods.generalizedUvApiCall = function(methodName, callback, doNotTriggerTimeouts) {
    //webservices.makeAsyncRequest($cn.data.UvApiEndpoint, methodName, {}, this, function(result){
    webservices.makeAsyncRequest(application.EndPoints['uv_auth'], methodName, {}, this, function(result){
        if(result && !result.err) {
            callback(result.data.result);
        }
    }, null, doNotTriggerTimeouts ? -1 : null);
};

$cn.methods.getLinkingAccount = function(callback, doNotTriggerTimeouts) {
    $cn.methods.generalizedUvApiCall("getLinkingAccount", callback, doNotTriggerTimeouts);
};

$cn.methods.getAccountLinkState = function(callback, doNotTriggerTimeouts) {
    $cn.methods.generalizedUvApiCall("getAccountLinkState", callback, doNotTriggerTimeouts);
};
$cn.methods.loginUserUv = function(callback, doNotTriggerTimeouts) {
    $cn.methods.generalizedUvApiCall("loginUserUV", callback, doNotTriggerTimeouts);
};

$cn.methods.getUVTermsOfService = function(callback) {
    if(!$cn.data.UVTermsText) {
        $cn.methods.generalizedUvApiCall("getUVTermsOfService", callback);
    }
    else {
        callback.call(this,$cn.data.UVTermsText);
    }
}

//------END UV CALLS---------

//------UTILITY CALLS-------
$cn.methods.getLegalInfo = function(callback) {
    if(!$cn.data.LegalInfo) {

        // TODO: Need call to get legal text
        webservices.makeAsyncRequest(application.EndPoints['util'], 'getLegalInfo', {}, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.LegalInfo = result.data.result;
                callback.call(this, result.data.result);
            }
        });
    }
    else {
        callback.call(this,$cn.data.LegalInfo);
    }
}

$cn.methods.getTermsOfService = function(callback) {
    if(!$cn.data.TermsText) {

        webservices.makeAsyncRequest(application.EndPoints['util'], 'getTermsOfService', {}, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.TermsText = result.data.result;
                callback.call(this, result.data.result);
            }
        });
    }
    else {
        callback.call(this,$cn.data.TermsText);
    }
}

// Check if current TOS have been accepted
// Returns True or False
$cn.methods.getTermsOfServiceAcceptance = function(callback) {

    // until we find out the acceptance url, we have to return true:
    // TODO: follow up with 20-2117 and see if we have url yet
    callback.call(this, true);
    return;

    webservices.makeAsyncRequest(application.EndPoints['util'], 'getTermsOfServiceAcceptance', {}, this, function(result){
        if(result && !result.err && result.data) {
            callback.call(this, result.data.result);
        }
    });

}

$cn.methods.getPrivacyPolicy = function(callback) {
    if(!$cn.data.PrivacyText) {

        webservices.makeAsyncRequest(application.EndPoints['util'], 'getPrivacyPolicy', {}, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.PrivacyText = result.data.result;
                callback.call(this, result.data.result);
            }
        });
    }
    else {
        callback.call(this,$cn.data.PrivacyText);
    }
}

$cn.methods.getEulaText = function(callback) {
    if(!$cn.data.EulaText) {

        webservices.makeAsyncRequest(application.EndPoints['util'], 'getEulaText', {}, this, function(result){
            if(result && !result.err && result.data && result.data.result) {
                $cn.data.EulaText = result.data.result;
                callback.call(this, result);
            }
        });
    }
    else {
        callback.call(this,$cn.data.EulaText);
    }
}

$cn.methods.acceptEula = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['util'], 'acceptEula', {}, this, function(result){
        if(result && !result.err) {
            $cn.data.EulaText = '';
            callback.call(this, result);
        }
    });
}

$cn.methods.setupDevice = function(lastCacheTime, load, callback) {
    if(load) {
        webservices.makeAsyncRequest(application.EndPoints['util'], 'setupDevice', {LastCache_UTCTime: lastCacheTime}, this, function(result){
            if(result && !result.err) {
                $cn.data.DeviceSettings = result;
                callback.call(this, result);
            }
        });
    }
    else {
        callback.call(this, $cn.data.DeviceSettings);
    }
}

$cn.methods.recordSessionData = function(sessionData, callback) {
    webservices.makeAsyncRequest(application.EndPoints['util'], 'recordSessionData', {SessionData : sessionData}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result);
        }
    });
}

$cn.methods.recordSessionConnectionSpeedTest = function(transferDuration, callback) {
    webservices.makeAsyncRequest(application.EndPoints['util'], 'recordSessionConnectionSpeedTest', 
		{"TransferDuration" : transferDuration, "BytesTransferred": $cn.data.BandwithCheckURLSize}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result);
        }
    });
}

$cn.methods.defineErrorCode = function(errorcode, callback) {
    webservices.makeAsyncRequest(application.EndPoints['util'], 'defineErrorCode', {ErrorCode: errorcode}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result);
        }
    });
}

$cn.methods.headerTest = function(callback) {
    log.write('headertest');
    webservices.makeAsyncRequest(application.EndPoints['util'], 'CheckHeaderValues', {test:1}, this, function(result){
        log.write(result);
        log.write('callback');
    });
}


$cn.methods.getAudioDefaultProperty  = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['util'], 'getAudioDefaultProperty', {"test":"void" }, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.setAudioDefaultProperty  = function(codec, callback) {

    webservices.makeAsyncRequest(application.EndPoints['util'], 'setAudioDefaultProperty',  {"AudioSetting" : codec}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result);
        }
    });
}

//------END UTILITY CALLS-------

//-----LIBRARY CALLS -----------
$cn.methods.getPurchasedTitle = function(passID, titleID, callback) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getPurchasedTitle', {"PassID": passID, "TitleId": titleID}, this, function(result){
        if(result && !result.err) {
            // Adjust date if necessary
            $cn.utilities.adjustDate(result.data.result, $cn.config.replacementPattern);
            
            //When the watchStatus is NotAvailable, do callback directly without getTitleListing.
            if (result.data.result && result.data.result.watchStatus && result.data.result.watchStatus.indexOf('NotAvailable') >= 0 ) {
            	callback.call(this, result.data.result);
            	return;
            }
            
            //If a library title is requested but it does not exist in the local detail cache then also request it. This
            //would only happen if you go directly to a title in the library without first seeing it in the store.
            if(!$cn.data.TitleDetailCache[titleID]) {
                $cn.methods.getTitleListing(titleID, true, function(cb){
                	
                    //If there is a custom rating, override the default US rating
                    if($cn.config.CustomRatingKey && $cn.config.CustomRatingKey != '' && $cn.data.CountryID == $cn.config.CustomRatingCountry){
                        var _rating = 'CR_' + $cn.utilities.getMeta($cn.config.CustomRatingKey, result.data.result.metaValues).replace(' ', '_').replace('+', '_Plus');
                        log.write("Custom Rating: " + _rating);

                        //If there is a custom rating then overwrite the US rating
                        if(_rating != 'CR_'){
                            result.data.result.mPAARating = _rating;
                        }
                    }

                    callback.call(this, result.data.result);
                    cb.errorHandled = true;
                });
            }
            else {

                //If there is a custom rating, override the default US rating
                if($cn.config.CustomRatingKey && $cn.config.CustomRatingKey != '' && $cn.data.CountryID == $cn.config.CustomRatingCountry){
                    var _rating = 'CR_' + $cn.utilities.getMeta($cn.config.CustomRatingKey, result.data.result.metaValues).replace(' ', '_').replace('+', '_Plus');
                    log.write("Custom Rating: " + _rating);

                    //If there is a custom rating then overwrite the US rating
                    if(_rating != 'CR_'){
                        result.data.result.mPAARating = _rating;
                    }
                }

                callback.call(this, result.data.result);
            }

        }
    });
}


$cn.methods.getUserLibrary = function(genreId, filter1, filter2, callback) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getUserLibrary', 
		{GenreId: genreId, MasterWheel: filter1, SlaveWheel: filter2}, this, function(result){
        var resultLength = result.data.result.items.length,
            item;
        //we need this to use in determining which purchased titles were uv purchases
        $cn.data.isPassUVCache = {};
        if ($cn.config.EnableUV) {
            while(resultLength--){
                item = result.data.result.items[resultLength];
                $cn.data.isPassUVCache[item.passID] = {
                    "passID" : item.passID,
                    "isPassUV" : item.isPassUV
                }
            }
        }

        $cn.methods.getSummariesForTheseIds(result, function(){
            log.write("+++ getUserLibrary after getShortSummaryPlural +++");
            callback.call(this, result.data.result);
        });
    });
}

$cn.methods.getUserLibraryExt = function(callback) {
	webservices.makeAsyncRequest(application.EndPoints['library'], 'getUserLibraryExt', {}, this, function(result){
		if(result && !result.err) {
            var resultLength = result.data.result.items.length,
                item;
            //we need this to use in determining which purchased titles were uv purchases
            $cn.data.isPassUVCache = {};
            if ($cn.config.EnableUV) {
                while(resultLength--){
                    item = result.data.result.items[resultLength];
                    $cn.data.isPassUVCache[item.passID] = {
                        "passID" : item.passID,
                        "isPassUV" : item.isPassUV
                    }
                }
            }
            
			$cn.methods.getSummariesForTheseIds(result, function(){
				log.write("+++ getUserLibraryExt after getShortSummaryPlural +++");
				callback.call(this, result.data.result);
			});
		}
    }, null, application.appSetting("WSRequestTimeout") * 5);
}

//
$cn.methods.getSummariesForTheseIds = function(result, callback) {
    log.write("+++ getSummariesForTheseIds +++");

    var ids = [], ctr = 0;

    if(result && !result.err && result.data && result.data.result) {

        // Create collection of needed ids
        for(ctr = 0; ctr< result.data.result.items.length; ctr++) {

            // Capitalization of "titleID" in JSON responses
            if (result.data.result.items[ctr].titleID) {
                ids[ids.length] = result.data.result.items[ctr].titleID;
            } else if (result.data.result.items[ctr].TitleID) {
                ids[ids.length] = result.data.result.items[ctr].TitleID;
            } else {
                log.write("+++++ getSummariesForTheseIds error ++++++++");
            }
        }

        // Get summaries for need ids, then callback with data
        $cn.methods.getShortSummaryPlural(ids, callback);
    }
}

$cn.methods.getGenres = function(titleType, callback) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getGenres', {TitleType: titleType}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result.genres);
        }
    });
}

$cn.methods.getAvailGenresAndLibSlaveWheelOptions = function(callback) {
    // TODO: Need version of web service that takes master wheel option
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getAvailGenresAndLibSlaveWheelOptions', {}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.getAvailLibSlaveWheelOptionByMasterWheel = function(masterWheel, callback) {
    //[NOTE REMOVED CACHING PER PRODUCT MANAGEMENT] Cache for 5 mins
    //log.write($cn.data.LibraryWheelItems[masterWheel]);
    //log.write($cn.utilities.DateDiff(new Date(), $cn.data.LibraryWheelItemsLastLoaded));

    //if(!$cn.data.LibraryWheelItems[masterWheel] || $cn.utilities.DateDiff(new Date(), $cn.data.LibraryWheelItemsLastLoaded) > (1000 * 60 * 5)) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getAvailLibSlaveWheelOptionByMasterWheel', {MasterWheel : masterWheel}, this, function(result){
        if(result && !result.err) {
            $cn.data.LibraryWheelItems[masterWheel] = result.data.result;
            $cn.data.LibraryWheelItemsLastLoaded = new Date();
            log.write($cn.data.LibraryWheelItems[masterWheel]);
            callback.call(this,$cn.data.LibraryWheelItems[masterWheel]);
        }
    });
    //}
    //else {
    //   callback.call(this,$cn.data.LibraryWheelItems[masterWheel]);
    //}
}

$cn.methods.getAvailMasterWheelOptions = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getAvailMasterWheelOptions', {}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result);
        }
    });
}

$cn.methods.getUserLibraryCounts = function(callback) {
    webservices.makeAsyncRequest(application.EndPoints['library'], 'getUserLibraryCounts', {}, this, function(result){
        if(result && !result.err) {
            callback.call(this, result.data.result.libraryCounts);
        }
    });
}
//-----END LIBRARY CALLS -----------


//-----STREAMING CALLS -----------
$cn.methods.getBonusAssetLocation = function(assetid, callback) {
    if(!$cn.data.BonusAssetCache[assetid]) {
    	if (configuration.readValue("PreferredDRMProvider") == "DIVX"){
    		webservices.makeXMLAsyncRequest('api/DivX/getBonusAssetLocation/default.ashx', 'getBonusAssetLocation', {BonusAssetID: assetid, TagStart: '<DivXGetBonusAssetLocation>', TagEnd: '</DivXGetBonusAssetLocation>'}, this, function(result) {
                if(result && !result.err && result.data && result.data.result) {
	                $cn.data.BonusAssetCache[assetid] = result.data.result;
	                callback.call(this, $cn.data.BonusAssetCache[assetid]);
                }
            });
    	}
    	else{
    		webservices.makeAsyncRequest(application.EndPoints['stream'],'getBonusAssetLocation', {BonusAssetID: assetid}, this, function(result) {
	            if(result && !result.err && result.data && result.data.result) {
	                $cn.data.BonusAssetCache[assetid] = result.data.result;
	                callback.call(this, $cn.data.BonusAssetCache[assetid]);
	            }
	        });
    	}
    } else {
        callback.call(this, $cn.data.BonusAssetCache[assetid]);
    }
}

$cn.methods.getStreamingAssetLocation = function(passid, fileprofile, callback) {
    // [THIS CAN CHANGE NOT CACHING]if(!$cn.data.StreamAssetCache[passid + "-" + fileprofile]) {
	if (configuration.readValue("PreferredDRMProvider") == "DIVX"){
		webservices.makeXMLAsyncRequest('api/DivX/getStreamingURL/default.ashx', 'getStreamingAssetLocation', {PassID: passid, FileProfile: fileprofile, TagStart: '<DivXGetStreamingURL>', TagEnd: '</DivXGetStreamingURL>'}, this, function(result) {
            if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
            }
        });
	}
	else{
	    webservices.makeAsyncRequest(application.EndPoints['stream'],'getStreamingAssetLocation', {PassID: passid, FileProfile: fileprofile}, this, function(result) {
	        if(result && !result.err && result.data && result.data.result) {
	            //$cn.data.StreamAssetCache[passid] = result.data.result;
	            //callback.call(this, $cn.data.StreamAssetCache[passid]);
	            callback.call(this, result.data.result);
	        }
	    });
	}
//	} else {
//		callback.call(this, $cn.data.StreamAssetCache[passid]);
//	}
}

$cn.methods.sendStopMessageForStream = function(streamid, seconds, callback) {
	if (configuration.readValue("PreferredDRMProvider") == "DIVX"){	
		webservices.makeXMLAsyncRequest('api/DivX/sendStopMessageForStream/default.ashx', 'sendStopMessageForStream', {StreamID: streamid, StopTimeSeconds: seconds, TagStart: '<DivXsendStopMessageForStream>', TagEnd: '</DivXsendStopMessageForStream>'}, this, function(result) {
            if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
            }
        });
	}
	else{
	    webservices.makeAsyncRequest(application.EndPoints['stream'],'sendStopMessageForStream', {StreamID: streamid, StopTimeSeconds: seconds}, this, function(result) {
	        if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
	        }
	    });
	}
}

//[TODO]: How should this be used? In what scenario?
$cn.methods.loadLastStreamingAssetLocationForPass = function(passid, fileprofile, callback) {
	if (configuration.readValue("PreferredDRMProvider") == "DIVX"){
		webservices.makeXMLAsyncRequest('api/DivX/getLastStreaming/default.ashx', 'loadLastStreamingAssetLocationForPass', {PassID: passid, FileProfile: fileprofile, TagStart: '<DivXGetLastStreaming>', TagEnd: '</DivXGetLastStreaming>'}, this, function(result) {
            if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
            }
        });
	}
	else{
	    webservices.makeAsyncRequest(application.EndPoints['stream'],'loadLastStreamingAssetLocationForPass', {PassID: passid, FileProfile: fileprofile}, this, function(result) {
	        if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
	        }
	    });
	}
}

$cn.methods.updateResumeTimeForPass = function(passid, resumetimeinseconds, callback) {
	if (configuration.readValue("PreferredDRMProvider") == "DIVX"){
		webservices.makeXMLAsyncRequest('api/DivX/UpdateResumeTimeForPass/default.ashx', 'updateResumeTimeForPass', {PassID: passid, ResumeTimeInSeconds: resumetimeinseconds, TagStart: '<DivXUpdateResumeTimeForPass>', TagEnd: '</DivXUpdateResumeTimeForPass>'}, this, function(result) {
	           if(result && !result.err && result.data && result.data.result) {
		            callback.call(this, result.data.result);
	           }
	       });
	}
	else{
	    webservices.makeAsyncRequest(application.EndPoints['stream'],'updateResumeTimeForPass', {PassID: passid, ResumeTimeInSeconds: resumetimeinseconds}, this, function(result) {
	        if(result && !result.err && result.data && result.data.result) {
	            callback.call(this, result.data.result);
	        }
	    });
	}
}
//-----END STREAMING CALLS -----------
