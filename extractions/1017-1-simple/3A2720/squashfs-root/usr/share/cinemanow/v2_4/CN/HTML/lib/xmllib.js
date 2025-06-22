//-----------------------------------------------------------------------------
// xmllibs.js
// Copyright (c) 2012 - 2013, Rovi Corporation.  All rights reserved.
//-----------------------------------------------------------------------------
 
/* XML Methods for MooTools */
/* Requires MooTools v1.2 */

var XML = {
	
	rootFromFile: function(file,callback){
		if(!$cn.config.PrecompiledApplication){
			var xmlhttp = new XMLHttpRequest();
			xmlhttp.open('GET', file, true);
			xmlhttp.send(null);
			xmlhttp.onreadystatechange = function(){
				
				if(xmlhttp.readyState == 4) {	
					
					if ((xmlhttp.status && xmlhttp.status == 200) || document.URL.substr(0,4) == "file") {
						
						var xmlParser = new DOMParser();
						var xmlDoc = xmlParser.parseFromString(xmlhttp.responseText, "text/xml");
	
						callback.call(this, xmlDoc);
					}
				}
			}
		}
		else {
			callback.call(this, null);
		}
	},
	
	rootFromFileSync: function(file) {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open('GET', file, false);
		xmlhttp.send(null);
		
		if(xmlhttp.readyState == 4) {	
			if (xmlhttp.status && xmlhttp.status == 200 || document.URL.substr(0,4) == "file") {
				return xmlhttp.responseXML;
			}
		}
		
		return null;
	},
	
	rootFromString: function(string){
		var root;

		if (Browser.Engine.trident){
			root = new ActiveXObject('Microsoft.XMLDOM');
			root.async = false;
			root.loadXML(string);
		} else {
			root = (new DOMParser()).parseFromString(string, 'text/xml');
		}

		return root;
	},
	
	rootToHashes: function(root){
		var hashes = [], children = root.childNodes, hash = null, i = 0, l;

		for (i = 0, l = children.length; i < l; i++){
			hash = XML.nodeToHash(children[i]);
			if (hash) hashes.push(hash);
		}

		return hashes;
	},
	
	nodeToHash: function(node){
		switch ($type(node)){

			case 'element':
				var attributes = node.attributes, attributesLength = attributes.length, attributesHash = {}, j = 0, attribute;

				for (j = 0; j < attributesLength; j++){
					attribute = attributes[j];
					if (attribute.nodeValue && attribute.nodeValue != 'inherit') attributesHash[attribute.nodeName] = attribute.nodeValue;
				}

				return {tag: node.nodeName.toLowerCase(), attributes: attributesHash, children: XML.rootToHashes(node)};

			case 'textnode': return {text: node.nodeValue};

			default: return null;
		}
	},
	
	rootToJSONString: function(root){
		var jsons = [], children = root.childNodes, json = '', i = 0, l;

		for (i = 0, l = children.length; i < l; i++){
			json = XML.nodeToJSONString(children[i]);
			if (json) jsons.push(json);
		}

		return jsons;
	},

	nodeToJSONString: function(node){
		var i = 0;
		if ($type(node) == 'element'){
			var attributes = node.attributes, attributesLength = attributes.length, attributesJSON = '', j = 0, attribute;
			
			if (attributesLength > 0){
				for (j = 0; j < attributesLength; j++){
					attribute = attributes[j];
					if (attribute.nodeValue && attribute.nodeValue != 'inherit'){
						if(!isNaN(Number(attribute.nodeValue)) || attribute.nodeValue === "true" || attribute.nodeValue === "false")
							attributesJSON += "\"" + attribute.nodeName + "\"" + ":" + attribute.nodeValue + ",";
						else
							attributesJSON += "\"" + attribute.nodeName + "\"" + ":" + "\"" + attribute.nodeValue + "\",";
					}
				}
				//remove the last character ','
				attributesJSON = attributesJSON.substring(0,attributesJSON.length-1);
				if (node.childNodes.length > 1)
					return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + "[" + XML.rootToJSONString(node) + "]" + attributesJSON + "}";
				else if (node.childNodes.length <= 1 && $type(node.firstChild) == 'textnode'){
					if (!isNaN(Number(node.nodeValue)) || node.nodeValue === "true" || node.nodeValue === "false")
						return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + node.nodeValue + attributesJSON + "}";
					else
						return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + "\"" + node.nodeValue + "\"" + attributesJSON + "}";
				}
			}
			else{
				if (node.childNodes.length > 1)
					return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + "[" + XML.rootToJSONString(node) + "]}";
				else if (node.childNodes.length <= 1 && $type(node.firstChild) == 'textnode')
					if (!isNaN(Number(node.childNodes[0].nodeValue)) || node.childNodes[0].nodeValue === "true" || node.childNodes[0].nodeValue === "false")
						return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + node.childNodes[0].nodeValue + "}";
					else	
						return "{\"" + node.nodeName.substring(0,1).toLowerCase() + node.nodeName.substring(1) + "\"" + ":" + "\"" + node.childNodes[0].nodeValue + "\"}";
			}
		}
	},
	nodesToJSONString: function(nodes){
		var i = 0;
		
		var result = "{";
		for (i = 0; i < nodes.length; i++){
			if ($type(nodes[i]) == 'element'){
				var JSONString = XML.nodeToJSONString(nodes[i]);
				if (nodes[i].childNodes.length <= 1 && $type(nodes[i].firstChild) == 'textnode'){
					JSONString = JSONString.substring(1,JSONString.length-1);
				}
				result += JSONString + ",";
			}
		}
		//remove the last character ','
		result = result.substring(0,result.length-1);
		result += "}";
		return result;
	},
	
	hashesToTree: function(hash){
		var tree = [], i, l;
		for (i = 0, l = hash.length; i < l; i++) tree.push(XML.hashToElement(hash[i]));
		return tree;
	},
	
	hashToElement: function(hash, tag){
		var element;
		if (hash.text) element = document.newTextNode(hash.text);
		else element = document.newElement(tag || hash.tag, hash.attributes).adopt(XML.hashesToTree(hash.children));
		return element;
	},
	
	hashToHTML: function(hash, level){
		var tabs = new Array(level || 0).join('\t'),attributes = [''],p, open='',close='',children=null;
		if (hash.text) return tabs + hash.text;

		for (p in hash.attributes) attributes.push(p + '="' + hash.attributes[p] + '"');
		attributes = attributes.join(' ');
		open = tabs + '<' + hash.tag + attributes + '>\n';
		close = '\n' + tabs + '</' + hash.tag + '>';
		children = XML.hashesToHTML(hash.children, level + 1);
		return open + children + close;
	},

	hashesToHTML: function(hashes, level){
		var html = [], i, l;
		for (i = 0, l = hashes.length; i < l; i++) html.push(XML.hashToHTML(hashes[i], level));
		return html.join('\n');
	},
	
	transform: function(xml, xsl){
		xml = (typeof xml == 'string') ? XML.rootFromFile(xml) : xml;
		xsl = (typeof xsl == 'string') ? XML.rootFromFile(xsl) : xsl;
		var xslt, root, i, children = [], element, temp = document.newElement('div'), l;
		
		xslt = new XSLTProcessor();
		xslt.importStylesheet(xsl);
		root = xslt.transformToFragment(xml, document);
		temp.appendChild(root);
		
		for (i = 0, l = temp.childNodes.length; i < l; i++){
			element = temp.childNodes[i], type = $type(element);
			if (type == 'element' || type == 'textnode') children.push(element);
		}
		return children;
	},
    
    toString: function(xmldom){
        return (new XMLSerializer).serializeToString(xmldom);
    },
    
    dumpDOM: function(rootnode, level) {
        var str = "DOM: ";
        if(level)
            str += level;
        else level = "";

        str += "[" + rootnode.nodeName + "]: " + rootnode.nodeValue;
        if(rootnode.attributes && rootnode.attributes.length) {
            str += " - ";
            for(var index=0; index < rootnode.attributes.length; index++) {
                var attr = rootnode.attributes[index];
                str += "(" + attr.nodeName + ":" + attr.nodeValue + ") ";
            }
        }
        log.write(str);
        
        if(rootnode.childNodes && rootnode.childNodes.length) {
            for(var index=0; index< rootnode.childNodes.length; index++) {
                var node = rootnode.childNodes[index];
                this.dumpDOM(node, level + "  ");
            }
        }
    }
	
};
	
