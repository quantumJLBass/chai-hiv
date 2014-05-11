 /*!
 * jQuery UI Google Map 3.0-rc
 * http://code.google.com/p/jquery-ui-map/
 * Copyright (c) 2010 - 2012 Johan Säll Larsson
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Depends:
 *		jquery.ui.map.js
 */
( function($) {
	
	$.extend($.ui.gmap.prototype, {
		
		
		
	getStreetViewPanorama: function(panel, streetViewPanoramaOptions) {
			var StreetViewPanorama = this.get('services > StreetViewPanorama', new google.maps.StreetViewPanorama());
			return StreetViewPanorama;
		},	  
	getGeocoder:function(){
		var Geocoder = this.get('services > Geocoder', new google.maps.Geocoder());
		return Geocoder;
	},
	
	getDirectionsService: function(){
		var DirectionsService = this.get('services > DirectionsService', new google.maps.DirectionsService());
		return DirectionsService;
	},
	getDirectionsRenderer: function(){
		var DirectionsRenderer = this.get('services > DirectionsRenderer', new google.maps.DirectionsRenderer());
		return DirectionsRenderer;
	},	
	getElevationService:function(){
		var ElevationService = this.get('services > ElevationService', new google.maps.ElevationService());
		return ElevationService;
	},
	
	getMaxZoomService:function(){
		var MaxZoomService = this.get('services > MaxZoomService', new google.maps.MaxZoomService());
		return MaxZoomService;
	},
	
	getDistanceMatrixService:function(){
		var DistanceMatrixService = this.get('services > DistanceMatrixService', new google.maps.DistanceMatrixService());
		return DistanceMatrixService;
	},

		/**
		 * Computes directions between two or more places.
		 * @param directionsRequest:google.maps.DirectionsRequest
		 * @param directionsRendererOptions:google.maps.DirectionsRendererOptions (optional)
		 * @param callback:function(result:google.maps.DirectionsResult, status:google.maps.DirectionsStatus)
		 * @see http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsRequest
		 * @see http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsRendererOptions
		 * @see http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#DirectionsResult
		 */
		displayDirections: function(directionsRequest, directionsRendererOptions, callback) {
			var self = this;		
			var directionService = this.getDirectionsService();
			var directionRenderer = this.getDirectionsRenderer();
			if ( directionsRendererOptions ) {
				directionRenderer.setOptions(directionsRendererOptions);
			}
			directionService.route(directionsRequest, function(results, status) {
				if ( status === 'OK' ) {
					directionRenderer.setDirections(results);
					directionRenderer.setMap(self.get('map'));
				} else {
					directionRenderer.setMap(null);
				}
				callback(results, status);
			});
		},
		
		/**
		 * Displays the panorama for a given LatLng or panorama ID.
		 * @param panel:jQuery/String/Node
		 * @param streetViewPanoramaOptions:google.maps.StreetViewPanoramaOptions (optional) 
		 * @see http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#StreetViewPanoramaOptions
		 */
		displayStreetView: function(panel, streetViewPanoramaOptions) {
			this.get('map').setStreetView(this.get('services > StreetViewPanorama', new google.maps.StreetViewPanorama(this._unwrap(panel), streetViewPanoramaOptions)));
		},
		
		
		getPanorama : function(){
			return this.get('map').getStreetView();
		},
		
		
		hasPanorama : function(){
			return this.get('map').getStreetView().getVisible();
		},
		/**
		 * A service for converting between an address and a LatLng.
		 * @param geocoderRequest:google.maps.GeocoderRequest
		 * @param callback:function(result:google.maps.GeocoderResult, status:google.maps.GeocoderStatus), 
		 * @see http://code.google.com/intl/sv-SE/apis/maps/documentation/javascript/reference.html#GeocoderResult
		 */
		search: function(geocoderRequest, callback) {
			this.get('services > Geocoder', new google.maps.Geocoder()).geocode(geocoderRequest, callback);
		},
		

    getelevation : function(todo){
      /*var fnc, path, samples, i,
          locations = [],
          callback = ival(todo, 'callback'),
          latLng = ival(todo, 'latlng'),
          that = this;
          
      if (typeof(callback) === 'function'){
        fnc = function(results, status){
          var out = status === google.maps.ElevationStatus.OK ? results : false;
          callback.apply($this, [out, status]);
          that._end();
        };
        if (latLng){
          locations.push(toLatLng(latLng));
        } else {
          locations = ival(todo, 'locations') || [];
          if (locations){
            locations = array(locations);
            for(i=0; i<locations.length; i++){
              locations[i] = toLatLng(locations[i]);
            }
          }
        }
        if (locations.length){
          this.getElevationService().getElevationForLocations({locations:locations}, fnc);
        } else {
          path = ival(todo, 'path');
          samples = ival(todo, 'samples');
          if (path && samples){
            for(i=0; i<path.length; i++){
              locations.push(toLatLng(path[i]));
            }
            if (locations.length){
              this.getElevationService().getElevationAlongPath({path:locations, samples:samples}, fnc);
            }
          }
        }
      } else {
        this._end();
      }*/
    },
	
	    /**
     * return the distance between an origin and a destination
     *      
     **/
    getdistance : function(todo){
      /*var i, 
          callback = ival(todo, 'callback'),
          that = this;
      if ( (typeof(callback) === 'function') && todo.options && todo.options.origins && todo.options.destinations ) {
        // origins and destinations are array containing one or more address strings and/or google.maps.LatLng objects
        todo.options.origins = array(todo.options.origins);
        for(i=0; i<todo.options.origins.length; i++){
          todo.options.origins[i] = toLatLng(todo.options.origins[i], true);
        }
        todo.options.destinations = array(todo.options.destinations);
        for(i=0; i<todo.options.destinations.length; i++){
          todo.options.destinations[i] = toLatLng(todo.options.destinations[i], true);
        }
        this.getDistanceMatrixService().getDistanceMatrix(
          todo.options,
          function(results, status) {
            var out = status == google.maps.DistanceMatrixStatus.OK ? results : false;
            callback.apply($this, [out, status]);
            that._end();
          }
        );
      } else {
        this._end();
      }*/
    }
		
		
		
		
		
		
		
		
		
		
		
		
	});
	
} (jQuery) );