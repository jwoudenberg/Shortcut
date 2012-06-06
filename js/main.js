require.config({
    //set base working directory to the containing shortcut.html
    baseUrl: '',

    //alliases for easy access to javascript libraries
    paths: {
        underscore: 'js/lib/underscore-min',
        backbone: 'js/lib/backbone-min',
        jquery: 'js/lib/jquery',
        jqueryui: 'js/lib/jquery-ui',
        text: 'js/lib/text'
    },

    shim: {
        'js/lib/jquery-ui': ['jquery']
    }
});

require(['js/views/page/main-view'],
function(MainView) {
    'use strict';

    //feature detection here
    if (true) {
        new MainView();
    }
});