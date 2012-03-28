define(['event'], function (newEvent) {
    // --- ACTION ---
    //allows user-actions to be undertaken, enabled or disabled
    //[man]func:       function that will be called if succesfull
    //[opt]defState:   defaul state (default: enable)
    return function (func, defState) {
        var that,
            curState,
            init,
            state,
            enable,
            disable,
            reset;

        //ACT [public]
        //Executes function or fail-function depending on state
        that = (function () {
            var event = newEvent(),
                that,
                result;

            //check whether a function has been supplied
            if (func === undefined) {
                throw new Error("action: no spec.function has been provided");
            }

            that = function () {
                if (curState === 'enable') {
                    result = func.apply(null, arguments); //perform action
                    if (result) { //only fire events if function succeeds
                        event.fire(result); //fire events
                    }
                }
                else {
                    result = false;
                }
                return result;
            };

            that.bind = event.bind;

            return that;
        })();//ACT

        init = function () {
            reset();
            return that;
        };//INIT

        //STATE [public]
        //returns the current state
        that.state = state = function () {
            return curState;
        };//STATE

        //ENABLE [public]
        //enables the action
        that.enable = enable = (function () {
            var event = newEvent(),
                enable;

            enable = function () {
                curState = 'enable';
                event.fire();
            };
            enable.bind = event.bind;

            return enable;
        })();//ENABLE

        //DISABLE [public]
        that.disable = disable = (function () {
            var event = newEvent(),
                disable;

            disable = function () {
                curState = 'disable';
                event.fire();
            };
            disable.bind = event.bind;

            return disable;
        })();//DISABLE

        //DEFAULT [public]
        that.reset = reset = (function () {
            var resetFunc;

            //if no defState supplied, set teh default to enable
            if (defState === undefined) {
                defState = 'enable';
            }

            if (defState === 'enable') {
                resetFunc = enable;
            } else if (defState === 'disable') {
                resetFunc = disable;
            } else {
                throw new Error("action.reset: " + defState + " is not a valid state.");
            }

            return resetFunc;
        })();//DEFAULT

        return init();
    };//ACTION
});