var makeDocument = require('can-vdom/make-document/make-document');
var serialize = require('../vdom-streaming-serializer');

var ASYNC = Symbol.for('async-node');

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

var div = document.createElement('div');
div.setAttribute('foo', 'bar');
document.body.appendChild(div);

var stream = serialize(document.documentElement);

stream.setEncoding('utf8');

stream.on('data', function(html){
    console.log('Chunk', html);
});

stream.on('end', function(){
    console.log('Finished');
});
