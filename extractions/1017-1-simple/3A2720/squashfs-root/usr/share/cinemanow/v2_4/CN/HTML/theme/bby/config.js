//-----------------------------------------------------------------------------
// config.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * RES file used for platform/retailer specific settings.
 */
$cn.config.version = '2.5.1.3';
$cn.config.build = '650093';
$cn.config.DateFormat                   = "short";
$cn.config.EnableJinni				    = "auto";
$cn.config.EnableBaseline				= "auto";
$cn.config.EnableFlixster				= "auto";
$cn.config.EnableAllowedRegions			= true;

$cn.config.EnableSystemStatus			= false;
$cn.config.SystemStatusTimeoutS         = 30;
$cn.config.DefaultSelectedCountry		= 1;
$cn.config.AllowedRegionOverride		= 'auto'; //auto
$cn.config.DeviceID = 'auto';
$cn.config.AllowedCountries				= [1,41];
$cn.config.CustomRatingKey				= "CHVRSRating";
$cn.config.CustomRatingCountry			= 41;
$cn.config.PrecompiledApplication = true;
$cn.config.HighlightColor 				= "#FFFFFF";
$cn.config.ExcludeTaxAsterisk 			= true;
$cn.config.EnableMerch 					= true;
$cn.config.MaxMerchThumbs               = 5;
$cn.config.EnableSearchScreenSeparator  = true;

$cn.config.EnableUVPurchases            = true;
$cn.config.EnableUV						= true; // This is overridden by setup device
$cn.config.UVAccountLinkUrl 			= 'www.cinemanow.com/account';
$cn.config.EnableD2D					= false;
$cn.config.DeviceD2DEnabled				= false;
$cn.config.UVTOSEnabled                 = false;

$cn.config.ApiUrl 						= "auto";
$cn.config.CenterWheel       			= true;
$cn.config.EnableGiftCertificates 		= true;
$cn.config.EnableTaxAPI 				= true;
$cn.config.Debug = true;
$cn.config.OnScreenDebugLog = false;
$cn.config.IsCesDemo 					= false;
$cn.config.HackedDtsTitles 				= ['a'];
$cn.config.CustomEndPoint = '';
$cn.config.SyncLogsExternally = false;

$cn.config.PlayerBufferTimeout 			= 30000; //Amount of time that the loading icon can spin after stream info is called before it throws and error to the screen
$cn.config.HDChokeLimit 				= 3; //Number of times a widget has to buffer before it switches to SD stream
$cn.config.HDLongChokeLimit 			= 4;
$cn.config.HDChokeTimeSpan 				= 120; //Amount of time in seconds that the choke limit is enforced. If 1 then if a title buffers x time in 1 minute switch to SD stream
$cn.config.LongWindowMinutes 			= 30;  // 30 mins long choke time limit.
$cn.config.BandwidthCheckTTL 			= 500000; //Time in seconds that a valid bandwidth check is valid
$cn.config.HDMinimumBandwidth 			= 250000; //Mininum bytes per second supported for HD Playback
$cn.config.SDMinimumBandwidth 			= 87500; // Minimum bytes per second support for standard definition playback
$cn.config.RegisterBufferGracePeriod 	= 10;  // No use
$cn.config.HDMaxBufferSeconds 			= 10;  // No use
$cn.config.SDMaxBufferSeconds 			= 30;  // No use
$cn.config.NetworkConnectTimeout		= 125; // Timeout in seconds sent to SDK.  
$cn.config.NetworkSendTimeout			= 125; // Timeout in seconds sent to SDK.
$cn.config.NetworkReceiveTimeout		= 125; // Timeout in seconds sent to SDK.
$cn.config.WSRequestTimeout				= 120; // Timeout in seconds used for client side makeAsyncRequest timeout.
$cn.config.RewindUponResumeS 			= 20;
$cn.config.EarliestResumeS				= 30; // RewindUponResumeS will be subtracted from this on resume
$cn.config.replacementPattern           = "$1/$2/$3";

