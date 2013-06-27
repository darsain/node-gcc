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
	var compilation = compiler.compile(src, dest, function (err, stdout, stderr) {
		if (stderr) {
			console.log('Error: ' + stderr);
		} else {
			console.log('Compiled size: ' + (stdout.length / 1024).toFixed(2) + ' KiB');
		}
	});

	compilation.on('close', function () {
		console.log('Process end');
	});
});