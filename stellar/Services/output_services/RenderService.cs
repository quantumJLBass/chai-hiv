#region Directives
using stellar.Models;
using stellar.Services;

using System;
using System.Linq;
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
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class renderService {
        ILog log = log4net.LogManager.GetLogger("renderService");

        /*
         * Get the value of a field that is attached to the 
         * place.
         */

        private int areacount = 0;
        private List<posting> used_contentblocks = new List<posting>();
        private Hashtable PropertyBag = new Hashtable();


        /// <summary> </summary>
        public static string get_field_value(field_types field_type, posting _post) {
            string value = "";
            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("type", field_type));
            if (!object.ReferenceEquals(_post, null)) typeEx.Add(Expression.Eq("owner", _post.baseid));
            fields field = ActiveRecordBase<fields>.FindFirst(typeEx.ToArray());
            value = fieldsService.getFieldVal(field_type, field);
            return value;
        }

        //NOTE THIS SHOULD HAVE NOT TIE TO A "POSTING" BUT ABLE TO PROSSCESS ANYTHING
        /// <summary> </summary>
        public static string field_processing(string text, posting place, Hashtable param) {
            return new renderService().process_fields(text, place, param);
        }
        /// <summary> </summary>
        public string process_fields(string text, posting place, Hashtable param) {
            String result = text;
            if (place.post_type != null) {
                List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
                typeEx.Add(Expression.Eq("type", place.post_type.alias));

                field_types[] ft = ActiveRecordBase<field_types>.FindAll(typeEx.ToArray());
                List<string> fields = new List<string>();

                if (ft != null) {
                    foreach (field_types ft_ in ft) {
                        string value = "";
                        if (text.Contains("$!{" + ft_.alias + "}")) {
                            //log.Error("on field:" + ft_.alias);
                            value = get_field_value(ft_, place);
                            result = result.Replace("$!{" + ft_.alias + "}", value);
                            PropertyBag["" + ft_.alias] = value;
                        }
                    }
                }
            }
            return result;
        }






        /// <summary> </summary>
        public static String postrender(String text, posting post, Hashtable param) {
            return new renderService().renderposting(text,post, param);
        }
        /// <summary> </summary>
        public String renderposting(String text, posting post, Hashtable param) {
            //log.Error(" place:" + place.prime_name);
            Hashtable hashtable = param;

            foreach (var key in PropertyBag.Keys) {
                if (!hashtable.ContainsKey(key) && hashtable[key] == null) {
                    hashtable.Add(key, PropertyBag[key]);
                } else {
                    hashtable[key] = PropertyBag[key];
                } 
            }

            if (!hashtable.ContainsKey("Controller")) {
                hashtable.Add("Controller", base.MemberwiseClone()); 
            }else{
                hashtable["Controller"] =  base.MemberwiseClone();
            }
            if (hashtable["item"] == null) {
                hashtable.Add("item", post);
            } else {
                hashtable["item"] = post;
            }



            if (!hashtable.ContainsKey("scriptsService")) { // don't think this is right.. should be there already
                hashtable.Add("scriptsService", new scriptsService());
            } else {
                hashtable["scriptsService"] = new scriptsService();
            }
            if (!hashtable.ContainsKey("htmlService")) {
                hashtable.Add("htmlService", new htmlService()); 
            }else{
                hashtable["htmlService"] = new htmlService();
            }

            param = hashtable;
            String tmp_str = renderService.proccessText(param, processContentblocks(field_processing(text, post, param), post, param), false);

            if (!PropertyBag.ContainsKey(post.post_type.alias + "_" + post.alias)) {
                PropertyBag[post.post_type.alias + "_" + post.alias] = tmp_str;
            }


            return tmp_str;
        }
        /// <summary> </summary>
        public String render(posting post, Hashtable param) {
            String mode = param.ContainsKey("mode") ? param["mode"].ToString() : "published";

            posting pub_post = post.get_published();
            String tmp_str = pub_post.load_content(mode);
            if (!PropertyBag.ContainsKey("post_content") && post.post_type.root
                && !post.post_type.use_layout_templates && !post.post_type.use_posting_templates) {
                PropertyBag["post_content"] = tmp_str;
            }

            posting temp = post.get_template_obj(post.post_type.alias + "_template");
            if (temp!=null) {
                tmp_str = renderposting(temp.load_content(mode), post, objectService.marge_params(PropertyBag, param));
            }

            //param.Add("Controller", base.MemberwiseClone());
            tmp_str = renderposting(tmp_str, post, objectService.marge_params(PropertyBag, param));



            String name = pub_post.name;//for testing only
            if (post.post_type.is_frontend_editable && post.is_frontend_editable && Controllers.BaseController.editing) {
                tmp_str = editingService.make_editable(tmp_str, post, areacount++);
            }

            if (!PropertyBag.ContainsKey("post_content") && post.post_type.root){
                PropertyBag["post_content"] = tmp_str;
            }

            Hashtable post_params = objectService.marge_params(PropertyBag, param);
            

            /* now process the content template RETHINK THIS */
            if (post.post_type.use_posting_templates) {
                
                posting posting_template = post.get_template_obj("posting_template");
                if (posting_template!=null) {

                    tmp_str = renderposting(posting_template.load_content(mode), post, post_params);
                }
                if (!PropertyBag.ContainsKey("childContent") && post.post_type.root) {
                        PropertyBag["childContent"] = tmp_str;
                }
            }else{
                if (!PropertyBag.ContainsKey("childContent") && post.post_type.root) {
                        PropertyBag["childContent"] = tmp_str;
                }
            }
            
            //NOTE THIS SHOULD HAVE FIELDS TEMPLATES SHOULD BE THAT ABLE 
            /* now process the layout */
            if (post.post_type.use_layout_templates) {
                posting layout_template = post.get_template_obj("layout_template");
                if (layout_template != null) {

                    tmp_str = renderposting(layout_template.load_content(mode), post, objectService.marge_params(PropertyBag, param));
                }
            }
            
            Controllers.BaseController.vardump(post_params, "Post:" + post.name , "<code><pre>${1}</pre></code>");
            return tmp_str;
        }


        /* this, the process order, bubbles out ... when started it bubbles in, like the event box model in html*/
        /// <summary> </summary>
        public static String simple_field_layout(String text, posting post, Hashtable param) {
            string processed = renderService.proccessText(param, text, false);
            string feild = renderService.field_processing(processed, post, param);
            return new renderService().processContentblocks(feild, post, param);
        }

        // this will look for code block like this {contentblock alias="header_html"}
        // this is hard code we only alias is accepted.. that needs to change
        /// <summary> </summary>
        public String processContentblocks(string text, posting post, Hashtable paramsbag) {
            string strRegex = @"\#{\w+(\s+(.*?))?\}";
            RegexOptions myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            Regex myRegex = new Regex(strRegex, myRegexOptions);

            if (!String.IsNullOrWhiteSpace(text) && myRegex.IsMatch(text)) {
                /*
                string blockstrRegex = @"(#{(?<block>\w+)\s+alias=""(?<alias>.*?)""})";
                RegexOptions blockRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
                Regex blockRegex = new Regex(blockstrRegex, blockRegexOptions);
                */
                String block = "";
                String controller = "";
                String alias = "";
                String param = "";
                string pattern = @"(?<block>\#\{(?<controller>\w+)?(?<ablock>\s+alias=""(?<alias>.*?)"")?(?:(?<params>(?:[^alias]\w+[=""].*[""])))?\}$?)";
                MatchCollection matches = Regex.Matches(text, pattern);

                foreach (Match match in matches) {
                    block = "";
                    controller = "";
                    alias = "";
                    param = "";

                    block = match.Groups["block"].Value;
                    controller = match.Groups["controller"].Value.ToLower();
                    alias = match.Groups["alias"].Value;
                    param = match.Groups["params"].Value;
                    String tmp_str = "";
                    if (!String.IsNullOrWhiteSpace(controller)) {
                        posting_type type = ActiveRecordBase<posting_type>.FindFirst(
                                                new List<AbstractCriterion>() { 
                                                    Expression.Eq("alias", controller) 
                                               }.ToArray()
                                            );
                        if (type != null) {
                            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                            
                            filtering.Add(Expression.Eq("deleted", false));
                            filtering.Add(Expression.Eq("post_type", type));
                            filtering.Add(Expression.Eq("alias", alias));

                            posting cBlock = ActiveRecordBase<posting>.FindFirst(new Order[] { Order.Desc("version"), Order.Asc("revision"), Order.Desc("sort") }, filtering.ToArray());
                            
                            if (cBlock != null) {
                                if (!Controllers.BaseController.usedev) cBlock = cBlock.get_published(); // find the published version
                                if (post.is_frontend_editable && Controllers.BaseController.editing) { used_contentblocks.Add(cBlock); } 

                                PropertyBag["item"] = cBlock;
                                if (cBlock.post_type.alias=="menu"){
                                    PropertyBag["menuItems"] = cBlock.menuoptions.OrderBy(x => x.sort);
                                }
                                /* now process the posttype templae if there is one /////--->moved to render()
                                String post_type_tmplate = cBlock.get_template(cBlock.post_type.alias + "_template");*/

                                paramsbag = objectService.marge_params(PropertyBag, objectService.pull_params(param, paramsbag));
                                //objectService.params_to_PropertyBag(PropertyBag, paramsbag);
                                Hashtable content_params = objectService.marge_params(PropertyBag, paramsbag);
                                Hashtable paramlist = objectService.pull_params(param, content_params);
                                text = text.Replace(block, render(cBlock, paramlist));
                            } else {
                                if (siteService.debug_mode()) {
                                    tmp_str = "Block error";
                                    text = text.Replace(block, tmp_str);
                                }
                            }
                        } else {

                            if (widgetFactoryService.method_exists(controller)) {
                                //Hashtable paramlist = pull_params(param, new Hashtable());

                                List<string> paramlist = new List<string>();

                                string parampattern = @"(?<block>(?<name>\w+)=""(?<value>.*?)"")";
                                MatchCollection parammatches = Regex.Matches(param, parampattern);
                                foreach (Match matched in parammatches) {
                                    String paramblock = "";
                                    String paramname = "";
                                    String paramvalue = "";

                                    paramblock = matched.Groups["block"].Value;
                                    paramname = matched.Groups["name"].Value.ToLower();
                                    paramvalue = renderService.proccessText(new Hashtable(), matched.Groups["value"].Value, false);

                                    if (!String.IsNullOrWhiteSpace(paramvalue) && !String.IsNullOrWhiteSpace(paramname)) {
                                        paramlist.Add(paramvalue);
                                    }
                                }
                                tmp_str = widgetFactoryService.reference_method(controller, paramlist.ToArray());
                                text = text.Replace(block, tmp_str);
                            } else {
                                if (siteService.debug_mode()) {
                                    tmp_str = "Block error";
                                    text = text.Replace(block, tmp_str);
                                }
                            }
                        }
                    }
                }
            }
            return text;
        }

        #region(NVelocity processing)

        /// <summary> </summary>
        public static String proccessText(bool isConent, Hashtable contextitems, String text, bool usetidy) {
            return htmlService.clearMSWordFormating(proccessText(contextitems, text, usetidy));
        }
        /// <summary> </summary>
        public static String proccessText(bool isConent, Hashtable contextitems, String text) {
            return htmlService.clearMSWordFormating(proccessText(contextitems, text, false));
        }
        /// <summary> </summary>
        public static String proccessText(Hashtable contextitems, String text) {
            return proccessText(contextitems, text, false);
        }
        /// <summary> </summary>
        public static String proccessText(Hashtable contextitems, String text, bool usetidy) {

            text = !String.IsNullOrWhiteSpace(text) ? text : "";
            text = htmlService.cleanTinyCode(text); //@todo : site setting
            text = normalize_phase_paths(text,contextitems);
            // template = template.Replace("#", "${pound}");
            //  if (!template.Contains("#set($pound"))
            // template = "#set($pound = \"#\")" + System.Environment.NewLine + template;
            VelocityEngine engine = new VelocityEngine();
            ExtendedProperties props = setMacros(new ExtendedProperties());
            props.SetProperty("directive.manager", "Castle.MonoRail.Framework.Views.NVelocity.CustomDirectiveManager; Castle.MonoRail.Framework.Views.NVelocity");

            engine.Init(props);

            VelocityContext context = new VelocityContext();
            // attach a new event cartridge 
            //context.AttachEventCartridge(new EventCartridge());
            // add our custom handler to the ReferenceInsertion event 
            // context.EventCartridge.ReferenceInsertion += EventCartridge_ReferenceInsertion; 



            foreach (String key in contextitems.Keys) {
                if (contextitems[key] != null && (contextitems[key]).GetType() == typeof(String)) {
                    String value = contextitems[key].ToString();
                    if (String.IsNullOrEmpty(value.Trim()))
                        value = null;
                    else
                        value = value.Trim();
                    //value = value.Replace("#", "${pound}");
                    context.Put(key, value);
                } else
                    context.Put(key, contextitems[key]);
            }
            StringWriter firstwriter = new StringWriter();
            StringWriter secondwriter = new StringWriter();

            // Merge the regions, render the nav, etc.
            engine.Evaluate(context, firstwriter, "logtag", text);
            String resultingtext = firstwriter.GetStringBuilder().ToString();
            //resultingtext = resultingtext.Replace("#", "${pound}");

            // 2nd time is to render ${siteroot} that may had been in one of the merged regions 
            try {
                engine.Evaluate(context, secondwriter, "logtag", resultingtext);
                resultingtext = secondwriter.GetStringBuilder().ToString();
            } catch (Exception ex) {
                // Choked on parsing the results of the first pass, so better show what we have rather then an error
                log4net.LogManager.GetLogger("renderService").Error("Error uploading file", ex);
            }

            String parsedtext = resultingtext;
            /*if (usetidy)
           {
               using (Document doc = new Document(resultingtext))
               {
                   doc.ShowWarnings = false;
                   doc.Quiet = true;
                   doc.DocType = DocTypeMode.Loose;
                   //doc.OutputXhtml = true;
                   doc.CleanAndRepair();
                   parsedtext = doc.Save();
               }
           }
           if (String.IsNullOrEmpty(parsedtext.Trim()))
           {
               parsedtext = resultingtext;
           }*/
            return parsedtext;
        }

        /// <summary> </summary>
        public static ExtendedProperties setMacros(ExtendedProperties props) {
            ArrayList macroList = new ArrayList();
            macroList.Add("macros.vm");
            object libPropValue = props.GetProperty(RuntimeConstants.VM_LIBRARY);

            if (libPropValue is ICollection) {
                macroList.AddRange((ICollection)libPropValue);
            } else if (libPropValue is string) {
                macroList.Add(libPropValue);
            }
            props.AddProperty(RuntimeConstants.RESOURCE_LOADER, "file");
            props.AddProperty(RuntimeConstants.FILE_RESOURCE_LOADER_PATH, HttpContext.Current.Server.MapPath("~/Views/macros/"));

            props.AddProperty(RuntimeConstants.VM_LIBRARY, macroList);
            props.AddProperty(RuntimeConstants.VM_LIBRARY_AUTORELOAD, true);
            return props;
        }

        /// <summary> </summary>
        private static void EventCartridge_ReferenceInsertion(object sender, ReferenceInsertionEventArgs e) {
            string originalString = e.OriginalValue.ToString();
            if (originalString == null) return;
            e.NewValue = htmlService.HtmlEncode(originalString);
        }
        #endregion

        #region(normalize)
        /// <summary> </summary>
        private static String normalize_phase_paths(String text,Hashtable contextitems){
            /*correct veiw paths for anyone using #parse*/
            string strRegex = @"#parse\(""";
            RegexOptions myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            Regex myRegex = new Regex(strRegex, myRegexOptions);

            if (myRegex.IsMatch(text)) {
                strRegex = @"#parse\(""\.\./\.\./Views/";
                myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
                myRegex = new Regex(strRegex, myRegexOptions);

                if (!myRegex.IsMatch(text)) {
                    //#parse("../../Views/admin/noted.vm")
                    string pattern = @"(?<block>#parse\(""(?<path>.*?)""\))";
                    MatchCollection matches = Regex.Matches(text, pattern);

                    foreach (Match match in matches) {
                        String block = "";
                        String path = "";
                        block = match.Groups["block"].Value;
                        path = match.Groups["path"].Value.ToLower().Trim().TrimStart('/').Replace("../", "");

                        text = text.Replace(block, "#parse(\"../../Views/" + path + "\")");
                    }
                }
            }
            strRegex = @"#parse\(""\.\./\.\./Views/";
            myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            myRegex = new Regex(strRegex, myRegexOptions);

            if (!myRegex.IsMatch(text)) {
                //#parse("../../Views/admin/noted.vm")
                string pattern = @"(?<block>#parse\(""(?<path>.*?)""\))";
                MatchCollection matches = Regex.Matches(text, pattern);

                foreach (Match match in matches) {
                    String block = "";
                    String path = "";
                    block = match.Groups["block"].Value;
                    path = match.Groups["path"].Value.ToLower().Trim().TrimStart('/').Replace("../","");
                    //"#parse(\"../../Views/" + path + "\")"
                    String processed_parse = proccessText(contextitems, file_handler.read_from_file("/Views/"+path));
                    //last ditched effort to process something
                    text = text.Replace(block, String.IsNullOrWhiteSpace(processed_parse) ? "#parse(\"../../Views/" + path + "\")" : processed_parse);
                }
            }
            return text;
        }
        #endregion
    }
}
