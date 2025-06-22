//-----------------------------------------------------------------------------
// titleview.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author tjmchattie
 */
var TitleViewControlProperties = {
        id: 'titleviewcontrol',
        persist: {},
        controls:{},
        tv:false,
        episode:false,
        season:false,
        tvshow:false,
        isLibrary:false,
        showingRating: false,
        layoutIsDirty: true,
        noBundleError: false,
        tpl: null,
        initialize: function(){     
            application.events.subscribe(this, 'elementfocus', this.updateSeparator);
//          application.events.subscribe(application, 'goback', this.update.bind(this));
            application.events.subscribe(this, "navigate", this.navigate.bind(this));
            application.events.subscribe(this, "wishlistinsert", this.onWishlistInsert.bind(this));
            application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
            application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
            // To handle #9681 - if item already in wishlist, a generic 550 error is returned
            application.events.subscribe(this, 'updatewishlistbutton', this.onWishlistError.bind(this));
        },
        updateSeparator: function(payload) {
            if (document.getElementById(payload.args[0].focusedelem) && (BrowseView.currentState == "titleview_wheel" || BrowseView.currentState == "titleview_tvepisodes")) {
                var buttonPanel = $("titledetailscontainer").getElement('.buttonpanel');
                

                if (buttonPanel && $(payload.args[0].focusedelem).getParent().hasClass("buttonpanel")){
                    BrowseView.expandTitleDetails();
                    BrowseView.TitleViewControl.enableButtons();

                }
                
            }
        },
        init: function(params, direction){
            log.write('titleviewcontrol.init()');       
            
            //Persist Params
            if(params) {
                this.persist = params;               
            }      
            
        },
        cleanUI: function(){
            if($('titledetailscontainer')) {
                if($('titledetailscontainer').getChildren().length > 0){
                    $('titledetailscontainer').getChildren().destroy();
                }
            }
        },
        /*
         * Load data will:
         * 1) Set the data source for the grid view
         * 2) Render the local controls
         * 3) set the data for the first item.  
         */
        loadData: function(title) {
            var template;
            this.persist.title = title;
            this.showingRating = false;
            this.tv = title.titleType.substring(3,0) == "TV_";
            this.season =  title.titleType == "TV_Season";
            this.episode = title.titleType == "TV_Episode";
            this.tvshow = title.titleType == "TV_Show";
            this.audioProfiles = $cn.utilities.getAudioProfileForTitle(title.titleID);
            template = this.tvshow ? "titleview.tvtitle" : "titleview.title";
            
            this.tpl = new ui.template("titledetailscontainer", application.ui.loadTpl(template));
            this.tpl.compile();
            this.draw();        
        },
        drawMeta: function(key, format){
            log.write('Getting meta for: ' + key);
            if(!format)
            {
                var val = $cn.utilities.getMeta(key, this.persist.title.metaValues);
                
                /*
                 * Deprecated as of v.0.6.0 spec v.0.96 comps no longer have "liked it" in the rating
                 * if(key == 'Flixster Users' || key == 'CriticsReview')
                 * {
                 *      if(val.indexOf("%") != -1)
                 *          val = "<span class='emphasis'>"+val.replace("%", "%</span>");
                 * }
                 * 
                */
                if(key == 'Flixster Users' || key == 'CriticsReview')
                {
                    val = val.replace(" liked it", "").replace(" liked it.", "");
                }
                
                return val;
            }
            else
                val = $cn.utilities.getMeta(key, this.persist.title.metaValues);
                return $cn.utilities.formatDate(val, format);
        },
        show3rdPartyData: function(){
            var val = '';
            
            if(this.showMetaField('CriticsReview') == "_hidden" && this.showMetaField('Flixster Users') == "_hidden"){
                val = "_hidden";
            }
            
            return val;
            
        },
        thirdPartyReviewsEnabled: function(){
            var val = '';
            
            if(!$cn.data.flixsterEnable){
                val = "_hidden";
            }
            
            return val;
        },
        getAudioCssClass: function(){
            var val = this.audioProfiles['Dolby_Digital_Plus_51'];
                
            if(!val){
                val = this.audioProfiles['Dolby_Digital_Plus_Stereo'];
                
                if(!val){
                    val = this.audioProfiles['DTS_Express_51'];
                    
                    if(!val){
                        val = this.audioProfiles['DTS_Express_Stereo'];
                    }
                }
            }
            
            if(!val){
                return "_hidden";
            }
            else {
                return '';
            }
        },
        getSurroundAudioCssClass: function(){
            var val = this.audioProfiles['Dolby_Digital_Plus_51'];
                
            if(!val){
                val = this.audioProfiles['DTS_Express_51'];
            }
            
            if(!val || (this.displaySurroundSoundBadge() == "hideextra" )){
                return "_hidden";
            }
            else {
                return '';
            }
        },
        //TODO Determines whether the audio icons in the bottom right of the title view are shown
        getAudioIconCssClass: function(profileName) {
            //Audio icons in deital page is not support yet.Return hidden only for CSS compatibility
            return "hidden";
        },
        showAudioMetaField: function(profileName){
            var val = this.audioProfiles[profileName];
            if(!val){
                return "_hidden";
            }
            else {
                return '';
            }
        },
        showAudioTechnicalField: function(type, audio){
            var val = '_hidden';
            
            if(type == "Standard Definition" && this.getAudioCssClass() != "_hidden" && !this.audioProfiles['HDOnly'] && this.audioProfiles[audio]) {
                val = '';
            }
            else if(type == "High Definition" && this.getAudioCssClass() != "_hidden" && this.audioProfiles[audio]){
                val = '';
            }
            
            return val;
        },
        showUVTechnicalDetails: function(name){
            if(name == "UltraViolet"){
                return (this.isLibrary ? application.resource.uv_messages.technical_details.uv_library_view :application.resource.uv_messages.technical_details.uv_store_view );
            }
        },
        showMetaField: function(fieldName){
            var val = $cn.utilities.getMeta(fieldName, this.persist.title.metaValues);
            if(val.length == 0){
                return "_hidden";
            }
            return '';      
        },
        showReviewMetaFields:function(){
            var val1 = '', val2 = '', returnVal ='';

            val1 = $cn.utilities.getMeta('Flixster Users', this.persist.title.metaValues);
            val2 = $cn.utilities.getMeta('CriticsReview', this.persist.title.metaValues);

            if(val1.length == 0 && val2.length == 0){
                returnVal =  "hidden";
            }

            return returnVal;
        },
        drawTomatoFactor: function(review){
            var txt = "splaticon";
            review = $cn.utilities.getMeta(review, this.persist.title.metaValues);
            
            if(review && review.length > 0){
                try {
                    var arr = review.split('%');
                    if(parseInt(arr[0].trim()) >= 60) {
                        txt = "freshicon";
                    }
                }
                catch(e){}
            }
            
            return txt;
        },
        getDirectorCssClass: function(){
            return (this.persist.title.directors.length == 0) ? "_hidden" : '';
        },
        getCastCssClass: function(){
            return (this.persist.title.actors.length == 0) ? "_hidden" : '';
        },
        drawStarRating: function(rating){
            
            log.write('Drawing rating for: ' + rating);
            for(var i = 1; i <= 5; i++) {
                $('TitleStar' + i).erase('class');
                if (rating >= i) {
                    $('TitleStar' + i).addClass('fullstar');
                } else if(rating < i && rating > (i - 1)) {
                    $('TitleStar' + i).addClass('halfstar');
                }
            }
        },
        getTrailer: function() {
            var assetid = '';
            this.hasTrailer = false;
            
            this.persist.title.bonusAssets.each(function(item) {
                if(item.bonusType == "Trailer") {
                    assetid = item.bonusAssetID;
                    this.hasTrailer = true;
                }
            }.bind(this));
            return assetid;
        },
        getPurchaseButtonText: function() {
            return $cn.utilities.purchaseText(this.persist.title);
        }, 
        getActors: function() {
            return $cn.utilities.ellipsis(this.persist.title.actors, application.resource.titleview_strings.Starring_Concat_Length);
        },
        getUserRatingFloat: function(rating){
            var val = 0;
            
             try {
                 if(!rating) {
                     val = parseFloat($cn.utilities.getMeta('YourRating', this.persist.title.metaValues)); 
                 }
                 else {
                    val = parseFloat(rating); 
                 }
             }
             catch (e) { val = 0; }
             
             return val;
        },
        setUserRating: function(rating) {
            $cn.utilities.setMeta('YourRating',rating, this.persist.title.metaValues);
        },
        getUserRating: function(rating){
            var yourRating = this.getUserRatingFloat(rating);
            return (yourRating > 0) ? "block" : "none";
        },
        getRateButtonText: function() {
            var rating = parseFloat($cn.utilities.getMeta('YourRating', this.persist.title.metaValues));
            var retString = 'Rate it';
            if(rating > 0) {
                retString = 'Change Rating';
            } 
            return retString;
        },
        getEpisodeShowTitle: function() {
            return (this.persist.title.show ? this.persist.title.show : "");

            
        },
        getEpisodeShowSeason: function() {
            return (this.persist.title.season ? this.persist.title.season : "");
            
        },
        displayBonusAsset: function(key){
            
            var val = 'hideextra';
            this.persist.title.bonusAssets.each(function(item){
                if(item.bonusType == key)
                {
                    val = 'showextra';
                }
            });
            
            log.write('BonusAsset: ' + val);
            return val;
        },
        displayAvailability: function(invert){
            
            var show = invert != null ? invert : false;
            
            if (this.persist && this.persist.title.watchStatus &&
                this.persist.title.watchStatus != WatchStatus.WatchNow &&
                this.persist.title.watchStatus != WatchStatus.ExpiredRental)
                show = !show;
        
            return show ? 'showextra' : 'hideextra';
        },
        displayExtra: function(key, invert){
            var b,
                val;

            // UV flag check short circuit
            if (key === "HasUV" && !$cn.config.EnableUV) {
                return 'hideextra';
            }

            // BrowseView.currentState is "search-view" if coming from search, even if showing owned movie
            // so we will check if isPassUV exists
            if(this.persist.title.isPassUV && key === "HasUV"){
                b = this.persist.title.isPassUV;
            } else {
                b = $cn.utilities.getMeta(key, this.persist.title.metaValues);
            }
            val = 'hideextra';
            
            if(((b == "True" || (b != "False" && b != '')) && !invert) || (b == "False" && invert)){
                    val = 'showextra';
            }
            
            return val;
        },
        displaySurroundSoundBadge: function(){
            /* This is repurposed to account for the dolby surround sound icon */
            var surround = this.audioProfiles['Dolby_Digital_Plus_51'],
                val = "hideextra";
            
            /*
             * If it is a surround sound title AND It is not in the library then dispaly
             * It is in the library AND surround sound enabled AND NOT limited to HD only then display
             * It is in the library AND surround sound enabled AND limited to HD only AND HD is enabled then display
             */
            if(surround && !this.isLibrary) {
                val = 'showextra';
            }
            else if(surround && this.isLibrary && !this.audioProfiles['HDOnly']) {
                val = 'showextra';
            }
            else if (surround && this.isLibrary && this.audioProfiles['HDOnly'] && $cn.utilities.getMeta("HD", this.persist.title.metaValues) == "True") {
                val = 'showextra';
            }

            return val;
        },
        displayMoreInfo: function(){
            var cnt = 0,
                x;
            //UI should determine show or hide more info panel according to baselineEnable and flixsterEnable.
            for (x = 0; x < this.persist.title.wheelItems.length; x++) {
               if ((this.persist.title.wheelItems[x] == "m_credits" ||
                    this.persist.title.wheelItems[x] == "m_cast_bios" ||
                    this.persist.title.wheelItems[x] == "m_cast_crew") 
                    && $cn.data.baselineEnable) {
                    cnt ++;
                   }
               if ((this.persist.title.wheelItems[x] == "r_critics" ||
                    this.persist.title.wheelItems[x] == "r_user_revs" || 
                    this.persist.title.wheelItems[x] == "m_technical_details" && configuration.readValue('EnableTechnicalDetailsWheelOption')) 
                    && $cn.data.flixsterEnable) {
                    cnt ++;
               }
            }
            
            return (cnt > 0) ? "showextra" : "hideextra";
        },
        displayExtraIfPresent: function(key){
            var b = $cn.utilities.getMeta(key, this.persist.title.metaValues);
            var val = 'hideextra';
            
            if(b && b != "" && b.length > 0){
                val = 'showextra';
            }
            
            return val;
        },
        drawDurationString: function(){
            var val = '',
            airDate = this.drawMeta("AirDate", $cn.config.DateFormat ? $cn.config.DateFormat : "longDate"),
            runTime = $cn.utilities.getMeta("RunTime", this.persist.title.metaValues);
            if(/^-|^0+\s/.test(runTime)){
                runTime = '';
                log.write("runTime was either 0 or negative and has been removed.")
            }

            if(this.episode)
            {
                if(airDate && airDate.length > 0)
                {
                    if($cn.data.CountryID == 82)
                    {
                        val = this.formatReviewDate(airDate);
                    }
                    else
                    {
                        val = airDate;
                    }
                }
            }
            else
            {
                if(this.persist.title.releaseYear && this.persist.title.releaseYear.length > 0)
                {
                    val = this.persist.title.releaseYear;
                }
            }
            
            if(!this.season && !this.tvshow)
            {
                if(runTime && runTime.length > 0)
                {   
                    if(val && val.length > 0)
                        val = val +  application.resource.titleview_strings.Duration_Concat;
                    else {
                        val = '';
                    }
                    
                    val = val + runTime;
                }
            }
            
            
            //if there is nothing to show, hide it
            if(!val || val.length == 0)
            {
                if(document.getElementById('titlemeta_duration')) {
                    $('titlemeta_duration').hide();
                }
            }
            return val;
        },
        storeLogo: function(){
            
            if(this.persist.title && this.persist.title.storeLogoUrl)
            {   log.write("STORE URL: <img src='"+this.persist.title.storeLogoUrl+"' id='storeLogo' alt='' />");
                return "<img src='"+this.persist.title.storeLogoUrl+"' id='storeLogo' alt='' style='vertical-align:middle;margin-left:5px;'  />";
                
            }
            else
            {
                log.write("STORE URL: NOTHING");
                return "";
            }

        },
        getRentalStatus: function(){
            var status = '';
            
            if(this.persist.title.watchStatus == 'ExpiredRental')//Expired
            {
                status = this.persist.title.expirationMessage;

            }
            else if(this.persist.title.expirationMessage && this.persist.title.expirationMessage != '')
            {
                status = '('+this.persist.title.expirationMessage+') ';
            }
            
            return status;
        },
        formatReviewDate: function(d){
            var val = '',
                dStr = null,
                day = '',
                month = '',
                year = '',
                m_names = new Array("January", "February", "March", 
                        "April", "May", "June", "July", "August", "September", 
                        "October", "November", "December");
            
            try {
                dStr = Date.parse(d);

                //Necessary because sometimes bad data comes through
                if(!isNaN(dStr.getDate())) {
                    day = dStr.getDate();
                    month = dStr.getMonth();
                    year = dStr.getFullYear();
                    
                    val = m_names[month] + " " + day + ", " + year;
                }
            }
            catch(e){
                alert(e);
                val = ''
            }
            
            return val;
        },
        reviewIcon: function(rating){
            return (rating && rating !='') ? rating : '';
        },
        getVisibleElements: function(container) {
            var result = [];
            if(container){
                var items = container.getChildren();
                for (var i = 0; i < items.length; i++) {
                    if (items[i].getStyle('display') == "block")
                        result.push(items[i]);
                }
            }
            return result;
        },
        /* Read config values and render grid */
        draw: function(){
            var tpl;
            this.cleanUI();
            
            /*
             *  1) Create elements for titles
             *  2) Attach a focus
             */     
            log.write(this.persist.title);
            $("ruler").setStyles({"font-weight":"bold","font-size":"17px"});
            
                this.persist.title.name = this.persist.title.name.ellipsToPixels(460);
                this.tpl.append(this.persist.title);
                this.tpl.apply();
                
                var isUnavailable = 
                    this.persist.title.watchStatus != null && 
                    this.persist.title.watchStatus != WatchStatus.WatchNow && 
                    this.persist.title.watchStatus != WatchStatus.ExpiredRental;
                
                
                //If no flixter hide ratings
                log.write("$cn.data.flixsterEnable: " + $cn.data.flixsterEnable);
                if ($cn.data.flixsterEnable) {
                	if(this.displayExtraIfPresent('CriticsReview') == "showextra" && this.displayExtraIfPresent('Flixster Users') == "showextra" && $("reviewcontainer")){
                		$("reviewcontainer").addClass("bothreviewssvisible");
                	}
                }
                
                if (!this.tvshow) {
                    
                    var template = "buttonpanel.title";
                    
                    if (this.persist.title.passID) {
                        if (this.season)
                            template = "buttonpanel.library.alternate";
                        else if (isUnavailable)
                            template = "buttonpanel.library.alternate";
                        else
                            template = "buttonpanel.library";
                    }
                    
                    tpl = new ui.template("ButtonPanel", application.ui.loadTpl(template));
                    
                    tpl.compile();
                    tpl.append(this.persist.title);
                    tpl.apply();
                    
                    if (isUnavailable)
                        $('ButtonPanel').addClass("unavailabletitle");                    	
                }
                
                //SHOW HIDE BITS
                if(this.tv)
                {
                    if (!this.persist.title.seasonal)
                        application.putInnerHTML($("tdbuttonEpisodes"), application.resource.episodes);

                    if (! this.noBundleError  && ! isUnavailable) {
                        $("tdbuttonEpisodes").removeClass("hideextra");
                    } else {
                        //$("tdbuttonEpisodes").addClass("hideextra");
                        this.noBundleError = false;
                    }
                    $("titlemeta_criticsreview").addClass("hideextra");
                    $("titlemeta_flixsterusers").addClass("hideextra");
                    
                    if(!this.tvshow)
                    {
                        if ($("reviewcontainer")) {
                    	    $("reviewcontainer").addClass("hideextra");
                        }
                        $("tdbuttonRating").hide();
                        $("ratingstar").hide();
                    }
                    if(this.season)
                    {
                        if(document.getElementById('duration')){
                            $("duration").hide();
                        }
                    }
                    
                    $$(".tv").show();
                    $$(".movie").hide();    
                    
                    if(!this.episode)
                    {
                        if($("tdbuttonWatchTrailer"))
                            $("tdbuttonWatchTrailer").addClass("hideextra");
                        
                        if($("tdbuttonCheckout"))
                            $("tdbuttonCheckout").addClass("hideextra");
                        //navigation.setFocus('tdbuttonEpisodes');
        
                        $$(".episode").hide();  
                    }
                    
                    if(this.season || this.episode) {
                        $('titlemeta_rating').hide();
                    }   
                    
                }
                
                if(this.persist.title.passID) //LIBRARY
                {
                    BrowseView.setLibrary(true);
                    this.isLibrary = true;
                    
                    $('purchaseinfostringdetails').hide();
                    
                    if (this.persist.title.passID > 0)
                        $('titlepurchasedstring').removeClass('hidden');
                    
                    if(this.persist.title.watchStatus == 'ExpiredRental')//Expired
                    {
                        $('tdbuttonExpired').removeClass("hideextra");
                        $('tdbuttonPlay').hide();
                    }               
                    if((this.persist.title.streamStartTimeSeconds >  $cn.config.EarliestResumeS - $cn.config.RewindUponResumeS) && this.persist.title.watchStatus == WatchStatus.WatchNow)
                    {
                        $('tdbuttonResumePlay').removeClass("hideextra");
                    }
                    
                    if(this.episode && this.persist.title.nextEpisodeID) //check for other episodes
                    {
                        $('ButtonPanel').addClass("nextepisode");
                    }
                    
                    /* If this title is not in the pass cache then add it. The pass cache is used to see if the HD stream is available */
                    log.write("Current Pass: " + this.persist.title.passID);
                    if(!$cn.data.PassCache[this.persist.title.passID]){
                        log.write("Adding pass to pass cache");
                        $cn.data.PassCache[this.persist.title.passID] = this.persist.title;
                    }
                }
                
                if(this.hasSimiliar() && ! isUnavailable)
                {
                    $('tdbuttonSimilar').show();
                }
                else
                {
                    $('tdbuttonSimilar').hide();
                }
                
                
                if(this.persist.title.availableProducts.length == 0 && $('tdbuttonCheckout')) {
                    
                    $('tdbuttonCheckout').hide();
                }
                
                this.drawStarRating(parseFloat($cn.utilities.getMeta('YourRating', this.persist.title.metaValues)));
                application.currentView.layoutIsDirty = true;
                
                log.write('Detail Image:');
                $('titledetailsboxartwrap').show();
                var titleImg = document.getElementById('TitleBoxArt');
                if(titleImg && !titleImg.onerror) {
                    titleImg.onerror = function(e) {
                        $('titledetailsboxartwrap').hide();
                    };
                }
                
                var showSurroundSound = this.displaySurroundSoundBadge();
                
                log.write("showSurroundSound: " + showSurroundSound);
                if(showSurroundSound == "hideextra"){
                    $('fiveonebadge').hide();
                }
                
                // Balance button panels
                //
                var buttonPanel = $('ButtonPanel'),
                    columns = buttonPanel.getElements('.half'),
                    left = this.getVisibleElements(columns[0]),
                    right = this.getVisibleElements(columns[1]),
                    count,
                    i;
                
                if (right.length > left.length) {
                    count = right.length - left.length;
                    for (i = 0; i < count; ++i) {
                        columns[1].removeChild(right[i]);
                        columns[0].getParent().insertBefore(right[i], columns[0]);
                    }
                }
                else if (left.length > right.length) {
                    count = left.length - right.length;
                    for (i = 0; i < count; ++i) {
                        columns[0].removeChild(left[i]);
                        columns[0].getParent().insertBefore(left[i], columns[0]);
                    }
                }

        },
        shouldShowRentalWarning: function(){
            var hasRental = false,
                shouldShowWarning = false,
                x;
            
            for(x = 0; x < this.persist.title.availableProducts.length; x++){
                if(this.persist.title.availableProducts[x].purchaseType == 'rent'){
                    hasRental = true;
                    break;
                }
            }
            
            if(hasRental){
                if($cn.utilities.getMeta("LicensesDelivered", this.persist.title.metaValues) == "0"){
                    shouldShowWarning = true;
                }
            }
            
            return shouldShowWarning;
        },
        getRentalPeriod: function(){
            var period = "24",
                x;
            
            for(x = 0; x < this.persist.title.availableProducts.length; x++){
                if(this.persist.title.availableProducts[x].purchaseType == 'rent'){
                    log.write('Found rental period: ' + this.persist.title.availableProducts[x].rentalPeriod);
                    period = this.persist.title.availableProducts[x].rentalPeriod;
                    break;
                }
            }
            
            return period;
        },
        update: function(payload){
            // TODO: Clean method: This method will reset focus in various cases, which is the cause of much of the branching in it:
            // This function will get called whenever someone clicks on previous and ends up on the title view. This is because the buttons possibly need to get updated.
            var self = this;
            this.showingRating = false;
            log.write(".... payload.leaveFocusAlone ..... is: " + payload.leaveFocusAlone);
            
            //If there is any kind of popup while updating then hide it.
            if(BrowseView.MessagePopup) {
                BrowseView.MessagePopup.hide();
            }
            
            if(payload && payload.passID)
            {
                if(this.persist.title){
                    this.persist.title.passID = payload.passID;
                }
            }

            log.write("TitleView.update(User Rating: " +this.getUserRatingFloat()+ ", payload.stopPositionMins: " +payload.stopPositionMins+", payload.stopPositionPercent: "+payload.stopPositionPercent+")");
            if(document.getElementById('titledetails').style.display == "block" || payload.forceUpdate){
                
                    if(this.persist.title && this.persist.title.passID) //COMING BACK TO LIBRARY VIEW. UPDATE BUTTONS
                    {
                        $cn.methods.getPurchasedTitle(this.persist.title.passID, this.persist.title.titleID, function(cb){
                            if(payload.setFocus){
                                BrowseView.loadTitle(cb, 'nextEpisode');
                                    if($('tdbuttonNextEpisode').getStyle('display') !== "block"){
                                        log.write('Next Episode Button is Hidden, Dont set focus');
                                        self.setFocus();
                                    } else{
                                        log.write('Calling next Episode focus: ' + payload.setFocus);
                                        application.navigator.setFocus(payload.setFocus);
                                        application.element.current = payload.setFocus;
                                    }
                            }else{

                                if (!payload.leaveFocusAlone) {
                                    BrowseView.loadTitle(cb);
                                    log.write("..... resetting focus .....");
                                    self.setFocus();
                                } else {
                                    BrowseView.loadTitle(cb, "skipFocus");
                                    log.write("..... not resetting focus .....");
                                }
                            }
                            //Check to see if we need to popup rating window
                            if(self.getUserRatingFloat() == 0 && (payload.stopPositionMins >= 30 || payload.stopPositionPercent >= 96)) {
                                log.write("Show rate modal");
                                self.showingRating = true;
                                if(self.tv) {
                                    BrowseView.showRate(self.persist.title.titleID);
                                }
                                else {
                                    BrowseView.showRate(self.persist.title.titleID);
                                }                           
                            }
                        });
                    } else if(payload.forceUpdate) {
                        log.write(".... forcing update ....");
                        $cn.methods.getTitleListing(this.persist.title.titleID, true, function(cb){
                            BrowseView.loadTitle(cb);
                            navigation.setFocus("tdbuttonCheckout");
                        }); 
                    } else {
                        log.write(".... last branch ....");
                        navigation.setFocus("tdbuttonCheckout");
                    }
                
                    
                    if(payload.bandwidthError){
                        log.write("Bandwidth error!!!!!!");
                    }
            }
        },
        goLibrary: function(titleid, passid) {

            BrowseView.TitleViewControl.setFocus();
            
            $cn.methods.getPurchasedTitle(passid, titleid, function(cb){
                BrowseView.loadTitle(cb, '');
            });

        },
        navigate: function(payload){
            var buttons,
                contender,
                currentLeft,
                currentTop,
                bLength,
                visButtons = [];

            if(!payload.preventCustom) {
                if((application.element.current && application.element.current != '') && document.getElementById(application.element.current) && $(application.element.current).getParent() != null 
                        && ($(application.element.current).getParent().hasClass("buttonpanel") || $(application.element.current).getParent().getParent().hasClass("buttonpanel"))){

                    if(payload.args[0].direction == 'right')
                    {
                        if(payload.args[0].current == $(application.element.current).get("id") && $(application.element.current).get('rightaction'))
                        {
                            eval('(' + $(application.element.current).get('rightaction')   + ')');
                            payload.preventDefault();
                        }                   
                    }
                    else if(BrowseView.currentState == "titleview" && payload.args[0].direction == 'left')
                    {   
                        //This code block is necessary to handle the case of 2 side by side buttons. Clicking left should only go to the dock if the button is on the left side.
                        buttons = $('ButtonPanel').getElements('a');
                        contender =  -1;
                        currentLeft = document.getElementById(application.element.current).offsetLeft;
                        currentTop = document.getElementById(application.element.current).offsetTop;
                        
                        for (var i = 0; i < buttons.length; i++) {
                            if (buttons[i].offsetWidth) {
                                
                                if(parseInt(buttons[i].offsetLeft) < parseInt(currentLeft) && parseInt(buttons[i].offsetTop) == parseInt(currentTop)) {
                                    contender = i;
                                    break;
                                }
                            }
                        }
                        
                        if(contender == -1) {
                            for (var i = 0; i < buttons.length; i++) {
                                if (buttons[i].offsetWidth) {
                                    //This loop SHOULD produce the button that is above the bottom button getting focus
                                    if(parseInt(buttons[i].offsetLeft) < parseInt(currentLeft) && parseInt(buttons[i].offsetTop) < parseInt(currentTop)) {
                                        contender = i;                                  
                                    }
                                }
                            }
                        }
                        
                        if(contender == -1) {
                            payload.preventDefault();
                            navigation.setFocus("dock-back");       
                        }   
                        else {
                            payload.preventDefault();
                            navigation.setFocus(buttons[contender].id); 
                        }
                    }
                    else if(BrowseView.currentState == "titleview" && payload.args[0].direction == 'down') {
                        //This code block is necessary to handle the custom actions when clicking the down button.
                        buttons = $('ButtonPanel').getElements('a');
                        contender =  -1;
                        currentLeft = document.getElementById(application.element.current).offsetLeft;
                        currentTop = document.getElementById(application.element.current).offsetTop;
                        
                        //1st pass determines if there is something directly underneath you
                        for (var i = 0; i < buttons.length; i++) {
                            if (buttons[i].offsetWidth) {
                                
                                if(parseInt(buttons[i].offsetLeft) == parseInt(currentLeft) && parseInt(buttons[i].offsetTop) > parseInt(currentTop)) {
                                    contender = i;
                                    break;
                                }
                            }
                        }
                        
                        //Second pass determines if there is something to the right and underneath you.
                        if(contender == -1) {
                            for (var i = 0; i < buttons.length; i++) {
                                if (buttons[i].offsetWidth) {
                                    if(parseInt(buttons[i].offsetLeft) > parseInt(currentLeft) && parseInt(buttons[i].offsetTop) > parseInt(currentTop)) {
                                        contender = i;      
                                        break; //Break on the 1st contender
                                    }
                                }
                            }
                        }
                        
                        //Third pass determines if you are alone on the last line per spec.
                        if(contender == -1) { 
                            payload.preventDefault();
                            
                            for (var i = 0; i < buttons.length; i++) {
                                if (buttons[i].offsetWidth) {
                                    if(buttons[i].id == application.element.current && parseInt(buttons[i].offsetTop) == parseInt(currentTop)) {
                                        bLength = buttons.length;
                                        while(bLength--){
                                            if(buttons[bLength].getStyle('display') == "block"){
                                                visButtons.unshift(buttons[bLength]);
                                            }
                                        }
                                        navigation.setFocus(visButtons[0].id);
                                        break;
                                    }
                                }
                            }                   
                            
    //[Removed PER: https://jira.sonic.com/browse/CNSWE20-1060]                     
//                          if(doSomething){
//                              navigation.setFocus("dock-help");
//                          }
                        }   
                        else {
                            payload.preventDefault();
                            navigation.setFocus(buttons[contender].id); 
                        }
                    } else if(BrowseView.currentState == "titleview" && payload.args[0].direction == 'up') {
                        buttons = $('ButtonPanel').getElements('a');
                        bLength = buttons.length;
                        log.write(bLength);
                        while(bLength--){
                            if(buttons[bLength].getStyle('display') == "block"){
                            visButtons.unshift(buttons[bLength]);
                            }
                        }
                        bLength = visButtons.length;
                        if(application.element.current == visButtons[0].id){
                            payload.preventDefault();
                            if(visButtons[0].offsetWidth == visButtons[(bLength-1)].offsetWidth){
                                navigation.setFocus(visButtons[(bLength-1)].id);
                            } else {
                                if($('tdbuttonWishlist-1') && $('tdbuttonWishlist-1').getStyle('display')== "block"){
                                    navigation.setFocus(visButtons[(bLength-1)].id);
                                } else if($(visButtons[(bLength-2)].id).getParent().getPrevious('.half')) {
                                    navigation.setFocus(visButtons[(bLength-3)].id);
                                } else {
                                    navigation.setFocus(visButtons[(bLength-2)].id);
                                }
                            }
                        }
                    }
                }
            }
        },
        hasSimiliar: function() {
            var has = false;
            var self = this;
            //Jinni and SimilarAvail has to be enabled for this.
            if ($cn.data.jinniEnable && ($cn.utilities.getMeta("SimilarAvail", self.persist.title.metaValues) == "True")) {
                //Wheel items have to exist
                if(this.persist.title.wheelItems.length > 0) {
                    this.persist.title.wheelItems.each(function(item){
                        //To see if there exists the data
                        if(item.indexOf("s_") == 0 ) {
                            has = true;
                        }
                    });
                }
            }
            //Baseline has to be enabled for this.
            if (!has && $cn.data.baselineEnable) {
                if(this.persist.title.wheelItems.length > 0) {
                    this.persist.title.wheelItems.each(function(item){
                        //To see if there exists the data
                        if(item.indexOf("m_cast_crew") == 0) {
                            has = true;
                        }
                    });
                }
            }
            return has;
        },
        setFocus: function() {
            log.write("Setting title view focus...");
            
            //Need to now also check for exit window open
            if(!this.showingRating) {
                log.write("Not showing the rating...");
                
                var buttons = $('ButtonPanel').getElements('a');
                var contender =  -1;
                
                for (var i = 0; i < buttons.length; i++) {
                    //If resume play is visible then always set focus to it.
                    if(buttons[i].id == "tdbuttonResumePlay" && document.getElementById('tdbuttonResumePlay').className.indexOf('hideextra') == -1) {
                        //If the current button is resume play and the hideextra class has been removed then focus it.
                        contender = i;
                        log.write("contender: " + buttons[i].id);
                        break;
                    }
                    
                    log.write(buttons[i].id + ":" + buttons[i].offsetWidth);
                    
                    //Make sure that the element is visible and top/left of the button list. Edit this with care.
                    if (buttons[i].offsetWidth) {
                        if(contender == -1) {
                            contender = i;
                            continue;
                        }
                        else if(parseInt(buttons[i].offsetLeft) < parseInt(buttons[contender].offsetLeft) && parseInt(buttons[i].offsetTop) <= parseInt(buttons[contender].offsetTop)) {
                            contender = i;
                        }   
                    }
                }
                
                log.write("contender" + contender);
                if(document.getElementById('modalcontrol') && document.getElementById('modalcontrol').className == "message_exit" && document.getElementById('modalcontrol').style.display == "block") {
                    if(contender != -1) {
                        BrowseView.MessagePopup.lastFocus = buttons[contender].id;
                    }
                    else if(buttons.length > 0) {
                        BrowseView.MessagePopup.lastFocus = buttons[0].id;
                    }
                }
                else {
                    if(contender != -1) {
                        log.write("titleview.setfocus: " + buttons[contender].id);
                        navigation.setFocus(buttons[contender].id);
                    }
                    else if(buttons.length > 0) {
                        navigation.setFocus(buttons[0].id);
                    }
                }
            }
        },
        disableButtons: function() {
            if($('ButtonPanel'))
            $('ButtonPanel').addClass('disabled');
        },
        enableButtons: function() {
            if($('ButtonPanel'))
                $('ButtonPanel').removeClass('disabled');
        },
        show: function() {
            $('titledetails').show();
            $('titledetailscontainer').show();
            
            if(document.getElementById('ButtonPanel')){
                var buttons = $('ButtonPanel').getElements('a');
                navigation.buildNavigation(buttons);
            }
        },
        showAvailability: function() {
            var unavailMsg = this.persist.title.watchStatus;
            if($cn.utilities.isTrue(this.persist.title.isPassUV)){
                unavailMsg = "UV_Unavailable";
            }
            var data = application.resource.unavailable_messages[unavailMsg];

            switch (this.persist.title.watchStatus)
            {
                case WatchStatus.NotAvailable_HoldBack:
                    data = {
                        Message: data.Message.replace('{Date}', $cn.utilities.formatDate(this.persist.title.dateExpired, "short")),
                        Content: data.Content
                    };
                    break;
                // Pre-order will be supported in the future.
                case WatchStatus.NotAvailable_Aired_Episode:
                    data = {
                        Message: data.Message.replace('{PurchaseDate}', $cn.utilities.formatDate(this.persist.title.datePurchased, "short")),
                        Content: data.Content
                    };
                    break;
                case WatchStatus.NotAvailable_Pre_Ordered:
                    data = {
                        Message: data.Message.replace('{PurchaseDate}', $cn.utilities.formatDate(this.persist.title.datePurchased, "short")),
                        Content: data.Content
                    };
                    break;
            }
            
            if (data)  {
                // Make sure we add a close button for all situations, not just the two in the switch.
                data.Close = "Close";
                BrowseView.showMessage("message_content", data);
            }
        },
        onEpisodes: function(titleId) {
            BrowseView.showTvEpisodes(this.persist.title);
        },
        onWishlistError: function(payload) {
            log.write("======== wishlist error 1 ========");
            log.write("pa0 is: " + payload.args[0]);
            log.write("pa0tid is: " + payload.args[0].titleId);
            log.write("======== wishlist error 2 ========");
            this.onWishlistInsert(payload);  
        },
        onWishlistInsert: function(payload) {
            if (this.persist.title.titleID == payload.args[0]) {

                var button = $("tdbuttonWishlist");

                if (button) {
                    if (button == $(application.element.current)) {
                        
    /*                  var buttonPanel = $("ButtonPanel");
                        var focus = button.attributes["up"];
                        
                        for (var up = focus; up && buttonPanel.isParentOf($(up.value)); up = $(up.value).attributes["up"])
                            focus = up;
                            
                        if (focus)
                            navigation.setFocus(focus.value);
                        else
                            this.setFocus();
    */
                        this.setFocus();
                            
                    }
                    
                    button.hide();
                }
                if(button.getParent('.half') == null){
                    $('tdbuttonWishlist-1').inject($('tdbuttonWishlist'), 'after');
                    log.write("fullsize move")
                }
                
                button = $("tdbuttonWishlist-1");

                if (button) 
                    button.show();

                var buttons = $('ButtonPanel').getElements('a');
                buttons.each(function(item){ 
                    item.removeProperties('up', 'down', 'left', 'right'); 
                });
                
                navigation.buildNavigation(buttons);
            }
        },
        onSaveState: function(payload){
            var state = payload.args[0];

            state[this.id] = { 
                persist: $extend({}, this.persist), 
                tv: this.tv,
                episode: this.episode,
                season: this.season,
                tvshow: this.tvshow
            };
        },
        onRestoreState: function(payload){
            var state = payload.args[0];
            $extend(this, state[this.id]);
        }
        
    }, 
    TitleViewControl = new Class(TitleViewControlProperties);

var WatchStatus = {
    WatchNow : "WatchNow",  
    ExpiredRental : "ExpiredRental",  
    NotAvailable_HoldBack : "NotAvailable_HoldBack",  
    NotAvailable_LicensorRestricted : "NotAvailable_LicensorRestricted",  
    NotAvailable_NotArrived : "NotAvailable_NotArrived",  
    NotAvailable_In_This_Store : "NotAvailable_In_This_Store",  
    NotAvailable_In_This_Territory : "NotAvailable_In_This_Territory",
    NotAvailable_Aired_Episode: "NotAvailable_Aired_Episode",
    NotAvailable_Pre_Ordered: "NotAvailable_Pre_Ordered"
};
