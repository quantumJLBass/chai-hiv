function setup_shapeEvents(shape_obj,shape,jObj,i){
	$(shape_obj).click(function(){
		if(typeof(shape.style.events.click)!="undefined" && shape.style.events.click != ""){
			jObj.gmap('setOptions',shape.style.events.click,this);
			if(typeof(shape.style.events.click.onEnd)!="undefined" && shape.style.events.click.onEnd != ""){
				/*(function(){
					var p= shape.style.events.click.onEnd.replace('\u0027',"'");
					var f=  new Function(p);
					f();
				})();*/
				eval(shape.style.events.click.onEnd.replace('\u0027',"'"));
			}
		}
	 }).mouseover(function(){
		 if(typeof(shape.style.events.mouseover)!="undefined" && shape.style.events.mouseover != ""){
			 jObj.gmap('setOptions',shape.style.events.mouseover,this);
			if(typeof(shape.style.events.mouseover.onEnd)!="undefined" && shape.style.events.mouseover.onEnd != ""){
				//(function(){var p= shape.style.events.mouseover.onEnd.replace('\u0027',"'");var f=  new Function(p);f();})();
				eval(shape.style.events.mouseover.onEnd.replace('\u0027',"'"));
			}		
		 }
	}).mouseout(function(){
		if(typeof(shape.style.events.rest)!="undefined" && shape.style.events.rest != ""){
			jObj.gmap('setOptions',shape.style.events.rest,this);
			if(typeof(shape.style.events.rest.onEnd)!="undefined" && shape.style.events.rest.onEnd != ""){
				(function(){var p= shape.style.events.rest.onEnd.replace('\u0027',"'");var f=  new Function(p);f();})();
			}
		}
	}).dblclick(function(){
		if(typeof(shape.style.events.dblclick)!="undefined" && shape.style.events.dblclick != ""){
			jObj.gmap('setOptions',shape.style.events.dblclick,this);
			(function(){var p= shape.style.events.dblclick.onEnd.replace('\u0027',"'");var f=  new Function(p);f();})();
		}
	})
	.trigger('mouseover')
	.trigger('mouseout');
}