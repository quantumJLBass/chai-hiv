#region Directives
using stellar.Models;
using stellar.Services;

using System;
using System.Data;
using System.Globalization;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

using NVelocity;
using NVelocity.App;
using NVelocity.App.Events;
using NVelocity.Util;
using NVelocity.Tool;
using NVelocity.Context;
using NVelocity.Runtime;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
//using MonoRailHelper;
using System.Xml;
using Commons.Collections;
using System.Collections;
using log4net;
using log4net.Config;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;

using Castle.MonoRail.Framework;

using stellar.Controllers;
using System.Dynamic;
using System.Linq;
using Omu.ValueInjecter;
using AutoMapper;

#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class editingService {
        ILog log = log4net.LogManager.GetLogger("devService");

        /// <summary> </summary>
        public static String make_editable(String txt, posting post, int areacount) {
            String draft = "";

            post = post.get_working_copy();
            if (post.has_draft())
                draft = "data-has_draft='true'";

            String status = "data-status='false'";
            if (post.is_published())
                status = "data-status='true'";

            txt = "<bdo data-id='" + post.baseid + "' " + draft + " " + status + " data-type='" + post.post_type.alias + "' data-name='" + post.name + "' data-alias='" + post.alias + "' data-blockid='" + areacount + "' class='editor_block'>" + txt + "</bdo>";

            return txt;
        }

        /// <summary> </summary>
        public static String ini_editor(String html, posting post, IDictionary PropertyBag) {
            return new editingService().setup_visiable_editor(html, post, PropertyBag);
        }

        /// <summary> </summary>
        public String setup_visiable_editor(String html, posting post, IDictionary PropertyBag) {

            // bool ActiveRecordBase<site_base>.FindFirst(new List<AbstractCriterion>() { Expression.Eq("name", "minhtml") }.ToArray())
            //Boolean tmpB = true;
            //if (tmpB) output = stripNonSenseContent(output, false);

            //@todo Pull out and refactor next few blocks
            Boolean has_head_start = false;

            string headsrtRegex = @"</head>";
            RegexOptions headRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            Regex headRegex = new Regex(headsrtRegex, headRegexOptions);

            has_head_start = headRegex.IsMatch(html);
            if (has_head_start) {
                string head_pattern = @"(?<target>\</head\>)";
                MatchCollection head_matches = Regex.Matches(html, head_pattern);
                foreach (Match matched in head_matches) {
                    String head = matched.Groups["target"].Value;
                    String js_path = scriptsService.Js("jquery.pageslide.js,/tinymce/tinymce/jscripts/tiny_mce/tiny_mce.js,/codemirror/codemirror.js,/codemirror/addon/runmode/runmode.js,/codemirror/mode/css/css.js,/codemirror/mode/xml/xml.js,/codemirror/mode/javascript/javascript.js,/codemirror/mode/htmlmixed/htmlmixed.js,/codemirror/addon/hint/simple-hint.js,/codemirror/addon/hint/javascript-hint.js,/codemirror/addon/dialog/dialog.js,/codemirror/addon/search/searchcursor.js,/codemirror/addon/search/search.js,/codemirror/addon/fold/foldcode.js,/admin_ui.js,/admin_ui__media.js,/admin_ui__tinymce.js,/admin_ui__code_editor.js,/admin_ui__editors.js,init_test.js,/admin_ini.js,/admin_init.js,visible_editor.js", "admin", true);

                    String css_path = scriptsService.Css("visible_editor.css", "admin", true);

                    html = html.Replace(head, js_path + "<link media='screen' href='http://images.wsu.edu/css/wsu_ui_default/jquery-ui-1.9.0.custom.min.css' 	type='text/css' rel='stylesheet' />" + css_path + head);
                }
            }

            //@todo Pull out and refactor next few blocks
            Boolean has_body_start = false;
            string bodysrtRegex = @"<body";
            RegexOptions bodyRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            Regex bodyRegex = new Regex(bodysrtRegex, bodyRegexOptions);

            String renderPath = file_info.root_path();
            String settings_template = System.IO.File.ReadAllText(renderPath + "Views/admin/visible_editor/settings.vm");

            PropertyBag["item"] = post;
            //PropertyBag["user_fields"] = user_fields;
            //PropertyBag["fields"] = fields;

            //Hashtable contentblocks = objectService.marge_params(postingService.get_published_postings("contentblock").ToArray(), new Hashtable());
            PropertyBag["post"] = post;
            PropertyBag["taxonomy"] = ActiveRecordBase<taxonomy_type>.FindAll();

            PropertyBag["postCustom"] = file_info.DirSearch("/Views/admin/postings/custom_post_blocks/" + post.post_type.alias + "/editor_blocks/", ".vm", @"\\editor_blocks\\");
            PropertyBag["used_contentblocks"] = postingService.get_published_postings("contentblock").ToArray();//used_contentblocks;
            PropertyBag["named_type"] = post.post_type.alias;
            PropertyBag["named_type_dname"] = post.post_type.name;
            PropertyBag["item"] = post;



            PropertyBag["posting_templates"] = themeService.get_published_templates("posting_template");
            PropertyBag["layout_templates"] = themeService.get_published_templates("layout_template");



            Hashtable settings_params = objectService.marge_params(PropertyBag,new Hashtable());// contentblocks);
            settings_template = renderService.proccessText(settings_params, settings_template);

            has_body_start = bodyRegex.IsMatch(html);
            if (has_body_start) {
                string body_pattern = @"(?<target><body(?<options>(.*?))>)";
                MatchCollection body_matches = Regex.Matches(html, body_pattern);
                foreach (Match matched in body_matches) {
                    String body = matched.Groups["target"].Value;
                    html = html.Replace(body, body + "<div id='stellar_visible_editor'>" + settings_template);
                }
            }
            Boolean has_body_end = false;
            bodysrtRegex = @"</body>";
            bodyRegex = new Regex(bodysrtRegex, bodyRegexOptions);
            has_body_end = bodyRegex.IsMatch(html);
            if (has_body_end) {
                string body_pattern = @"(?<target>\</body\>)";
                MatchCollection body_matches = Regex.Matches(html, body_pattern);
                foreach (Match matched in body_matches) {
                    String body = matched.Groups["target"].Value;
                    html = html.Replace(body, "</div></body>");
                }
            }



            return html;
        }






    }

}
