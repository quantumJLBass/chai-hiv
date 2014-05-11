#region Directives
using stellar.Models;
using stellar.Services;
using Castle.ActiveRecord;
using System;
using System.Data;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web;
//using MonoRailHelper;

using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Reflection;
using NHibernate.Criterion;
using System.Security;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.ComponentModel;
using System.Collections;
using log4net;
using System.Xml.Linq;
using System.Collections.Specialized;

using Castle.MonoRail.Framework.Configuration;

#endregion

namespace stellar.Services {
    public class themeService {
        ILog log = log4net.LogManager.GetLogger("themeService");
        /* this is just a shell to work with the postings in the key word of templates. 
         i think the goal should to be to make this install able so that you can 
         simple expand the base which is everything posted is a post 
         but is handled the way it needs to be */
        public static IList<posting> get_published_templates(String type_alias) {
            return get_published_templates(type_alias, false);
        }
        public static IList<posting> get_published_templates(String type_alias, Boolean usedev) {
            return get_templates(type_alias, false, false,null);
        }


        public static IList<posting> get_working_templates(String type_alias) {
            return get_working_templates(type_alias, false);
        }

        public static IList<posting> get_working_templates(String type_alias, Boolean usedev) {
            return get_templates(type_alias, usedev, false,null);
        }

        public static IList<posting> get_templates(String type_alias, Boolean usedev, Boolean deleted, posting parent) {
            return postingService.get_general_postings(type_alias, usedev, deleted, parent);
        }

        private static String veiw_path() {
            MonoRailConfiguration section = (MonoRailConfiguration)ConfigurationManager.GetSection("monorail");
            string path = section.ViewEngineConfig.ViewPathRoot;
            return path;
        }
        private static String virtural_veiw_path() {
            MonoRailConfiguration section = (MonoRailConfiguration)ConfigurationManager.GetSection("monorail");
            string path = section.ViewEngineConfig.VirtualPathRoot;
            return path;
        }

        


        #region(info and lists)
            public static List<Hashtable> list_themes() {
                return list_themes("frontend");

            }
            public static List<Hashtable> list_themes(String mode) {
                List<Hashtable> themelist = new List<Hashtable>();
                foreach (String f in Directory.GetFiles(file_info.site_content_path() + "/themes/", "theme_info.txt", SearchOption.AllDirectories)) {

                    string content = System.IO.File.ReadAllText(f);
                    string body_pattern = @"\*\s+?theme\s?:\s?(?<theme>(.*))\r?";
                    MatchCollection body_matches = Regex.Matches(content, body_pattern);

                    String theme = "";
                    foreach (Match matched in body_matches) {
                        theme = matched.Groups["theme"].Value.Trim();
                    }

                    body_pattern = @"\*\s+?author\s?:\s?(?<author>(.*))\r?";
                    body_matches = Regex.Matches(content, body_pattern);

                    String author = "";
                    foreach (Match matched in body_matches) {
                        author = matched.Groups["author"].Value.Trim();
                    }

                    body_pattern = @"\*\s+?version\s?:\s?(?<version>(.*))\r?";
                    body_matches = Regex.Matches(content, body_pattern);

                    String version = "";
                    foreach (Match matched in body_matches) {
                        version = matched.Groups["version"].Value.Trim();
                    }

                    Hashtable output = new Hashtable();
                    output.Add("theme",theme);
                    output.Add("author",author);
                    output.Add("version",version);


                    themelist.Add(output);
                }
                return themelist;
            }
        #endregion



        /*
        public static string render_admin_layout(String action, IDictionary PropertyBag) {
            return render_admin_view("", action, PropertyBag);
        }

        public static string render_admin_view(String action, IDictionary PropertyBag) {
            return render_admin_view("",action,PropertyBag);
        }
        public static string render_admin_view(String controller, String action, IDictionary PropertyBag) {
            // find "default"
            // find "live"
            String theme = "default";
            String txt = renderService.proccessText(
                                                objectService.PropertyBag_to_params(PropertyBag, new Hashtable()),
                                                file_handler.read_from_file(get_admin_path(theme, controller, action))
                                            );
            return txt;
        }
        */




        #region(paths)
        //themeService.get_theme_alias()
        public static String current_theme_alias() {
            return current_theme_alias(siteService.getCurrentSite());
        }
        public static String current_theme_alias(site site) {
            String theme = site.get_option("current_site_theme");
            return theme == "" ? "base" : theme;
        }




        public static string get_file_from_theme(String file, String type) {
            return get_file_from_theme(file, themeService.current_theme_alias(), "frontend", type);
        }
        public static string get_file_from_theme(String file, String mode, String type){
            return get_file_from_theme(file, themeService.current_theme_alias(), mode, type);
        }
        public static string get_file_from_theme(String file, String theme, String mode, String type){
            String BASEPATH = theme_path(siteService.getCurrentSite(), theme, mode, type).Trim('/');
            String themefile = BASEPATH + "/" + file.Trim('/');
            if (file_info.file_exists(themefile)) return themefile;

            BASEPATH = theme_path(siteService.getCurrentSite(), "base", mode, type).Trim('/');
            themefile = BASEPATH + "/" + file.Trim('/');
            if (file_info.file_exists(themefile)) return themefile;

            return file;
        }








