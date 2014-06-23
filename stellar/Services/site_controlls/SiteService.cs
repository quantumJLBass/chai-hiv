#region Directives
using stellar.Models;
using stellar.Services;
using System;
using System.Collections.Generic;
using System.Web;
using System.ComponentModel;
using Castle.ActiveRecord;
using NHibernate;

using System.Data;
using System.Configuration;
using System.Net;
using System.IO;

//using MonoRailHelper;

using System.Text.RegularExpressions;
using log4net;
using System.Collections;
using NHibernate.Criterion;
using System.Web.Script.Serialization;
#endregion

namespace stellar.Services {

    /// <summary> </summary>
    public class siteService {
        private static ILog log = log4net.LogManager.GetLogger("siteService");
        /*
        public site getsiteByHostFromDB(String host) {

            log.Info("Lookikng up in sites: " + host);
            site site = ActiveRecordBase<site>.FindFirst(new ICriterion[] { Expression.InsensitiveLike("URL", "%" + host.ToLower() + "%") });
            if (site == null) {
                log.Info("Not found, now lookikng up in Aliases: " + host.ToLower());
                site_alias alias = ActiveRecordBase<siteAlias>.FindFirst(new ICriterion[] { Expression.IsNotNull("site"), Expression.InsensitiveLike("Alias", "%" + host.ToLower() + "%") });
                if (alias != null) {
                    site = alias.site;
                    log.Info("Found it in aliases!:" + host);
                }
            }
            if (site == null) {
                log.Error("site not found:" + host);
            } else {
                log.Info("Found site");
            }
            return site;
        }
        */


        /* getting and setting the site */
        /// <summary> </summary>
        public static Boolean is_localhost(){
            return System.Web.HttpContext.Current.Request.IsLocal;
        }

        /// <summary> </summary>
        public static site getDefaultSite() {
            site site = new site();
            try{ // the reason for using a try here is that we don't care if it can't find a default site.  
                // what is import is if there is one.  this is important for reinstallation
                site = ActiveRecordBase<site>.FindOne(new List<AbstractCriterion>() { 
                            Expression.Eq("is_default", true)
                        }.ToArray());
            }catch{
                site = new site();
            }
            return (site == null) ? new site() : site;
        }

        /// <summary> </summary>
        public static site getSiteFromURL() {
            site site = ActiveRecordBase<site>.FindOne(new List<AbstractCriterion>() { 
                            Expression.Eq("base_url", httpService.getCurrentBaseURL())
                        }.ToArray());
            return site;
        }
        /*
         * having issues with the lazy load when setting  Controllers.BaseController.localsite so .. 
         * skipping at the moment.
         * 
         * public static site setCurrentSite() {
            site current = new site();
            if(is_localhost()){
                current = getDefaultSite();
            }else{
                current = getSiteFromURL();
            }
            Controllers.BaseController.localsite = current;
            return current;
        }*/
        /// <summary> </summary>
        public static site getCurrentSite() {
            site current = new site();
            if (is_localhost() || !Controllers.installController.is_installed() ) {
                current = getDefaultSite();
            } else {
                current = getSiteFromURL();
            }
            if (current == null || current.local_path == null || String.IsNullOrWhiteSpace(current.local_path)) {
                Uri uri = HttpContext.Current.Request.Url;
                String getBaseURL = uri.Scheme + Uri.SchemeDelimiter + uri.Host;
                current = new site() {
                    local_path = file_info.root_path(),
                    base_url = getBaseURL
                };
            }
            log.Info(current.local_path);
            return current;
        }


        /// <summary> </summary>
        public static Boolean is_admin() {
            return Controllers.BaseController.in_admin;
        }

        /// <summary> </summary>
        public static Boolean is_frontend() {
            return Controllers.BaseController.in_admin;
        }






        /// <summary> </summary>
        public static String json_site_admin_options(){
            return json_site_admin_options(siteService.getCurrentSite(), "", "");
        }
        /// <summary> </summary>
        public static String json_site_admin_options(String include) {
            return json_site_admin_options(siteService.getCurrentSite(), "", include);
        }
        /// <summary> </summary>
        public static String json_site_admin_options(String exclude, String include) {
            return json_site_admin_options(siteService.getCurrentSite(), exclude, include);
        }
        /// <summary> </summary>
        public static String json_site_admin_options(site site, String exclude, String include) {
            return json_site_options(siteService.getCurrentSite(), exclude, "admin" + (String.IsNullOrWhiteSpace(include) ? "" : "," + include));
        }


        /// <summary> </summary>
        public static String json_site_options(){
            return json_site_options(siteService.getCurrentSite(), "","");
        }
        /// <summary> </summary>
        public static String json_site_options(String include) {
            return json_site_options(siteService.getCurrentSite(), "", include);
        }
        /// <summary> </summary>
        public static String json_site_options(String exclude, String include) {
            return json_site_options(siteService.getCurrentSite(), exclude, include);
        }
        /// <summary> </summary>
        public static String json_site_options(site site, String exclude, String include) {
            Hashtable site_options = new Hashtable();
            var jss = new JavaScriptSerializer();
            String[] excludes = exclude.Split(',');
            String[] includes = include.Split(',');
            foreach (options item in site.options) {
                if (excludes.Length > 0) {
                    foreach (String excd in excludes) {
                        if (!item.option_key.Contains(excd)) {
                            site_options.Add(item.option_key, item.value.ToString());//ie: post.get_meta("title");
                            break;
                        }
                    }
                }
                if (includes.Length > 0) {
                    foreach (String incd in includes) {
                        if (item.option_key.Contains(incd)) {
                            site_options.Add(item.option_key, item.value.ToString());//ie: post.get_meta("title");
                            break;
                        }
                    }
                }
                if (includes.Length == 0 && excludes.Length == 0) {
                    site_options.Add(item.option_key, item.value.ToString());
                }
            }
            
            var settings = jss.Serialize(site_options).Replace("\"0\"", "false").Replace("\"1\"", "true");
            return settings;
        }





        /// <summary> </summary>
        public Hashtable getAppHashTable() {
            Hashtable hash = HttpContext.Current.Application["sites"] as Hashtable;
            if (hash == null) {
                HttpContext.Current.Application["sites"] = new Hashtable();
                hash = HttpContext.Current.Application["sites"] as Hashtable;
            }
            return hash;
        }

        /// <summary> </summary>
        public site getsiteFromAppScope(String host) {
            Hashtable hash = getAppHashTable();
            if (hash[host.ToLower()] == null) {
                hash[host.ToLower()] = "";//getsiteByHostFromDB(host.ToLower());
            }

            return hash[host.ToLower()] as site;
        }

        /// <summary> </summary>
        public site getsite() {
            String hostname = getHostNameFromContext();
            return getsiteFromAppScope(hostname);
        }

        /// <summary> </summary>
        public void clearsite() {
            Hashtable hash = getAppHashTable();
            hash[getHostNameFromContext()] = null;
            HttpContext.Current.Application["sites"] = hash;
        }

        /// <summary> </summary>
        public String getHostNameFromContext() {
            String host = HttpContext.Current.Request.Url.Host;
            if (HttpContext.Current.Request.Url.Port != 80 && HttpContext.Current.Request.Url.Port != 443)
                host += ":" + HttpContext.Current.Request.Url.Port;
            return host;
        }

        /// <summary> </summary>
        internal static bool debug_mode() {
            return siteService.getCurrentSite().get_option("state_debug") == "1";
        }
    }
}
