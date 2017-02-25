import QUnit from 'steal-qunit';
import plugin from './vdom-streaming-serializer';

QUnit.module('vdom-streaming-serializer');

QUnit.test('Initialized the plugin', function(){
  QUnit.equal(typeof plugin, 'function');
  QUnit.equal(plugin(), 'This is the vdom-streaming-serializer plugin');
});
