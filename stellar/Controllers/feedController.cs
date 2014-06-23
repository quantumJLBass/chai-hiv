#region using
using System;
using System.Collections;
using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.ActiveRecord.Framework;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using stellar.Models;
//using MonoRailHelper;
using System.IO;
using System.Net;
using System.Web;
using NHibernate.Criterion;
using System.Xml;
using System.Xml.XPath;
using System.Text.RegularExpressions;
using System.Text;
using System.Net.Sockets;
using System.Web.Mail;
using stellar.Services;

using System.CodeDom;
using System.CodeDom.Compiler;
using System.Reflection;
using Microsoft.CSharp;
using System.Reflection.Emit;
using System.Runtime.InteropServices;
using System.Runtime.Remoting;
using System.Threading;
using Microsoft.SqlServer.Types;
using System.Data.SqlTypes;
/* Newtonsoft slated to remove */
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;

using log4net;
using log4net.Config;



using System.Collections.ObjectModel;
using System.Dynamic;
using System.Linq;
using System.Web.Script.Serialization;

using System.Net.Mail;
using Castle.Components.Common.EmailSender;
using Castle.Components.Common.EmailSender.Smtp;

using System.Collections.Specialized;
using System.Xml.Serialization;
using System.Xml.Schema;


using System.Runtime.Serialization;
#endregion


namespace stellar.Controllers {
    /// <summary> </summary>
    public class feedController : BaseController {

        /// <summary> </summary>
        public feedController() {
            Controllers.BaseController.current_controller = "feed";
        }


        //ILog log = log4net.LogManager.GetLogger("publicController");
        #region JSON OUTPUT

        /*public void get_pace_type()
            {
                CancelView();
                CancelLayout();
                events_types[] types = ActiveRecordBase<events_types>.FindAll();

                List<JsonAutoComplete> type_list = new List<JsonAutoComplete>();
                foreach (events_types events_type in types)
                {
                    JsonAutoComplete obj = new JsonAutoComplete();
                    obj.baseid = events_type.baseid;
                    obj.label = events_type.name;
                    obj.value = events_type.name;
                    type_list.Add(obj);
                }
                string json = JsonConvert.SerializeObject(type_list);
                RenderText(json);
            }*/
        /*
         * 
         * Look to campus map.. implamentation is there but the goal is a 
         * way to call model by the name(string)
         * 
         * 
        public void get_json(String TYPE)
        {
            CancelView();
            CancelLayout();
            Type t = Type.GetType("stellar.Models."+TYPE);
            Ijson_autocomplete theclass = (Ijson_autocomplete)Activator.CreateInstance(t);
            RenderText(theclass.get_json_data());
        }
        */
        #endregion

        #region URL rendering
        /// <summary> </summary>
        public void general(string aspxerrorpath) {
            CancelLayout();
            CancelView();
            LayoutName = "error";
            RenderView("errors/general404");
        }
        /// <summary> </summary>
        public void error(string aspxerrorpath) {
            CancelView();
            CancelLayout();
            Exception LastErrorOccured;
            LastErrorOccured = Context.LastException;
            PropertyBag["error"] = LastErrorOccured;
            LayoutName = "error";
            RenderView("errors/error");
        }
        /// <summary> </summary>
        public void render() {
            /*
             * get regisitored routes
             * test if uri matches
             * get ogject id
             * get object
             * get query params
             * go to action with params
             * if no action or route 404
             * on eception 5xx
             */
            HttpRequest httpRequest = HttpContext.Current.Request;
            if (httpRequest.Browser.IsMobileDevice) {
                HttpContext.Current.Response.Redirect("http://goo.gl/maps/4P71");
            }
            String everUrl = Context.Request.Url;
            // URL comes in like http://sitename/edit/dispatch/handle404.castle?404;http://sitename/pagetorender.html
            // So strip it all out except http://sitename/pagetorender.html
            everUrl = Regex.Replace(everUrl, "(.*:80)(.*)", "$2");
            everUrl = Regex.Replace(everUrl, "(.*:443)(.*)", "$2");
            String urlwithnoparams = Regex.Replace(everUrl, @"(.*?)(\?.*)", "$1");
            String querystring = HttpUtility.UrlDecode(Regex.Replace(everUrl, @"(.*?)(\?.*)", "$2"));

            Dictionary<string, string> queryparams = httpService.get_request_parmas_obj();

            String sitePath = HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority);

            CancelView();

            List<int> id = new List<int> { };

            Boolean usedev = (querystring.IndexOf("dev=1") > -1);
            urlwithnoparams = urlwithnoparams.Replace("/feed/", "/");
            posting post = (!String.IsNullOrWhiteSpace(urlwithnoparams)) ? postingService.get_posting_by_url(urlwithnoparams, usedev) : new posting();
            if (post.baseid > 0) id.Add(post.baseid);
            /*
            //check is it a real place or do 404
            if (!String.IsNullOrWhiteSpace(urlwithnoparams) && urlwithnoparams != "/" && post.baseid == 0) {
                id = postingService.get_posting("/404.html", usedev).baseid;
                Response.StatusCode = 404;
            }
            */
            //check if we need to login
            if (post.baseid > 0 && !post.is_Public && !Context.Request.IsLocal && Controllers.BaseController.authenticated()) { Redirect("center", "login", new Hashtable()); }

