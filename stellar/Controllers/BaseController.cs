#region Directives
using Castle.MonoRail.Framework;
using stellar.Services;
using System.Text.RegularExpressions;
using System;
using System.Collections;
using System.Collections.Generic;

using System.Collections.ObjectModel;
using System.Linq;
using System.IO;
using System.ServiceModel.Web;
using System.Runtime.Serialization;
using System.Runtime.Serialization.Formatters.Binary;
using System.Runtime.Serialization.Json;
using System.Dynamic;
using System.Security.Permissions;
using System.Web.Script.Serialization;
using stellar.Models;
using Castle.ActiveRecord;
//using MonoRailHelper;
using stellar.Filters;
using log4net;
using log4net.Config;
using System.Text;

using System.Reflection;
using NHibernate.Criterion;
using System.ComponentModel.Composition;
using System.ComponentModel.Composition.Hosting;
using System.Diagnostics;
using System.DirectoryServices.AccountManagement;
using System.Web;
#endregion
namespace stellar.Controllers {

    /* NOTE : 
        Everything is based off a few ideas.
           1.) Everything that is posted is stored as a posting
           2.) The base post type is a page.
           3.) Page, layout, post template, menu are reserved core
           4.) All postings are to a site
           5.) A site has options
           6.) Postings have meta data
           7.) Postings may have feilds
           8.) Users are split in to groups of frontend / admin
           9.) Both admin and Frontend have theme support
           10.)All changes to posts with false checksum is versioned
           11.)All posts have a version and a revision of the version
           12.)Point version resleases aree the working/backup copies 
                IE: "foo" version 3 rev 4 is the working copy over "foo" version 3 rev 1 nad from "foo" version 3 rev 0
           13.)The largest version int release is the Published IE: "foo" version 3 is showen over "foo" version 2
           14.)Rendering is a bubbled process where we start with the base post type and work out wards
    
        As far as coding style, the goal has been to produce a jquery like formation.  A lib of common routines 
        and plugins to expand the lib with contollers that set up the UI's.  
    */
    //programers notes:
    /* 1.) .Trim('/') + "/" is every were only for the distrust that it can't be forgoten.  long run it should be able to be taken out
     * 
     */

    [Filter(ExecuteWhen.BeforeAction, typeof(scriptFilter))]
    [Layout("default")]
    [Rescue(typeof(RescueController))]//Rescue("generalerror")
    public abstract class BaseController : SmartDispatcherController {
        private static ILog log = log4net.LogManager.GetLogger("baseController");
         /* 
        /* plugins */
        /* this is attempet 2
         * based on http://msdn.microsoft.com/en-us/library/dd460648.aspx
         */
        //private CompositionContainer _container;
        public BaseController() {
            
            /* load the plugins .. test if there are first to avoid Object reference not set to an instance of an object
            //An aggregate catalog that combines multiple catalogs
            var catalog = new AggregateCatalog();
            //Adds all the parts found in the same assembly as the Program class
            catalog.Catalogs.Add(new AssemblyCatalog(typeof(BaseController).Assembly));
            catalog.Catalogs.Add(new DirectoryCatalog(Context.Server.MapPath("/plugins/")));

            //Create the CompositionContainer with the parts in the catalog
            _container = new CompositionContainer(catalog);

            //Fill the imports of this object
            try {
                this._container.ComposeParts(this);
            } catch (CompositionException compositionException) {
                Console.WriteLine(compositionException.ToString());
            }
             */
        }
        private static Boolean _installed;
        public static Boolean installed {
            set {
                _installed = (!installed) ? Controllers.installController.is_installed() : true; 
            }
            get {
                    return (!_installed) ? Controllers.installController.is_installed() : _installed; 
            }
        }
        

        /* These are global vars that we'll need
         */
        public static site localsite { get { return (!installed) ? new site() : siteService.getCurrentSite(); } }
        public static Boolean in_admin { get; set; }

        public static string current_controller { get; set; } 

