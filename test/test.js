'use strict';

var compiler = require('../lib/gcc.js');
var fs = require('fs');
var path = require('path');
var src = [
	path.resolve(__dirname, 'src/example1.js'),
	path.resolve(__dirname, 'src/example2.js')
];
var dest = path.resolve(__dirname, 'tmp/result.js');

fs.unlink(dest, function () {
	compiler.compile(src, dest, function () {});
});