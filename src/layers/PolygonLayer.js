// PolygonLayer.js

import { GroupLayer } from "./GroupLayer.js";


/**
var states = [
    ["Alaska", [[70.0187, -141.0205], ...],
    ["...", ...],
    ...
]
var pLayer = new dmap.PolygonLayer();
pLayer.data(states, function (data) {
    return {
        name: data[0],
        coordinates: data[1]
    }
}).enter().addTo(map)
 */

export var PolygonLayer = GroupLayer.extend({
    generate: function() {
        return this._data.map(
            (data)=>{return L.polygon(
                data.coordinates, data.options
            )}
        );
    }
})
