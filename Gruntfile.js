module.exports = function (grunt) {
    require('jit-grunt')(grunt);

    grunt.initConfig({
        jshint: {
            all: [ 'Gruntfile.js', 'src/**/*.js' ]
        },
        uglify: {
            'quakes.js': [
                'bower_components/jquery.fn/cross-domain-ajax/jquery.xdomainajax.js',
                'bower_components/google-maps-utility-library-v3/canvaslayer/src/CanvasLayer.js',
                'src/quakes.js',
            ] 
        }
    });

    grunt.registerTask('default', [ 'jshint', 'uglify' ]);
};