//Creds ['<DEV TYPE>_<PROCESSOR (SS, BCOM)>_<FIRMWARE YEAR>_<COUNTRY ID>']

// USING - BD_SS_2011_1

//TV's
// affid

// Aff id - 4425
//$cn.config.ApiKeyCollection['BD_SS_2013_1'] = "jg23SAFt0Z+ll6LX3mJZpdp0OpEWzU1p0a0tKleFh0qBFm6G9I4xqg==";
//$cn.config.DeviceTypeCollection['BD_SS_2013_1'] = "1030";

// Aff id - 4426
//$cn.config.ApiKeyCollection['HTS_SS_2013_1'] = "DUER0TEsWi3KoBrm5ydY6KV/D0uv12OcQqBg+aPWJAd8SlIOZU7Ozg==";
//$cn.config.DeviceTypeCollection['HTS_SS_2013_1'] = "1031";

// Aff id - 4429
//$cn.config.ApiKeyCollection['TV_SS_2013_1'] = "+PRZjtJY5N49F1WuCFOQmaqeJOtX3KSwCb+ElceTQh4WdruuGx+J0w==";
//$cn.config.DeviceTypeCollection['TV_SS_2013_1'] = "1034";

// Aff id - 4427
//$cn.config.ApiKeyCollection['TV_MSTAR_2013_1'] = "yLBsDAS467Hn7IHyOv8JLx45fNNO1va+rO+eCncHKsixpky2J1AzKg==";
//$cn.config.DeviceTypeCollection['TV_MSTAR_2013_1'] = "1032";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Aff id - 4099
//$cn.config.ApiKeyCollection['TV_SS_2012_1'] = "0ITNEWl79Uk/Xvxyb9S3b6sQp3NP9jsrNdJSOsepZdLMaOWGauyMWw==";
//$cn.config.DeviceTypeCollection['TV_SS_2012_1'] = "881";

// Aff id - 4100
//$cn.config.ApiKeyCollection['TV_MSTAR_2012_1']	= "vi3JPI3CEw1xiKT1cBEW3j66zfIUuO4fgydmaTo0Exew0HgW1jEvFA==";
//$cn.config.DeviceTypeCollection['TV_MSTAR_2012_1'] = "882";

// Aff id - 4101
//$cn.config.ApiKeyCollection['BD_SS_2012_1']	= "CUFsizcAQMN+zmVmcYYI6L+G+uNnpdgl7nBLTjMw9y6YCtF50urybw==";
//$cn.config.DeviceTypeCollection['BD_SS_2012_1'] = "883";

// Aff id - 4102
//$cn.config.ApiKeyCollection['HTS_SS_2012_1'] = "EIzfpvmwuPUYF34+s17yV0iQFgcTABdDyINfFEN5MS5ajb8aeJcCpw==";
//$cn.config.DeviceTypeCollection['HTS_SS_2012_1'] = "884";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Aff id - 4103
//$cn.config.ApiKeyCollection['TV_SS_2011_1'] = "XrzOhzuCDBh4rIZA0UpLyTW0rpCrCFjTwLCT7TKMoTKS07xi7na26w==";
//$cn.config.DeviceTypeCollection['TV_SS_2011_1'] = "885";

// Aff id - 4104
//$cn.config.ApiKeyCollection['TV_MSTAR_2011_1']	= "a8pKWePleYwIl4PkBJiRDixJBEITpZayuXkxnNd2SCBaBjdv1SwTBg==";
//$cn.config.DeviceTypeCollection['TV_MSTAR_2011_1'] = "886";

// Aff id - 4105
//$cn.config.ApiKeyCollection['BD_SS_2011_1']	= "vfO+ukyDWwWNuIpCyIhfti6wTAN00JmmPLDFClORdt2SDLnQj1cmTQ==";
//$cn.config.DeviceTypeCollection['BD_SS_2011_1'] = "887";

