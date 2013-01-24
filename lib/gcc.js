/*!
 * Google Closure Compiler wrapper.
 * https://github.com/Darsain/node-gcc
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

var child = require('child_process');
var fs = require('fs');
var path = require('path');
var compilerPath = path.normalize(path.join(__dirname, '..', 'bin', 'compiler-r2388.jar'));
exports.java = 'java';
exports.defaults = {
	compilation_level: 'SIMPLE_OPTIMIZATIONS'
};

/**
 * Check whether the value is a function.
 *
 * @param  {Mixed}  value
 *
 * @return {Boolean}
 */
function isFunction(value) {
	return value && {}.toString.call(value) === '[object Function]';
}

/**
 * Turn everything to array.
 *
 * @param  {Mixed}  value
 *
 * @return {Array}
 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

/**
 * Google Closure Compiler wrapper.
 *
 * @param  {Mixed}    src      File path or an array of file paths.
 * @param  {String}   dest     Destination file path. Ommiting will output the code in callback's stdout.
 * @param  {Object}   opts     Object with options. Extends default options.
 * @param  {Function} callback Callback function. Arguments: error, stdout, stderr
 *
 * @return {Void}
 */
exports.compile = function (src, dest, opts, callback) {
	var options = {};
	var args = ['-jar', compilerPath];

	// Optional arguments logic
	if (typeof dest !== 'string') {
		callback = opts;
		opts = dest;
		dest = false;
	}
	if (isFunction(opts)) {
		callback = opts;
		opts = false;
	}

	// Terminate if no destination and callback
	if (!dest && !isFunction(callback)) {
		return;
	}

	// Set source files
	toArray(src).forEach(function (file) {
		args.push('--js');
		args.push(file);
	});

	// Set destination
	if (dest) {
		args.push('--js_output_file');
		args.push(dest);
	}

	// Extend options
	Object.keys(exports.defaults).forEach(function (key) {
		options[key] = exports.defaults[key];
	});
	if (opts) {
		Object.keys(opts).forEach(function (key) {
			options[key] = opts[key];
		});
	}

	// Parse options into arguments array
	if (typeof options === 'object') {
		Object.keys(options).forEach(function (key) {
			toArray(options[key]).forEach(function (value) {
				args.push('--' + key);
				if (typeof value === 'string') {
					args.push(value);
				}
			});
		});
	}

	// Create compiling stream
	var stream = child.spawn(exports.java, args);
	stream.stdout.setEncoding('utf8');
	stream.stderr.setEncoding('utf8');

	// Pipe destination stream to compiler stdout
	if (dest) {
		var destination = fs.createWriteStream(dest, { flags: 'w', encoding: 'utf-8' });
		destination.on('error', function (error) {
			if (error.errno !== 0) {
				throw error;
			}
		});
		stream.stdout.pipe(destination);
		stream.on('exit', function () {
			destination.end();
		});
	}

	// Capture stdout and stderr for callback
	if (isFunction(callback)) {
		var stdout = '';
		var stderr = '';

		stream.stdout.on('data', function (data) {
			stdout += data;
		});
		stream.stderr.on('data', function (data) {
			stderr += data;
		});

		// Execute callback
		stream.on('exit', function (code) {
			var error = null;
			if (code !== 0) {
				error = new Error(stderr);
				error.code = code;
			}

			callback(error, stdout, stderr);
		});
	}
};
