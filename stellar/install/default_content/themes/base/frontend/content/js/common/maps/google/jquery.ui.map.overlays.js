 /*!
 * jQuery UI Google Map 3.0-rc
 * http://code.google.com/p/jquery-ui-map/
 * Copyright (c) 2010 - 2012 Johan Säll Larsson
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends:
 *      jquery.ui.map.js
 */
( function($) {

	$.extend($.ui.gmap.prototype, {
	
		/*
		 * This is just a short cut to addShape
		 */
		addPolygon: function(shapeOptions, callback) {
			return  this.addShape('Polygon', shapeOptions,callback);
		},
		addPolyline: function(shapeOptions, callback,callback) {
			return  this.addShape('Polyline', shapeOptions,callback);
		},
		addRectangle: function(shapeOptions, callback) {
			return  this.addShape('Rectangle', shapeOptions,callback);
		},
		addCircle: function(shapeOptions, callback) {
			return  this.addShape('Circle', shapeOptions,callback);
		},
		/**
		 * Adds a shape to the map
		 * @param shapeType:string Polygon, Polyline, Rectangle, Circle
		 * @param shapeOptions:object
		 * @return object
		 */
		addShape: function(shapeType, shapeOptions, callback) {
			//alert(dump(shapeOptions));
			var self = this;
			var flip = typeof(shapeOptions.coordsFlip)!=='undefined' ? shapeOptions.coordsFlip : false;
			if(typeof(shapeOptions.paths)!="undefined" && typeof(shapeOptions.paths)!='string' && !$.isArray(shapeOptions.paths) ){
				var reverse_array = false;
				var paths_array = [];
				$.each(shapeOptions.paths, function(i,v){
					if(i>=1 && i % 2 > 0){reverse_array=true}
					paths_array.push(self.process_coords(v,flip,reverse_array));
				});
				shapeOptions.paths = paths_array;
			}
			if(typeof(shapeOptions.paths)=='string'){shapeOptions.paths = self.process_coords(shapeOptions.paths,flip,false);}
			if(typeof(shapeOptions.path)=='string'){shapeOptions.path = self.process_coords(shapeOptions.path,flip,false);}
			if(typeof(shapeOptions.encoded)=='string'){shapeOptions.paths = google.maps.geometry.encoding.decodePath(shapeOptions.encoded);}
			
			var shape = new google.maps[shapeType](jQuery.extend({'map': self.get('map')}, shapeOptions));
			this.get('overlays > ' + shapeType, []).push(shape);
			this._call(callback, shape);
			return $(shape);
		},
		process_coords: function(coordinates,flip,reverse_array) {
			var Coords=[];
			if( typeof(google.maps.geometry)!=='undefined' && coordinates.match(/[\||\@|\_|\`]+/i) ){ // only encoded has @ | _ `
				Coords = google.maps.geometry.encoding.decodePath(coordinates);
			}else{
				/*
				* We are forcing common formats in to a one spatial formaat ie:
				* -122.358 47.653, -122.348 47.649 for 
				* POLYGON((-122.358 47.653, -122.348 47.649, -122.348 47.658, -122.358 47.658, -122.358 47.653))
				*/
				var coordArray = coordinates.match(/\((-?\d+\.\d+\s?,\s?-?\d+\.\d+)\)/gim);
				//(-122.8 ,47.653) (-122.358 , 47.47) (-32.348,47.649)
				if ( coordArray != null) {
					/* returns value
					*	myArray[0] = "(-122.8 ,47.653)"
					*	myArray[1] = "(122.358 , 47.47)"
					*	myArray[2] = "(-32.348,47.649)"
					*/
					for ( i = 0; i < coordArray.length; i++ ) { 
						var cord=coordArray[i].replace('(','').replace('(','').replace(' ','').split(',');
						/* cord normalized from
						*	(-122.8 ,47.653) too
						*	myArray[0] = "-122.8"
						*	myArray[1] = "47.653"
						*/ //make google lat and long object\
						if(flip){
							var lat = parseFloat(cord[1]);
							var long = parseFloat(cord[0]);
						}else{
							var lat = parseFloat(cord[0]);
							var long = parseFloat(cord[1]);
						}
						Coords.push(new google.maps.LatLng(lat,long));
					}Coords = (reverse_array ? Coords.reverse() : Coords);
				}else{
					var coordArray = coordinates.match(/(-?\d+\.\d+\s?-?\d+\.\d+)\s?,?/gim);
					// from many online coord output generators
					//-12.38 47.6, -122.358 47.658 ,-133.358 3.653
					if ( coordArray != null) {
						/* returns value
						*	myArray[0] = "-12.38 47.6,"
						*	myArray[1] = "-122.358 47.658,"
						*	myArray[2] = "-133.358 3.653"
						*/
						for ( i = 0; i < coordArray.length; i++ ) { 
							var cord=coordArray[i].replace('  ',' ').replace(',','').split(' ');
							/* cord normalized from
							*	-122.8 47.65 too
							*	myArray[0] = "-122.8"
							*	myArray[1] = "47.653"
							*/ //make google lat and long object
							if(flip){
								var lat = parseFloat(cord[1]);
								var long = parseFloat(cord[0]);
							}else{
								var lat = parseFloat(cord[0]);
								var long = parseFloat(cord[1]);
							}
								Coords.push(new google.maps.LatLng(lat,long));
						}Coords = (reverse_array ? Coords.reverse() : Coords);
					}else{
						var coordArray = coordinates.match(/(-?\d+\.\d+\s?,\s?-?\d+\.\d+)\s?,?\n?/gim);
						// matches what would come from MS SQL geography
						//-117.153010,46.737331,\n-117.154212,46.737037,\n-117.155070,46.736625   NOTE:(\n in string and \n as new line)
						if ( coordArray != null) {
							/* returns value
							*	myArray[0] = "-117.153010,46.737331,"
							*	myArray[1] = "-117.154212,46.737037,"
							*	myArray[2] = "-117.155070,46.736625"
							*/
							
							for ( i = 0; i < coordArray.length; i++ ) { 
							var cord='';
								var l_str=coordArray[i].substring(coordArray[i].length - 1); 
									l_str==',' ? coordArray[i] = coordArray[i].substring(0,coordArray[i].length - 1) : '' ;
								var cord=coordArray[i].replace(' ','').split(',');
								/* cord normalized from
								*	-122.8,47.65, too
								*	myArray[0] = "-122.8"
								*	myArray[1] = "47.653"
								*/ //make google lat and long object
								if(flip){
									var lat = parseFloat(cord[0]);
									var long = parseFloat(cord[1]);
								}else{
									var lat = parseFloat(cord[1]);
									var long = parseFloat(cord[0]);
								}
								Coords.push(new google.maps.LatLng(lat,long));
								
							}Coords = (reverse_array ? Coords.reverse() : Coords);
						}
					}	
				}			
			}
			return Coords.length ? Coords  : false;
		},
		get_shapeCount: function(shapeType){
			return this.get('overlays > ' + shapeType, []).length;
		},
				
		move_shape: function(shape,latlng, callback){
			//alert('starting the move');
			var self = this;
			
			var bounds= new google.maps.LatLngBounds();
			var MVCArray_latLng = shape.getPath().getArray();
			for (i = 0; i < MVCArray_latLng.length; i++) {
				bounds.extend(MVCArray_latLng[i]);
			}
  
			var currentCenter = bounds.getCenter();
			//calculate the offsets 
			var xoff = Math.abs(latlng.lng() - currentCenter.lng()); 
			var yoff = Math.abs(latlng.lat() - currentCenter.lat()); 

			if (latlng.lng() < currentCenter.lng()) { xoff *= -1; } 
			if (latlng.lat() < currentCenter.lat()) { yoff *= -1; } 

			//alert(xoff);
			//alert(yoff);

			var newPath = [];

			for (var i = 0; i < MVCArray_latLng.length; i++) { 
				var old = MVCArray_latLng[i];
				newPath.push(new google.maps.LatLng(( old.lat() + yoff ),( old.lng() + xoff ))); 
			}

			shape.setPath(newPath);
			
			this._call(callback, shape);
			
			return $(shape);
		},	
		stop_shapeMove: function(polygon){},
		/*
		options
			zoom
		
		*/
		zoom_to_bounds: function(options,shape,callback){
			poly = this._unwrap(shape); 
			alert('zooming');
			var map = this.get('map');
			var bounds= new google.maps.LatLngBounds();
			var MVCArray_latLng = poly.getPath().getArray();
			for (i = 0; i < MVCArray_latLng.length; i++) {
				bounds.extend(MVCArray_latLng[i]);
			}
			//var currentCenter = bounds.getCenter();	
			map.fitBounds(bounds); 
			if(typeof(options)!=="undefined" && typeof(options.zoom)!=="undefined"){
				var listener = google.maps.event.addListener(map, "idle", function() {  
				  if (map.getZoom() > options.zoom) map.setZoom(options.zoom);  
				  google.maps.event.removeListener(listener);  
				});
			}
			this._call(callback, shape);
			return $(shape);
		},

		attach_shape_to_marker:function(shape,marker){
			return this.move_shape(shape,marker.getPosition());
		},
		/**
		 * Adds fusion data to the map.
		 * @param fusionTableOptions:google.maps.FusionTablesLayerOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#FusionTablesLayerOptions
		 * @param fusionTableId:int
		 */
		loadFusion: function(fusionTableOptions, fusionTableId) {
			( (!fusionTableId) ? this.get('overlays > FusionTablesLayer', new google.maps.FusionTablesLayer()) : this.get('overlays > FusionTablesLayer', new google.maps.FusionTablesLayer(fusionTableId, fusionTableOptions)) ).setOptions(jQuery.extend({'map': this.get('map') }, fusionTableOptions));
		},
		
		/**
		 * Adds markers from KML file or GeoRSS feed
		 * @param uid:String - an identifier for the RSS e.g. 'rss_dogs'
		 * @param url:String - URL to feed
		 * @param kmlLayerOptions:google.maps.KmlLayerOptions, http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#KmlLayerOptions
		 */
		loadKML: function(uid, url, kmlLayerOptions) {
			this.get('overlays > ' + uid, new google.maps.KmlLayer(url, jQuery.extend({'map': this.get('map')}, kmlLayerOptions)));
		}	
	});
	
} (jQuery) );