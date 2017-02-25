module.exports = function serialize(element){
  if(element.nodeType === 3) {
    return element.nodeValue;
  }

  var out = '<' + element.nodeName.toLowerCase();

  var attr;
  for(var i = 0, len = element.attributes.length; i < len; i++) {
    attr = element.attributes[i];
    out += attr.name + '=' + attr.value;
  }

  out += '>';

  var child = element.firstChild;
  while(child) {
  	out += serialize(child);
  	child = child.nextSibling;
  }

  out += '</' + element.nodeName.toLowerCase() + '>';
  return out;
};