import { fire as Fire } from "../utils/Util";

// BaseLayer.js
// Define BaseLayer class and basic methods here.


// @class BaseLayer
// Base class of all dmap.layer.

export var BaseLayer = L.Layer.extend({
    options: {
        theme: undefined,
        zIndex: 300
    },
    initialize: function(options) {
        L.Util.setOptions(this, options);
        console.log('Layer init with options: ', options)
    },

    data: function(data, fn) {
        throw new Error('this method must be override.')
    },

    enter: function() {
        throw new Error('this method must be override.')
    },

    exit: function() {
        throw new Error('this method must be override.')
    },

    setZIndex: function(z_index) {
        return this;
    },

    fire: function(type, data, propagate) {
        return Fire.call(this, type, data, propagate);
    }
});