        /* the goal is to load the settings */
        public static string site_ext { get { return (!installed) ? "" : siteService.getCurrentSite().get_option("site_ext"); } } // = ".html"; // site pref
        public static Boolean use_static { get { return Convert.ToBoolean(Convert.ToInt16((!installed) ? "0" : siteService.getCurrentSite().get_option("use_static"))); } } // site pref
        public static Boolean usedev { get { return Convert.ToBoolean(Convert.ToInt16((!installed) ? "0" : siteService.getCurrentSite().get_option("usedev"))); } }//= false;  // not seeming to be updated look to the visible editor | should be a site pref
        public static string theme { get { return (!installed) ? "default" : siteService.getCurrentSite().get_option("current_site_theme"); } }

        public static Boolean editing { get; set; }



        /* this is a hashtable version of the PropertyBag
         * to be used and passed to services where access to 
         * monorail's PropertyBag is not able to be had it seems
         */
        public static Hashtable sodo_PropertyBag = new Hashtable();




        public static System.Web.HttpContext context() {
            return System.Web.HttpContext.Current;
        }

        [SkipFilter()]
        public static bool logout_user() {
            context().Response.Cookies["unldap_en"].Value = "";
            context().Response.Cookies["unldap_en"].Expires = DateTime.Now.AddDays(-1d);
            context().Response.Cookies["unldap"].Expires = DateTime.Now.AddDays(-1d);
            context().Response.Cookies["pasessionid"].Value = "";
            context().Response.Cookies["pasessionid"].Expires = DateTime.Now.AddDays(-1d);

            kill_cookies();

            context().Session.Abandon();

            //context().Response.Redirect("/center/login.castle");

            return authenticated();
        }
        public void redirect_logouted_user() {
            Redirect("center", "login", new Hashtable());
        }
        public static void kill_cookies() {
            HttpCookie myCookie = new HttpCookie("unldap_en");
            myCookie.Expires = DateTime.Now.AddDays(-1d);
            context().Response.Cookies.Add(myCookie);

            HttpCookie pasessionidCookie = new HttpCookie("pasessionid");
            myCookie.Expires = DateTime.Now.AddDays(-1d);
            context().Response.Cookies.Add(pasessionidCookie);


        }
        public static bool authenticated() {
            log.Info("checking login");
            //if (context().Request.IsLocal) return true;
            log.Info("checking login and was not local");
            String passedid = "";
            if (context().Request.Cookies["pasessionid"] != null) {
                passedid = context().Request.Cookies["pasessionid"].Value;
                context().Response.Cookies["pasessionid"].Value = passedid;
                context().Response.Cookies["pasessionid"].Expires = DateTime.Now.AddDays(1);
            }
            String username = "";
            if (context().Request.Cookies["unldap_en"] != null) {
                username = context().Request.Cookies["unldap_en"].Value;
                context().Response.Cookies["unldap_en"].Value = username;
                context().Response.Cookies["unldap_en"].Expires = DateTime.Now.AddDays(1);
            }
            bool authenticated = false;
            if (
                !String.IsNullOrWhiteSpace(passedid) && !String.IsNullOrWhiteSpace(username)
                && passedid == username ) {
                authenticated = true;
                if (context().Request.Cookies["unldap"] != null) {
                    username = context().Request.Cookies["unldap"].Value;
                    context().Response.Cookies["unldap"].Value = username;
                    context().Response.Cookies["unldap"].Expires = DateTime.Now.AddDays(1);
                }
            }
            log.Info("user is " + (authenticated?"logged in":"not logged in"));
            return authenticated;
        }

        public bool IsAuthenticated(string srvr, string usr, string pwd) {
            bool authenticated = false;
            PrincipalContext adContext = null;
            try {
                adContext = new PrincipalContext(ContextType.Domain, "clintonhealthaccess.org");
            } catch (Exception ex) {
                if (context().Request.IsLocal) {
                    authenticated = true;
                } else {
                    throw ex;
                }
            }
            context().Response.Cookies["unldap_en"].Value = helperService.CalculateMD5Hash(usr);
            context().Response.Cookies["unldap_en"].Expires = DateTime.Now.AddDays(1);
            context().Response.Cookies["unldap"].Value = usr;
            context().Response.Cookies["unldap"].Expires = DateTime.Now.AddDays(1);
            if (!authenticated) {
                try {
                    using (adContext) {
                        authenticated = adContext.ValidateCredentials(usr + "@clintonhealthaccess.org", pwd);
                    }
                } catch (Exception ex) {
                    if (context().Request.IsLocal) {
                        authenticated = true;
                    } else {
                        throw ex;
                    }
                }
            }
            if (authenticated) {
                context().Response.Cookies["pasessionid"].Value = helperService.CalculateMD5Hash(usr);
                context().Response.Cookies["pasessionid"].Expires = DateTime.Now.AddDays(1);
            }

            return authenticated;
        }



