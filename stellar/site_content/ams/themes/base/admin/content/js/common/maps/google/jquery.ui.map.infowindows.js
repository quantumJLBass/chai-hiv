 /*!
 * jQuery UI Google Map 3.0-rc  -- WSU extentions ( DrawingManager )
 * http://code.google.com/p/jquery-ui-map/
 * Copyright (c) 2010 - 2012 Jeremy Bass
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends:
 *      jquery.ui.map.js
 */
( function($) {


	$.extend($.ui.gmap.prototype, {
		
		
		
		
		
		init_infowindow: function(windowOptions , handling) {
			var self = this;	

			
			self.set('drawingOptions', drawingOptions);
			self.set('handling', handling);

			var drawingManager = new google.maps.drawing.DrawingManager(jQuery.extend({'map': self.get('map')}, drawingOptions));
			self.set('drawingManager', drawingManager);
			
			if( typeof(handling.loaded_shape)!=='undefined' && !$.isEmptyObject(handling.loaded_shape) ){
				var shape = self.addShape(handling.loaded_type, handling.loaded_shape);
			
				google.maps.event.addListener(shape[0], 'click', function(e) {
											var newShape = shape[0];
											newShape.type = handling.loaded_type;
											self.set_drawingSelection(newShape);
											handling.onDrag();
										});
				google.maps.event.trigger(shape[0], 'click');
			}

			if(typeof(handling.onDrag)=='function'){
				if(typeof(shape)!=='undefined' && !$.isEmptyObject(shape) ){
					google.maps.event.addListener(shape, 'click', function(event) {
						if(typeof(handling.onDrag)=='function'){
							handling.onDrag();
						}
					});
				}
			}
			google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
				var newShape = e.overlay;
            	newShape.type = e.type;
				
				drawingManager.setDrawingMode(null);
				self.get('_drawings',[]).push(newShape);
				
				self.unset_drawingSelection;
				google.maps.event.addListener(newShape, 'click', function() { self.set_drawingSelection(newShape); handling.onDrag(); });
				self.set_drawingSelection(newShape);
				
				if(typeof(handling.overlaycomplete)=='function'){handling.overlaycomplete(self.get_updated_data());}
				
				var ele_count = self.get('_drawings',[]).length;
				if( ele_count >= handling.limit) {
					self.get('drawingManager').setOptions({drawingControl: false});
					if(typeof(handling.limit_reached)!=='undefined'){
						handling.limit_reached(self);
					}
				}
			});
			google.maps.event.addListener(drawingManager, 'drawingmode_changed', function() {
				self.unset_drawingSelection();
				if(typeof(handling.drawingmode_changed)=='function'){
					handling.drawingmode_changed( self.get_drawingMode() );
				}
			});

			//google.maps.event.addListener(self.get('map'), 'click', function(){handling.onDrag();self.unset_drawingSelection();});
			
			return $(drawingManager);
		},
		hide_drawingControl: function() {
			if ( this.get('drawingManager') != null ) {
				this.get('drawingManager').setOptions({  drawingControl: false});
			}
			return this;
		},
		show_drawingControl: function() {
			if ( this.get('drawingManager') != null ) {
				this.get('drawingManager').setOptions({drawingControl: true});
			}
			return this;
		},
		start_drawing: function(OverlayType,drawingControl){
			if ( this.get('drawingManager') != null ) {
				this.get('drawingManager').setOptions({  drawingControl: (typeof(drawingControl) !== 'undefined'?drawingControl:true) });
				this.get('drawingManager').setDrawingMode(OverlayType);
			}
			return this;
		},
		stop_drawing: function(){
			if ( this.get('drawingManager') != null ) {
				this.get('drawingManager').setOptions({  drawingControl: false});
				this.get('drawingManager').setDrawingMode(null);
			}
			return this;
		},	
		destroy_drawing: function(){
			if ( this.get('drawingManager') != null ) {
				this.get('drawingManager').setMap(null);
				this.set('drawingManager') = null;
			}
			return this;
		},
		refresh_drawing: function(clear){
			if(typeof(clear)!=='undefined' && clear)this.clear_drawings;
			this.destroy_drawing;
			this.init_drawing( this.get('drawingOptions') , this.get('handling') ); 
			return this;
		},	
		get_drawnElementCount: function(type){
			var count = this.get('_drawings',[]).length;
			if( (count==0 || count == null) && typeof(type) !== 'undefined'){
				var count = this.get_shapeCount(type);
			}
			return (count==0 || count == null) ? 0 : count;
		},		
		get_drawingMode: function(){
			return this.get('drawingManager').getDrawingMode();
		},
		set_drawingMode: function(mode){
			return this.get('drawingManager').setDrawingMode(mode);
		},
		clear_drawings: function(){
			$.each(this.get('_drawings',[]),function(i,v){
				v.setMap(null);
			});
			return;
		},
		unset_drawingSelection:function() {
			var sel = this.get('selected');
			if( sel != null) {
				if(sel.type  == google.maps.drawing.OverlayType.MARKER ) {
					sel.setDraggable(true);
				}else{
					sel.setEditable(false);
				}
				this.set('selected',null);
			}
		},
		set_drawingSelection:function(shape) {
			this.unset_drawingSelection();
			this.set('selected',shape);
			this.set('type',shape.type);
			if(shape.type  == google.maps.drawing.OverlayType.MARKER ) {
				shape.setDraggable(true);
			}else{
				shape.setEditable(true);
			}
		},
		get_drawingSelection: function(){
			return this.get('selected');
		},
		delete_drawingSelection:function() {
			if (this.get('selected') != null) {
			  	this.get('selected').setMap(null);
			}
		},		
		get_updated_data:function() {
			var overlay = this.get('selected');
			if (overlay.type == google.maps.drawing.OverlayType.CIRCLE || overlay.type == 'Circle') { 
				var points = overlay.getRadius();
			}else if (overlay.type == google.maps.drawing.OverlayType.POLYLINE || overlay.type == 'Polyline') {
				var points = overlay.getPath();
			}else if (overlay.type == google.maps.drawing.OverlayType.POLYGON || overlay.type == 'Polygon') {
				if($.isArray(overlay.getPaths())){
					/*
					* i think this needs to move somewhere.. in regrades to the 
					* way i think google handle drawing complex shapes.  
					* they don't let you and we need to fake it
					*/
					//alert('is a array so you are making holes');
					var paths = overlay.getPaths();
					if(paths.length){
						for(i=0; i<=paths.length-1; i++){
							var path = self.convert_gmap_LatLng(paths[i])
							i % 2 > 0 ? path.reverse() : '';
							points.push();
						}
					}
				}else{
					var points = this.convert_gmap_LatLng(overlay.getPath(),  this.get('handling'));
				}
			}
			return points;
		},	
		
		// Polygon containsLatLng - method to determine if a latLng is within a polygon
		polygon_containsLatLng:function(polygon,latLng) {
		  // Exclude points outside of bounds as there is no way they are in the poly
		  var bounds = polygon.getBounds();
		  if(bounds != null && !bounds.contains(latLng)) {
			return false;
		  }
		  // Raycast point in polygon method
		  var inPoly = false;
		
		  var numPaths = polygon.getPaths().getLength();
		  for(var p = 0; p < numPaths; p++) {
			var path = polygon.getPaths().getAt(p);
			var numPoints = path.getLength();
			var j = numPoints-1;
		
			for(var i=0; i < numPoints; i++) { 
			  var vertex1 = path.getAt(i);
			  var vertex2 = path.getAt(j);
		
			  if (vertex1.lng() < latLng.lng() && vertex2.lng() >= latLng.lng() || vertex2.lng() < latLng.lng() && vertex1.lng() >= latLng.lng())  {
				if (vertex1.lat() + (latLng.lng() - vertex1.lng()) / (vertex2.lng() - vertex1.lng()) * (vertex2.lat() - vertex1.lat()) < latLng.lat()) {
				  inPoly = !inPoly;
				}
			  }
			  j = i;
			}
		  }
		  return inPoly;
		},	
/*
* This block here i think should be moved a utilities class
*/
		convert_gmap_LatLng: function(points,handling) {
				if(handling.encodePaths){
					points = google.maps.geometry.encoding.encodePath(points);
				}else{
					if(handling.data_return == 'str'){
						points = this.make_latlng_str(points,handling);
					}else if(handling.data_return == 'array'){
						points = points; // ie: array of gmaps latlng objs here for now but waste of processes i know
					}
				}
			return points;
		},
		make_latlng_str: function(points,handling) {
			var pathString='';
			for(i=0;i<points.length;i++){
				var point=points.getAt(i);
				var delimiter = (typeof(handling.delimiter)!=='undefined' && handling.delimiter !='') ?  handling.delimiter : ',';
				if(typeof(handling.data_pattern)!=='undefined' && handling.data_pattern !=''){
					pathString +=  handling.data_pattern
												.replace('{lat}',point.lat())
												.replace('{lng}',point.lng())
												.replace('{delimiter}',( i < (points.length-1) ? delimiter : '' ));
				}else{
					pathString += + point.lat()+' '+ point.lng()+ ( i < (points.length-1) ? ',' : '' ) +'\n';
				}
			}
			return pathString;
		}
/*
*
*/
		

		
	});
	
} (jQuery) );