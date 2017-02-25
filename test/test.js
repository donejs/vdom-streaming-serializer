const assert = require('assert');
var ASYNC = Symbol.for('async-node');

var makeDocument = require('can-vdom/make-document/make-document');
var serialize = require('../vdom-streaming-serializer');

describe('vdom-streaming-serializer', function(){
  it('works', function(done){
    //assert.ok(true, 'It worked');
    var document = makeDocument();

	var h1 = document.createElement('h1');
	h1.appendChild(document.createTextNode('Hello world'));
	document.body.appendChild(h1);

	var ul = document.createElement('ul');
	document.body.appendChild(ul);

	var li = document.createElement('li');

	// Marking this li as async will force the serialize to wait
	li[ASYNC] = Promise.resolve();

	ul.appendChild(li);


	var ul2 = document.createElement('ul');
	document.body.appendChild(ul2);

	var li2 = document.createElement('li');

	// Marking this li as async will force the serialize to wait
	li2[ASYNC] = Promise.resolve();

	ul2.appendChild(li2);



	var stream = serialize(document.documentElement);

	stream.setEncoding('utf8');

	var count = 0;
	stream.on('data', function(html){
		count++;
		if (count == 1) {
			//assert.equal(1,2);
			assert.equal(html, "<html><body><h1>Hello world</h1><ul>");
		} else if (count == 2) {
			assert.equal(html, "<li></li></ul><ul>");
		} else if (count == 3) {
			assert.equal(html, "<li></li></ul></body></html>");
			done();
		}
		
	});
  });
});


