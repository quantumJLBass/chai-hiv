if(typeof(loading)==='undefined'){var loading='';}
utilities={};
/* setup VARS */
var c=0;

/* -----------
    utility functions 
    -----------------------*/
function async_load_css(url,callback){var headID = document.getElementsByTagName("head")[0],node = document.createElement('link');node.type = 'text/css';node.rel = 'stylesheet';node.href = url;node.media = 'screen';headID.appendChild(node);}
function async_load_js(url,callback){var headID = document.getElementsByTagName("head")[0], s = document.createElement('script');s.type = 'text/javascript';s.async = true;s.src = url;var x = document.getElementsByTagName('script')[0];if(typeof(callback)!=='undefined' && typeof(callback.onreadystatechange)==='undefined'){s.onreadystatechange = callback.onreadystatechange;s.onload = callback.onload; } headID.appendChild(s);}
function defined(obj){return typeof(obj)!=='undefined';}
function shuffle(ary){return ary.sort(function(){ Math.random() - 0.5})}
function isNumber(n) {   return !isNaN(parseFloat(n)) && isFinite(n); } 
function split( val ) {return val.split( /,\s*/ );}
function extractLast( term ) {return split( term ).pop();}

//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's URL funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------	
(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})($);

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};

var url_parts = parseUri(window.location);

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};
	function param(name,url){url=(typeof(url)==='undefined'?window.location.href:url);name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS = "[\\?&]"+name+"=([^&#]*)";var regex = new RegExp( regexS );var results = regex.exec( url );if( results == null ) return false; else return results[1];}
	
///* hash handlings  *///
	$(window).bind('load', function() {
		//If we use it as docs page, go to the selected option
		if(window.location.hash && window.location.href.indexOf('/docs/') != -1) {
			gotoHash();
		}
	});
	function listenToHashChange() {
		var savedHash = window.location.hash;
		window.setInterval(function() {
			if(savedHash != window.location.hash) {
				savedHash = window.location.hash;
				if(window.location.hash && window.location.href.indexOf('/docs/') != -1)
				gotoHash();
				//Since we have bind click event on demos link and load hash on document.ready
				//if(window.location.hash && window.location.href.indexOf('/demos/') != -1)
				// loadHash();
			}
		},200);
	}
	function loadHash() {
		$('#demo-config-menu a').each(function() {
			if(this.getAttribute('href').indexOf('/'+window.location.hash.substr(1)+'.html') != -1) {
				$(this).parents('ul').find('li').removeClass('demo-config-on');
				$(this).parent().addClass('demo-config-on');
				loadDemo(this.getAttribute('href'));
			}
		});
	}
	function gotoHash() {
		var hash = window.location.hash.substr(1).split('-');
		var go = hash[1] ? hash[1] : hash[0];
		var resolve = { overview: 0,option: 1,event: 2,method: 3,theming: 4 };
		$("#widget-docs").tabs('select', resolve[hash[0]]);
		var h3 = $("#widget-docs a:contains("+go+")").parent();
		h3.parent().parent().toggleClass("param-open").end().next().toggle();
		$(document).scrollTop(h3.parent().effect('highlight', null, 2000).offset().top);
	}
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's timer funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------

function clearCount(timer){
	if(typeof(timers_arr)!=='undefined' && typeof(timers_arr[timer])!=='undefined'){
		/// clear the time from timer
		clearTimeout(timers_arr[timer]);
		/// Make sure it's clear  
		timers_arr[''+timer+'']=0;
		delete timers_arr[''+timer+''];
	}
}
function setCount(timer,time,func){
	if(typeof(timers_arr)==='undefined'){var timers_arr = new Array();}
	clearCount(timer);
	if(timers_arr[timer]==0||typeof(timers_arr[timer]) === 'undefined'){
	  timers_arr[timer]=setTimeout(function(){
			   func();                                                 
	  },time);
	}
}
		
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's Browser funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
var inTouch=false;
function isTouch() 	{if ( isIpad() || isMobile()) {return true;}return false;}
function isIpad() 	{if ( navigator.userAgent.indexOf('iPad') != -1 ) {return true;}return false;}
function isMobile() {if ( navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('Android') != -1 ) {return true;}return false;}





