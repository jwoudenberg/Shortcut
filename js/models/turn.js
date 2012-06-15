/* --- TURN ---

    A turn collects actions a that take place during a players turn and executes
    responses to those actions by the gametype. Actions are a collection of
    attribute-changes on the models, responses are arrays of flags to be raised
    on the models, thereby influencing the models behaviour. These responses
    can't, in other words, directly affect the models attributes.

    Should a player undo a specific action, the corresponding will be undone
    aswell. A new turn object begins by resetting all responses (removing all
    flags).

    CHANGES OBJECT
    changes: {
        'model-cid:attr': {
            model:                      (changed model)
            attr:                       (changed attribute)
            before:                     (old value)
            after:                      (new value)
            response: {
                flag:   [ models ]      (set flag on models)
            }
        }
    }
*/
define(['underscore', 'backbone'],
function (_, Backbone) {
    return Backbone.Model.extend({

        changes:    undefined,

        defaults: {
            player: undefined,
            lastTurn: false
        },

        initialize: function () {
            this.changes = {};
            this.respond(); //removes all softLocks
            this.constructor.modelCache = {};
        },

        end: function () {
            //delete references
            delete this.owner;
            delete this.changes;
            delete this.modelCache;
        },

        log: function (model, attr, response) {
            var changes = this.changes,
                hash, before, after, compare;

            //build a hash for this change-type (defined by model and attr)
            hash = model.cid + ':' + attr;

            //get the existing before value for this change-type, if it exists.
            //If not and this is the first such change, get the old model value
            before = changes[hash] ? changes[hash].before : model.previous(attr);

            //find the new value of the attribute
            after = model.get(attr);

            //check if before and after are the same.
            //use compare function on the model if it exists
            compare = model.constructor.compare && model.constructor.compare[attr];
            if (compare && compare(before, after, model)) { //compare function
                delete this.changes[hash];
            }
            else if (before === after) { //no compare function
                delete this.changes[hash];
            }
            else {
                //before and after are unequal: save change to changes object
                this.changes[hash] = {
                    model:      model,
                    attr:       attr,
                    before:     before,
                    after:      after,
                    response:   response
                };
            }

            //update response
            this.respond();
        },

        respond: function () {
            /*  Find the difference between the current set of responses and the
                ones currently set on models (found in the modelCache).
                Set the differences and fire corresponding events.
            */
            var modelCache = this.constructor.modelCache,
                responses, model, oldFlags, newFlags, temp, i, flag;

            //get the current responses
            responses = this._bundleResponses();

            //loop over models in the cache (these have (had) locks this turn)
            for (var cid in modelCache) {
                model = modelCache[cid];

                //get the old and new locks in arrays
                oldFlags = _.keys(model.flags);
                newFlags = responses[cid] || []; //some models have no newLocks

                //remove locks that are in both arrays (they don't change)
                temp = oldFlags; //store oldLocks
                oldFlags = _.difference(oldFlags, newFlags);
                newFlags = _.difference(newFlags, temp);

                //check if any changes are left
                if (!oldFlags.length && !newFlags.length) continue;

                //now change the locks on the models. First remove onld ones
                for (i = oldFlags.length - 1; i >= 0; i--) {
                    flag = oldFlags[i];
                    delete model.flags[flag];
                    model.trigger('flag:' + flag, model, false);
                }
                //add new locks
                for (i = newFlags.length - 1; i >= 0; i--) {
                    flag = newFlags[i];
                    model.flags[flag] = true;
                    model.trigger('flag:' + flag, model, true);
                }
                //trigger general event
                model.trigger('flag', model);
            }
        },

        _bundleResponses: function () {
            /*  groups the responses in all changes per model
                returns a collection arrays containging locks, indexed by cid:
                responses: {
                    cid: [ locks ]
                }
            */
            var changes = this.changes,
                responses = {},
                change, response, flaggedModels, flaggedModel, cid, i;

            //bundle responses per model: loop over all changes
            for (var hash in changes) {
                change = changes[hash];

                //check if change has a response
                response = change.response;
                if(response) {

                    //loop over all locks in response
                    for (var lock in response) {
                        flaggedModels = response[lock]; //the lock (attr name)

                        //loop over all models affected by this lock
                        for (i = flaggedModels.length - 1; i >= 0; i--) {
                            flaggedModel = flaggedModels[i];
                            cid = flaggedModel.cid;

                            //check for previous responses for this model
                            if (!responses[cid]) {
                                //none found. Set up an empty array
                                responses[cid] = [];
                                //save a reference back to the model
                                this.constructor.modelCache[cid] = flaggedModel;
                            }
                            else if (_.indexOf(responses[cid], lock) !== -1) {
                                //this lock is already present
                                continue;
                            }
                            //add response
                            responses[cid].push(lock);
                        }
                    }
                }
            }
            return responses;
        }

    }, {
        //CLASS PROPERTIES
        modelCache: {} //holds a hashtable for model-cids
    });
});