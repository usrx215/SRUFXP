//-----------------------------------------------------------------------------
// scrollview.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/**
 * @author lwilson
 */
var ScrollViewProperties = {
		id: 'scrollview',
		content: null,
		pageHeight: 0,
		scrollbar: null,
		onScroll: null,
		initialize: function(element){
		
			this.content = element.getChildren()[0];
			this.scrollbar = new ScrollBar(element.getElement(".scrollbar").id);
			this.scrollbar.onScroll = this.onScroll.bind(this);

		},
		destroy: function() {
			this.scrollbar.destroy();
		},
		draw: function() {

			var attr = this.content.attributes["pageHeight"];
			this.pageHeight = attr == null ? this.content.getParent().clientHeight : attr.value.toInt();
			log.write("scroll amount: " + this.pageHeight);

//			this.pageHeight = Math.floor(this.content.getParent().clientHeight / lineHeight) * lineHeight - lineHeight;
			var contentHeight = this.content.getDimensions().y;

			this.scrollbar.setPosition(0);
			this.scrollbar.setRange(Math.ceil(contentHeight / this.pageHeight) - 1);
//			this.scrollbar.draw();		
			
		},
		onScroll: function(direction, scrollbar)
		{
			if(this.content)			
			{		
//				totalheight = this.content.clientHeight;
//				visibleheight = this.content.getParent().clientHeight;

				var newPosition = scrollbar.getPosition() + (direction == "down" ? 1 : -1);
				newPosition = Math.min(Math.max(0, newPosition), scrollbar.range);
				
				if (newPosition != scrollbar.getPosition()) {
					var top = -newPosition * this.pageHeight;
					
//					if (top < visibleheight - totalheight)
//						top = visibleheight - totalheight;
					
//					var elem1 = new Fx.Morph(this.content, animation.options);
//					elem1.start({'margin-top': top});

					this.content.setStyle('margin-top', top);
					scrollbar.setPosition(newPosition);
				}
			}
		}
	},
	ScrollView = new Class(ScrollViewProperties);
