/*
* WSU TRACKING BOOTSCRIPT
* Version 0.1
* Copyright (c) 2011-12 Jeremy Bass
* Licensed under the MIT license:
* http://www.opensource.org/licenses/mit-license.php
*/
function async_load_js(url){var headID = document.getElementsByTagName("head")[0];var s = document.createElement('script');s.type = 'text/javascript';s.async = true;s.src = url;var x = document.getElementsByTagName('script')[0];headID.appendChild(s);}
function param( name , process_url ){if(typeof(process_url)==='undefined'){process_url=window.location.href;}name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var regexS = "[\\?&]"+name+"=([^&#]*)";var regex = new RegExp( regexS );var results = regex.exec( process_url );if( results == null ){ return false;}else{return results[1];}}

url = document.getElementById('boot').src; 
ver_jquery=(param( 'jquery' , url )!=false?param( 'jquery' , url ):'1.7.2');

if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery!=ver_jquery || jQuery.fn.jquery!=ver_jquery) ){
	async_load_js('https://ajax.googleapis.com/ajax/libs/jquery/'+ver_jquery+'/jquery.min.js');
}	
load_base(url);
function load_base(url) {		
	setTimeout(function(){		   
		if((typeof(jQuery) === 'undefined'||typeof($) === 'undefined') || (jQuery().jquery!=ver_jquery || jQuery.fn.jquery!=ver_jquery) ){
			load_base(url);
		}else{
			(function($) {
				scriptArray = [ // this is where we'd load the scriptArray list dynamicly.  Right now it's hard coded
					{
						src:"https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js",
						async:false,
						exc:function(){}
					},{
						src:"http://images.wsu.edu/javascripts/jQuery_UI_addons/jquery-ui-timepicker-addon.js",
						async:false
					},{
						src:"http://images.wsu.edu/javascripts/jQuery_UI_addons/jquery-ui-combobox.js",
						async:false
					},{
						src:"/content/js/jquery.dialog.extra.js",
						async:false
					},{
						src:"/Content/js/utilities_general.js",
						async:false
					},{
						src:"/content/js/colorpicker/jpicker-1.1.6.min.js"
					},{
						src:"http://dev-mcweb.it.wsu.edu/jeremys%20sandbox/gMaps/infobox.js"
					},{
						src:"/Content/js/external/jquery.cookie.js"
					},{
						src:"/content/js/tinymce/tinymce/jscripts/tiny_mce/tiny_mce.js"
					},{
						src:"http://images.wsu.edu/javascripts/jquery.lazyload.js"
					},{
						src:"http://images.wsu.edu/javascripts/jqueryFileUpload.js"
					},{
						//src:"/Content/js/jquery.ui.map.js"
					},{
						src:"/Content/js/jquery.ui.map.extensions.js"
					},{
						src:"/Content/js/jquery.ui.map.services.js"
					},{
						src:"/Content/js/jquery.ui.map.overlays.js"
					},{
						//src:"/Content/js/jquery.ui.map.drawingmanager.js"
					},{
						src:"/Content/js/map_editor_vars.js"
					},{
						src:"/Content/js/map_functions.js"
					},{
						src:"/Content/js/admin_ui__media.js"
					},{
						src:"/Content/js/admin_ui__tinymce.js"
					},{
						src:"/Content/js/init_test.js"
					},{
						src:"/Content/js/admin_init.js"
					}
				];
				$.each(scriptArray, function(i,v){
					var async = typeof(v.async)!=='undefined'?v.async:true;
					$.ajax({
						async:async,
						type:"GET",dataType:"script",cache:true,url:v.src,
						success: function() { typeof(v.exc)!=='undefined'?v.exc():'';}
					});
				});
			}(jQuery));
		}
	},50);
}