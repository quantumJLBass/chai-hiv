/**
 * jCell (c) 2012 jeremyBass 
 *
 * Fork from
 * jCarouselLite - jQuery plugin to navigate images/any content in a carousel style widget.
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Version: 1.0.1
 * Note: Requires jquery 1.2 or above from version 1.0.1
 *
 *  <div class="jCell">
 *      <ul>
 *          <li><img src="image/1.jpg" alt="1"></li>
 *          <li><img src="image/2.jpg" alt="2"></li>
 *          <li><img src="image/3.jpg" alt="3"></li>
 *      </ul>
 * 		<button class="prev">&lt;&lt;</button>
 * 		<button class="next">&gt;&gt;</button>
 *  </div>
 *
 * $(".carousel").jCell({
 *      btnNext: ".next", // (|null) string css seletor of previous nav button
 *      btnPrev: ".prev", // (|null) string css seletor of previous nav button
 *      btnGo: [".0", ".1", ".2"], // (|null) array set nav custom element loctions in the carousel represented by ".0"
 *      scroll: 2, // (|1) int number of cells moved when click next/prev 
 *      mouseWheel: false // (|true) bool mouse-wheel plugin from brandon
 *      auto: 800, // (|null) int time between cells
 *      speed: 500, //(|200) int speed of the sliding speed
 *      easing: "bounceout", (|null) string effect
 *      vertical: true, // (|false) bool up and down direction
 *      circular: false, // (|true) bool loop over on it's self
 *      visible: 4, // (|3) int number of visable cells 
 *      start: 2, // (|0) int index number of starting cell
 *      nav:$('#jCellnav'), // (|null)colection via $(selector)
 *      pauseOnHover:true, // (|false) bool on hover pause action
 *      navTemplate:'<li><a href="#">&bull;</a></li>', //(|null) string default is a li for a ul nav seletor NOTE: {$i} will be replaced by the number
 *      navActive:'active',
 *      beforeStart: function(a) {
 *          alert("Before animation starts:" + a); // callback
 *      },
 *      afterEnd: function(a) {
 *          alert("After animation ends:" + a); // callback
 *      }
 *      onInt: function(a) {
 *          alert("After int:" + a); // callback
 *      }
 * });
 */
var ip="";
function myIP() { 
	if(ip==""){
		if (window.XMLHttpRequest) xmlhttp = new XMLHttpRequest(); 
		else xmlhttp = new ActiveXObject("Microsoft.XMLHTTP"); 
	 
		xmlhttp.open("GET","http://api.hostip.info/get_html.php",false); 
		xmlhttp.send(); 
	 
		hostipInfo = xmlhttp.responseText.split("\n"); 
	 
		for (i=0; hostipInfo.length >= i; i++) { 
			ipAddress = hostipInfo[i].split(":"); 
			if ( ipAddress[0] == "IP" ){
				ip=	jQuery.trim(ipAddress[1]);
				return ip; 
			}
		} 
		return false; 
	}else{
		return ip;
	}
} 

