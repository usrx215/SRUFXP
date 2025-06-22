//-----------------------------------------------------------------------------
// data.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
// TS: data should be moved into model
// TODO: assume we will eventually begin receiving this in the getDeviceEnv response?
/*$cn.data.UvApiEndpoint = "api/orbit/auth/uv.ashx";
$cn.data.UvEndpoints = {
    'auth'      : 'api/orbit/auth/uv.ashx',
    'library'   : 'api/orbit/library/uv.ashx',
    'stream'    : 'api/orbit/stream/uv.ashx'
};*/
// TODO: will these come in over WS?
$cn.data.mockUserAccount = '';
$cn.data.mockUserAccountState = '';
$cn.data.RuntimeId = Math.round(new Date().getTime() / 1000);
$cn.data.ApiUrl = '';
$cn.data.Navigation = null;
$cn.data.History = {};
$cn.data.BonusAssetCache = {};
$cn.data.StreamAssetCache = {};
$cn.data.TitlesByGenre = {};
$cn.data.Merch = {};
$cn.data.TitlesByGenrePages = {};
$cn.data.TitlesByCast = {};
$cn.data.TitlesBySimilar = {};
$cn.data.TitlesAudioProfiles = {};
$cn.data.PurchaseAudioProfiles = {};
$cn.data.TitleCache = {};
$cn.data.TitleSummaryCache = {};
$cn.data.TitleDetailCache = {};
$cn.data.TitleCastDetailCache = {};
$cn.data.TitleCastBiosCache = {};
$cn.data.TitleCastBioCache = {};
$cn.data.TitleCreditsCache = {};
$cn.data.TitleImagesCache = {};
$cn.data.TitleReviewsCache = {};
$cn.data.TitleRecommendations = {};
$cn.data.TitleTechnicalDetailsCache = {};
$cn.data.d2dTitleInfo = {};
$cn.data.d2dTitleOffers = {};
$cn.data.d2dPath = false;
$cn.data.EpisodeCache = {};
$cn.data.EpisodeListCache = {};
$cn.data.purchTypeFilter = 'any';
$cn.data.PassCache = {};
$cn.data.isPassUVCache = {};
$cn.data.SearchResults = {};
$cn.data.AuthToken = '';
$cn.data.CurrentRegion = '';
$cn.data.SoftwareVersion = '';
$cn.data.DeviceName = '';
$cn.data.UserEmailAddress = '';
$cn.data.EnableAdult = '';
$cn.data.ContentIsFiltered = false;
$cn.data.EnableTv = false;
$cn.data.EnableSite = false;
$cn.data.EnableMerchPage = false;
$cn.data.DeviceID = '';
$cn.data.PendingWishlistItem = '';
$cn.data.MyVideos = [];
$cn.data.lastViewed = null;
$cn.data.lastBrowsed = null;
$cn.data.speedchecked = false;
$cn.data.freshPurchase = false;
$cn.data.brokenImages = {};
$cn.data.masterWheel = {};
$cn.data.slaveWheel = {};
$cn.data.getBundleListing = {};
$cn.data.TitlePersonCache = {};
$cn.data.TitleSearchCache = {};
$cn.data.EulaText = '';
$cn.data.SessionId = ''; 
$cn.data.IsParent = false;
$cn.data.isConnected = true;
$cn.data.completedSpeedTest = false;
$cn.data.InitialLoad = true;
$cn.data.CurrentPromotion = '';
$cn.data.CurrentSku = '';
$cn.data.ImageLoadTest = '';
$cn.data.PurchasePinEnabled = false;
$cn.data.ParentalControlsConfigured = false;
$cn.data.ParentPinEnabledOnStartup = false;
$cn.data.ParentPinEnabled = false; /* User has parent pin enabled, some ratings may be filtered at the server. Show option to input parent pin if enabled. */
$cn.data.AdultPinEnabled = false; /* Do not allow user to enter lifestyle store without prompting for pin. */
$cn.data.LastCacheLoadTimeUTC = null; /* Last time in UTC when server side cache was reloaded. */
$cn.data.ShouldUpdateCache = false; /* Calculate based on input if local cache should be purged. */
$cn.data.CountryID = -1; /* Country ID for the current client request. */
$cn.data.SelectedCountryID = -1;/* Country ID for latest succeeded client request. This is dictated by the app and used to select the appropriate API Key */
$cn.data.Region = '';
$cn.data.RegionCheckEnabled = true;
$cn.data.AllowedRegions = [];
$cn.data.ActivationURL = ''; /* Custom activation URL configurable at server. (when applies) */
$cn.data.DisplayEula = false; /* If enabled user has not accepted eula, please display. use getEulaText to load text to display. */
$cn.data.ShouldEnableTvNode = false; /* Notes if TV is approved for this device. */
$cn.data.LastBandwidthCheck = null;
$cn.data.LastBandwidthSpeed = 0;
$cn.data.BandwithCheckURL = ''; /* http link to file to be used for testing bandwidth on device. */
$cn.data.BandwithCheckURLSize = 0;
$cn.data.AuthTokenActive = false; /* If auth token present in header it will be checked to verify it is active. */
$cn.data.SystemOffline = false; /* If set to True, display message at startup. */
$cn.data.SystemUnavailableMessage = ''; /* Message to display in the case of system offline. */
$cn.data.SessionLimitRows = -1;  /* Number of rows to record before forcing save session. */
$cn.data.SessionLimitMinutes = -1; /* Number of minutes to wait before forcing save session. */
$cn.data.AllowAdult = false; /* Allow display of adult store. */
$cn.data.AllowPlayboy = false; /* Allow display of playboy stores */
$cn.data.AffId = 'Not Set'; /* Aff ID for the current client request. */
$cn.data.EnableAccountLink = false; /* Used in the settings panel to turn on and off the linking feature */
$cn.data.AccountLinkUrl = ''; /* Used in the settings panel to turn on and off the linking feature */
$cn.data.RootMoodGenreID = '';
$cn.data.TVRootMoodGenreID = '';
$cn.data.RecomendedGenreIds = '';
$cn.data.LibraryWheelItems = {};
$cn.data.LibraryWheelItemsLastLoaded = new Date();
$cn.data.LoadTitleID = '';
$cn.data.libraryMasterWheel = [{
    "iD": "0",
    "name": "Movies",
    "ptype": 10954,
    "ttype": "Movies",
    "status":"Undefined"
},{
	"iD": "1",
    "name": "Movie Rentals",
   "ptype": 10954,
    "ttype": "Movie_Rentals",
    "status": "Undefined"
},{
    "iD": "2",
    "name": "HD Movies",
    "ptype": 10954,
    "ttype":"HD_Movies",
    "status":"Undefined"
},{
	"iD": "3",
    "name": "HD TV Shows",
    "ptype":11062,
    "ttype":"HD_TV_Shows",
    "status":"Undefined"
},{
	"iD": "4",
    "name": "TV Shows",
    "ptype": 11062,
    "ttype": "TV_Shows",
    "status":"Undefined"
},{
    "iD": "5",
    "name": "My UltraViolet",
    "ptype": 10954,
    "ttype":"UV_Movies",
    "status":"Undefined"
},{
    "iD": "6",
    "name": "Disc to Digital",
    "ptype": 10954,
    "ttype":"D2D_Movies",
    "status":"Undefined"
}];
$cn.data.librarySlaveWheel = '';
$cn.data.jinniEnable = false;
$cn.data.flixsterEnable = false;
$cn.data.baselineEnable = false;
$cn.data.recommendedGenres = [];
$cn.data.FirmwareVersion = 'Not Set';
$cn.data.PreferredAudioType = '';
$cn.data.PreferredAudioTypeSet = false;
$cn.data.AllowedAudioProfiles = [];
$cn.data.DTS51Enable = false;
$cn.data.Dolby51Enable = false;
$cn.data.DTSStereoEnable = false;
$cn.data.DolbyStereoEnable = false;
$cn.data.ShowWelcomeScreen = true;
$cn.data.sysTestResults = [];
$cn.data.UVTermsText = '';
$cn.data.UVTermsAcceptance = null;
$cn.data.uvLinkingAccount = {
    "Status" : {
        "active": "Active",
        "deleted": "Deleted",
        "forceDelete": "ForceDelete",
        "suspended": "Suspended",
        "blocked": "Blocked",
        "blockedTOU": "BlockedTOU",
        "blockedCLG": "BlockedCLG",
        "pending": "Pending",
        "archived": "Archived", // TODO: check if this is expired?
        "other": "Other"
    }
};
$cn.data.uvLinkStatus = {
    "linkState": {
        "notAvailable": "AcctNotAvailable",
        "unlinking": "Unlinking",
        "pending": "Pending",
        "linked": "Linked"
    }
};
