function load_codemirror(){
	
	if( $("#code").data("editable")==true ){
		//Make the editor bars and wrap here first
		$("#code").after('<a href="#" id="wrap">Wrappning - <strong>ON</strong></a> || <a href="#" id="format_selection"> Autoformat Selected </a> || <a href="#"  id="comment_selection"> Comment Selected </a> || <a href="#" id="uncomment_selection"> Uncomment Selected  </a> || Choose theme <select id="selectTheme">    <option>default</option>    <option selected>ambiance</option>    <option>blackboard</option>    <option>cobalt</option>    <option>eclipse</option>    <option>elegant</option>    <option>erlang-dark</option>    <option>lesser-dark</option>    <option>monokai</option>    <option>neat</option>    <option>night</option>    <option>rubyblue</option>    <option>solarized dark</option>    <option>solarized light</option>    <option>twilight</option>    <option>vibrant-ink</option>    <option>xq-dark</option></select><h3>editor tips:</h3><ul><li><span>Press F11 when cursor is in the editor to toggle full screen editing. Esc can also be used to exit full screen editing.</span></li><li><span>Press Ctrl+Space for code hints with cursor in code area.</span></li><li><span>Press Ctrl+f to bring up the scearch bar with reg/ex support with cursor in code area.</span></li> <li><span>Press Ctrl+Q to fold a html node that you have the cursor at.  This will not save at that moment</span></li></ul>');
	}
	var theme= ( typeof($("#code").attr("rel"))!=="undefined" )  ? $("#code").attr("rel") : (  ($('#selectTheme').length) ? $('#selectTheme').val() : "ambiance"  ) ;

	var options = {
      lineNumbers: true,
	  lineWrapping: true,
	  mode: "htmlmixed",
      extraKeys: {
        "F11": function(cm) {
          setFullScreen(cm, !isFullScreen(cm));
        },
        "Esc": function(cm) {
          if ($('.CodeMirror-fullscreen').length) setFullScreen(cm, false);
        },
		"Ctrl-Space": function(cm) {
			var editorDiv = jQuery('.CodeMirror-scroll');
			if (!editorDiv.hasClass('fullscreen')) {
				return CodeMirror.simpleHint(cm, CodeMirror.javascriptHint);
			}
        },
		"Ctrl-Q": function(cm){foldFunc_html(cm, cm.getCursor().line);}
      },
	  onGutterClick: function(cm, n) {
		var info = cm.lineInfo(n);
		if (info.markerText)
			cm.clearMarker(n);
		else
			cm.setMarker(n, "● %N%");
		}
    };

	var foldFunc_html = CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
	if(theme)$.extend(options,{theme:theme})
	var codearea = document.getElementById("code");
	
    var editor = CodeMirror.fromTextArea(codearea, options);
	editor.on("gutterClick", foldFunc_html);
	
	$(window).resize(function(){
		if($('.CodeMirror-fullscreen').length){
			var showing = $('.CodeMirror-fullscreen');
			if (!showing) return;
			var wrap = editor.getWrapperElement();
			wrap.style.height = winHeight()-$("#adminNav").height() + "px";
		}
	});
	
	var tabsOps = 
		function (event, ui) {
			if ($('.tinyEditor').length) {
				tinyMCE.triggerSave();
				tinyResize();
			}
			if ($('#code').length) {
				if( typeof (editor) !== 'undefined')editor.refresh();
				if( typeof (cm) !== 'undefined')cm.refresh();
			}
		};
	
	if ($(".sub_tabs").length > 0) {
        $(".sub_tabs").each(function () {
            $(this).tabs("option","activate",tabsOps);
        });
    }
    if ($(".tabs").length > 0) {
        $(".tabs").each(function () {
            $(this).tabs("option","activate",tabsOps);
        });
    }	

	
	
	
	$("#format_selection").on("click",function(e){
		e.preventDefault;
		autoFormatSelection(editor);
	});
	//CodeMirror.commands["selectAll"](editor);
	
	$("#format_selection").on("click",function(e){
		e.preventDefault;
		autoFormatSelection(editor);
	});
	$("#comment_selection").on("click",function(e){
		e.preventDefault;
		commentSelection(true,editor);
	});
	$("#uncomment_selection").on("click",function(e){
		e.preventDefault;
		commentSelection(false,editor);
	});	
	$("#selectTheme").on("change",function(e){
		editor.setOption("theme", $(this).val());
	});	
	$("#wrap").on("click",function(e){
		e.preventDefault;
		if($("#wrap").text()=="Wrappning - OFF"){
			$("#wrap").html("Wrappning - <strong>ON</strong>");
			 var setAs = true;
		}else{
			$("#wrap").html("Wrappning - <strong>OFF</strong>");
			var setAs = false;
		}
		editor.setOption("lineWrapping",setAs);
	});		

}


