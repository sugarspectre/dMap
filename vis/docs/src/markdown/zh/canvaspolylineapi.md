# CanvasPolylineLayer : CanvasLayer

## 元素说明
`Polyline` 是 dmap 为 `CanvasPolylineLayer` 设计的折线数据结构。用于构造折线元素。基本数据格式包含了 `coordinates` 与 `options` 字段，分别代表坐标序列与折线样式。从而以折线的形式在 canvas 上进行绘制渲染，支持点击等交互形式。

`Polyline` 的 `options` 格式如下，由 `data` 方法构造。

| Option | Type | Default | Description |
| :----- | :---:| :-----: | :---------  |
| color | String | `'#000000'` | 折线颜色 |
| width | Number | `1` | 折线宽度，单位为px | 
| zoomLevel | Number | `1` | 最小显示缩放程度，默认在任意缩放大小下均显示 |

## 参数说明

| Option | Type | Default | Description |
| :----- | :---:| :-----: | :---------  |
| opacity | Number | `0.99` | canvas图层不透明度 |
| createPane | Boolean | `true` | 是否在新的Pane上创建图层 |
| zIndex | Number | `300` | 图层的Z轴高度 |
| cursor  | String | `'pointer'` | 指定鼠标划过折线时的CSS样式 |
| dividePart  | Number | `2` | 优化交互检索效率，将图层折线按照 dividePart 数目横纵划分 |


## 方法说明

### data
*(Array&lt;any&gt;, Function) => this*

将原始数据集映射为具有指定字段格式的对象数组`this._data`。

| key    | Type  | Description |
| :----- | :---: | :---------  |
| coordinates  | `Array(Array(2))`/`Array<L.Latlng>` | Polyline 的坐标集合 |
| options | `Object` | 样式设置，参见 "Polyline参数说明" |

### hide
*() => ()*

隐藏当前图层，并且禁止全部图层交互。

### show
*() => ()*

重新显示当前图层，并且恢复全部图层交互。

### on
*(String event_type, Function callback_function, Object? context) => this*

为当前图层绑定 event_type 事件。
+ `event_type`: *String*，绑定事件
+ `callback_function`: *Function (Polyline p, Number index, Object originData)*，回调函数
+ `context`: *Object*，执行回调函数时的事件上下文

### enter
*() => this*

调用`generate`方法，将`this._data`映射为对应的`Polyline`对象数组

### generate
*() => Array*

将 `this._data` 映射为 `Array<Polyline>`。

### addTo
*(Map) => this*

将图层添加到Leaflet地图容器中。

### getBounds
*() => L.Bounds*

返回该图层的渲染范围，为地图缩放等功能提供参数。

### needRedraw
*() => this*

强制重新渲染图层。


## 代码示例

下方代码以 `CanvasPolylineLayer` 绘制纽约市的路网数据，并支持鼠标单击标记、双击清楚全部标记的交互方式。

```javascript
map.doubleClickZoom.disable();

var emphasisList = [];

function emphasisPolyline(polyline) {
    if (polyline.emphasis) return;

    polyline.options.formerColor = polyline.options.color;
    polyline.options.formerWidth = polyline.options.width;

    polyline.options.color = 'red';
    polyline.options.width = 2;

    polyline.emphasis = true;
    emphasisList.push(polyline)
}

function resetEmphasis() {
    emphasisList.forEach(function(polyline) {
        polyline.options.color = polyline.options.formerColor;
        polyline.options.width = polyline.options.formerWidth;
        polyline.emphasis = false;
    });
    emphasisList = [];
}

function onClickCallBack(polyline, index, originData) {
    if (polyline) emphasisPolyline(polyline);
    c.needRedraw();
}

var c = new dmap.CanvasPolylineLayer({
    cursor: 'pointer',
    divideParts: 4
})

  
$.getJSON('nyc.json', function(json) {
    c.data(json.data, function(d) {
        let color = undefined,
            type = parseInt(d.t)
        switch (type) {
            case 2: color = '#f2be45'; break;
            case 3: color = '#ff7500'; break;
            default: color = '#2e4e7e';
        }
        return {
            coordinates: d.c,
            options: { 
                zoomLevel: type == 2 ? 1 : 11,
                color: color,
                width: 0.5
            },
            data: d
        }
    }).enter().addTo(map);
    map.fitBounds(c.getBounds());
    c.on('dblclick', function() {
        resetEmphasis();
    })
    c.on('click', onClickCallBack, c);

})
```