# vdom-streaming-serializer

[![Build Status](https://travis-ci.org//vdom-streaming-serializer.png?branch=master)](https://travis-ci.org//vdom-streaming-serializer)



## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'vdom-streaming-serializer';
```

### CommonJS use

Use `require` to load `vdom-streaming-serializer` and everything else
needed to create a template that uses `vdom-streaming-serializer`:

```js
var plugin = require("vdom-streaming-serializer");
```

## AMD use

Configure the `can` and `jquery` paths and the `vdom-streaming-serializer` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'vdom-streaming-serializer',
		    	location: 'node_modules/vdom-streaming-serializer/dist/amd',
		    	main: 'lib/vdom-streaming-serializer'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

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
