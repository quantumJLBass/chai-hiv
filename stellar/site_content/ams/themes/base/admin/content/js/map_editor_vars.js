/* NOTE THERE IS A LOT OF EXTRA THAT NEEDS DELETING */


var tinyMCEImageList = [];
var ib = [];
var timeouts;

var DOMAIN='http://localhost:50759';
var DEFAULT_overlay;
var DEFAULT_polylines = [];
var	rest_Options={fillColor: "#a90533"};
var	hover_Options={fillColor: "#5f1212"};	

var element_pool = [];

// Our global state
var map;
var infowindow,
	service;
var boxHtmls;
var referenceId;
var localSearches;
var selectedResults = [];
var currentResults = [];
var searchForm; 
var waypts = [],
	markers = [],
	checkboxArray = [],
	polylineOptions = [],
	overlay_pool = [],
	depth=0,
	fractal=0,
	iterator = 0,
	points=[],
	lableStyles=[],
	keysOrder=[],
	pullman = new google.maps.LatLng(46.730904390653876,-117.16101408004698);
//var pullman_str = '46.730904390653876,-117.16101408004698';

function gob(e){if(typeof(e)=='object')return(e);if(document.getElementById)return(document.getElementById(e));return(eval(e))}

	//to show and hide controls base
	var controlsOut = {scaleControl: false,mapTypeControl:false,zoomControl:false,panControl:false,streetViewControl:false};
	var controlsIn  = {scaleControl: true,mapTypeControl:true,zoomControl:true,panControl:true,streetViewControl:true};



var polyShape;
var markerShape;
var oldDirMarkers = [];
//var tmpPolyLine;
var drawnShapes = [];
var holeShapes = [];
var startMarker;
var nemarker;
var tinyMarker;
var markers = [];
var midmarkers = [];
//var markerlistener1;
//var markerlistener2;
var rectangle;
var circle;
var southWest;
var northEast;
var centerPoint;
var radiusPoint;
var calc;
var startpoint;
var dirpointstart = null;
var dirpointend = 0;
var dirline;
var waypts = [];
//var waypots = [];
var polyPoints = [];
var pointsArray = [];
var markersArray = [];
var addresssArray = [];
var pointsArrayKml = [];
var markersArrayKml = [];
var toolID = 1;
var codeID = 1;
var shapeId = 0;
var adder = 0;
var plmcur = 0;
var lcur = 0;
var pcur = 0;
//var rcur = 0;
var ccur = 0;
var mcur = 0;
var outerPoints = [];
var holePolyArray = [];
var outerShape;
var anotherhole = false;
//var it;
var outerArray = [];
var innerArray = [];
var innerArrays = [];
var outerArrayKml = [];
var innerArrayKml = [];
var innerArraysKml = [];
var placemarks = [];





//var mylistener;
var editing = false;
var notext = false;
var kmlcode = "";
var javacode = "";
var polylineDecColorCur = "255,0,0";
var polygonDecColorCur = "255,0,0";
var docuname = "My document";
var docudesc = "Content";
var polylinestyles = [];
var polygonstyles = [];
//var rectanglestyles = [];
var circlestyles = [];
var markerstyles = [];
 //var geocoder; = new google.maps.Geocoder();
//var startLocation;
var endLocation;
//var dircount;
var dircountstart;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var directionsYes = 0;
var dirtool = 0;
//var oldDirections = [];
var destinations = [];
//var currentDirections = null;
var oldpoint = null;
//var infowindow = new google.maps.InfoWindow({size: new google.maps.Size(150,50)});
var tinyIcon = new google.maps.MarkerImage(
    DOMAIN+'/Content/Content/images/marker_20_red.png',
    new google.maps.Size(12,20),
    new google.maps.Point(0,0),
    new google.maps.Point(6,16)
);
var tinyShadow = new google.maps.MarkerImage(
    DOMAIN+'/Content/images/marker_20_shadow.png',
    new google.maps.Size(22,20),
    new google.maps.Point(6,20),
    new google.maps.Point(5,1)
);
var imageNormal = new google.maps.MarkerImage(
	DOMAIN+'/Content/images/square.png',
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);
var imageHover = new google.maps.MarkerImage(
	DOMAIN+'/Content/images/square_over.png',
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);
var imageNormalMidpoint = new google.maps.MarkerImage(
	DOMAIN+'/Content/images/square_transparent.png',
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);
/*var imageHoverMidpoint = new google.maps.MarkerImage(
	"square_transparent_over.png",
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);*/
// Create our "tiny" marker icon
var gYellowIcon = new google.maps.MarkerImage(
	"http://labs.google.com/ridefinder/images/mm_20_yellow.png",
	new google.maps.Size(12, 20),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 20)
	);
var gRedIcon = new google.maps.MarkerImage(
	"http://labs.google.com/ridefinder/images/mm_20_red.png",
	new google.maps.Size(12, 20),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 20)
	);
var gSmallShadow = new google.maps.MarkerImage(
	"http://labs.google.com/ridefinder/images/mm_20_shadow.png",
	new google.maps.Size(22, 20),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 20)
	);
var boxText = document.createElement("div");


var availableTags = [
			"Food",
			"Fun",
			"Facts",
			"Foo",
			"Far",
			"From"
		];
		//var geocoder; 
		var temp_var;
		
		
var gmap_location_types = ['building','accounting','airport','amusement_park','aquarium','art_gallery','atm','bakery','bank','bar',
						'beauty_salon','bicycle_store','book_store','bowling_alley','bus_station','cafe','campground','car_dealer',
						'car_rental','car_repair','car_wash','casino','cemetery','church','city_hall','clothing_store','convenience_store',
						'courthouse','dentist','department_store','doctor','electrician','electronics_store','embassy','establishment',
						'finance','fire_station','florist','food','funeral_home','furniture_store','gas_station','general_contractor',
						'geocode','grocery_or_supermarket','gym','hair_care','hardware_store','health','hindu_temple','home_goods_store',
						'hospital','insurance_agency','jewelry_store','laundry','lawyer','library','liquor_store','local_government_office',
						'locksmith','lodging','meal_delivery','meal_takeaway','mosque','movie_rental','movie_theater','moving_company',
						'museum','night_club','painter','park','parking','pet_store','pharmacy','physiotherapist','place_of_worship',
						'plumber','police','post_office','real_estate_agency','restaurant','roofing_contractor','rv_park','school',
						'shoe_store','shopping_mall','spa','stadium','storage','store','subway_station','synagogue','taxi_stand',
						'train_station','travel_agency','university','veterinary_care','zoo','administrative_area_level_1',
						'administrative_area_level_2','administrative_area_level_3','colloquial_area','country','floor','intersection',
						'locality','natural_feature','neighborhood','political','point_of_interest','post_box','postal_code',
						'postal_code_prefix','postal_town','premise','room','route','street_address','street_number','sublocality',
						'sublocality_level_4','sublocality_level_5','sublocality_level_3','sublocality_level_2','sublocality_level_1',
						'subpremise','transit_station'];
		
		