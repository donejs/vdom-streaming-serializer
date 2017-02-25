var Readable = require('stream').Readable;

var ASYNC = Symbol.for('async-node');

module.exports = function(element){
  var stream = new Readable();
	var generator = serialize(element);
  	stream._read = function(){
		var result = generator.next();

		if(result.done) {
			this.push(null);
			return;
		}

		var value = result.value;
		var node = value.node;
		var buffer = value.buffer;

		
		this.push(buffer);
  };
  return stream;
};

function* serialize(element){
	if (element.nodeType === 3) {
		yield {
			buffer: element.nodeValue
		};
		return;
	}

	var buffer = '';

	buffer += '<' + element.nodeName.toLowerCase();

	var attr;
	for (var i = 0; i < element.length; i++) {
		attr = element.attributes[i];
		buffer += attr
	}
	buffer += '>';

    var child = element.firstChild;
    while(child) {
		if(child[ASYNC]) {
			yield {
				buffer: buffer,
				node: child
			};
			buffer = '';
		}

		var generator = serialize(child);
		var result = generator.next();

		while(!result.done) {
			buffer += result.value.buffer;
			if(result.value.node && result.value.node[ASYNC]) {
				yield {
					buffer: buffer,
					node: result.value.node
				};
				buffer = '';
			}

			result = generator.next();
		}

    	child = child.nextSibling;
    }
	buffer += '</' + element.nodeName.toLowerCase() + '>';

	yield {
		buffer: buffer
	};
};