// Aff id - 4106
//$cn.config.ApiKeyCollection['HTS_SS_2011_1'] = "l20uTP78XKDx4jJgPktWwARVGoGMxWYubCLu70jn3fjPtcF1nl5Ryw==";
//$cn.config.DeviceTypeCollection['HTS_SS_2011_1'] = "888";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Aff id - 4108
//$cn.config.ApiKeyCollection['TV_SS_2010_1']	= "czJnZL9aoyUfDlVy8KgWBVzjsumOxnNJXOGI3/LGGZahvX9nnDpOGQ==";
//$cn.config.DeviceTypeCollection['TV_SS_2010_1'] = "890";

// Aff id - 4109
//$cn.config.ApiKeyCollection['BD_SS_2010_1']	= "TYite4PWA3FmQp2Zf1QeBGm1U48/IAqcwD082DW+L2ygKHY7avpKiA==";
//$cn.config.DeviceTypeCollection['BD_SS_2010_1'] = "891";

// Aff id - 4110
//$cn.config.ApiKeyCollection['HTS_SS_2010_1'] = "+n77ALLM3V3u4QegU+a210VsqeSnDTHEgxUhSIvAN45z6rDMGb/7ng==";
//$cn.config.DeviceTypeCollection['HTS_SS_2010_1'] = "892";

// Aff id - 4111
//$cn.config.ApiKeyCollection['BD_BCOM_2010_1'] = "bgLUmshlOR6oNc1JN2YlPfxU0pLJj9QrJIiAIFCS6J3t3z72WyrgXw==";
//$cn.config.DeviceTypeCollection['BD_BCOM_2010_1'] = "893";

// Aff id - 4111
//$cn.config.ApiKeyCollection['BD_BCOM_2011_1'] = "bgLUmshlOR6oNc1JN2YlPfxU0pLJj9QrJIiAIFCS6J3t3z72WyrgXw==";
//$cn.config.DeviceTypeCollection['BD_BCOM_2011_1'] = "893";

// Aff id - 4111
//$cn.config.ApiKeyCollection['BD_BCOM_2012_1'] = "bgLUmshlOR6oNc1JN2YlPfxU0pLJj9QrJIiAIFCS6J3t3z72WyrgXw==";
//$cn.config.DeviceTypeCollection['BD_BCOM_2012_1'] = "893";

// Aff id - 4112
//$cn.config.ApiKeyCollection['BD_HTS_2010_1'] = "T4rOuzyeE8fxpJg/DyLVmL8oRpoMhKuu1sdbnrYa4ZelBF7dD5Dh9g==";
//$cn.config.DeviceTypeCollection['BD_HTS_2010_1'] = "894";

// Canada ----------------------------------

// Affid 4420
//$cn.config.ApiKeyCollection['BD_SS_2013_41']		= "xGhA3Dl54jXSFabsmLv8kXOOwfji8Hzjw1hFCLvSTEwg9Ug2uDUf4Q==";
//$cn.config.DeviceTypeCollection['BD_SS_2013_41'] = "1025";

// Affid 4421
//$cn.config.ApiKeyCollection['HTS_SS_2013_41']		= "ZKMW32sf0z5PjTuxC1UYqGoqhx7CYWrRvLxNiQhYOiQiRnSS4jc3Yg==";
//$cn.config.DeviceTypeCollection['HTS_SS_2013_41'] = "1026";

// Affid 4422
//$cn.config.ApiKeyCollection['TV_MSTAR_2013_41']		= "DO6eh77ujODRI0YuLPxJkIP0A6qfnkr3yu7WcGq+z5CvbiMbf1JmRg==";
//$cn.config.DeviceTypeCollection['TV_MSTAR_2013_41'] = "1027";

// Affid 4424
//$cn.config.ApiKeyCollection['TV_SS_2013_41']		= "uQgRFf2qkdHuHhDEdTshRMkI6cd0qJTtJRJS+CFuAEFMepRJ8D1GRg==";
//$cn.config.DeviceTypeCollection['TV_SS_2013_41'] = "1029";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//TV CA CREDS
// affid
//$cn.config.ApiKeyCollection['TV_SS_2012_41']		= "p9Tk5A2WCFQwWY1YT32c+wXPXqL7tO3b6Hz83/1vL7G0sV84r4lYNg==";
//$cn.config.DeviceTypeCollection['TV_SS_2012_41'] = "473";

