#region Directives
using stellar.Models;
using stellar.Services;

using System;
using System.Data;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web;
//using MonoRailHelper;

using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Collections;
using Castle.ActiveRecord;
using log4net;
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class cacheService {
        ILog log = log4net.LogManager.GetLogger("CacheService");
        siteService siteService = new siteService();

        /// <summary> </summary>
        public object getCachedVersion(String cmsurl, bool ismobile) {
            cmsurl = fixurl(cmsurl);
            Hashtable cache = getCorrectHashtable(ismobile);
            return cache[cmsurl];
        }


        /// <summary> </summary>
        public static Boolean flushAllCached() {
            return flushAllCached(0);
        }
        /// <summary> </summary>
        public static Boolean flushAllCached(int hours) {
            return flushCache(file_info.root_path() + "cache/", hours);
        }
        /// <summary> </summary>
        public static Boolean flushMenuCache(int hours) {
            return flushCache(file_info.root_path() + "cache/html/menu/0_menu.ext", hours);
        }
        /// <summary> </summary>
        public static Boolean flushCache(String cachePath, int hours) {
            if (File.Exists(cachePath)) {
                FileInfo fi = new FileInfo(cachePath);
                if (fi.LastWriteTime <= DateTime.Now.AddHours(hours)) {
                    fi.Delete();
                    return false;
                }
            }
            return true;
        }

        /// <summary> </summary>
        public Hashtable getCorrectHashtable(bool ismobile) {
            if (ismobile) {
                if (HttpContext.Current.Application["mobilecache"] == null) {
                    HttpContext.Current.Application["mobilecache"] = new Hashtable();
                }
                return HttpContext.Current.Application["mobilecache"] as Hashtable;
            } else {
                if (HttpContext.Current.Application["cache"] == null) {
                    HttpContext.Current.Application["cache"] = new Hashtable();
                }
                return HttpContext.Current.Application["cache"] as Hashtable;
            }
        }


        /*Come back to 
        

        public void setCachedVersion(String cmsurl, object renderedtext, bool ismobile) {
            cmsurl = fixurl(cmsurl);
            Hashtable cache = getCorrectHashtable(ismobile);
            if (renderedtext != null)
                cache.Remove(cmsurl);
            else
                cache[cmsurl] = renderedtext;
        }

        public void clearCachedVersion(int ResourceId) {
            posting resource = ActiveRecordBase<posting>.Find(ResourceId);
            String cmsurl = null;
            bool validurl = true;
            Uri cmsuri = null;
            try {
                cmsuri = new Uri(new Uri(resource.Site.URL.ToLower()), resource.FullPath.ToLower());
            } catch (Exception) {
                validurl = false;
            }
            if (validurl) {
                cmsurl = cmsuri.ToString();
                cmsurl = fixurl(cmsurl);
                setCachedVersion(cmsurl, null, true);
                setCachedVersion(cmsurl, null, false);
                foreach (SiteAlias alias in resource.Site.Aliases) {
                    try {
                        cmsuri = new Uri(new Uri(alias.Alias.ToLower()), resource.FullPath.ToLower());
                        cmsurl = cmsuri.ToString();
                        cmsurl = fixurl(cmsurl);
                        setCachedVersion(cmsurl, null, true);
                        setCachedVersion(cmsurl, null, false);
                    } catch (Exception) {
                        // bad uri
                    }
                }
            }
        }

        public void clearCachedVersion(String cmsurl) {
            cmsurl = fixurl(cmsurl);
            setCachedVersion(cmsurl, null, true);
            setCachedVersion(cmsurl, null, false);
        }

        public void clearCachedVersion(posting resource) {
            if (resource != null) {
                String resourcepath = "";//resource.FullPath;
                if (resourcepath != null && resourcepath.Length > 1)
                    resourcepath = resourcepath.Substring(1, resourcepath.Length - 1);
                String cmsurl = "";// fixurl(resource.site.URL + resourcepath);
                setCachedVersion(cmsurl, null, true);
                setCachedVersion(cmsurl, null, false);

                foreach (site_alias sa in ActiveRecordBase<site_alias>.FindAll()) {
                    cmsurl = fixurl(sa.alias + resourcepath);
                    setCachedVersion(cmsurl, null, true);
                    setCachedVersion(cmsurl, null, false);
                }
            }
        }

        public void clearCache() {
            HttpContext.Current.Application["cache"] = new Hashtable();
            HttpContext.Current.Application["mobilecache"] = new Hashtable();
        }
        
        public void clearProxyCache(ProxyEntry proxy) {
            foreach (String key in HttpContext.Current.Application.AllKeys) {
                if (key != null && key.Contains("proxycache")) {
                    HttpContext.Current.Application[key] = null;
                }
            }
        }

        public void clearProxyCache() {
            foreach (ProxyEntry entry in ActiveRecordBase<ProxyEntry>.FindAll()) {
                clearProxyCache(entry);
            }
        }
        */
        /// <summary> </summary>
        public String fixurl(String url) {
            if (!String.IsNullOrEmpty(url)) {
                url = url.ToLower();
                url = url.Replace(" ", "%20");
            }
            return url;
        }

        // Final URL is one that has all variables rendered if it has variables
        /*public object getCacheContents(String finalurl) {
            log.Info("getCacheContents: " + finalurl);
            if (siteService.getSite().isDevelopment())
                return "";
            bool getcache = true;
            String content = "";
            finalurl = fixurl(finalurl);
            if (HttpContext.Current.Request.HttpMethod == "POST")
                getcache = false;
            if (getcache && HttpContext.Current.Application["proxycache" + finalurl] != null) {
                log.Info("getcacheforproxy: true");
                content = HttpContext.Current.Application["proxycache" + finalurl] as String;
            } else
                log.Info("getcacheforproxy: false");
            return content;
        }

        
        // Final URL is one that has all variables rendered if it has variables
        public String getCacheContents(ProxyEntry proxyEntry, String finalurl) {
            finalurl = fixurl(finalurl);
            String content = "";
            // Need this switchable in the admin
            bool getcache = true;
            if (proxyEntry.CacheTime == 0)
                getcache = false;
            if (HttpContext.Current.Application["proxycachetime" + proxyEntry.Id + "-" + finalurl] != null) {
                log.Info("proxycachetime is set: " + HttpContext.Current.Application["proxycachetime" + proxyEntry.Id + "-" + finalurl]);
                DateTime cachetime = (DateTime)HttpContext.Current.Application["proxycachetime" + proxyEntry.Id + "-" + finalurl];
                DateTime nowTime = DateTime.Now;
                TimeSpan span = nowTime.Subtract(cachetime);
                if (span.Hours > proxyEntry.CacheTime) {
                    getcache = false;
                    log.Info("Not getting cache because the span was " + span.Hours + " and cache time was set to " + proxyEntry.CacheTime);
                }
            } else
                log.Info("No cache found in the app context");
            if (HttpContext.Current.Request.HttpMethod == "POST")
                getcache = false;
            if (getcache && HttpContext.Current.Application["proxycache" + proxyEntry.Id + "-" + finalurl] != null) {
                log.Info("getcacheforproxy: true");
                content = HttpContext.Current.Application["proxycache" + proxyEntry.Id + "-" + finalurl] as String;
            } else
                log.Info("getcacheforproxy: false");
            return content;
        }

        public void setCacheContents(ProxyEntry proxyEntry, String finalurl, String content) {
            finalurl = fixurl(finalurl);
            if (!content.Contains("Stack Trace") && !content.Contains("Server Error")) {
                HttpContext.Current.Application["proxycache" + proxyEntry.Id + "-" + finalurl] = content;
                HttpContext.Current.Application["proxycachetime" + proxyEntry.Id + "-" + finalurl] = DateTime.Now;
            }
        }
       
        public void setCacheContents(String finalurl, object content) {
            if (!siteService.getSite().isDevelopment()) {
                finalurl = fixurl(finalurl);
                HttpContext.Current.Application["proxycache" + finalurl] = content;
                HttpContext.Current.Application["proxycachetime" + finalurl] = DateTime.Now;
            }
        }
 */

    }
}
