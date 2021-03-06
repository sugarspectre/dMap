// import {PointLayer} from "./PointLayer.js"

export class TimelineLayer{
    constructor(mymap,options) {
        this._times = [];
        this._data = [];
        this.times2index = {};
        this._layers = [];
        this._curlayer = null;
        this._map = mymap;

        this._isrunning = false;
        this.timechangefun = function(d,i,t,layer){};

        this.timeline = document.createElement("div");
        this.timeline.id = "timeline";
        this.timeline.style.visibility = "visible";
        document.body.appendChild(this.timeline); 

        this.slider = document.createElement("input");
        this.slider.type = "range";
        this.slider.min = 0;
        this.slider.max = 4;
        this.slider.value = 0;
        this.slider.id = "myRange";

        this.bt_play = document.createElement("button");
        this.bt_play.type="button";
        this.bt_play.id="bt_play";
        this.bt_play.textContent = "play";

        this.par = document.createElement("p");
        this.par.textContent = "Vaule: ";
        this.output = document.createElement("span");
        this.output.id = "demo";
        this.par.appendChild(this.output);

        this.timeline.appendChild(this.slider); 
        this.timeline.appendChild(this.bt_play); 
        this.timeline.appendChild(this.par); 

        this.setOption(options);

        var tmp = this;
        this.slider.onclick = function(){
            tmp.renderAtTime(tmp.output.innerHTML,tmp._map);
        }
    }

    setOption(options){
        this.options = options;
    }

    data(time,data,fn){
        this._times = time;
        this._data = data;
        this.slider.max = time.length-1;
        for(let i=0;i<time.length;i++){
            this.times2index[this._times[i]] = i;
        }

        for(let i=0;i<time.length;i++){
            if(this.options.layerType=="PointMap"){
                let l = new PointLayer();
                this._layers[i] = l.data(data[i],fn).enter();
            }
            else if(this.options.layerType=="heatmap"){
                // let l = new HeatmapOverlay(this.options.layerOption);
                // l.setData(this._data[i]);
                // this._layers[i] = l;
            }
        }
        this.listen();
        
        return this;
    }

    listen(){
        //添加slider监听事件
        var tmp = this;
        this.slider.oninput = function() {
            tmp.output.innerHTML = tmp._times[tmp.slider.value];
            return tmp.output.innerHTML;
        }
        this.output.innerHTML = this._times[this.slider.value]; // Display the default slider value

        //the timeline is(not) visible
        if(this.options.enableControl==false){
            timeline.style.visibility = "hidden";
        }else{
            timeline.style.visibility = "visible";
        }

        //是否自动播放
        if(this.options.autoPlay==true){
            this.play(this._times[0],this._map);
        }else{
            this.renderAtTime(this._times[0],this._map);
        }

        //添加播放按钮监听事件
        var tmp = this;
        this.bt_play.onclick = function(){
            // tmp.running = 1;
            tmp.play(tmp._times[0],tmp._map);
        }
        // this.bt_stop.onclick = function(){
        //     tmp.running = 2;
        // }
        // this.bt_pause.onclick = function(){
        //     tmp.running = 3;
        // }

    }

    renderAtTime(time_index){
        if(this._curlayer!=null){
            this._curlayer.remove();
        }
        switch(this.options.layerType){
            case "PointMap":   
                this._layers[this.times2index[time_index]].addTo(this._map);
                this._curlayer = this._layers[this.times2index[time_index]];
                break;
            case "heatmap":
                    this._curlayer = new HeatmapOverlay(this.options.layerOption).addTo(this._map);
                    this._curlayer.setData(this._data[this.times2index[time_index]]);
                break;
            default:
                throw new Error(this.options.layerType+'is not exist in the timelinelayer');
        }     
        this.slider.value = this.times2index[time_index];
        this.output.innerHTML = time_index;  

        let index = Number(this.slider.value);
        this.timechangefun(this._data[index],index,this._times[index],this._curlayer);
    }

    on(event,f){
        if(event==="timechange"){
            this.timechangefun = f;
        }
        return this;
    }

    play(time){
        let index = this.times2index[time];
        if(this._isrunning==false){
            this._isrunning=true;
            //es6 promise
            for (let i=index; i<this._times.length; i++) {
                var tmp = this;
                (function () {
                    setTimeout(() => {tmp.renderAtTime(tmp._times[i],tmp._map);if(i==tmp._times.length-1){tmp._isrunning=false}}, tmp.options.tickTime*i)
                })();
            }
        }
    }
}
