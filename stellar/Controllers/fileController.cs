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
/* */
using ElFinder;

using System.Web.Mvc;
using System.Runtime.Serialization;
#endregion


namespace stellar.Controllers {
    [Layout("admin")]
    public class fileController : SecureBaseController {

        public fileController() {
            Controllers.BaseController.current_controller = "file";
        }



        public void get_index() {
            CancelLayout();
            CancelView();

            HttpRequest httpRequest = HttpContext.Current.Request;
            site site = siteService.getCurrentSite();
            FileSystemDriver driver = new FileSystemDriver();
            driver.AddRoot(new Root(new DirectoryInfo(HttpContext.Current.Server.MapPath("~/"+file_info.relative_site_uploads_path().Trim('/'))), "http://" + httpRequest.Url.Authority + "/"+file_info.relative_site_cache_path().Trim('/')+"/uploads/") { IsReadOnly = false, Alias = site.name });
            //driver.AddRoot(new Root(new DirectoryInfo(@"C:\Program Files"), "http://" + httpRequest.Url.Authority + "/") { IsReadOnly = true });
            var connector = new Connector(driver);


            var jsonResult = connector.Process(new HttpRequestWrapper(httpRequest));

            var data = jsonResult.Data;

            string json = new JavaScriptSerializer().Serialize(data);
            RenderText(json);
        }

        public void SelectFile(string target) {
            CancelLayout();
            CancelView();

            HttpRequest httpRequest = HttpContext.Current.Request;
            site site = siteService.getCurrentSite();
            FileSystemDriver driver = new FileSystemDriver();
            driver.AddRoot(new Root(new DirectoryInfo(HttpContext.Current.Server.MapPath("~/" + file_info.relative_site_uploads_path().Trim('/'))), "http://" + httpRequest.Url.Authority + "/" + file_info.relative_site_cache_path().Trim('/') + "/uploads/") { IsReadOnly = false, Alias = site.name });
            //driver.AddRoot(new Root(new DirectoryInfo(@"C:\Program Files"), "http://" + httpRequest.Url.Authority + "/") { IsReadOnly = true });
            var connector = new Connector(driver);
            var jsonResult = connector.GetFileByHash(target).FullName;
            var data = jsonResult;//.Data;
            string json = new JavaScriptSerializer().Serialize(data);
            RenderText(json);
        }


        public void retrieve_file_info(string target) {
            CancelLayout();
            CancelView();

            HttpRequest httpRequest = HttpContext.Current.Request;
            site site = siteService.getCurrentSite();
            FileSystemDriver driver = new FileSystemDriver();
            driver.AddRoot(new Root(new DirectoryInfo(HttpContext.Current.Server.MapPath("~/" + file_info.relative_site_uploads_path().Trim('/'))), "http://" + httpRequest.Url.Authority + "/" + file_info.relative_site_uploads_path()) { IsReadOnly = false, Alias = site.name });
            //driver.AddRoot(new Root(new DirectoryInfo(@"C:\Program Files"), "http://" + httpRequest.Url.Authority + "/") { IsReadOnly = true });
            var connector = new Connector(driver);
            var jsonResult = connector.GetFileDataByHash(target);
            var data = jsonResult;//.Data;
            string json = new JavaScriptSerializer().Serialize(data);
            RenderText(json);
        }

        




















        #region URL rendering
        public void general(string aspxerrorpath) {
            CancelLayout();
            CancelView();
            LayoutName = "error";
            RenderView("errors/general404");
        }
        public void error(string aspxerrorpath) {
            CancelView();
            CancelLayout();
            Exception LastErrorOccured;
            LastErrorOccured = Context.LastException;
            PropertyBag["error"] = LastErrorOccured;
            LayoutName = "error";
            RenderView("errors/error");
        }
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
            //output_feed(id.ToArray(), usedev);
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

        protected htmlService HtmlService = new htmlService();

        public void filebrowser(int iid) {

            List<String> pagelist = file_info.DirSearch("/views/admin/admin_pages/");

            /*

            Hashtable files = 












            //RenderText(output);
            PropertyBag["content"] = output;*/
            RenderView("../admin/default/actions/filebrowser");
        }


    }


}