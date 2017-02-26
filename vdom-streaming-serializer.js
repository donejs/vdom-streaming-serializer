var Readable = require('stream').Readable;

var ASYNC = Symbol.for('async-node');


function* serialize(element) {
	//buffer is used to store the strings that is returned through the yield commands
    var buffer = '';

    //visited is used for storing all elements that have been visited in order to close opened tags
    var visited = new Set();

    while(element) {

        if(visited.has(element)) {
        	//This section closes a tag that has already been explored and serialized
            buffer += '</' + element.nodeName.toLowerCase() + '>';

        } else if (element.nodeType === 3) {
        	//This section serializes text type of nodes.
            buffer += element.nodeValue;
            visited.add(element);
            if(element[ASYNC]) {
                yield {
                    buffer: buffer,
                    node: element.parentNode
                };
            }
        } else {
        	//If the current node is asynchronous return what you have already serialized
            if(element[ASYNC]) {
                yield {
                    buffer: buffer,
                    node: element
                };
                buffer = '';
            }
            //Mark the current node as visited
            visited.add(element);

            // Create opening tag
            buffer += '<' + element.nodeName.toLowerCase();

            // Add the attributes of the current tag to the buffer.
            var attr;
            for (var i = 0; i < element.attributes.length; i++) {
                attr = element.attributes[i];
                buffer += (" "+attr.name+" = "+"'"+attr.value+"'");
            }
            // the other >
            buffer += '>';

            //If the element doesn't have any childs. Making sure to close the string
            if(!element.firstChild){
                buffer += '</' + element.nodeName.toLowerCase() + '>';
            }

        }

        //Determine next element to serialize
        if(element.firstChild && !visited.has(element.firstChild)) {
            element = element.firstChild;
        } else if(element.nextSibling) {
            element = element.nextSibling;
        } else if(element.parentNode) {
        	//If the parent node is the #document, finish the while loop making element = null
            if(element.parentNode.nodeType === 9) {
                element = null;
            } else {
                element = element.parentNode;
            }

        }


    }
    //Return what still remains in the buffer.
    yield {
        buffer: buffer
    };
    return;
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
			//console.log(value);
			var node = value.node;
			var buffer = value.buffer;
			//console.log(buffer);
			//console.log(node);
			if(node && node[ASYNC]) {
				// We want to wait on this!
				promise = node[ASYNC];
			}
			
			this.push(buffer);

  		}.bind(this));
		
  };
  return stream;
};
