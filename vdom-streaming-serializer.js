var Readable = require('stream').Readable;

var ASYNC = Symbol.for('async-node');

function* serialize(element) {
	var buffer = '', dir = 0, i, attr, tagName;
	while(element) {
		if(dir === 0) {
			if(element[ASYNC]) {
				yield {
					buffer: buffer,
					node: element
				};
				buffer = '';
			}

			switch(element.nodeType) {
				case 3:
					buffer += element.nodeValue;
					break;
				default:
					tagName = element.nodeName.toLowerCase();

					buffer += '<' + tagName;
					for(i = 0; i < element.attributes.length; i++) {
						attr = element.attributes[i];
						buffer += ' ' + attr.name + '="' + attr.value + '"';
					}
					buffer += '>';
			}

			if(element.firstChild) {
				element = element.firstChild;
			} else if(element.nextSibling) {
				element = element.nextSibling;
			} else {
				if(element.nodeType === 1) {
					buffer += '</' + tagName + '>';
				}

				element = element.parentNode;
				dir = 1;
			}
		} else {
			if(element.nodeType === 1) {
				tagName = element.nodeName.toLowerCase();
				buffer += '</' + tagName + '>';
			}

			if(element.nextSibling) {
				element = element.nextSibling;
				dir = 0;
			} else {
				element = element.parentNode;
			}
		}
	}

	yield {
		buffer: buffer
	};
}

module.exports = function(element){
	if(element.nodeType === 9) {
		element = element.firstChild;
	}
  var stream = new Readable();
	var generator = serialize(element);
	var promise = Promise.resolve();
  	stream._read = function(){
  		promise.then(function() {
  			var result = generator.next();

			if(result.done) {
				this.push(null);
				return;
			}

			var value = result.value;
			var node = value.node;
			var buffer = value.buffer;
			if(node && node[ASYNC]) {
				// We want to wait on this!
				promise = node[ASYNC];
			}

			this.push(buffer);

  		}.bind(this));

  };
  return stream;
};
