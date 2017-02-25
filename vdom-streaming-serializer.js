module.exports = function serialize(element){
	//console.log(element);
	if (element.nodeType === 3) {
		return element.nodeValue;
	}

	var out = '<' + element.nodeName.toLowerCase();
	for (var i = 0; i < element.attributes.length; i++) {
		attr = element.attributes[i];
		out += attr
	}
	out += '>';

    var child = element.firstChild;
    while(child) {
    	out += serialize(child);
    	child = child.nextSibling;
    }
	out += '</' + element.nodeName.toLowerCase() + '>'
	return out;
};


