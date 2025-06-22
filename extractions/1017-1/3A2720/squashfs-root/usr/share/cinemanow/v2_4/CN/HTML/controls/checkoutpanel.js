//-----------------------------------------------------------------------------
// checkoutpanel.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
var CheckoutPanelControlProperties = {
    id: 'checkoutpanel',
    couponCode: 0,
    discountAmount: 0,
    persist: {},
    controls:{},
    layoutIsDirty: true,
    inLibrary: false,
    isActive: false,
    spinnerPos: 1,
    spinnerTimer: null,
    spinnerSpinning: false,
    spinnerPosition: 1,
    paymentInfoAvailable: false,
    paymentInfoListener: null,
    loadingTimer: null,
    tpl: null,
    tplCart: null,
    purchaseDetails:{},
    getPersist: function() {
        return this.persist;
    },
    initialize: function(){
        if($('checkoutpanel')){
            $('checkoutpanel').hide();
        }
        this.loadView('checkout.buy');
        log.write('checkoutpanel.init()');		
        this.spinnerTimer = new Timer();
        this.spinnerTimer.Interval = 80;
        paymentInfoAvailable = false;
        application.events.subscribe(this, 'titlecheckoutwheelchanged', this.handleSettingWheelChange.bind(this));
//		    application.events.subscribe(this, 'checkoutpanel', this.handleSettingWheelChange.bind(this));
        application.events.subscribe(this, 'redeemed', this.onRedeemed.bind(this));
    },
    activate: function() {    	
        navigation.setFocusElement($('checkoutpanel').getElement('.default'));
        application.events.subscribe(this, 'navigate', this.navigate.bind(this));
        application.events.subscribe(this, 'activated', this.updateCheckoutPanelStatus.bind(this));
        this.isActive = true;
    },
    deactivate: function() {
        if (this.isActive) {
            application.events.unsubscribe(this, 'navigate');
            application.events.unsubscribe(this, 'activated');
            this.isActive = false;
        }
    },
    cleanUI: function(){
        if($('checkout_container')) {
            if($('checkout_container').getChildren().length > 0){
                $('checkout_container').getChildren().destroy();
            }
        }
    },
    loadView: function(tplid) {
        this.tpl = new ui.template("checkout_container", application.ui.loadTpl(tplid));
        this.tpl.compile();
    },
    getTitleObject: function() {
        return $cn.data.TitleDetailCache[this.persist.titleID];
    },
    showSummaryItem: function(key){
        if(document.getElementById(key)){
            $(key).removeClass('hidden');
        }
        
        $$('.' + key).removeClass('hidden');
    },
    loadData: function(payload) {
        var x, 
        title,
        sku,
        name,
        season,
        episode,
            loyaltyRentalPoints, 
        loyaltyBuyerPoints,
        uvPlayback;
        //[Not sure why this is here. Seems unreliable] this.handleLoading();
        // Signal that payment info is not yet available
        this.paymentInfoAvailable = false;
        this.couponCode = 0;
        this.discountAmount = 0;
        this.persist.titleID = payload.titleID;
	    	
        title = this.getTitleObject();

        for(x = 0; x < title.availableProducts.length; x++){
            if(title.availableProducts[x].skuID == payload.selectedvalue)
            {
                this.persist.sku = title.availableProducts[x];
            }
        }

        sku = this.persist.sku;

        name = title.show ? title.show : title.name;   	
        season = title.episode ? title.episode : "";
        episode = "";
			
        if (title.titleType == "TV_Episode") {
            episode = '"' + title.name + '"';
            $("checkout_container").addClass("episode");
        }
        else
            $("checkout_container").removeClass("episode");
			
        var item = {
            sku: sku.skuID,
            name: name.ellipsToPixels(233),
            season: season,
            episode: episode,
            titleID: title.titleID,
            mPAARating: title.mPAARating,
            loyalty_rent:$cn.utilities.getMeta("LoyaltyPointsForRent", title.metaValues),
            loyalty_buy:$cn.utilities.getMeta("LoyaltyPointsForBuy", title.metaValues),
            isHD: false,
            message: ""
        };

        this.tpl.empty();
        this.tpl.append(item);
        this.tpl.apply();
			
        //General Available Options
        //for(x = 0; x < sku.availableAssets.length; x++){
        //  if(sku.availableAssets[x].file_FileProfile == "HIGH_DEFINITION")
        //  {
        //      $('1080phd').removeClass('hidden');
        //      item.isHD = true;
        //  }
        //}
        if(sku.skuType.indexOf('HD') > -1)
        {
            $('1080phd').removeClass('hidden');
            item.isHD = true;
        }
        
        var extrasMeta = false;
        for(x = 0; x < title.metaValues.length; x++){
            if(title.metaValues[x].keyName == "Extras" && title.metaValues[x].keyValue == "True")
            {
                extrasMeta = true;
            }
            
            if(title.metaValues[x].keyName == "promoText" && title.metaValues[x].keyValue != "")
            {
                $('promoText').removeClass('hidden');
            }
        }

        // ## TS: this should be made into matrix, or at least as part of model
        //Movie Available Options
        if(title.titleType == "Movie" )
        {
            if(sku.purchaseType == "rent")
            {
                $('singlePlayback').removeClass('hidden');
                
                this.showSummaryItem("checkoutRental");
                // CNSWE20-2427
                if (!item.isHD) {
                    this.showSummaryItem("checkoutRentalSD");
                }

                //Check for loyalty points
                loyaltyRentalPoints = $cn.utilities.getMeta("LoyaltyPointsForRent", title.metaValues); 
                if(loyaltyRentalPoints != "" && parseInt(loyaltyRentalPoints, 10) > 0) {						
                    $('loyaltyrent').removeClass('hidden');
                }
            }
            else if(sku.purchaseType == "buy" && sku.skuType.indexOf("Upgrade") != -1)
            {
                $('checkout_top').getElement('.title').innerHTML = title.name.ellipsToPixels(100) + ' - Disc to Digital Version';
                $$('.d2dCheckout').removeClass('hidden');
            }
            else if(sku.purchaseType == "buy")
            {
                this.showSummaryItem("ownIt");
                
                $('multiPlayback').removeClass('hidden');
                
                if(extrasMeta)
                    $('digitalextras').removeClass('hidden');
                    
                //Check for loyalty points
                loyaltyBuyerPoints = $cn.utilities.getMeta("LoyaltyPointsForBuy", title.metaValues); 
                if(loyaltyBuyerPoints != "" && parseInt(loyaltyBuyerPoints, 10) > 0) {
                    $('loyaltybuy').removeClass('hidden');
                }
                // check for UV playback
                uvPlayback = this.skuIsUv();
                if($cn.utilities.isTrue(uvPlayback) && $('uvPlayback')) {
                    $('uvPlayback').removeClass('hidden');
                }
            }
        }
        else if(title.titleType == "TV_Episode")  //TV Available Options
        {
            $('multiPlayback').removeClass('hidden');
            this.showSummaryItem("ownIt");
            
            if(extrasMeta)
                $('digitalextras').removeClass('hidden');
        }

        //Handle Audio Options
        //No longer showing checkout messages for surround sound
        /*var audioProfile = $cn.utilities.getAudioProfile(title.titleID);
        
        //If the profile is not marked as HD only or the title is an HD title continue
        if(!audioProfile.HDOnly || item.isHD) {
            if(audioProfile["Dolby_Digital_Plus_51"]){
                $('dolbydigital51').removeClass('hidden');
            }
            if(audioProfile["DTS_Express_51"]){
                $('dts51').removeClass('hidden');
            }
        }*/
        
        application.currentView.layoutIsDirty = true;
        $('checkout_container').show(); // Added because this containers visibility was getting jacked somewhere.
        
        $cn.methods.lookupPurchaseDetailsForTitle(title.titleID, function(result){
        	$cn.methods.getBillingInfo(this.onBillingInfoLoaded.bind(this));
        	if (result.responseCode == 31) {
        		result.isAvailable = false;
        		result.state = "Not_Owned";
        		result.errorHandled = true;
        	} 
        	
            this.inLibrary = result.isAvailable;

            if (result.state != "Not_Owned") {
                var title = this.getTitleObject();
                this.persist.passID = result.passID;

                if (title.show)
                    application.putInnerHTML($('checkout_message'), application.resource.ownership_state.tv_title[result.state]);
                else
                    application.putInnerHTML($('checkout_message'), application.resource.ownership_state.title[result.state]);
            }
        }.bind(this));
    },
    titleInLibrary: function() {
        return this.inLibrary;
    },
    skuIsUv: function() {
        var isTitleUV = $cn.utilities.isTrue($cn.utilities.getMeta("HasUV", this.getTitleObject().metaValues)),
            isSkuUV = "not set";
        if (isTitleUV) {
            isSkuUV = $cn.utilities.isTrue(this.getPersist().sku.isUV);
        }
        log.write("This " + (isTitleUV ? "is" : "is not") + " a UV title");
        log.write("This " + (isSkuUV ? "is" : "is not") + "a UV sku");
        return isTitleUV && isSkuUV;
    },
    skuIsD2D: function (){
        if($cn.config.EnableD2D && $cn.config.DeviceD2DEnabled){
            log.write("TEST d2d");
            var title = this.getPersist();
            log.write(JSON.stringify(title));
            return (title.sku.skuType.indexOf("Upgrade") != -1);
        } else {
            return false;
        }
    },
    checkD2DValid : function (){
        var invalidDisc = 1;
        return $cn.data.d2dTitleInfo.validDisc != invalidDisc;
    },
    goCheckOut: function(confirmationSkip) {
        var self = this;
        
        if (self.titleInLibrary() && !confirmationSkip) {
            if (self.skuIsUv()) {
                self.checkIfUserOwnsUvTitle(self.showAlreadyPurchasedModal.bind(self));
            }
            else {
                self.showAlreadyPurchasedModal();
            }
        } else {
            if ($cn.config.EnableUV && $cn.config.EnableUVPurchases && self.skuIsUv()) {
                if(typeof this.UV === "undefined"){
                    this.UV = new $cn.utilities.UserUVManager("CheckoutPanel");
                }
				//verifyAuthToken before doPurchase, because user may decative the device in website before click 'Place Order'
				//For none UV title, if the user decative the device, doPurchase will return 31 error, then activate panel popup
				$cn.methods.verifyAuthToken(function(result){
                    if (result) {
                    	self.UV.checkUVAccount(function(proceed){
                            if(proceed){
                                self.buyItemInStore();
                            }
                        }, true);
                    } else {
                        BrowseView.showActivate();
                    }
                });
               // $cn.methods.getAccountLinkState(self.respondToUvStatus.bind(self));
            } else {
                self.buyItemInStore();
            }
        }
    },
    showWarningModal: function(messageObj) {
        var self = this;
        log.write("messageObj is: " + JSON.stringify(messageObj));
        log.write("real warning modal");
        var data = {
            Message: messageObj.Message,
            Content: messageObj.Content,
            OK: messageObj.OK,
            Close:  messageObj.Cancel,
            callback: function(result) {
                if (result) {
                    self.goCheckOut();
                }
            }.bind(self)
        };
        //this will apply a class so we can further style UV modal Messages.
        BrowseView.showMessage("message_okcancel_vert", data);
    },
    buyItemInStore: function() {
        BrowseView.goCheckOut(this.getPersist().titleID, this.getPersist().sku.skuID, this.couponCode);
    },
    showSimilarPurchaseD2DModal: function(similarTitle){
        var messagePath = application.resource.d2d_messages.already_own,
            self= this,
				data = {
                Message: messagePath.Message,
                Content: messagePath.Content.replace(/##title##/g ,this.getTitleObject().name).replace("##libTitle##", similarTitle.name).replace("##price##", this.persist.sku.price),
                Close : messagePath.Cancel,
                OK: messagePath.OK,
                Class: "similarD2DModal",
						callback: function(result) {
                        if (result) {
                            // We cannot simply checkout on confirmation.
                            self.goCheckOut(true);
                        }
                    }
				};
				BrowseView.showMessage("message_okcancel", data);
    },
    showAlreadyPurchasedModal: function(userOwnsUv) {
        var messagePath,
            self = this,
            persist = this.getPersist();

        if(userOwnsUv){
            messagePath = application.resource.uv_messages.already_own;
		}
        else{
            messagePath = application.resource.already_purchased;
        }

        var data = {
            Message: messagePath.Message,
            Content: messagePath.Content,
            OK: messagePath.OK,
            Close:  messagePath.Cancel,
            Action: messagePath.Action,
            callback: function(result) {
                switch (result) {
                    case 'buy':
                        // We cannot simply checkout on confirmation.
                        // We have to do the entire UV pathway.
                        self.goCheckOut(true);
                        break;
                    case 'play':
                        //
                        BrowseView.MessagePopupCached.startPlay(persist.titleID, persist.passID);
                        break;
				}
            }
        };
        BrowseView.showMessage("message_alreadyownuv", data);
    },
    checkIfUserOwnsUvTitle: function(callback) {
        $cn.methods.getPurchasedTitle(this.persist.passID, this.persist.titleID, function(result){
            var uvOwnership = $cn.utilities.isTrue(result.isPassUV);
            callback(uvOwnership);
        });
    },
    checkUVOwnership: function() {

        // TODO: check service for ownership (or pass to this function if already known)
        // Pretty sure we don't need this it's a duplicate.
        var alreadyOwnedUV = true;

        if(alreadyOwnedUV) {

            var data = {
                    Message: application.resource.uv_messages.already_own.Message,
                    Content: application.resource.uv_messages.already_own.Content,
                    OK: application.resource.uv_messages.already_own.OK,
                    Close:  application.resource.uv_messages.already_own.Cancel,
                    Action: application.resource.uv_messages.already_own.Action,
                    callback: function(result) {

                        // TODO: handle result switch

                    }.bind(this)
            };

            BrowseView.showMessage("message_alreadyownuv", data);

        } else {
            // TODO: assuming this follows standard purchase process if linked
				BrowseView.goCheckOut(this.persist.titleID, this.persist.sku.skuID, this.couponCode);
        }
    },
    goPaymentBreakdown: function() {
        var self = this;
    	$cn.methods.verifyAuthToken(function(result){
            if (result) {
                self.showPaymentBreakdown();
            } else {
                BrowseView.showActivate();
            }
        }.bind(this));
    },
    showPaymentBreakdown: function() {
        var amountApplied, amountLeft;

        if (! this.paymentInfoAvailable) {
            log.write("--- payment info not yet available, setting listener ---");
            this.loadingTimer = $cn.utilities.showLoadingModal(2000, "Loading Payment Info...");
            this.paymentInfoListener = this.goPaymentBreakdown;
            return;
        }
        $cn.utilities.clearLoadingSpinner(this.loadingTimer);

        var remaining = 0;
        var asteriskString = '',
            asteriskFooterString = '';

        // Show asterisk and footer string except for tax is more than 0 using the same logic as title detail page
        if((this.purchaseDetails.amount_tax > 0 && this.purchaseDetails.amount_tax != "") || ($cn.config.EnableTaxAPI && this.purchaseDetails.amount_tax != 0)) {
            asteriskString = '';
            asteriskFooterString = '';
        }
        else if ($cn.config.EnableTaxAPI) {
            asteriskString = '<span class="white"> * </span>';
            asteriskFooterString = '<tr><td colspan="2" align="right" style="height:50px">' + application.resource.tax_string + '</td></tr>';
        }

        var HTML = '<table width="90%" align="center">';

        // Subtotal
        HTML += '<tr><td align="left">Item Subtotal:</td><td align="right">' + application.resource.currency_symbol + this.purchaseDetails.amount_subtotal + '</td></tr>';

        // Gift card
        if(this.purchaseDetails.amount_giftcard_remaining > 0) {
            // This is the amount we will use
            amountApplied = (parseFloat(this.purchaseDetails.amount_giftcard) - parseFloat(this.purchaseDetails.amount_coupon)).toFixed(2);
            // This is the current ballance minus the amount we will use
            amountLeft = (parseFloat(this.purchaseDetails.amount_giftcard_remaining) - amountApplied).toFixed(2);
            HTML += '<tr><td align="left">Gift Card(s) (' + application.resource.currency_symbol + amountLeft + ' remaining):</td><td align="right">-' + application.resource.currency_symbol + amountApplied + '</td></tr>';
        }

        // Coupon
        if(this.purchaseDetails.amount_coupon > 0) {
                HTML += '<tr><td align="left">Coupon(s):</td><td align="right">-' + application.resource.currency_symbol + this.purchaseDetails.amount_coupon + '</td></tr>';
        }

        // Taxes - we should show 0 if tax api enabled
        if(this.purchaseDetails.amount_tax != 0) {
            HTML += '<tr><td align="left">Applicable Tax:</td><td align="right">' + application.resource.currency_symbol + this.purchaseDetails.amount_tax + '</td></tr>';
        }

        // Total
        HTML += '<tr><td colspan="2">&nbsp;</td></tr>';
        HTML += '<tr><td align="left" class="white">Total to ' + this.purchaseDetails.total_confirm + ': ' + asteriskString + '</td><td class="white" align="right">' + application.resource.currency_symbol + this.purchaseDetails.amount_total + '</td></tr>';
        HTML += '<tr><td colspan="2">&nbsp;</td></tr>';

        // Credit card
        if(this.purchaseDetails.lastfour && this.purchaseDetails.lastfour.length > 0) {
            HTML += '<tr><td align="left">Credit Card ending in ' + this.purchaseDetails.lastfour + ':</td><td align="right">' + application.resource.currency_symbol + this.purchaseDetails.amount_total + '</td></tr>';
        }
        else {
            HTML += '<tr><td align="left">Credit Card:</td><td align="right">' + application.resource.currency_symbol + this.purchaseDetails.amount_total + '</td></tr>';
        }
        HTML += '<tr><td colspan="2">&nbsp;</td></tr>';

        HTML += asteriskFooterString;

        HTML += '</table>';
        
        var tmp = {id: 'tmp'};
        application.events.subscribe(tmp, 'navigate', function(block){
            block.preventDefault();
            log.write('Blocked navigation per 2011 bug.');
        });
        
        BrowseView.showMessage("payment_table_popup", {
            Message: "PAYMENT BREAKDOWN", 
            Content: HTML,
            OK: "Close",
            callback: function(result) {
                log.write('back: ' + result);
                application.events.unsubscribe(tmp, 'navigate');
            }.bind(this)
        });	
    },
    onBillingInfoLoaded: function(billingInfoResult) {
    	if (billingInfoResult.responseCode == 31) { //Not activated
    		billingInfoResult.giftCertificateBalance = 0;
    		billingInfoResult.cCLast4 = '';
    		billingInfoResult.errorHandled = true;
    	}
    	
        var gcUsed = 0,
            gcBalance = billingInfoResult.giftCertificateBalance,
            subtotal = Math.round(this.persist.sku.price * 100),
            total,
            sku = this.persist.sku,
            confirmation,
            i,
            ccinfo;
			
        switch (sku.purchaseType) {
			case "any":
			case "buy":
            confirmation = application.resource.confirmation["buy"][this.getTitleObject().titleType];
				break;
			case "rent":
				confirmation = application.resource.confirmation.rent;
				confirmation = confirmation.replace("{Period}", sku.rentalPeriod);
				break;
        }
        
        //for (i = 0; i < sku.availableAssets.length; ++i) {
        //    if (sku.availableAssets[i].file_FileProfile	&& sku.availableAssets[i].file_FileProfile == "HIGH_DEFINITION") {
        //       confirmation += application.resource.confirmation.hd;
        //       break;
        //    }
        //}
        
        if(sku.skuType.indexOf('HD') > -1)
        {
            confirmation += application.resource.confirmation.hd;
        }

        ccinfo = (billingInfoResult.cCLast4 && billingInfoResult.cCLast4.length > 0) ? " " +  billingInfoResult.cCLast4 : "";

        $cn.methods.calcOrderTax(this.persist.sku.skuID, null, function(res) {
        	if (billingInfoResult.responseCode == 31) { //Not activated
        		res.subTotal = 0;
        		res.tax = 0;
        		res.errorHandled = true;
        	}
        	
            var remain, $cartDetails;

            subtotal = res.subTotal > 0 ? Math.round(res.subTotal * 100) : subtotal;
            total = subtotal + Math.round(res.tax * 100) - this.discountAmount;
            if (total > 0) {
                gcUsed = Math.min(gcBalance, total);
                // gcBalance -= gcUsed; Removed per []
                total -= gcUsed;
            }
            else
                total = 0;
				
            this.purchaseDetails = {
                amount_subtotal: $cn.utilities.formatAsMoney(subtotal),
                amount_tax: $cn.utilities.formatAsMoney(res.tax * 100),
                amount_coupon: $cn.utilities.formatAsMoney(this.discountAmount),
                amount_giftcard: $cn.utilities.formatAsMoney(this.discountAmount + gcUsed),
                amount_total_discount: $cn.utilities.formatAsMoney(this.discountAmount + gcUsed),
                amount_giftcard_remaining: $cn.utilities.formatAsMoney(gcBalance),
                amount_creditcard: $cn.utilities.formatAsMoney(total),
                amount_total: $cn.utilities.formatAsMoney(total),
                tax_string: application.resource.tax_string,
                lastfour: ccinfo,
                total_confirm: confirmation
            };
		
            if (this.tplCart == null)
                this.tplCart = new ui.template("cartdetails", application.ui.loadTpl("cartdetails.tpl")); 
            else
                this.tplCart.empty();
                
            this.tplCart.append(this.purchaseDetails);
            this.tplCart.apply();

            $cartDetails = $("cartdetails");

            if(document.getElementById('cartdetails')) {
                if(this.discountAmount > 0)
                {
                    if(0 + gcBalance > 0)
                    {
                        $cartDetails.getElements('.giftcard_coupon').show();
                    }
                    else {
                        $cartDetails.getElements('.coupon').show();
                    }
                }
                else if(gcUsed > 0)
                {
                    $cartDetails.getElements('.giftcard').show();
                }

                remain = $("giftcard_remaining");
                if (gcBalance <= 0 && remain) {
                    remain.hide();
                }

                // We hide the tax related fields, and then if applicable we show them below.
                $cartDetails.getElements('.taxes').hide();
                $cartDetails.getElements('#taxesString').hide();
                $cartDetails.getElement('.total .col1 span.white').hide();

                // Show taxes if taxes are greater than zero
                // Or if taxes are on and taxes are greater or equal to zero
				if((res.tax > 0 && res.tax != "") || ($cn.config.EnableTaxAPI && res.tax != 0)) {
                    $cartDetails.getElements('.taxes').show();
				} 
				else if ($cn.config.EnableTaxAPI) {
                    $cartDetails.getElements('#taxesString').show();
                    $cartDetails.getElement('.total .col1 span.white').show();
				}
            }

            // Payment info is now available
            this.paymentInfoAvailable = true;
            if (this.paymentInfoListener) {
                log.write("--- was waiting for payment info, now firing ---");
                this.paymentInfoListener();
                this.paymentInfoListener = null;
            }
            //Show order information when data is loaded
            $('checkout1').addClass('placeorder');
        }.bind(this));
        
//		application.currentView.layoutIsDirty = true;
        
    },
    handleSettingWheelChange: function(payload) {
        var data = payload.args[0];
        switch(data.name)
        {
            case "buy":
            case "rent":
                this.loadView("checkout.buy");
                break;
            case "freepreview":
                this.loadView("checkout.freepreview");
                break;
        }
        this.loadData(data);
    },
    show: function() {
        $('checkoutpanel').show();
        //check for d2d path and if disk is valid/
        if($cn.data.d2dPath){
            if(!this.checkD2DValid()){
                var messagePath = application.resource.d2d_messages.invalid,
                    data = {
                        Message: messagePath.Message,
                        Content: messagePath.Content,
                        Close: messagePath.OK
                    };
                BrowseView.showMessage("message_d2d_content", data);
            }
            BrowseView.CurrentProcessLoaded = true;
            $cn.data.d2dPath = false;
        }
        //animation.start({'width': 350});
    },
    hide: function() {
        $('checkoutpanel').hide();
        log.write('enable buttons');
        //animation.start({'width': 350});
        this.deactivate();
    },
    getWarning: function(mpaaRating) {
        
        if(mpaaRating == "R" ||mpaaRating == "NC17"||mpaaRating == "NR")
        {
            $('movieWarning').removeClass("hidden");
            $('checkoutProductList').addClass("hidden");
        }
        else if (mpaaRating == "TVMA")
        {
            $('tvWarning').removeClass("hidden");
            $('checkoutProductList').addClass("hidden");
        }
        else if (mpaaRating == "MA") //TODO: Verify the mature rating code
        {
            $('matureWarning').removeClass("hidden");
            $('checkoutProductList').addClass("hidden");
        }
        
    },
    navigate: function(payload){

        var p = payload.args[0];
        if ($('checkoutpanel').isParentOf($(p.current))) {
            
            if(p.direction == "left" && $(p.current).get('left') == null){

                this.deactivate();
                navigation.setFocus($('singlewheel').offsetWidth ? 'singleselectedmaster' : 'tdbuttonCheckout');

                payload.preventDefault();
            
            }
            else if(p.direction == "right" && $(p.current).get('right') == null){
                // log.write('right: ' + $(p.current).get('right'));
                payload.preventDefault();

                if (!this.isNavigating) {
                    if ($(p.current).get('rightaction') == 'true')
                        eval('(' + $(application.element.current).get('rightaction')   + ')');
                }
            }
        }
    },
    onRedeemed: function(payload) {
        if (payload.args[0].coupon) {
            this.couponCode = payload.args[0].coupon;
            this.discountAmount = payload.args[0].amount;
        }
        $cn.methods.getBillingInfo(this.onBillingInfoLoaded.bind(this));
    },
    
    updateCheckoutPanelStatus: function(payload) {
        $cn.methods.lookupPurchaseDetailsForTitle(this.getTitleObject().titleID, function(result){
        	$cn.methods.getBillingInfo(this.onBillingInfoLoaded.bind(this));
        	
        	this.inLibrary = result.isAvailable;
            if (result.state != "Not_Owned") {
                var title = this.getTitleObject();
                this.persist.passID = result.passID;

                if (title.show)
                    application.putInnerHTML($('checkout_message'), application.resource.ownership_state.tv_title[result.state]);
                else
                    application.putInnerHTML($('checkout_message'), application.resource.ownership_state.title[result.state]);
            }
        }.bind(this));
    }
    
},
CheckoutPanelControl = new Class(CheckoutPanelControlProperties);
