require.config({
    //set base working directory to the containing shortcut.html
    baseUrl: '',

    //alliases for easy access to javascript libraries
    paths: {
        backbone: 'js/lib/backbone-min',
        jqueryui: 'js/lib/jquery-ui',
        mustache: 'js/lib/mustache',
        text: 'js/lib/text',
        underscore: 'js/lib/underscore-min'
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