            if (queryparams.ContainsKey("iids")) {
                foreach (String id_is in objectService.explode(queryparams["iids"])) {
                     id.Add(Int32.Parse(id_is));
                }
            }
            output_feed(id.ToArray(), usedev);
            return;
        }

        /*
        public void get_sm_url(String _url) {
            CancelLayout();
            CancelView();
            RenderText(make_sm_url(_url));
        }

        public String make_sm_url(String _url) {
            String sm_url = "";
            small_url[] u = ActiveRecordBase<small_url>.FindAllByProperty("or_url", _url);
            if (u.Count() == 0) {
                small_url url = new small_url();
                url.or_url = _url;
                url.sm_url = String.Format("{0:X}", _url.GetHashCode());
                url.Save();
                Array.Resize(ref u, 1);
                sm_url = url.sm_url;
            } else {
                sm_url = u[0].sm_url;
            }
            return sm_url;
        }
        */

        #endregion

        /// <summary> </summary>
        protected htmlService HtmlService = new htmlService();



        /*
        public static dynamic LoadFromXMLString(string xmlText) {
            var stringReader = new System.IO.StringReader(xmlText);
            var serializer = new XmlSerializer(this.GetType());
            return serializer.Deserialize(stringReader) as this.GetType();
        }*/


        /// <summary> </summary>
        public void output_feed(int[] iid, Boolean dev) {
            output_feed(iid, "", dev);
        }

        /// <summary> </summary>
        public static String json_site_options(site site, String filter) {
            Hashtable site_options = new Hashtable();
            var jss = new JavaScriptSerializer();
            foreach (options item in site.options) {
                if (filter=="" || !item.option_key.StartsWith(filter)) site_options.Add(item.option_key, item.value);//ie: post.get_meta("title");
            }

            var settings = jss.Serialize(site_options).Replace("\"0\"", "false").Replace("\"1\"", "true");
            return settings;
        }
        /*
         * Needs:
         * limit
         * include
         * exclude
         * from (date)
         * to (date)
         */

        /// <summary> </summary>
        public void output_feed(int[] iids, string filter, Boolean dev) {
            CancelLayout();
            CancelView();

            var output = "";
            Dictionary<string, string> queries = httpService.get_request_parmas_obj();
            Hashtable post_json_obj = new Hashtable();
            String model = (queries.ContainsKey("model")?queries["model"]:"posting");
            String type = (queries.ContainsKey("type"))?queries["type"]:"page";

            switch(model){
                case ("post_list"):
                    if (iids.Count() == 0 || iids[0]==0) {
                        post_json_obj.Add("posts", postingService.make_all_post_json_table(type, dev));

                    }else{
                        Hashtable post_array = new Hashtable();
                        var i = 0;
                        foreach (int iid in iids){

                            String name = (queries.ContainsKey("format") && queries["format"] == "xml") ? ("post_"+i.ToString()) : i.ToString();


                            post_array.Add(name, postingService.make_post_json_table(iid, type, dev));
                            i++;
                        }
                        post_json_obj.Add("posts",post_array);
                    }
                    break;

                case ("site_options"):
                    Hashtable site_options = new Hashtable();
                    foreach (options item in siteService.getCurrentSite().options) {
                        if (filter=="" || !item.option_key.StartsWith(filter)) site_options.Add(item.option_key, item.value);//ie: post.get_meta("title");
                    }
                    post_json_obj = site_options;
                        break;
                default:
                case ("posting"):
                        post_json_obj = (iids.Count() > 0) ? postingService.make_post_json_table(iids[0],type, dev) : new Hashtable();
                        break;
            }


            if (!queries.ContainsKey("format") || ( queries.ContainsKey("format") && queries["format"] == "json" ) ) {
                var jss = new JavaScriptSerializer();
                output = jss.Serialize(post_json_obj).Replace(":\"0\"", ":false").Replace(":\"1\"", ":true");
                Response.ContentType = "application/json; charset=UTF-8";
            }

            if ((queries.ContainsKey("format") && queries["format"] == "xml")) {
                String content_type = "text/xml";
                if ((queries.ContainsKey("ContentType") && queries["ContentType"] != "")) {
                    switch (queries["ContentType"]) {
                        case ("rss"):
                            content_type = "application/rss+xml";
                            break;

                        case ("rdf"):
                            content_type = "application/rdf+xml";
                            break;
                        case ("atom"):
                            content_type = "application/atom+xml";
                            break;
                    }
                }
                var jss = new JavaScriptSerializer();
                Hashtable tmp = new Hashtable();
                tmp.Add("App", post_json_obj);
                output = jss.Serialize( tmp ).Replace(":\"0\"", ":false").Replace(":\"1\"", ":true");
                XmlDocument doc = (XmlDocument)JsonConvert.DeserializeXmlNode(output);


                StringBuilder sb = new StringBuilder();
                StringWriter sw = new StringWriter(sb);
                XmlTextWriter xtw = null;
                try {
                    xtw = new XmlTextWriter(sw);
                    xtw.Formatting = System.Xml.Formatting.Indented;
                    doc.WriteTo(xtw);
                } finally {
                    if (xtw != null)
                        xtw.Close();
                }
                output = sb.ToString();
                output = Regex.Replace(output, @"_\d+>", ">");
                Response.ContentType = content_type +"; charset=UTF-8";
            }



            RenderText(output);
        }




        


    }


}