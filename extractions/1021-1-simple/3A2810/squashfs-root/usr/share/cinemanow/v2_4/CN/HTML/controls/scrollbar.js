//-----------------------------------------------------------------------------
// scrollbar.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author Adam Tumminaro
 */
var ScrollBarProperties = {
		id: 'scrollbar',
		onScroll: null,
		range: 0,
		position: 0,
//		element: null,
		tpl: null,
		thumb: null,
		isBusy: false,
		initialize: function(id){
			this.id = id;
			//this.loadData([], 250)

			this.tpl = new ui.template(this.id, application.ui.loadTpl(this.id + ".tpl"));
			this.tpl.compile();
			this.tpl.append();
			this.tpl.apply();

			this.thumb = $(this.id).getElement(".scrollthumb").id;

			application.events.subscribe(this, 'navigate', this.navigate.bind(this));
			application.events.subscribe(this, 'savestate', this.onSaveState.bind(this));
			application.events.subscribe(this, 'restorestate', this.onRestoreState.bind(this));
		},
		activate: function(grid){
			log.write("ScrollBar.activate is deprecated");
		},
		deactivate: function()
		{
			//hide
			this.hide();
		},
		destroy: function() {
			application.events.unsubscribe(this, 'navigate');
			application.events.unsubscribe(this, 'savestate');
			application.events.unsubscribe(this, 'restorestate');
		},
		hide: function()
		{
			//hide
			$(this.id).hide();
		},
		draw: function(){

			if (this.range == 0)
				return;
				
			var element = $(this.id);
			
			if (element) {
					
				var thumb = $(this.thumb);
				var percentage = (this.range > 0 ? this.position / this.range : 0);
				var thumbHeight = thumb.getSize().y;

				var arrow = this.arrow;

				if (arrow) {
					arrow.addClass("hover");
					this.arrow = null;
				}

				/* ADD HACK HERE - Take scrolling out of the following scenarios:
				 *  - More Info Panel/User Reviews
	 			 *	- More Info Panel/Critic Revews
	 			 *	- More Info Panel/Cast Bios
	 			 *	- More Info Panel/Credits
	 			 *	- EULA pop-up 
				 */

//				if( ((document.getElementById('creditsgrid') && document.getElementById('creditsgrid').style.display == "block") || 
//					(document.getElementById('biogrid') && document.getElementById('biogrid').style.display == "block") ||
//					(document.getElementById('reviewgrid') && document.getElementById('reviewgrid').style.display == "block") ||
//					(document.getElementById('modalcontrol') && document.getElementById('modalcontrol').style.display == "block"))
//				){
//					thumb.setStyle('margin-top', (element.getElement(".scrollarea").clientHeight - thumbHeight) * percentage);
//					
//					if (arrow)
//						arrow.removeClass("hover");
//				}
//				else
				{
					if(device.getDeviceSoc() != "BCOM") {
						
						var animation = new Fx.Morph(thumb, {
							duration: 200,
							transition: Fx.Transitions.Sine.easeOut,
							onComplete: function(obj){
								if (arrow)
									arrow.removeClass("hover");
							}
						});
			
						animation.start({'margin-top': (element.getElement(".scrollarea").clientHeight - thumbHeight) * percentage});
					}
					else {
						thumb.setStyles({'margin-top': (element.getElement(".scrollarea").clientHeight - thumbHeight) * percentage});
						if (arrow)
							arrow.removeClass("hover");
					}
				}
			}		
		},
		getPosition: function() {
			return this.position;
		},
		setPosition: function(position) {
			
			position = Math.min(this.range, Math.max(0, position));
			
			if (position != this.position) {
				this.position = position;
				this.draw();
			}
		},
		setRange: function(range) {
			
			if (range != this.range) {
				this.range = range;
					
				if (this.position > this.range)
					this.position = this.range;
		
				if (this.range > 0)
					this.draw();
			}
					
			if (this.range > 0) 
				$(this.id).show();
			else
				this.hide();
		},
		loadData: function(content, height) {
					
			this._data["scrollID"] = "scrollbarID";
			//this._data = content;		
			this.draw();
			
		},
		navigate: function(payload){

			if ((application.element.current && application.element.current != '') && document.getElementById(application.element.current) && application.element.current == this.thumb){
				
				if(payload.args[0].direction == "down" || payload.args[0].direction == "up") {

					// TODO: flash is supposed to be on keydown and keyup
					this.arrow = $(this.id).getElement(payload.args[0].direction == "down" ? ".scrollbottom" : ".scrolltop");

					if (this.onScroll != null)
						this.onScroll(payload.args[0].direction, this);
					else
			       		application.events.publish('scroll', {direction: payload.args[0].direction, scrollbar: this });
						
					//Stop Default Action
					payload.preventDefault();
				}			
			}		
		},
		onViewChanged: function(payload){
			this.currentView = payload.args[0];
		},
		onSaveState: function(payload){
			var state = payload.args[0];
			state[this.id] = { position: this.position, range: this.range };
		},
		onRestoreState: function(payload){
			var state = payload.args[0];
			$extend(this, state[this.id]);
		}
	}, 
	ScrollBar = new Class(ScrollBarProperties);