function isFullScreen(cm) {
	return /\bCodeMirror-fullscreen\b/.test(cm.getWrapperElement().className);
}
function winHeight() {
	return window.innerHeight || (document.documentElement || document.body).clientHeight;
}
function setFullScreen(cm, full) {
	var wrap = cm.getWrapperElement();
	if (full) {
		$("body").addClass("CodeMirror-fullscreen");
		$("#adminNav").addClass('fixed');
		wrap.style.height = winHeight()-$("#adminNav").height() + "px";
		document.documentElement.style.overflow = "hidden";
	} else {
		$("body").removeClass("CodeMirror-fullscreen");
		$("#adminNav").removeClass('fixed');
		wrap.style.height = "";
		document.documentElement.style.overflow = "";
	}
	cm.refresh();
}

function getSelectedRange(editor) {
	return { from: editor.getCursor(true), to: editor.getCursor(false) };
}

function autoFormatSelection(editor) {
	var range = getSelectedRange(editor);
	editor.autoFormatRange(range.from, range.to);
}

function commentSelection(isComment,editor) {
	var range = getSelectedRange(editor), selStart = editor.getCursor("start");
	editor.commentRange(isComment, range.from, range.to);
	editor.setSelection(selStart, editor.getCursor("end"));
}  




function selectTheme(node) {
	var theme = node.options[node.selectedIndex].value;
	var editorDiv = jQuery('.CodeMirror-scroll');
	editor.setOption("theme", theme);
}

function toggleFullscreenEditing(){
	var editorDiv = jQuery('.CodeMirror-scroll');
	var toolbarDiv = jQuery('#cfc-toolbar');
	if (!editorDiv.hasClass('fullscreen')) {
		toggleFullscreenEditing.beforeFullscreen = { height: editorDiv.height(), width: editorDiv.width() }
		editorDiv.addClass('fullscreen');
		editorDiv.height('89%');
		editorDiv.width('100%');
		toolbarDiv.addClass('cfc-toolbar-full');
		editor.refresh();
	} else {
		editorDiv.removeClass('fullscreen');
		toolbarDiv.removeClass('cfc-toolbar-full');
		editorDiv.height(toggleFullscreenEditing.beforeFullscreen.height);
		editorDiv.width(toggleFullscreenEditing.beforeFullscreen.width);
		editor.refresh();
	}
}

//var formMain = document.getElementById('template');
//formMain.removeAttribute('id');
var lastPos = null, lastQuery = null, marked = [];

function unmark() {
	for (var i = 0; i < marked.length; ++i) marked[i].clear();
	marked.length = 0;
}

function search() {
	unmark();                     
	var text = document.getElementById("query").value;
	if (!text) return;
	for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
		marked.push(editor.markText(cursor.from(), cursor.to(), "searched"));

	if (lastQuery != text) lastPos = null;
	var cursor = editor.getSearchCursor(text, lastPos || editor.getCursor());
	if (!cursor.findNext()) {
		cursor = editor.getSearchCursor(text);
		if (!cursor.findNext()) return;
	}
	editor.setSelection(cursor.from(), cursor.to());
	lastQuery = text; lastPos = cursor.to();
}

function replace() {
	unmark();
	var text = document.getElementById("query").value,
	replace = document.getElementById("replace_str").value;
	if (!text) return;
	var cursor = editor.getSearchCursor(text);
	cursor.findNext();
	if (!cursor) return;
	editor.replaceRange(replace, cursor.from(), cursor.to());
	editor.setSelection(cursor.from(), cursor.to());
}

function replace_all() {
	unmark();
	var text = document.getElementById("query").value,
	  replace = document.getElementById("replace_str").value;
	if (!text) return;
	for (var cursor = editor.getSearchCursor(text); cursor.findNext();)
		cursor.replace(replace);
}

function clear_result(){
	lastQuery = null;
	lastPos = null;
	unmark();
	document.getElementById("query").value = '';
	document.getElementById("replace_str").value = '';
}

function save_all() {
	document.getElementById('submit').click();
}