//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's Cache and load Control funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
$.fn.preload = function() {
	if($('#preloader').length==0){$('body').append('<div id="preloader" style="position:absolute;top:-9999px;left:-9999px;"></div>')}
	this.each(function(){
		$('#preloader').append('<img src="'+this+'" style="position:absolute;top:-9999px;left:-9999px;"/>');
	});
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's color space funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------	
function color_html2kml(color){
    var newcolor ="FFFFFF";
    if(color.length == 7) newcolor = color.substring(5,7)+color.substring(3,5)+color.substring(1,3);
    return newcolor;
}
function color_hex2dec(color) {
    var deccolor = "255,0,0";
    var dec1 = parseInt(color.substring(1,3),16);
    var dec2 = parseInt(color.substring(3,5),16);
    var dec3 = parseInt(color.substring(5,7),16);
    if(color.length == 7) deccolor = dec1+','+dec2+','+dec3;
    return deccolor;
}
function getopacityhex(opa){
    var hexopa = "66";
    if(opa == 0) hexopa = "00";
    if(opa == .0) hexopa = "00";
    if(opa >= .1) hexopa = "1A";
    if(opa >= .2) hexopa = "33";
    if(opa >= .3) hexopa = "4D";
    if(opa >= .4) hexopa = "66";
    if(opa >= .5) hexopa = "80";
    if(opa >= .6) hexopa = "9A";
    if(opa >= .7) hexopa = "B3";
    if(opa >= .8) hexopa = "CD";
    if(opa >= .9) hexopa = "E6";
    if(opa == 1.0) hexopa = "FF";
    if(opa == 1) hexopa = "FF";
    return hexopa;
}






//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's debuging funtions
//-------------------------------------------------------------------------------------------------------------------------------------------------------------	

	function dump(n,t){var i="",f,e,r,u;for(t||(t=0),f="",e=0;e<t+1;e++)f+=" ";if(typeof n=="object")for(r in n)u=n[r],typeof u=="object"?(i+=f+"'"+r+"' ...\n",i+=dump(u,t+1)):i+=f+"'"+r+"' => \""+u+'"\n';else i="===>"+n+"<===("+typeof n+")";return i}

	
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
// jeremy's TRACKING UTILIIES
// example
//	_parts['editor']='';
//	_parts['currentProcess']='';
//	id='CSS1';
//	track_[id]=_parts;
//-------------------------------------------------------------------------------------------------------------------------------------------------------------
//var track_ = new Array();
	function add_to_tracker(id,part_name,part_value){
		if(typeof(track_)==='undefined'){window['track_']=new Array();}
		if(typeof(track_._parts)==='undefined'){
			var _parts = new Array();
		}
		_parts[part_name]=part_value;
		track_[id]=_parts;
	}
	function remove_from_tracker(id,part_name){
		//try{
			if((typeof(id)!=='undefined'&&id!='')&&(typeof(part_name)==='undefined'||part_name=='')){
				track_[''+id+'']=0;
				delete track_[''+id+''];
			}else if((typeof(id)!=='undefined'&&id!='')&&(typeof(part_name)!=='undefined'&&part_name!='')){
				track_[''+id+'']._parts[''+part_name+'']=0;
				delete track_[''+id+'']._parts[''+part_name+''];
			}
		//}catch(err){
		//}
	}
	
	function get_from_tracker(id,part_name){
		var value = false;
			if((typeof(id)!=='undefined'&&id!='')&&(typeof(part_name)==='undefined'||part_name=='')){
				value = track_[''+id+''];
			}else if((typeof(id)!=='undefined'&&id!='')&&(typeof(part_name)!=='undefined'&&part_name!='')){
				//value = track_[''+id+'']._parts[''+part_name+''];
				value = track_[''+id+''][''+part_name+''];
			}
		return value
	}