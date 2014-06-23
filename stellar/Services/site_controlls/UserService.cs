#region Directives
    using System;
    using System.Data;
    using System.Configuration;
    using stellar.Models;
    using NHibernate.Criterion;
    using System.Collections.Generic;
    using Castle.ActiveRecord;
    using System.Net;
    using System.Text.RegularExpressions;
    using System.IO;
    using System.Web;
    //using MonoRailHelper;
    using System.Xml;
    using System.Linq;
    using System.Drawing;
    using System.Drawing.Imaging;
    using System.Drawing.Drawing2D;
    using System.Collections.Specialized;
    //using Newtonsoft.Json;
    //using Newtonsoft.Json.Utilities;
    //using Newtonsoft.Json.Linq;
    using stellar.Services;
    using Castle.MonoRail.Framework;
    using stellar.Filters;
    using log4net;
    using log4net.Config;
    using System.Text;
#endregion

namespace stellar.Services {

    /// <summary> </summary>
    public class userService {
        ILog log = log4net.LogManager.GetLogger("userService");


        /// <summary> </summary>
        public static Boolean loginUser() {
            String username = System.Web.HttpContext.Current.Response.Cookies["unldap"].Value; //Authentication.authenticate();
            HttpContext.Current.Request.Cookies["unldap"].Value = username; //Maybe this should be md5'd?
            // save user in database
            appuser[] user_list = ActiveRecordBase<appuser>.FindAll();
            appuser temp = null;
            foreach (appuser user in user_list) {
                if (!string.IsNullOrEmpty(user.nid) && user.nid.ToUpper() == username.ToUpper()) { temp = user; }
            }
            if (temp != null) {
                temp.logedin = true;
                ActiveRecordMediator<appuser>.Save(temp);
                return temp.logedin;
            }
            return false;
        }

        /// <summary> </summary>
        public static Boolean logoutUser() {
            String username = HttpContext.Current.Request.Cookies["unldap"] != null ? HttpContext.Current.Request.Cookies["unldap"].Value : null;
            if (username != null) {
                // save user in database
                appuser[] user_list = ActiveRecordBase<appuser>.FindAll();
                appuser temp = null;
                foreach (appuser user in user_list) {
                    if (!string.IsNullOrEmpty(user.nid) && user.nid.ToUpper() == username.ToUpper()) { temp = user; }
                }
                temp.logedin = false;
                ActiveRecordMediator<appuser>.Save(temp);
                return temp.logedin ? false : true;
            }
            return true;
        }

        /// <summary> </summary>
        public static appuser[] getLogedIn() {
            appuser[] users = ActiveRecordBase<appuser>.FindAllByProperty("logedin", true);
            return users;
        }

        /// <summary> </summary>
        public static Boolean isLogedIn() { return isLogedIn(null); }

        /// <summary> </summary>
        public static Boolean isLogedIn(string nid) {
            appuser[] user_list = getLogedIn();
            bool temp = false;
            if (String.IsNullOrWhiteSpace(nid)) nid = getNid();
            if (!String.IsNullOrWhiteSpace(nid)) {
                foreach (appuser user in user_list) {
                    if (!string.IsNullOrEmpty(user.nid) && user.nid.ToUpper() == nid.ToUpper()) { temp = true; }
                }
            }
            return temp;
        }

        /// <summary> </summary>
        public static String getNid() {
            String username = "";
            if (HttpContext.Current.Request.Cookies["unldap"]!=null) username = HttpContext.Current.Request.Cookies["unldap"].Value;
            return username;
        }

        /// <summary> </summary>
        public static appuser setUser() {
            String uname = getNid();
            appuser user = null;
            if( !String.IsNullOrWhiteSpace(uname) ){
                try {
                    user = ActiveRecordBase<appuser>.FindAllByProperty("nid", uname).FirstOrDefault();
                } catch { return null; }
            }
            //HttpContext.Current.Session["you"] = user;
            return user;
        }

        /// <summary> </summary>
        public static appuser getUser() {
            // this needs to change back to the session
            appuser user = setUser();// HttpContext.Current.Session["you"] == null ? setUser() : (users)HttpContext.Current.Session["you"];
            return user;
        }

        /// <summary> </summary>
        public static appuser getUserFull(int id) {
            appuser user = ActiveRecordBase<appuser>.Find(id);
            return user;
        }

        /// <summary> </summary>
        public static appuser getUserFull() {
            appuser userbase = getUser();
            appuser user = null;
            if (userbase!=null) {
                int id = getUser().baseid;
                
                if (id > 0) {
                    user = ActiveRecordBase<appuser>.Find(id);
                }
            }
            return user;
        }

