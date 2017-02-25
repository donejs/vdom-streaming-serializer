var Readable = require('stream').Readable;

var ASYNC = Symbol.for('async-node');

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

function* serialize(element) {
	debugger;

    var buffer = '';
    var visited = new Set();

	while(element) {

    	if(visited.has(element)) {
            buffer += '</' + element.nodeName.toLowerCase() + '>';

		} else if (element.nodeType === 3) {
        	buffer += element.nodeValue;
        	visited.add(element);
            if(element[ASYNC]) {
                yield {
                    buffer: buffer,
                    node: element.parentNode
                };
                // return;
            }
        } else {
            if(element[ASYNC]) {
                yield {
                    buffer: buffer,
                    node: element
                };
                buffer = '';
            }
            visited.add(element);
            // Create opening tag
            buffer += '<' + element.nodeName.toLowerCase();

            // Add the attributes to the buffer.
            var attr;
            for (var i = 0; i < element.attributes.length; i++) {
                attr = element.attributes[i];
                buffer += attr
            }
            // the other >
            buffer += '>';

            if(!element.firstChild){
                buffer += '</' + element.nodeName.toLowerCase() + '>';
			}

		}



		//Serialize the childs

        //Determine next element to serialize
        if(element.firstChild && !visited.has(element.firstChild)) {
            element = element.firstChild;
        } else if(element.nextSibling) {
            element = element.nextSibling;
        } else if(element.parentNode) {
    		if(element.parentNode.nodeType === 9) {
    			element = null;
			} else {
                element = element.parentNode;
			}

        }

        // create closing tag

	}
    yield {
        buffer: buffer
    };
	return;
}


function* serialize2(element){

	if (element.nodeType === 3) {
		yield {
			buffer: element.nodeValue
		};
		return;
	}

	var buffer = '';

	buffer += '<' + element.nodeName.toLowerCase();

	var attr;
	for (var i = 0; i < element.attributes.length; i++) {
		attr = element.attributes[i];
		buffer += attr
	}
	buffer += '>';

	//Start serialization of childs
    var child = element.firstChild;
    while(child) {
    	//If the child serialization is asynchronous start streaming by returning the opening tag for the parent
		if(child[ASYNC]) {
			yield {
				buffer: buffer,
				node: child
			};
			buffer = '';
		}

		var generator = serialize(child);
		var result = generator.next();

		//Serialize each attribute or child within the current child
		while(!result.done) {
			buffer += result.value.buffer;
			//If the nodes are asynchronous stream each of the nodes one node a time.
			if(result.value.node && result.value.node[ASYNC]) {
				yield {
					buffer: buffer,
					node: result.value.node
				};
				buffer = '';
			}

			result = generator.next();
		}

		//Start serializing next child
    	child = child.nextSibling;
    }
	buffer += '</' + element.nodeName.toLowerCase() + '>';

    //Finish serialization with the closing tag.
	yield {
		buffer: buffer
	};
};
