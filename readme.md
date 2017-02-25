[![Build Status](https://travis-ci.org/donejs/vdom-streaming-serializer.png?branch=master)](https://travis-ci.org/donejs/vdom-streaming-serializer)

# vdom-streaming-serializer

The vdom-streaming-serializer is a library for serializing virtual DOM objects into chunks of strings that can be written into an HTTP response.

## Installation
```
npm install vdom-streaming-serializer
```

## Usage
A virtual dom has to be created and running the serialization will emit chunks of HTML.

### Example
This example creates a virtual dom and serializes it to emit streams of HTML elements in Chunks.
```js
var document = makeDocument();
var ul = document.createElement('ul');
document.body.appendChild(ul);
var li = document.createElement('li');
```
Making this ```<li>``` as asynchronous will force the serialize to wait.
```js
var ASYNC = Symbol.for('async-node');
li[ASYNC] = Promise.resolve();
ul.appendChild(li);
```

Once the element is serialized, it is then emitted in ```data``` event.
```js
var stream = serialize(document);
stream.setEncoding('utf8');
stream.on('data', function(html){
	console.log('Chunk', html);	
});
```
The output from this demo should be:
```
Chunk <html><body><ul>
Chunk <li></li></ul<body></html>
```
From this, the ```<li>``` element is serialized asynchronously.


## API
The serialization process traverses and checks for html syntax and attributes to add to the buffer.

Upon noticing a child node, the serializer determines whether its child is asynchronous or not. If it is, the current buffer is flushed and the element begins serializing the asynchronous child.

### Asynchronization
It handles synchronous and asynchronous elements differently by resolving promise elements if we wish to wait before emitting.

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/vdom-streaming-serializer/dist/global/vdom-streaming-serializer.js'></script>
```

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests


Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
