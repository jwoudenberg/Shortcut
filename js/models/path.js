// --- PATH ---
/*  A path has a start and optionally an end port. If no end port is provided,
    the path is a dead end.

    A path can have an owner.
*/
define(['backbone'],
function (Backbone) {
    return Backbone.Model.extend({

        defaults: {
            //mandatory
            start: undefined,
            card: undefined,
            //optional
            end: 'unconnected',
            owner: undefined
        },

        validate: function (attrs) {
            if (attrs.start === undefined) {
                return "Path: path needs at least a starting port.";
            }
            if (attrs.card === undefined) {
                return "Path: path needs a card.";
            }
        },

        initialize: function (attrs, options) {
            //if initialized with an owner, checkin with that owner.
            var owner = attrs.owner;
            if (owner !== undefined) {
                owner.bases.add(this);
            }
        },

        setOwner: function (newOwner) {
            //if path already has an owner, remove it
            if (this.get('owner') !== undefined) {
                this.removeOwner();
            }
            newOwner.bases.add(this);
            this.set('owner', newOwner);
        },

        removeOwner: function () {
            this.get('owner').bases.remove(this);
            this.set('owner', undefined);
        }

    });
});