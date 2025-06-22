//-----------------------------------------------------------------------------
// giftcard.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author jessemccabe
 */
var GiftCardPanelControl = new Class({
	Extends:ModalControl,
	id: 'giftcard',
	layoutIsDirty: true,
	isValid: false,
	tpl: null,
	sku: '',
	keyboard: null,
	isPurchasePath: false,
    initialize: function(){
		log.write('giftcard.init()');
		this.parent('giftcard');
		
    },
    show: function(isPurchasePath, sku){
		$('ModalWindow').setAttribute('style', '');
    	var headingTxt = (isPurchasePath) ? application.resource.gift_card_poup_heading_purchase_path : application.resource.gift_card_poup_heading;
    	
    	this.parent();
    	this.loadData([{buttonTxt:'Cancel', headingTxt: headingTxt}]);
    	BrowseView.GiftCardKeyboard.show();
    	this.sku = (isPurchasePath) ? sku : 0;
    	this.isValid = false;
		this.isPurchasePath = isPurchasePath;
    	application.events.subscribe(this, "back", this.handleBack.bind(this));
    	application.events.subscribe(this, "navigate", this.handleNavigate.bind(this));
    },
    hide: function(){
    	this.isValid = false;
    	this.parent();
    	application.events.unsubscribe(this, "back");
    	application.events.unsubscribe(this, "navigate");
    },
    apply: function(){
    	if(this.isValid) {
    		$cn.data.CurrentPromotion = this.keyboard.value.trim();
    	}
    },
    handleBack: function(payload){
    	payload.preventDefault();
    	application.currentView.GiftCardKeyboard.hide();
    	this.hide();
    },
    handleNavigate: function(payload){
    	if(payload.args[0].direction == "right" && 
    		(	application.element.current == ""
    			
    		)
    	){
	
		}
    },
    redeem:function(){
    	$('giftcodeerror').innerHTML = '';
    	var self = this,
			timer = null;
    	this.isValid = false;
    	this.isProcessing = true;
		
		var code = this.keyboard.value.trim();
		if (!code.length) {
			this.isProcessing = false;
			$('giftcodeerror').innerHTML = 'Invalid code.';
			return;
		}    	
    	
		if (this.isPurchasePath) {			
			timer = $cn.utilities.showLoadingModal(2000, "Redeem Gift Code...");
			$cn.methods.verifyCode(this.sku, code, function(api){
				$cn.utilities.clearLoadingSpinner(timer);
				self.isProcessing = false;
                if($('giftcodeerror')==null) //in case we are coming back from activation
                {
                    BrowseView.GiftCardPanel.show(true, self.sku);
                    navigation.setFocus("gcredeem");
                }
				if (api.responseCode == 0) {
					/* Successfully applied coupon, update UI */
					self.isValid = true;
					self.keyboard.clear();
					
					if (api.discountType == "GiftCertificate") {
						/* This is a Gift Code */
						$('giftcodetotal').innerHTML = '-' + application.resource.currency_symbol + $cn.utilities.formatAsMoney(api.giftCertificateBalance);
						$('giftcodesredeemed').show();

						application.events.publish("redeemed", { giftCertificate: api.giftCertificateBalance });
					}
					else {
						if (api.discountType == "Coupon") {
							$('coupontotal').innerHTML = '-' + application.resource.currency_symbol + $cn.utilities.formatAsMoney(api.discountAmount);
							$('couponseredeemed').show();

							application.events.publish("redeemed", { coupon: code, amount: api.discountAmount });
						}
					}
				}
				else {
					var errorMsg = 'Invalid code.';
					
					/* Error with the coupon code or scenario. Display Reason. */
					switch (api.responseCode) {
						case 36:
							errorMsg = 'Coupon code already used.';
							break;
						case 37:
							errorMsg = 'Code already used.';
							break;
						default:
							break;
					}
					
					self.keyboard.clear();
					$('giftcodeerror').innerHTML = errorMsg;
				}
				
			});
		}
		else{
			timer = $cn.utilities.showLoadingModal(2000, "Redeem Gift Code...");
			$cn.methods.applyGiftCode(code, function(api){
				$cn.utilities.clearLoadingSpinner(timer);
				self.isProcessing = false;
				
				if($('giftcodeerror')==null) //in case we are coming back from activation
                {
                    BrowseView.GiftCardPanel.show(false);
                    navigation.setFocus("gcredeem");
                }
				if (api.responseCode == 0) {
					/* Successfully applied coupon, update UI */
					self.isValid = true;
					self.keyboard.clear();
					
					$('giftcodetotal').innerHTML = '-' + application.resource.currency_symbol + $cn.utilities.formatAsMoney(api.giftCertificateBalance);
					$('giftcodesredeemed').show();					
				}
				else {
					var errorMsg = 'Invalid code.';
					
					/* Error with the coupon code or scenario. Display Reason. */
					switch (api.responseCode) {
						case 36:
							errorMsg = 'Code already used.';
							break;
						case 37:
							errorMsg = 'Code already used.';
							break;
						default:
							break;
					}
					
					self.keyboard.clear();
					$('giftcodeerror').innerHTML = errorMsg;
				}
			});
		}
    }
});
