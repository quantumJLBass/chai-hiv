var useragent = navigator.userAgent;
var passThroughFormSubmit = false;

function isTouch() {
  if (useragent.indexOf('iPad') != -1 || useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    return true;
  }
  return false;
}

function MySubmitForm(){
     if (passThroughFormSubmit) {
          return true;
     }
     // Do site-specific form validation here, then...
     Asirra_CheckIfHuman(HumanCheckComplete);
     return false;
}
function HumanCheckComplete(isHuman){
     if (!isHuman){
         if($('#fb_uid').length>0 && $('#fb_uid').val()!=''){
                passThroughFormSubmit = true;
              formElt = document.getElementById("mainForm");
              formElt.submit();
         }else{
            if($('#fb_uid').length>0){
                alert("Please try to log in to facebook.");
              }else{
                alert("Please correctly identify the cats.");
              }
          }
     }else{
          passThroughFormSubmit = true;
          formElt = document.getElementById("mainForm");
          formElt.submit();
     }
}

$(function() {


if($('.right_side #twtr-search-widget').length>0){
  new TWTR.Widget({
	  search: 'from:DailyEvergreen',
	  id: 'twtr-search-widget',
	  loop: true,
	  title: 'on Twitter',
	  subject: '',
	  width: 193,
	  height: 300,
	  features: {
		  scrollbar: true,
		  loop: true,
		  live: true,
		  hashtags: true,
		  timestamp: true,
		  avatars: true,
		  behavior: 'default'
	  },
	  theme: {
		  shell: {
			  background: '#7f9d6a',
			  color: '#ffffff'
		  },
		  tweets: {
			  background: '#ffffff',
			  color: '#444444',
			  links: '#1985b5'
		  }
	  }
  }).render().start();
}







	$(".lazy img,img.lazy").lazyload();
	if($('#slider').length>0){
		$('#slider').cycle({
			fx:     'fade',
			speed:  'fast',
			timeout: 5000,
			next:   '#next', 
			prev:   '#prev', 
			pause: 1,
			pauseOnPagerHover: true,
			pager:'#slider_pager',
    		pagerAnchorBuilder: function(idx, slide) {return '<li><a href="#">&#149;</a></li>';     } 
		});
    }

	if($('.imgroto').length>0){
		$('.imgroto').cycle({
			fx:     'fade',
			speed:  'fast',
			timeout: 5000,
			next:   '.slide_next', 
			prev:   '.slide_prev', 
			pause: 1
		});
    }



	if($('.horizontal_scroller').length>0){
	    $('.horizontal_scroller').SetScroller({
	    	velocity: 	 70,
		    direction: 	 'horizontal',
		    startfrom: 	 'right',
		    loop:		 'infinite',
		    movetype: 	 'linear',
		    onmouseover: 'pause',
		    onmouseout:  'play',
		    onstartup: 	 'play',
		    cursor: 	 'pointer'
	    });
	}



    if($("#comment_comments").length>0){
        var hb_skin_silk_icons = $("#comment_comments").css("height","100").css("width","600").htmlbox({
            toolbars:[
	             ["bold","italic","underline","strike","sub","sup","separator_dots","separator_dots",
		         "left","center","right","justify","separator_dots","ol","ul","indent","outdent"]
	        ],
	        idir:"../content/images/",
	        icons:"silk",
	        skin:"green",
	        about:false
        });
    }
     if($("#comment_comments_home").length>0){
        var hb_skin_silk_icons = $("#comment_comments_home").css("height","100").css("width","600").htmlbox({
            toolbars:[
	             ["bold","italic","underline","strike","sub","sup","separator_dots","separator_dots",
		         "left","center","right","justify","separator_dots","ol","ul","indent","outdent"]
	        ],
	        idir:"../content/images/",
	        icons:"silk",
	        skin:"green",
	        about:false
        });
    }
    
	if($(".userFlagged").length>0){
	    $(".userFlagged").on("click", function(e){
			if($(this).val()==""){
			    e.preventDefault();
			    e.stopPropagation();
				$(this).attr("name","flagged").val("yes").click();
			}
	    });
	}
	var click_arr = new Array();
    if(isTouch()){
        $('.main a').on('click',function(e){
            e.preventDefault();
            var el = $(this);
            var link = el.attr('href');            
            var i='c'+$(this).index($('.main a'));
            if(typeof(click_arr[i]) === 'undefined'){click_arr[i]=0;}
            //alert(click_arr[i]);
            if(click_arr['c'+i]>0){
                window.location = link; 
            }
            click_arr[i]=click_arr[i]+1;        
        });
    }
    
    
	$('.selectedImage').on('click',function(e){
		e.preventDefault();
		$('#main_Image').attr('src',$(this).find('img').attr('src'));
	});
		
	
	$('.comments.uFlaged h3').on('click',function(){
		var obj=$(this);
		$(this).next('div').slideToggle('slow', function() {
			obj.find('em').html()=='-'?obj.find('em').html('+'):obj.find('em').html('-');
		});
	});
	
	$('#classified_main h3').on('click',function(){
		var obj=$(this);
	   $(this).next('div').slideToggle('fast', function() {
		obj.find('em').html()=='-'?obj.find('em').html('+'):obj.find('em').html('-');
	   });
	   
	});
  
  
  function youtube(url){
	  var html='<iframe title="YouTube video player" width="480" height="390" src="http://www.youtube.com/embed/'+url+'" frameborder="0" allowfullscreen></iframe>';
	  return html;  
	}

	if($('a.mediaLinks').length>0){
		//$("a.mediaLinks").hover(function(){medialinK='http://www.digitalbarn.tv/'+$(this).attr('href');},function(){});
		
		$("a.mediaLinks.youtube").click(function(e){
			
			e.preventDefault();
			var url = $(this).attr("href");
			$("a.mediaLinks.youtube").colorbox({opacity:0.45,scrolling:false,initialWidth:"438px",innerHeight:"345px",initialWidth:'75px',initialHeight:'50px',iframe:false,resize:true,current:"",title:"",
			html:function(){
				return '<embed src="'+url+'" type="application/x-shockwave-flash" wmode="transparent" width="425" height="344"></embed>';
			}
			
			});
		});
		//$("a.mediaLinks.w480px").colorbox({innerWidth:"480px",innerHeight:"360px",initialWidth:'75px',initialHeight:'50px',inline:true,href:"#MediaPlayer",resize:true,current:"",title:""});
		//$("a.mediaLinks.sm,a.mediaLinks.w864px,a.mediaLinks.w560px,a.mediaLinks.w480px").bind('cbox_complete',function(){openMovie(this.href)});
	}
	function openMovie(url){var u=medialinK.toString();$("#cboxTitle").css("visibility","visible");flowplayer("MediaPlayer","uploads/Videoplayer/flowplayer-3.2.7.swf",flowSettings);flowplayer().play(u).onFinish(function(){$.fn.colorbox.close();});}

	var flowSettings = {
	  clip:{url:"placeholder.flv",autoPlay:false},
		canvas:{background:'#FFFFFF'},
		screen:{background:'#FFFFFF'},
		plugins:{controls:{
				autoHide:'always',
				hideDelay:4000,
				backgroundColor:'#570507',
				backgroundGradient:[0.0,0.0],
				fontColor:'#ffffff',
				progressColor:'#FFFFFF',
				progressGradient:'low',
				timeFontColor:'#CCCCCC',
				bufferColor:'#000000',
				sliderColor:'#000000',
				buttonOverColor:'#222222',
				buttonColor:'#000000',
				play:true,
				volume:true,
				mute:true,
				playlist:false
			}
		}
	};

	$("a").each(function() {
		$(this).attr("hideFocus", "true").css("outline", "none");
	});
    
});