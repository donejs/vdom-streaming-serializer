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


  	it('wait on aync node', function(done){

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

	it('recursive async', function(done){
		var document = makeDocument();

		var h1 = document.createElement('h1');
		h1.appendChild(document.createTextNode('Hello world'));
		document.body.appendChild(h1);

		var ul = document.createElement('ul');
		document.body.appendChild(ul);

		var li = document.createElement('li');


		// Marking this li as async will force the serialize to wait
		li[ASYNC] = Promise.resolve().then(function(){
			var span = document.createElement('span');
			// Marking these recursive span as async will force the serialize to wait
			span[ASYNC] = Promise.resolve().then(function() {
				var rspan = document.createElement('span');
				rspan[ASYNC] = Promise.resolve().then(function() {
					var rrspan = document.createElement('span');
					rrspan[ASYNC] = Promise.resolve().then(function() {
						rrspan.appendChild(document.createTextNode('This is interesting'));
					})
					rspan.appendChild(rrspan);
					
				});
				span.appendChild(rspan);
			});		
			
			

			li.appendChild(span);
		})

		ul.appendChild(li);

		var stream = serialize(document.documentElement);

		stream.setEncoding('utf8');

		var count = 0;
		stream.on('data', function(html){
			count++;
			if (count == 1) {
				assert.equal(html, "<html><body><h1>Hello world</h1><ul>");
			} else if (count == 2) {
				assert.equal(html, "<li>");
			} else if (count == 3) {
				assert.equal(html, "<span>");
			} else if (count == 4) {
				assert.equal(html, "<span>");
			} else if (count == 5) {
				assert.equal(html, "<span>This is interesting</span></span></span></li></ul></body></html>");
				done();
			}
		});
	});
	it('attrib works', function(done){
	    //assert.ok(true, 'It worked');

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

		

			var div = document.createElement('div');
			div.setAttribute('foo', 'bar');
			document.body.appendChild(div);


			var stream = serialize(document);

			stream.setEncoding('utf8');

			var count = 0;
			stream.on('data', function(html){
				count++;
				if (count == 1) {
					//assert.equal(1,2);
					assert.equal(html, "<html><body><h1>Hello world</h1><ul>");
				} else if (count == 2) {
					//console.log(html);
					assert.equal(html, "<li></li></ul><div foo = 'bar'></div></body></html>");
					done();
				}

			});
	  });


});
