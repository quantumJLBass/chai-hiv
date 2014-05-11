var tinyMCEImageList = [];
var ib = [];
var timeouts;
var DOMAIN='http://localhost:50759';




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
var overlay_pool = [];
var waypts = [],
	markers = [],
	checkboxArray = [],
	polylineOptions = [],

	depth=0,
	fractal=0,
	iterator = 0,
	points=[],
	lableStyles=[],
	keysOrder=[],
	pullman = new google.maps.LatLng(46.73191920826778,-117.15296745300293);


function gob(e){if(typeof(e)=='object')return(e);if(document.getElementById)return(document.getElementById(e));return(eval(e))}

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
    'icons/marker_20_red.png',
    new google.maps.Size(12,20),
    new google.maps.Point(0,0),
    new google.maps.Point(6,16)
);
var tinyShadow = new google.maps.MarkerImage(
    'icons/marker_20_shadow.png',
    new google.maps.Size(22,20),
    new google.maps.Point(6,20),
    new google.maps.Point(5,1)
);
var imageNormal = new google.maps.MarkerImage(
	DOMAIN+"/Content/images/square.png",
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);
var imageHover = new google.maps.MarkerImage(
	DOMAIN+"/Content/images/square_over.png",
	new google.maps.Size(11, 11),
	new google.maps.Point(0, 0),
	new google.maps.Point(6, 6)
);
var imageNormalMidpoint = new google.maps.MarkerImage(
	DOMAIN+"/Content/images/square_transparent.png",
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
//boxText.style.cssText = "border:none; background:transparent url('http://dev-mcweb.it.wsu.edu/jeremys%20sandbox/gMaps/movie_clouds.gif') no-repeat left bottom;";
				

//var geocoder; // = new google.maps.Geocoder();
