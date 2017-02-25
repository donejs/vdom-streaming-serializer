const assert = require('assert');
var ASYNC = Symbol.for('async-node');

var makeDocument = require('can-vdom/make-document/make-document');
var serialize = require('../vdom-streaming-serializer');

describe('vdom-streaming-serializer', function(){
	it('works', function(done){

		var document = makeDocument();

		var h1 = document.createElement('h1');
		h1.appendChild(document.createTextNode('Hello world'));
		document.body.appendChild(h1);

		var ul = document.createElement('ul');
		document.body.appendChild(ul);

		var li = document.createElement('li');
		ul.appendChild(li);

		// Marking this li as async will force the serialize to wait
		li[ASYNC] = Promise.resolve();

		var stream = serialize(document);

		stream.setEncoding('utf8');

		var count = 0;
		stream.on('data', function(html){
			count++;
			if (count == 1) {
				assert.equal(html, "<html><body><h1>Hello world</h1><ul>");
			} else if (count == 2) {
				assert.equal(html, "<li></li></ul></body></html>");
				done();
			}

		});
	});

  it('wait on async node', function(done){
		var document = makeDocument();

		var h1 = document.createElement('h1');
		h1.appendChild(document.createTextNode('Hello world'));
		document.body.appendChild(h1);

		var ul = document.createElement('ul');
		document.body.appendChild(ul);

		var li = document.createElement('li');

		li[ASYNC] = Promise.resolve().then(function(){
			var span = document.createElement('span');
			span.appendChild(document.createTextNode('This is interesting'));
			li.appendChild(span);
		});

		ul.appendChild(li);

		var stream = serialize(document);

		stream.setEncoding('utf8');

		var count = 0;
		stream.on('data', function(html){
			count++;
			if (count == 1) {
				assert.equal(html, "<html><body><h1>Hello world</h1><ul>");
			} else if (count == 2) {
				assert.equal(html, "<li><span>This is interesting</span></li></ul></body></html>");
				done();
			}
		});
	});


});
