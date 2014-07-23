module.exports = function(grunt) {
	// Project configuration
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env : {
			options : {
				/* Shared Options Hash */
				//globalOption : 'foo'
			},
			dev: {
				NODE_ENV : 'DEVELOPMENT'
			},
			prod : {
				NODE_ENV : 'PRODUCTION'
			}
		},
		watch: {
			files: [
				'src/css/style.css',
				'src/js/forms/general_functions.js',
				'src/js/forms/global.js',
				'src/js/forms/families.js',
				'src/js/forms/markets.js',
				'src/js/forms/reports.js',
				'src/js/forms/trail.js',
				'src/js/forms/clinical.js',
				'src/js/init.js',
				'build/js/init.js'
			],
			tasks: [ 'concat', 'jshint', 'env:dev', 'cssmin', 'uglify' ]
		},
		concat: {
			/*styles: {
				src: ['styles/skeleton.css','styles/colors.css','styles/spine.css','styles/respond.css'],
				dest: 'build/<%= pkg.build_version %>/spine.css',
			},*/
			scripts: {
				src: [
					'src/js/forms/general_functions.js',
					'src/js/forms/global.js',
					'src/js/forms/families.js',
					'src/js/forms/markets.js',
					'src/js/forms/reports.js',
					'src/js/forms/trail.js',
					'src/js/forms/clinical.js',
					'src/js/init.js'
				],
				dest: 'build/js/init.js',
			},
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' +
					'/*   */\n'
			},
			build: {
				src: 'build/js/init.js',
				dest: 'js/init.js'
			}
		},
		cssmin: {
			combine: {
				files: {
					// Hmmm, in reverse order
					'css/style.css': ['src/css/style.css']
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js','build/js/init.js', ],
			options: {
				// options here to override JSHint defaults
				boss: true,
				curly: true,
				eqeqeq: true,
				eqnull: true,
				expr: true,
				immed: true,
				noarg: true,
				//onevar: true,
				//quotmark: "double",
				smarttabs: true,
				//trailing: true,
				undef: true,
				unused: true,
				globals: {
					jQuery: true,
					$: true,
					console: true,
					module: true,
					document: true,
					window:true,
					define:true,
					alert:true,
					setTimeout:true
				}
			}
		},
		
	});

	// Load the plugin that provides the "uglify" task.
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Default task(s).
	grunt.registerTask('start', ['watch']);
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('prod', ['env:prod', 'concat','preprocess:js','cssmin','uglify','copy','includereplace','preprocess:html']);

	grunt.registerTask('dev', [ 'concat', 'jshint', 'env:dev', 'cssmin', 'uglify', ]);

};