// affid
//$cn.config.ApiKeyCollection['TV_SS_2011_41']		= "p9Tk5A2WCFQwWY1YT32c+wXPXqL7tO3b6Hz83/1vL7G0sV84r4lYNg==";
//$cn.config.DeviceTypeCollection['TV_SS_2011_41'] = "473";

// affid
//$cn.config.ApiKeyCollection['TV_SS_2010_41']		= "p9Tk5A2WCFQwWY1YT32c+wXPXqL7tO3b6Hz83/1vL7G0sV84r4lYNg==";
//$cn.config.DeviceTypeCollection['TV_SS_2010_41'] = "473";

//CA BD CREDS

// affid
//$cn.config.ApiKeyCollection['BD_SS_2012_41']		= "d+Pz3a1R/1wJhpDWBhJVPalmg4RT8kCVus4m/EBzrifaamnDoP0TBQ==";
//$cn.config.DeviceTypeCollection['BD_SS_2012_41'] = "470";

// affid
//$cn.config.ApiKeyCollection['BD_SS_2011_41']		= "d+Pz3a1R/1wJhpDWBhJVPalmg4RT8kCVus4m/EBzrifaamnDoP0TBQ==";
//$cn.config.DeviceTypeCollection['BD_SS_2011_41'] = "470";

// affid
//$cn.config.ApiKeyCollection['BD_SS_2010_41']		= "d+Pz3a1R/1wJhpDWBhJVPalmg4RT8kCVus4m/EBzrifaamnDoP0TBQ==";
//$cn.config.DeviceTypeCollection['BD_SS_2010_41'] = "470";

// affid
//$cn.config.ApiKeyCollection['BD_BCOM_2011_41']		= "d+Pz3a1R/1wJhpDWBhJVPalmg4RT8kCVus4m/EBzrifaamnDoP0TBQ==";
//$cn.config.DeviceTypeCollection['BD_BCOM_2011_41'] = "470";

// affid
//$cn.config.ApiKeyCollection['BD_BCOM_2010_41']		= "d+Pz3a1R/1wJhpDWBhJVPalmg4RT8kCVus4m/EBzrifaamnDoP0TBQ==";
//$cn.config.DeviceTypeCollection['BD_BCOM_2010_41'] = "470";

//HT CA CREDS
// affid
//$cn.config.ApiKeyCollection['HTS_SS_2012_41']		= "9N+jbJ8rabP8ArbRaVv77M5IpU4IpfuF+n7LTxaSNN0WWK3HhUf95g==";
//$cn.config.DeviceTypeCollection['HTS_SS_2012_41'] = "472";

// affid
//$cn.config.ApiKeyCollection['HTS_SS_2011_41']		= "9N+jbJ8rabP8ArbRaVv77M5IpU4IpfuF+n7LTxaSNN0WWK3HhUf95g==";
//$cn.config.DeviceTypeCollection['HTS_SS_2011_41'] = "472";

// affid
//$cn.config.ApiKeyCollection['HTS_SS_2010_41']		= "9N+jbJ8rabP8ArbRaVv77M5IpU4IpfuF+n7LTxaSNN0WWK3HhUf95g==";
//$cn.config.DeviceTypeCollection['HTS_SS_2010_41'] = "472";

//Affid 4030 US
//$cn.config.ApiKeyCollection['RES_BD_2012_1']		= "Y5uayKfdN91/+g3YfKJO4dMb8P4x4jXEg4KKM87w7rT1x+bgyqkLZA==";
//$cn.config.DeviceTypeCollection['RES_BD_2012_1'] = "51";

//Affid 2995 CA
//$cn.config.ApiKeyCollection['RES_BD_2012_41']		= "Ryvpz3HXWKvfzQyNBicDxBYKpM8jFyddS3tepAeCJoh9hJ1YKjjfAg==";
//$cn.config.DeviceTypeCollection['RES_BD_2012_41'] = "463";