        public static String theme_path(String type) {
            return theme_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_path(String theme, String type) {
            return theme_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static String theme_path(site site, String type) {
            return theme_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_path(site site, String theme, String type) {
            return theme_path(site, theme, "frontend", type);
        }
        public static String theme_path(site site, String theme, String mode, String type) {
            String BASEPATH = site.local_path.Trim('/');
            return file_info.normalize_path(BASEPATH + "/" + relative_theme_path(site, theme, mode, type).Trim('/') + "/");
        }

        public static string virtual_theme_path(String type) {
            return virtual_theme_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static string virtual_theme_path(String theme, String type) {
            return virtual_theme_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static string virtual_theme_path(site site, String type) {
            return virtual_theme_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static string virtual_theme_path(site site, String theme, String type) {
            return virtual_theme_path(site, theme, "frontend", type);
        }
        public static string virtual_theme_path(site site, String theme, String mode, String type) {
            return "~/" + relative_theme_path(site, theme, mode, type).Trim('/') + "/";
        }

        public static string relative_theme_path(String type) {
            return relative_theme_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static string relative_theme_path(String theme, String type) {
            return relative_theme_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static string relative_theme_path(site site, String type) {
            return relative_theme_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static string relative_theme_path(site site, String theme, String type) {
            return relative_theme_path(site, theme, "frontend", type);
        }
        public static string relative_theme_path(site site, String theme, String mode, String type) {
            String path = file_info.relative_site_content_path(site.alias).Trim('/') + "/cache/published/" + theme + "/" + mode + "/" + type + "/";
            if (!Directory.Exists(path)) path = file_info.relative_site_content_path(site.alias).Trim('/') + "/cache/published/base/" + mode + "/" + type + "/";
            if (!Directory.Exists(path) && mode == "admin") path = relative_theme_admin_path().Trim('/') + "/default/" + type + "/";
            return path;
        }



        public static string theme_adminfallback_path() {
            return file_info.root_path().Trim('/') + "/" + relative_theme_admin_path().Trim('/');
        }
        //the Views is set form the config.  Need to read that.
        public static string relative_theme_admin_path() {
            return "/" + virtural_veiw_path() + "/admin/";
        }




        //Skin is js / img / css
        public static string virtual_theme_skin_path(String type) {
            return virtual_theme_skin_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static string virtual_theme_skin_path(String theme, String type) {
            return virtual_theme_skin_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static string virtual_theme_skin_path(site site, String type) {
            return virtual_theme_skin_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static string virtual_theme_skin_path(site site, String theme, String type) {
            return virtual_theme_skin_path(site, theme, "frontend", type);
        }
        public static string virtual_theme_skin_path(site site, String theme, String mode, String type) {
            return "~/" + relative_theme_skin_path(site, theme, mode, type).Trim('/') + "/";
        }

        public static String theme_skin_path(String type) {
            return theme_skin_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_skin_path(String theme, String type) {
            return theme_skin_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static String theme_skin_path(site site, String type) {
            return theme_skin_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_skin_path(site site, String theme, String type) {
            return theme_skin_path(site, theme, "frontend", type);
        }
        public static String theme_skin_path(site site, String theme, String mode, String type) {
            String BASEPATH = site.local_path.Trim('/');
            return file_info.normalize_path(BASEPATH + "/" + relative_theme_skin_path(site, theme, mode, type).Trim('/') + "/");
        }

        public static String theme_skin_url(String type) {
            return theme_skin_url(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_skin_url(String theme, String type) {
            return theme_skin_url(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static String theme_skin_url(site site, String type) {
            return theme_skin_url(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static String theme_skin_url(site site, String theme, String type) {
            return theme_skin_url(site, theme, "frontend", type);
        }
        public static String theme_skin_url(site site, String theme, String mode, String type) {
            String BASEURL = site.base_url.Trim('/');
            return BASEURL + "/" + file_info.normalize_path(relative_theme_skin_path(site, theme, mode, type)).Trim('/');
        }

        public static string relative_theme_skin_path(String type) {
            return relative_theme_skin_path(siteService.getCurrentSite(), themeService.current_theme_alias(), "frontend", type);
        }
        public static string relative_theme_skin_path(String theme, String type) {
            return relative_theme_skin_path(siteService.getCurrentSite(), theme, "frontend", type);
        }
        public static string relative_theme_skin_path(site site, String type) {
            return relative_theme_skin_path(site, themeService.current_theme_alias(), "frontend", type);
        }
        public static string relative_theme_skin_path(site site, String theme, String type) {
            return relative_theme_skin_path(site, theme, "frontend", type);
        }
        public static string relative_theme_skin_path(site site, String theme, String mode, String type) {
            String path = file_info.relative_site_content_path(site.alias).Trim('/') + "/cache/published/" + theme + "/" + mode + "/content/" + type + "/";
            if (!Directory.Exists(path)) path = file_info.relative_site_content_path(site.alias).Trim('/') + "/cache/published/base/" + mode + "/content/" + type + "/";
            if (!Directory.Exists(path) && mode == "admin") path = relative_theme_admin_path().Trim('/') + "/default/content/" + type + "/";
            return path;
        }









        public void scrub_skin_file(String file){
            String tmp = file_handler.read_from_file(file);

            file_handler.write_to_file(file, tmp);
        }


        #endregion

    }
}
