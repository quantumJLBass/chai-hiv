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
				'src/js/chai.stub.js',
				'src/js/chai.core.util.js',
				'src/js/chai.general_functions.js',
				'src/js/forms/global.js',
				'src/js/chai.form_base.js',
				'src/js/forms/family.js',
				'src/js/forms/markets.js',
				'src/js/forms/reports.js',
				'src/js/forms/trail.js',
				'src/js/forms/trail_arm.js',
				'src/js/forms/clinical.js',
				'src/js/forms/drug.js',
				'src/js/forms/substance.js',
				'src/js/forms/reference.js',
				'src/js/chai.init.js',
				'build/js/init.js'
			],
			tasks: [ 'concat', 'jshint', 'env:dev', 'autoprefixer', 'cssmin', 'uglify' ]
		},
		concat: {
			/*styles: {
				src: ['styles/skeleton.css','styles/colors.css','styles/spine.css','styles/respond.css'],
				dest: 'build/<%= pkg.build_version %>/spine.css',
			},*/
			scripts: {
				src: [
					'src/js/scripts.js',
					'src/js/jquery.maskedinput.js',
					'zeroclip/ZeroClipboard.js',
					'src/js/chai.stub.js',
					'src/js/chai.core.util.js',
					'src/js/chai.general_functions.js',
					'src/js/forms/global.js',
					'src/js/chai.form_base.js',
					'src/js/forms/family.js',
					'src/js/forms/markets.js',
					'src/js/forms/reports.js',
					'src/js/forms/trail.js',
					'src/js/forms/trail_arm.js',
					'src/js/forms/clinical.js',
					'src/js/forms/drug.js',
					'src/js/forms/substance.js',
					'src/js/forms/reference.js',
					'src/js/chai.init.js'
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
		autoprefixer: {
			options: {
				browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8', 'ie 9','ie 10']
			},
			single_file: {
				src: 'src/css/style.css',
				dest: 'build/_precss/style.css'
			},
		},
		cssmin: {
			combine: {
				files: {
					// Hmmm, in reverse order
					'css/style.css': ['build/_precss/style.css']
				}
			}
		},
		jshint: {
			files: ['Gruntfile.js',
					'src/js/chai.stub.js',
					'src/js/chai.core.util.js',
					'src/js/chai.general_functions.js',
					'src/js/forms/global.js',
					'src/js/chai.form_base.js',
					'src/js/forms/family.js',
					'src/js/forms/markets.js',
					'src/js/forms/reports.js',
					'src/js/forms/trail.js',
					'src/js/forms/trail_arm.js',
					'src/js/forms/clinical.js',
					'src/js/forms/drug.js',
					'src/js/forms/substance.js',
					'src/js/forms/reference.js',
					'src/js/chai.init.js'
				],
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
					setTimeout:true,
					ZeroClipboard:true
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
	grunt.loadNpmTasks('grunt-autoprefixer');
	// Default task(s).
	grunt.registerTask('start', ['watch']);
	grunt.registerTask('default', ['jshint']);
	grunt.registerTask('prod', ['env:prod', 'concat','preprocess:js','autoprefixer','cssmin','uglify','copy','includereplace','preprocess:html']);

	grunt.registerTask('dev', [ 'concat', 'jshint', 'env:dev','autoprefixer', 'cssmin', 'uglify', ]);

};