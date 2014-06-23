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

using SquishIt.Framework;
using SquishIt.Framework.CSS;
using SquishIt.Framework.JavaScript;
using System.Collections.Generic;
using System.Collections;
using log4net;

#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class scriptsService {
        ILog log = log4net.LogManager.GetLogger("scriptsService");

        /// <summary> </summary>
        public static String Css(String files) { return Css(files, "frontend", false); }
        /// <summary> </summary>
        public static String Css(String files, String mode) { return Css(files, mode, false); }
        /// <summary> </summary>
        public static String Css(String files, Boolean debug) { return Css(files, "frontend", debug); }
        /// <summary> </summary>
        public static String Css(String files,String mode, Boolean debug) {

            String name = helperService.CalculateMD5Hash(files);
            String path = file_info.virtual_site_cache_path().Trim('/')+"/scripts/css/";
            path = file_info.normalize_path(path);
            String dir = Path.GetDirectoryName(path);
            try {
                if (!Directory.Exists(dir)) {
                    DirectoryInfo di = Directory.CreateDirectory(dir);
                }
            } catch { }//let it pass

            String FilePath = file_info.normalize_path(path + name + ".css");

            if (!file_info.dir_exists(path)) {
                System.IO.Directory.CreateDirectory(path);
            }
            site site = siteService.getCurrentSite();
            String theme = themeService.current_theme_alias();
            CSSBundle css = new CSSBundle();
            foreach (string fl in files.Split(',')) {
                String filepath = themeService.virtual_theme_skin_path(site, theme, mode, "css").Trim('/') + "/" + fl.Trim('/'); // this is terrible.. 
                if (!file_info.file_exists(filepath)){
                    filepath = themeService.virtual_theme_skin_path(site, "base", mode, "css").Trim('/') + "/" + fl.Trim('/');
                }
                if (file_info.file_exists(filepath)) {
                    css.Add(filepath);
                }
            }
            String output = "";
            debug = true;
            if (debug) {
                output = css.ForceRelease().ForceDebug().Render(FilePath);
            } else {
                try{
                    output = css.ForceRelease().Render(FilePath);
                }catch{
                    return css.ForceRelease().ForceDebug().Render(FilePath) + "<!-- there is something wrong with your css and can't be parsed -->";
                }
            }
            return output;
        }
        /// <summary> </summary>
        public static String Js(String files) { return Js(files, "frontend", false); }
        /// <summary> </summary>
        public static String Js(String files, String mode) { return Js(files, mode, false); }
        /// <summary> </summary>
        public static String Js(String files, Boolean debug) { return Js(files, "frontend", debug); }
        /// <summary> </summary>
        public static String Js(String files,String mode, Boolean debug) {
            String name = helperService.CalculateMD5Hash(files);
            String path = file_info.virtual_site_cache_path().Trim('/') + "/scripts/js/";
            path = file_info.normalize_path(path);
            String dir = Path.GetDirectoryName(path);
            
            try {
                if (!Directory.Exists(dir)) {
                    DirectoryInfo di = Directory.CreateDirectory(dir);
                }
            } catch { }//let it pass
            String FilePath = file_info.normalize_path(path + name + ".js");

            if (!file_info.dir_exists(path)) {
                System.IO.Directory.CreateDirectory(path);
            }
            site site = siteService.getCurrentSite();
            String theme = themeService.current_theme_alias();
            JavaScriptBundle js = new JavaScriptBundle();
            foreach (string fl in files.Split(',')) {
                String filepath = themeService.virtual_theme_skin_path(site, theme, mode, "js").Trim('/') + "/" + fl.Trim('/');
                if (!file_info.file_exists(filepath)){
                    filepath = themeService.virtual_theme_skin_path(site, "base", mode, "js").Trim('/') + "/" + fl.Trim('/');
                }
                if (file_info.file_exists(filepath)) {
                    js.Add(filepath);
                }
            }
            String output = "";
            debug = true;
            if (debug == true) {
                output = js.ForceRelease().ForceDebug().Render(FilePath);
            } else {
                try {
                    output = js.ForceRelease().Render(FilePath);
                    if (!String.IsNullOrWhiteSpace(output)) {
                        String content = file_handler.read_from_file(FilePath);
                        content = htmlService.filter_file_images_paths(content, themeService.theme_skin_url(site, theme, mode, "images"));
                        if (!String.IsNullOrWhiteSpace(content)) {
                            file_handler.write_to_file(FilePath, content);
                        }
                    }
                } catch {
                    output = js.ForceRelease().ForceDebug().Render(FilePath) +"<!-- there is something wrong with your css and can't be parsed -->";
                }
            }

            return output;
        }
    }
}
