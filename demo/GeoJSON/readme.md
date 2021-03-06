# GeoJson类API说明文档
### `构造函数`
( data: *L.geoJSON*, options: *GeoJSON options*)

Geojson图层的构造函数。根据data和options参数进行构造。

例子：

```javascript
var mygeo = dmap.GeoJson(data, {
    style: function (feature) {
        return {color: feature.properties.color};
    }
})
```
其中data为L.geoJSON类型的数据，style为GeoJSON options类型的参数。

### `setStyle(style)方法`

(options : *GeoJSON options*) => this

设置Geojson图的配置。

例子：

```javascript
function style(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7,
      fillColor: getColor(feature.properties.density)
    };
}
mygeo.setStyle(style)
```

### `addData(data)方法`

(data：*L.geoJSON*) => this

给Geojson图添加数据。

例子：

```javascript
mygeo.addData(data)
```

### `on(event,callback)方法`

(event_type：*event*, callback：*func*)

给Geojson图添加响应事件。

例子：

```javascript
function trig(layer,feature){
    var popupContent = "<p>My name is " +
    feature.properties.name + "</p>";
    layer.bindPopup(popupContent).openPopup();
}
mygeo.on("click",trig)
```





# GeoJson类demo说明文档

GeoJson类的一些常用方法和leaflet中的Geojson类一致，由于geojson类对on方法的实现需要用户手动设置，因此在此特意重写了此方法。

```javascript
 // overwrite the method on
    on(event_type, callback) {
        this.geojson.eachLayer(function (layer) {
            if(layer && layer.feature){
                callback(layer,layer.feature)
            }
        }, this);
        return this
    }
```

至于其它方法，该类将leaflet的Geojson类作为我们自己GeoJson类的元素，因此，也可以通过自己来调用。

下面为demo部分：

对于test.js文件中的geojson对象（变量名为statesData），表示美国各个洲的分布。在测试的html文件的<body>部分中，我们可以加入如下代码：

```javascript
function trig(layer,feature){
    var popupContent = "<p>My name is " +
        feature.properties.name + "</p>";
    // console.log(popupContent)
    layer.bindPopup(popupContent).openPopup();
}
mygeo = new GeoJson(statesData, {style: style}).addTo(map);
mygeo.on("click",trig)       //mouseover,click
```

这样即实现了对GeoJson类的每一个对象添加on方法。