(function($) {
$.fn.jCell = function(o) {
    o = $.extend({
        btnPrev: null,
        btnNext: null,
        btnGo: null,
        mouseWheel: false,
        auto: null,
        speed: 200,
        easing: null,
        vertical: false,
        circular: true,
        visible: 3,
        start: 0,
        scroll: 1,
		nav:null,
		pauseOnHover:false,
		navTemplate:'<li><a href="#">&bull;</a></li>',
		navActive:'active',
        beforeStart: null,
        afterEnd: null,
		onInt:null
    }, o || {});

    return this.each(function() {

        var running = false, animCss=o.vertical?"top":"left", sizeCss=o.vertical?"height":"width";
        var div = $(this), ul = $("ul", div), tLi = $("li", ul), tl = tLi.size(), v = o.visible;
		var navpos = 0;
		var extra = tLi.slice(tl-v-1+1).size() + tLi.slice(0,v).size();
		
		//alert(extra);
		
        if(o.circular) {
            ul.prepend(tLi.slice(tl-v-1+1).clone())
              .append(tLi.slice(0,v).clone());
            o.start += v;
        }

        var li = $("li", ul), itemLength = li.size(), curr = o.start;
        div.css("visibility", "visible");

        li.css({overflow: "hidden", float: o.vertical ? "none" : "left"});
        ul.css({margin: "0", padding: "0", position: "relative", "list-style-type": "none", "z-index": "1"});
        div.css({overflow: "hidden", position: "relative", "z-index": "2", left: "0px"});
        var liSize = o.vertical ? height(li) : width(li);   // Full li size(incl margin)-Used for animation
        var ulSize = liSize * itemLength;                   // size of full ul(total length, not just for the visible items)
        var divSize = liSize * v;                           // size of entire div(total length for just the visible items)

        li.css({width: li.width(), height: li.height()});
        ul.css(sizeCss, ulSize+"px").css(animCss, -(curr*liSize));

        div.css(sizeCss, divSize+"px");                     // Width of the DIV. length of visible images

        if(o.btnPrev)
            $(o.btnPrev).click(function() {
                return go(curr-o.scroll);
            });
        if(o.btnNext)
            $(o.btnNext).click(function() {
                return go(curr+o.scroll);
            });
        if(o.btnGo)
            $.each(o.btnGo, function(i, val) {
                $(val).click(function() {
                    return go(o.circular ? o.visible+i : i);
                });
            });
        if(o.mouseWheel && div.mousewheel)
            div.mousewheel(function(e, d) {
                return d>0 ? go(curr-o.scroll) : go(curr+o.scroll);
            });
        if(o.auto)
            setInterval(function() {
                go(curr+o.scroll);
            }, o.auto+o.speed);
		if(o.nav){
			o.nav.html('');
			$.each(tLi,function(i,v){o.nav.append(o.navTemplate.replace("{$i}",i));});
			if(o.nav){selectNav(navpos);}
			$.each(o.nav.children(),function(i,v){
				$(this).on('click',function(e){
					e.preventDefault();
					e.stopPropagation();
					go(o.circular ? o.visible+i : i);
					selectNav(i);
				});
			});
		}
		
		if(o.onInt) o.onInt.call(this, div);
		
		
		function selectNav(i){
			o.nav.find("."+o.navActive).removeClass(o.navActive);
			o.nav.children().eq(i).addClass(o.navActive);
		}
        function vis() {
            return li.slice(curr).slice(0,v);
        };
        function go(to) {
            if(!running) {
                if(o.beforeStart)
                    o.beforeStart.call(this, vis());
                if(o.circular) {            // If circular we are in first or last, then goto the other end
                    if(to<=o.start-v-1) {           // If first, then goto last
                        ul.css(animCss, -((itemLength-(v*2))*liSize)+"px");
                        // If "scroll" > 1, then the "to" might not be equal to the condition; it can be lesser depending on the number of elements.
                        curr = to==o.start-v-1 ? itemLength-(v*2)-1 : itemLength-(v*2)-o.scroll;
                    } else if(to>=itemLength-v+1) { // If last, then goto first
                        ul.css(animCss, -( (v) * liSize ) + "px" );
                        // If "scroll" > 1, then the "to" might not be equal to the condition; it can be greater depending on the number of elements.
                        curr = to==itemLength-v+1 ? v+1 : v+o.scroll;
                    } else {
						curr = to;
					}
					if(to>tl){
						navpos = (to-1)-tl;
					}else{
						navpos = (to-1);
					}
                } else {
                    if(to<0 || to>itemLength-v) return;
                    else curr = to;
					navpos = (to-1);
                }
				
				if(o.nav){selectNav(navpos);}

                running = true;
                ul.animate(
                    animCss == "left" ? { left: -(curr*liSize) } : { top: -(curr*liSize) } , o.speed, o.easing,
                    function() {
						
                        if(o.afterEnd)
                            o.afterEnd.call(this, vis());
                        running = false;
                    }
                );

                // Disable buttons when the carousel reaches the last/first, and enable when not
                if(!o.circular) {
                    $(o.btnPrev + "," + o.btnNext).removeClass("disabled");
                    $( (curr-o.scroll<0 && o.btnPrev)
                        ||
                       (curr+o.scroll > itemLength-v && o.btnNext)
                        ||
                       []
                     ).addClass("disabled");
                }
            }
            return false;
        };
    });
};

function css(el, prop) {
    return parseInt($.css(el[0], prop)) || 0;
};
function width(el) {
    return  $(el[0]).width() + css(el, 'marginLeft') + css(el, 'marginRight');
};
function height(el) {
    return  $(el[0]).height() + css(el, 'marginTop') + css(el, 'marginBottom');
};

})(jQuery);