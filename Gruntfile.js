/*jshint node:true */
module.exports = function(grunt) {
	'use strict';

	var jsonFile = 'package.json';

	// Grunt configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON(jsonFile),

		// JSHint the code.
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: ['lib/*.js', 'test/*.js']
		},

		// Clean folders.
		clean: {
			dist: ['test/tmp/**', '!test/tmp']
		},

		// Bump up fields in JSON files.
		bumpup: jsonFile,

		// Commit changes and tag the latest commit with a version from JSON file.
		tagrelease: jsonFile
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-tagrelease');
	grunt.loadNpmTasks('grunt-bumpup');

	// Task for updating the pkg config property. Needs to be run after
	// bumpup so the next tasks in queue can work with updated values.
	grunt.registerTask('updatePkg', function () {
		grunt.config.set('pkg', grunt.file.readJSON(jsonFile));
	});

	// Release task.
	grunt.registerTask('release', function (type) {
		type = type ? type : 'patch';
		grunt.task.run('jshint');
		grunt.task.run('bumpup:' + type);
		grunt.task.run('updatePkg');
		grunt.task.run('tagrelease');
	});

	// Default task.
	grunt.registerTask('default', ['jshint']);
};