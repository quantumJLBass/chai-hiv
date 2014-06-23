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


#endregion


namespace stellar.Controllers {
    /// <summary> </summary>
    public class publicController : BaseController {

        /// <summary> </summary>
        public publicController() {
            Controllers.BaseController.in_admin = false;
            Controllers.BaseController.current_controller = "public";
        }




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
            // I don't like this.. need a better way to tell it's installed.  More passive, 
            //like change the config file and reload it then read it from there the rest of the time??
            if (!Controllers.installController.is_installed()) Controllers.installController.start_install();
            
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

            Dictionary<string, string> queryparams = httpService.getUrlQueries(urlwithnoparams, querystring);

            //String sitePath = HttpContext.Current.Request.Url.GetLeftPart(UriPartial.Authority);
            
            CancelView();

            int id = 0;
            
            Boolean usedev = (querystring.IndexOf("dev=1") > -1);
            urlwithnoparams = urlwithnoparams.Replace("/ams/", "/");
            posting post = (!String.IsNullOrWhiteSpace(urlwithnoparams))?postingService.get_posting_by_url(urlwithnoparams, usedev): new posting();
            if(post.baseid>0) id = post.baseid;

            //check is it a real place or do 404
            if (!String.IsNullOrWhiteSpace(urlwithnoparams) && urlwithnoparams != "/" && post.baseid == 0) {
                id = postingService.get_posting_by_url("/404.html", usedev).baseid;
                Response.StatusCode = 404;
            }

            //check if we need to login
            if (post.baseid > 0 && !post.is_Public && !Context.Request.IsLocal && Controllers.BaseController.authenticated()) { Redirect("center", "login", new Hashtable()); }

            posting(id,usedev);
                return;
        }

        #endregion

        /// <summary> </summary>
        protected htmlService HtmlService = new htmlService();
        /// <summary> </summary>
        public void posting(int iid, Boolean dev){
            posting(iid,new string[]{},0,false, false, "", dev);
        }


        /// <summary> </summary>
        public void posting(int iid, string[] cat, int activeitem, Boolean eb, Boolean hasUrl, string sm_url, Boolean dev) {
            //posting post = ActiveRecordBase<posting>.Find(iid);
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
            editing = false;
            PropertyBag["dev"] = dev;
            //if (!usedev) filtering.Add(Expression.Eq("revision", 0));
            posting post = null;
            if (iid > 0) {
                post = ActiveRecordBase<posting>.Find(iid).get_published();
            } else {
                filtering.Add(Expression.Eq("is_default", true));
                filtering.Add(Expression.Eq("deleted", false));
                filtering.Add(Expression.IsNull("parent")); // the  parent null makes it the working copy to first look too
                filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                            new List<AbstractCriterion>() { 
                                Expression.Eq("alias", "page")
                            }.ToArray())
                        ));
                post = ActiveRecordBase<posting>.FindFirst(new Order[] { Order.Desc("revision"), Order.Desc("version") }, filtering.ToArray());
                if (post != null) post = post.get_published();
            }

            if(post == null){
                post = postingService.get_posting_by_url("/404.html", usedev).get_published();
                Response.StatusCode = 404;
            }




            /* Items that should be globaly accessed */
            PropertyBag["url"] = sm_url;
            //PropertyBag["campus"] = ActiveRecordBase<campus>.FindAllByProperty("name", "Pullman")[0];

            PropertyBag["selected_taxanony"] = cat;
            PropertyBag["activeitem"] = activeitem;

            PropertyBag["embeded"] = eb;

            site site = siteService.getCurrentSite();
            PropertyBag["site"] = site;

            PropertyBag["baseurl"] = "public/posting.castle";
            PropertyBag["htmlService"] = HtmlService;

            /* add site options */
            if (site.options != null && site.options.Count > 0) {
                foreach (options item in site.options) {
                    PropertyBag[item.option_key.ToUpper()] = item.value.ToString();//ie: post.get_meta("title");
                }
            }

            /* add meta */
            if (post.meta_data != null && post.meta_data.Count > 0) {
                foreach (meta_data item in post.meta_data) {
                    PropertyBag[item.meta_key.ToUpper()] = item.value;//ie: post.get_meta("title");
                }
            }

            String urlQueries = "";
            PropertyBag["urlQueries"] = String.IsNullOrWhiteSpace(urlQueries) ? "" : "iid[]=" + urlQueries.TrimStart(',');
            if (iid > 0) {
                PropertyBag["urlQueries"] += (String.IsNullOrWhiteSpace(urlQueries) ? "" : "&") + "iid=" + iid.ToString();
            }

            PropertyBag["siteroot"] = httpService.getRootUrl().TrimEnd('/');
            PropertyBag["Controller"] = base.MemberwiseClone();
            PropertyBag["mode"] = "published";

            posting pub_post = post.get_published();
            PropertyBag["post"] = pub_post;

            Hashtable content_params = objectService.marge_params(PropertyBag, new Hashtable());


            String output = new renderService().render(post, content_params);



            // bool ActiveRecordBase<site_base>.FindFirst(new List<AbstractCriterion>() { Expression.Eq("name", "minhtml") }.ToArray())
            Boolean tmpB = false;
            if (tmpB) output = htmlService.stripNonSenseContent(output, false);

            RenderText(output);
        }


        /// <summary> </summary>
        public void user_keywordAutoComplete(string name_startsWith, string callback) {
            CancelView();
            CancelLayout();
            String json = "";
            Response.ContentType = "application/json; charset=UTF-8";
            RenderText(json);
        }
    }
}