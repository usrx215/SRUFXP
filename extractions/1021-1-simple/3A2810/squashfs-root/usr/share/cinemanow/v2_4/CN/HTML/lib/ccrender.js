//-----------------------------------------------------------------------------
// ccrender.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------

//Close Caption Render
var ccrender = {
    safearea: 0.05,
    width: 960,
    height: 540,
    originX: 0,
    originY: 0,
    resolutionX: 960,
    resolutionY: 540,
    minRow: 4,
    maxFontSize: 32,   //A work around font size to avoid overlap in most titles.    
    renderHtmlDivs: [],
    styleList: [],
    cellResolution: { cols: 32, rows: 15 }, //Set the default value
    defaultCCDisplayEnabled: false,
    userCCDisplayEnabled: undefined,
    isCCStreamAvailable: false,

    init: function(containerId) {
        log.write('ccrender.init');

        // Add a "safe area" around the screen.
        this.originX = Math.floor(this.width * this.safearea);
        this.originY = Math.floor(this.height * this.safearea);
        this.resolutionX = this.width - 2 * this.originX;
        this.resolutionY = this.height - 2 * this.originY;

        this.styleList = [];
        this.renderHtmlDivs = [];

        var container = $(containerId),
            i = 0;

        if (container && container.childNodes && container.childNodes.length) {
            for (i = 0; i < this.minRow && i < container.childNodes.length; i++) {
                var node = container.childNodes[i];
                //Clean up the nodes to avoid show last closed caption title.
                node.set('html', '');
                node.hide();
                this.renderHtmlDivs.push(node);
            }

            if (i < this.minRow) {
                log.write('ccrender.init: container number is smaller than the minimum (at least 4)!');
            }
        }

        this.defaultCCDisplayEnabled = configuration.readValue('DefaultCCDisplayEnabled') || this.defaultCCDisplayEnabled;
        this.userCCDisplayEnabled = configuration.readValue('UserCCDisplayEnabled');
    },

    isCCEnabled: function() {
        if (!this.userCCDisplayEnabled) { //First time run
            return this.defaultCCDisplayEnabled;
        } else {
            return this.userCCDisplayEnabled;
        }
    },

    setCCEnabled: function(enable) {
        this.userCCDisplayEnabled = enable;
        configuration.writeValue('UserCCDisplayEnabled', enable);
    },

    isCCAvailable: function() {
        return this.isCCStreamAvailable;
    },

    setCCAvailable: function(available) {
        this.isCCStreamAvailable = available;
    },

    convertXMLNodetoJSObj: function(xmlNodes) {
        log.write('ccrender.convertXMLNodetoJSObj: Enter');
        var nodes = xmlNodes;
        var tts = []; //Timed Title Array to store given timed title
        for (var i = 0; i < nodes.length; i++) {
            if (nodes[i].nodeName == "Metadata") {
                styleNodes = nodes[i].childNodes;
                for (var j = 0; j < styleNodes.length; j++) {
                    if (styleNodes[j].nodeName == "Style") {
                        //Closed Caption Style
                        var ccs = this._parseXMLStyleNode(styleNodes[j]);
                        this.styleList.push(ccs);
                    } else if (styleNodes[j].nodeName == "cellResolution") {
                        //Parse Cell Resolution Information
                        var cellres = this._parseCellResolution(styleNodes[j]);
                        this.cellresolution = cellres;
                    }
                }
            }

            if (nodes[i].nodeName == "Data") {
                for (var j = 0; j < nodes[i].childNodes.length; j++) {
                    if (nodes[i].childNodes[j].nodeName == "p") {
                        //Get a timed title and push it to the array.
                        var tt = this._parseXMLParagraghNode(nodes[i].childNodes[j]);
                        tts.push(tt);
                    }
                }
            }
        }
        log.write('ccrender.convertXMLNodetoJSObj: Return');
        return tts;
    },

    renderCCXMLNodes: function(xmlNodes) {
        if (this.renderHtmlDivs.length >= this.minRow) {
            this.renderCCJSNodes(this.convertXMLNodetoJSObj(xmlNodes));
        } else {
            log.write('ccrender.renderCCXMLNodes: Should init firstly and the render nodes cannot be empty!');
        }
    },

    renderCCJSNodes: function(tts) {
        if (tts && tts.length > 0) {
            //TODO May add other renders
            this.renderPopupStyle(tts);
        } else { //Clean up
            for (var i = 0; i < this.renderHtmlDivs.length; i++) {
                this.renderHtmlDivs[i].set('html', '');
                this.renderHtmlDivs[i].hide();
            }
        }
    },

    renderPopupStyle: function(tts) {
        var i, j;

        for (i = 0; i < tts.length; i++) {
            this.renderHtmlDivs[i].set('html', tts[i].timedText);
            this.renderHtmlDivs[i].setStyles(tts[i].divStyle);
            this.renderHtmlDivs[i].show();
        }
        //Clean up other divs
        for (j = i; j < this.renderHtmlDivs.length; j++) {
            this.renderHtmlDivs[j].set('html', '');
            this.renderHtmlDivs[j].hide();
        }
    },

    renderRollupStyle: function(tts) {
        //TODO special code for roll up effect
    },

    renderPaintonStyle: function(tts) {
        //TODO special code for paint on effect
    },

    _parseCellResolution: function(node) {
        var cellResArray = node.textContent.split(" ");
        var cellRes = { cols: 32, rows: 15 }; //default value
        if (cellResArray && cellResArray.length == 2) {
            cellRes.cols = cellResArray[0];
            cellRes.rows = cellResArray[1];
        }
        return cellRes;
    },

    _parseXMLStyleNode: function(node) {
        var ccs = {};
        var id = node.getAttribute('id');

        //Set the value to closed caption style. If the style value not exist, set it to default value.
        var fontsize = this._getFontsize(node.getAttribute('fontSize'));
        var fontweight = node.getAttribute('fontWeight') || 'normal';
        var fontstyle = node.getAttribute('fontStyle') || 'normal';
        var fontfamily = 'cour';
        var color = node.getAttribute('color') || 'white';
        var background = node.getAttribute('backgroundColor') || 'black';
        var textdecoration = node.getAttribute('textDecoration') || 'none';
        ccs = { 'id': id, 'fontsize': fontsize, 'fontweight': fontweight, 'fontstyle': fontstyle, 'fontfamily': fontfamily,
            'color': color, 'background': background, 'textdecoration': textdecoration
        };
        log.write('ccrender._parseXMLStyleNode: get a style node');
        return ccs;
    },

    _parseXMLParagraghNode: function(node) {

        var ttWithStyle = { timedText: '', divStyle: {}, id: 0 };
        var pos = this._getPosition(node.getAttribute('origin'));
        var id = node.getAttribute('id');
        var width = this.resolutionX + 'px';
        var height = 0;
        ttWithStyle.divStyle = { 'id': id, 'left': pos.left, 'top': pos.top, 'width': width, 'height': height };

        var tt = "";
        //Find Text Node
        var childNodes = node.childNodes;
        for (var i = 0; i < childNodes.length; i++) {
            if (childNodes[i].nodeName == "t" || childNodes[i].nodeName == "b") {
                tt += this._parseXMLTextNode(childNodes[i]);
            }
        }
        ttWithStyle.timedText = tt;

        return ttWithStyle;
    },

    _parseXMLTextNode: function(node) {
        var text = "";
        if (node.nodeName == "t") {
            var ccs = this._getCCStyle(node.getAttribute('sid'));

            var fontsize = ccs.fontsize;
            var fontweight = ccs.fontweight;
            var fontstyle = ccs.fontstyle;
            var fontfamily = 'cour'; //TODO  ccs.fontfamily;
            var color = ccs.color;
            var background = ccs.background;
            var textdecoration = ccs.textdecoration;
            text = "<span style=" + "'" +
            "font-size:" + fontsize + ";" + "font-weight:" + fontweight + ";" + "font-style:" + fontstyle + ";" + "font-family:" + fontfamily + ";" +
            "color:" + color + ";" + "background:" + background + ";" + "text-decoration:" + textdecoration + ";" + "display:inline;" + "'" + ">" +
            node.textContent + "</span>";

        } else if (node.nodeName == "b") {
            text = "<br/>";
        }
        return text;
    },

    _getCCStyle: function(sid) {
        for (var i = 0; i < this.styleList.length; i++) {
            if (this.styleList[i].id == sid) {
                return this.styleList[i];
            }
        }
    },

    _getFontsize: function(value) {
        var fontsize = this.maxFontSize;
        if (value.indexOf('%') > -1) {
            // Font percent is relative to base font size, which is "1c". But some font sizes in these
            // files are wrong - they show 8% for what should be 80%. So we try a little rough fudging.
            fontsize = parseFloat(value.substring(0, value.indexOf('%')));
            if (fontsize < 10)
                fontsize *= 10;
            fontsize = Math.floor((fontsize * this.resolutionY) / (this.cellResolution.rows * 100));
        } else if (value.indexOf('px') > -1) {
            fontsize = value.substring(0, value.indexOf('px'));
        } else if (value.indexOf('c') > -1) {
            fontsize = Math.floor((this.resolutionY / this.cellResolution.rows) * value.substring(0, value.indexOf('c')));
        }
        //if (fontsize > this.maxFontSize) { // A work around to avoid overlap or font too large issue.
        //    fontsize = this.maxFontSize;
        //}
        return fontsize + 'px';
    },

    _getPosition: function(value) {
        var left = 0, top = 0;
        var origin = "";
        if (value) {
            origin = value.split(" ");
        }
        if (origin.length == 2) {
            left = Math.floor(origin[0].slice(0, origin[0].indexOf("%")) * this.resolutionX / 100);
            top = Math.floor(origin[1].slice(0, origin[1].indexOf("%")) * this.resolutionY / 100);
        } else {
            //To set default position when no position info
            left = Math.floor(this.resolutionX * 0.2);
            top = Math.floor(this.resolutionY * 0.8);
        }
        left += this.originX;
        top += this.originY;
        return { 'left': left + 'px', 'top': top + 'px' };
    }
};
