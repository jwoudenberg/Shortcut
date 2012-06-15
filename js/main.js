require.config({
    //set base working directory to the containing shortcut.html
    baseUrl: '',

    //alliases for easy access to javascript libraries
    paths: {
        underscore: 'js/lib/underscore-min',
        backbone: 'js/lib/backbone-min',
        jquery: 'js/lib/jquery',
        jqueryui: 'js/lib/jquery-ui',
        modernizr: 'js/lib/modernizr',
        text: 'js/lib/require-text',
        domready: 'js/lib/require-domready'
    },

    shim: {
        'js/lib/jquery-ui': ['jquery']
    }
});

require(['domready', 'modernizr', 'js/views/page/main-view'],
function(domReady, Modernizr, MainView) {
    domReady(function () {

        //feature detection here
        if (!Modernizr.inlinesvg) {
            document.getElementById('content').innerHTML = "<h1>Sorry!</h1><p>Shortcut won't run in this browser.</p>";
        };


        new MainView();
    });

}, function (err) {
    //something went wrong with the loading of files
    document.getElementById('content').innerHTML = '<h1>Oops...</h1><p>Something went wrong with loading.</p>';
    throw err;
});