        #region(Core methods)
            public String getVersion() {
                // create reader & open file
                String path = Context.Server.MapPath("../version.txt");
                TextReader tr = new StreamReader(path);

                String[] versionarray = tr.ReadLine().Split(':');
                String version = versionarray[versionarray.Length - 1];
                PropertyBag["version"] = version;
                // close the stream
                tr.Close();
                return version;
            }

            /* maybe this should be in a utilitiesServices?*/
            public static void echo(String txt) {
                System.Web.HttpContext.Current.Response.Write(txt);
            }

            //public static Hashtable debuglog { get; set; }
            public static Hashtable debuglog = new Hashtable();

            public static void vardump(Hashtable paramtable) {
                vardump(paramtable, "", "");
            }
            public static void vardump(Hashtable paramtable, String message) {
                vardump(paramtable, message, "");
            }
            public static void vardump(Hashtable paramtable,String message,String wrap) {
                if (siteService.debug_mode()) {
                    List<String> wrap_parts= new List<String>();
                    if (!String.IsNullOrWhiteSpace(wrap)) {
                        wrap_parts.AddRange(wrap.Split(new string[] { "${1}" }, StringSplitOptions.None));
                        System.Web.HttpContext.Current.Response.Write(wrap_parts[0]);
                    }
                    System.Web.HttpContext.Current.Response.Write("\r\n");
                    System.Web.HttpContext.Current.Response.Write("::|| Called Method => " + (new StackFrame(1, true).GetMethod().Name) + " ||::\r\n");
                    System.Web.HttpContext.Current.Response.Write("\t<===|| NOTE: " + message + " ||===>\r\n");

                    foreach (var key in paramtable.Keys) {
                        if (paramtable[key] != null && paramtable.ContainsKey(key)) {
                                if (Controllers.BaseController.debuglog.ContainsKey(key)) {
                                    if (Controllers.BaseController.debuglog[key].ToString() != paramtable[key].ToString() ) {
                                        System.Web.HttpContext.Current.Response.Write("\t\t" + key + "=>" + paramtable[key].ToString() + "\r\n");
                                    }
                                    Controllers.BaseController.debuglog[key] = paramtable[key].ToString();
                                } else {
                                    Controllers.BaseController.debuglog.Add(key, paramtable[key].ToString());
                                    System.Web.HttpContext.Current.Response.Write("\t\t" + key + "=>" + paramtable[key].ToString() + "\r\n");
                                }
                        
                        }
                    }
                    System.Web.HttpContext.Current.Response.Write("\r\n");
                    if (!String.IsNullOrWhiteSpace(wrap)) {
                        System.Web.HttpContext.Current.Response.Write(wrap_parts[1]);
                    }
                }
            }
        #endregion

        #region MCV INFO METHODS
            public string getView() {
                String veiw = "";
                try{
                    veiw = SelectedViewName.Split('\\')[0];
                }catch{}
                return veiw;
            }
            public string getAction() {
                String action = "";
                try{
                    if (SelectedViewName.Split('\\')[1].Contains("../")) {
                        string[] act = SelectedViewName.Split('\\')[1].Split('/');
                        action = act[act.Length - 1];
                    } else {
                        action = SelectedViewName.Split('\\')[1];
                    }
                } catch { }
                return action;
            }
            public string getViewAndAction() {
                String VA = "";
                try {
                    VA = SelectedViewName.Replace("\\", "/");
                } catch { }
                return VA;
            }
            public object getVar(string var) {
                return PropertyBag[var];
            }
        #endregion

        #region methodbase
        /*public bool isLocal() {
            return Request.IsLocal;
        }*/

        #endregion

        /* to remove for clean up
        #region Method extentions
        public static String Serialize(dynamic data) {
            var serializer = new DataContractJsonSerializer(data.GetType());
            var ms = new MemoryStream();
            serializer.WriteObject(ms, data);

            return Encoding.UTF8.GetString(ms.ToArray());
        }
        #endregion
        */
    }
}