        /// <summary> </summary>
        public static string getUserIp() {
            return GetIPAddress();
        }

        /// <summary> </summary>
        protected static string GetIPAddress() {
            System.Web.HttpContext context = System.Web.HttpContext.Current;

            string ipAddress = context.Request.ServerVariables["HTTP_X_FORWARDED_FOR"];

            if (!string.IsNullOrEmpty(ipAddress)) {
                string[] addresses = ipAddress.Split(',');
                if (addresses.Length != 0) {
                    return addresses[0];
                }
            }
            return context.Request.ServerVariables["REMOTE_ADDR"];
        }

        /// <summary> </summary>
        public static Boolean isActive(appuser user) {
            int timeThreshold = -2; //TODO Set as site perference
            bool active = false;
            if (user != null && (!user.active || user.last_active < DateTime.Today.AddHours(timeThreshold))) {
                active = true;
            }
            return active;
        }




        /// <summary> </summary>
        public Boolean hasGroup(String group) {
            return hasGroup(group, userService.getUser());
        }

        /// <summary> </summary>
        public Boolean hasGroup(String group, appuser user) {
            return group == user.groups.name;
        }




        /// <summary> </summary>
        public static bool setSessionPrivleage(appuser user, string privilege) {

            bool flag = false;

            if (user != null) flag = user.groups.privileges.Any(item => item.alias == privilege);
            HttpContext.Current.Session[privilege] = flag;
            return flag;
        }
        /// <summary> </summary>
        public static bool checkPrivleage(string privilege) {
            return checkPrivleage(getUserFull(), privilege);
        }
        /// <summary> </summary>
        public static bool checkPrivleage(appuser user, string privilege) {
            bool flag = setSessionPrivleage(user, privilege);// (HttpContext.Current.Session[privilege] == null || String.IsNullOrWhiteSpace(HttpContext.Current.Session[privilege].ToString())) ? setSessionPrivleage(user, privilege) : (bool)HttpContext.Current.Session[privilege];
            return flag;
        }

        /// <summary> </summary>
        public static contact_profile get_defaultContactProfile() {
            return get_defaultContactProfile(getUserFull());
        }
        /// <summary> </summary>
        public static contact_profile get_defaultContactProfile(appuser user) {
            contact_profile profile = user.contact_profiles.FirstOrDefault(x => x.isDefault == true);
            return profile;
        }

        //This is a generic set of methods that will first check the object has a property
        //then if it does set it to null if the user is not actively editing it
        /// <summary> </summary>
        public static Boolean clearConnections<t>() {
            t[] items = ActiveRecordBase<t>.FindAll();
            bool result = false;
            foreach (dynamic item in items) {
                if (item.GetType().GetProperty("editing") != null) {
                    if (userService.isActive(item.editing)) {
                        //NOTE THIS IS NEEDING TO BE CORRECTED>> item.editing is null
                        //For some resaon when we try to access it it's like we have one layer deep
                        //and this item uses the :publish_base:_base model inheritence
                        //LogService.writelog("Releasing editor from item ", item.editing.nid, item.baseid);
                        logger.writelog("Releasing editor from item ", item.baseid);
                        item.editing = null;
                        ActiveRecordMediator<dynamic>.Save(item);
                        result = true;
                    }
                }
            }
            return result;
        }
        /// <summary> </summary>
        public static Boolean clearTmps<t>() {
            t[] items = ActiveRecordBase<t>.FindAll();
            bool result = false;
            foreach (dynamic item in items) {
                if (item.tmp == true && item.baseid > 0) {
                    if (userService.isActive(item.editing) && item.editing == userService.getUser()) {
                        //NOTE THIS IS NEEDING TO BE CORRECTED>> item.editing is null
                        //For some resaon when we try to access it it's like we have one layer deep
                        //and this item uses the :publish_base:_base model inheritence
                        //LogService.writelog("Releasing editor from item ", item.editing.nid, item.baseid);
                        logger.writelog("Deleting tmp item ", item.baseid);
                        ActiveRecordMediator<dynamic>.Delete(item);
                        result = true;
                    }
                }
            }
            return result;
        }



        /// <summary> </summary>
        public static Boolean clearLocked<t>(int id, bool ajax) {
            dynamic item = ActiveRecordBase<t>.Find(id);
            bool result = false;
            if (item.GetType().GetMethod("editing") != null) {
                logger.writelog("Releasing editor from item ", item.editing.nid, item.baseid);
                item.editing = null;
                ActiveRecordMediator<dynamic>.Save(item);
                result = true;
            }
            return result;
        }
    }
}
