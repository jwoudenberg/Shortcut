define(function () {
    // --- EVENT ---
    //Functions can be added to it. When fired, all coupled functions will fire
    return function () {
        var that,
            handlers = [],
            fire,
            bind;
    
        that = {};
    
        //FIRE
        //activate all handlers
        that.fire = fire = function () {
            var i;
            for (i = handlers.length; i--;) {
                if (handlers[i].dead) {
                    handlers.splice(i, 1);
                } else {
                    handlers[i].func.apply(null, arguments);
                }
            }
            return that;
        };//FIRE
    
        //BIND
        //bind a new function to this event
        that.bind = bind = function (func) {
            var handler = {'func': func};
    
            //allows a handler to be removed again
            handler.remove = function () {
                handler.dead = true;
            };
    
            //add handler to the list
            handlers.push(handler);
            //return handler-remove function
            return handler.remove;
        };//BIND
    
        return that;
    };
});