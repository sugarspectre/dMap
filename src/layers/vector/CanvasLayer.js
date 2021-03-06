/*
  1.0.1 (downloaded from https://github.com/Sumbera/gLayers.Leaflet/releases/tag/v1.0.1)

  Generic  Canvas Layer for leaflet 0.7 and 1.0-rc,
  copyright Stanislav Sumbera,  2016 , sumbera.com , license MIT
  originally created and motivated by L.CanvasOverlay  available here: https://gist.github.com/Sumbera/11114288
*/

import { BaseLayer } from "../BaseLayer.js";

export var CanvasLayer = BaseLayer.extend({

    options: {
        cursor: 'pointer',
        createPane: true,
        zIndex: 300
    },

    // -- initialized is called on prototype
    initialize: function (options) {
        L.Util.setOptions(this, options);
        this._map = null;
        this._canvas = null;
        this._frame = null;
        this._delegate = null;
        this._visible = true;

        this.options.cursor && this.on('mousemove', this._changeCursorOn, this);

        BaseLayer.prototype.initialize.call(this, options)
    },

    _changeCursorOn: function (v) {
        if (!this.isVisible()) return;
        if (!this.options.cursor) return;

        let cursor = this.options.cursor;
        let style = this._map.getContainer().style;
        style.cursor = v !== null ? cursor : 'grab';
    },


    delegate: function (del) {
        this._delegate = del;
        return this;
    },

    needRedraw: function () {
        if (!this._frame) {
            this._frame = L.Util.requestAnimFrame(this.drawLayer, this);
        }
        return this;
    },

    //-------------------------------------------------------------
    _onLayerDidResize: function (resizeEvent) {
        this._canvas.width = resizeEvent.newSize.x;
        this._canvas.height = resizeEvent.newSize.y;
    },
    //-------------------------------------------------------------
    _onLayerDidMove: function () {
        var topLeft = this._map.containerPointToLayerPoint([0, 0]);
        L.DomUtil.setPosition(this._canvas, topLeft);
        this.drawLayer();
    },
    //-------------------------------------------------------------
    getEvents: function () {
        var events = {
            resize: this._onLayerDidResize,
            moveend: this._onLayerDidMove
        };
        if (this._map.options.zoomAnimation && L.Browser.any3d) {
            events.zoomanim = this._animateZoom;
        }

        return events;
    },
    //-------------------------------------------------------------
    onAdd: function (map) {
        this._map = map;
        this._canvas = L.DomUtil.create('canvas', 'leaflet-layer');
        this.tiles = {};

        var size = this._map.getSize();
        this._canvas.width = size.x;
        this._canvas.height = size.y;

        var animated = this._map.options.zoomAnimation && L.Browser.any3d;
        L.DomUtil.addClass(this._canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));


        // map._panes.overlayPane.appendChild(this._canvas);
        this._pane = this.options.createPane
            ? map.getPane(String(this._leaflet_id)) || map.createPane(String(this._leaflet_id))
            : map.getPanes().overlayPane;
        this._pane.appendChild(this._canvas);

        map.on(this.getEvents(), this);

        var del = this._delegate || this;
        del.onLayerDidMount && del.onLayerDidMount(); // -- callback

        this._delegateListeners(map);

        this.setZIndex();

        this.needRedraw();
    },

    //-------------------------------------------------------------
    onRemove: function (map) {
        var del = this._delegate || this;
        del.onLayerWillUnmount && del.onLayerWillUnmount(); // -- callback


        map.getPanes().overlayPane.removeChild(this._canvas);

        map.off(this.getEvents(), this);

        this._canvas = null;

        this._unDelegateListeners(map);
    },

    //------------------------------------------------------------
    addTo: function (map) {
        map.addLayer(this);
        return this;
    },
    // --------------------------------------------------------------------------------
    
    _delegateListeners: function(map) {
        map = map || this._map;
        if (!map) return;

        for (var type in this._events) {
            map.on(type, this._enableIdentify, this);
        }
    },

    _unDelegateListeners: function(map) {
        map = map || this._map;
        if (!map) return;

        for (var type in this._events) {
            map.off(type, this._enableIdentify, this);
        }
    },
    
    LatLonToMercator: function (latlon) {
        return {
            x: latlon.lng * 6378137 * Math.PI / 180,
            y: Math.log(Math.tan((90 + latlon.lat) * Math.PI / 360)) * 6378137
        };
    },

    show() {
        this._visible = true;
        this._showCanvas();
        this._delegateListeners();
    },

    hide() {
        this._visible = false;
        this._hideCanvas();
        this._unDelegateListeners();
    },

    isVisible() {
        return this._visible && this._map;
    },

    
    _showCanvas() {
        if (this._canvas && this._visible) {
            this._canvas.style.visibility = 'visible';
        }
    },

    _hideCanvas() {
        if (this._canvas) {
            this._canvas.style.visibility = 'hidden';
        }
    },
    
    //------------------------------------------------------------------------------
    drawLayer: function () {
        // -- todo make the viewInfo properties  flat objects.
        var size = this._map.getSize();
        var bounds = this._map.getBounds();
        var zoom = this._map.getZoom();

        var center = this.LatLonToMercator(this._map.getCenter());
        var corner = this.LatLonToMercator(this._map.containerPointToLatLng(this._map.getSize()));

        var del = this._delegate || this;
        del.onDrawLayer && del.onDrawLayer({
            layer: this,
            canvas: this._canvas,
            bounds: bounds,
            size: size,
            zoom: zoom,
            center: center,
            corner: corner
        });
        this._frame = null;
    },

    //------------------------------------------------------------------------------
    _animateZoom: function (e) {
        var scale = this._map.getZoomScale(e.zoom);
        var offset = this._map._latLngToNewLayerPoint(this._map.getBounds().getNorthWest(), e.zoom, e.center);

        L.DomUtil.setTransform(this._canvas, offset, scale);
    },

    setZIndex: function(z_index) {
        if (this._pane) this._pane.style.zIndex = z_index ? z_index : this.options.zIndex;
        return this;
    },

    exit: function() {
        this.remove();
        return this;
    },

    _enableIdentify: function(e) {
        this.fire(e.type, e);
    },

    on: function(event_type, fn, context) {
        this._events = this._events || [];
        if (!this._events[event_type] && this._map) {
            this._map.on(event_type, this._enableIdentify, this);  
        }
        BaseLayer.prototype.on.call(this, event_type, fn, context);
        return this;
    },

    off: function(event_type, fn, context) {
        BaseLayer.prototype.off.call(this, event_type, fn, context);
        this._events = this._events || [];
        if (this._events[event_type] && this._map) {
            this._map.off(event_type, this._enableIdentify, this);
        }
        return this;
    }
});