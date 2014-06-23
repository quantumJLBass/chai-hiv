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
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Specialized;
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;
using stellar.Services;
using log4net;
using log4net.Config;
using Goheer.EXIF;
using System.Runtime.InteropServices;
using System.Collections;
using System.Reflection;
#endregion

namespace stellar.Services {
    /// <summary>
    /// This is for returning information on a file.  Get path info to light searching
    /// </summary>
    public class file_info : file_handler {

        #region(paths)
            /// <summary>
            /// Function output a string of the root path
            /// </summary>
            /// <returns>Return String - a string of the root path of the applaction root</returns>
            public static String root_path() {

                NameValueCollection section = (NameValueCollection)ConfigurationManager.GetSection("site_config");
                string setting = section["root"];
                if (String.IsNullOrWhiteSpace(setting)) return setting;

                /*
                String path = VirtualPathUtility.ToAppRelative("~");

                if (!String.IsNullOrWhiteSpace(path)) return path;
                */
                String path = Path.GetDirectoryName(new Uri(Assembly.GetExecutingAssembly().GetName().CodeBase).LocalPath).Replace("bin", "");
                return path;
            }

            /// <summary>
            /// Function output a string of the root path
            /// </summary>
            /// <returns>Return String - a string of the root path of the site requested</returns>
            public static String site_path() {
                return site_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String site_path(string site_alias) {
                site site = ActiveRecordBase<site>.FindOne(new List<AbstractCriterion>() { 
                                Expression.Eq("alias", site_alias)
                            }.ToArray());
                return site.local_path;
            }

            /// <summary> </summary>
            public static String site_content_path() {
                return site_content_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String site_content_path(string site_alias) {
                String path = normalize_path(site_path(site_alias) + relative_site_content_path(site_alias).Trim('/'));
                return path;
            }
            /// <summary> </summary>
            public static String relative_site_content_path() {
                return relative_site_content_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String relative_site_content_path(string site_alias) {
                return "/site_content/" + site_alias +"/";
            }

            /// <summary> </summary>
            public static String site_uploads_path() {
                return site_uploads_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String site_uploads_path(string site_alias) {
                String path = normalize_path(site_path(site_alias) + relative_site_uploads_path(site_alias).Trim('/'));
                if (!Directory.Exists(path)) { DirectoryInfo di = Directory.CreateDirectory(path); };
                return path;
            }

            /// <summary> </summary>
            public static String relative_site_uploads_path() {
                return relative_site_uploads_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String relative_site_uploads_path(string site_alias) {
                return relative_site_content_path(site_alias) + "uploads/";
            }

            /// <summary> </summary>
            public static String site_cache_path() {
                return site_cache_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String site_cache_path(string site_alias) {
                String path = normalize_path(site_path(site_alias) + relative_site_cache_path(site_alias).Trim('/'));
                if (!Directory.Exists(path)) { DirectoryInfo di = Directory.CreateDirectory(path); }
                return path;
            }

            /// <summary> </summary>
            public static String relative_site_cache_path() {
                return relative_site_cache_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String relative_site_cache_path(string site_alias) {
                return relative_site_content_path(site_alias) + "cache/";
            }

            /// <summary> </summary>
            public static String virtual_site_cache_path() {
                return virtual_site_cache_path(siteService.getCurrentSite().alias);
            }
            /// <summary> </summary>
            public static String virtual_site_cache_path(string site_alias) {
                return "~/"+relative_site_content_path(site_alias).Trim('/') + "/cache/";
            }



        #endregion

        #region(basic information)
            /*thought is that we should be doing tests */
            /// <summary> </summary>
            public static String file_extension(String file) {
                String ext = Path.GetExtension(file);
                return ext;
            }
        #endregion

        #region(tests)

            /// <summary>
            /// Is the path we are looking at a relative path
            /// </summary>
            /// <param name="file"></param>
            /// <returns></returns>
            public static Boolean is_relative_path(String file) {
                return System.IO.Path.IsPathRooted(@"" + file);
            }

            /// <summary>
            /// A simple check to see if it's a known media file
            /// </summary>
            /// <param name="extension">the file extension</param>
            /// <returns></returns>
            public static Boolean is_media_file(String extension) {
                List<String> filetypes = new List<String>();
                    filetypes.Add("image");
                    filetypes.Add("audio");
                    filetypes.Add("video");
                String mime = file_mime.mime_type(extension);
                foreach(String filetype in filetypes){
                    if ( mime.IndexOf(filetype) > -1 ) return true;
                }
                return false;
            }


            //not sure on this, we need to ba able to say, do we put the version info in the content of the file, or do we put it in the metadate
            /// <summary> </summary>
            public static Boolean does_in_content_metadata(String extension) {
                if (is_media_file(extension)) return false;
                return true;
            }

            /// <summary>
            /// Function to take any manor of path and resolve if the Directory is really there
            /// </summary>
            /// <param name="sDirName">Directory path to be checked</param>
            /// <returns>Boolean - Return true if found</returns>
            public static bool dir_exists(string sDirName) {
                try {
                    if (System.IO.Directory.Exists(sDirName))
                        return true;
                    if (System.IO.Directory.Exists("~/" + sDirName.Trim('/').Replace("../", "")))
                        return true;
                    if (System.IO.Directory.Exists("~/" + sDirName.Trim('/').Replace("~/", "")))
                        return true;
                    if (System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/" + sDirName.Trim('/').Replace("../", ""))))
                        return true;
                    if (System.IO.Directory.Exists(HttpContext.Current.Server.MapPath("~/" + sDirName.Trim('/').Replace("~/", ""))))
                        return true;
                    return false;
                } catch (Exception ex) {
                    logger.writelog(ex.Message);
                    return (false);//Exception occured, return False
                }
            }

            /// <summary>
            /// Function to take any manor of path and resolve if the file is really there
            /// </summary>
            /// <param name="file">File path to be checked</param>
            /// <returns>Boolean - Return true if found</returns>
            public static Boolean file_exists(string file) {
                if (String.IsNullOrWhiteSpace(file)) return false;
                try {
                    try {
                        if (System.IO.File.Exists(file))
                            return true;//exit first thing
                    } catch { }
                    
                    //If there is some bad path prepended to the front let's remove it
                    if (file.IndexOf("~/") > -1) {
                        String[] tmpf = file.Split(new string[] { "~/" }, StringSplitOptions.None);
                        file = "~/" + tmpf[tmpf.Length - 1];
                    }
                    //Create an array of possible corrected paths
                    String[] alt_file_paths = new String[]{
                        "~/" + file.Replace("~/", "").Replace("../", "").Trim('/'),
                        root_path().Trim('/') + "/" + file.Trim('/'),
                        HttpContext.Current.Server.MapPath("~/" + file.Replace("~/", "").Trim('/')),
                        (file.IndexOf("~/") > -1) ? HttpContext.Current.Server.MapPath(file) : file_info.true_file_path(file)
                    };
                    //Return the first one avilible
                    foreach (String path in alt_file_paths) {
                        try {
                            if (System.IO.File.Exists(path))
                                return true;
                        } catch { }
                    }
                    
                    return false;
                } catch (Exception ex) {
                    ex.Message.Insert(ex.Message.Length, "\r\n" + file); // lets try to provide the file just in case
                    logger.writelog(ex.Message);
                    return false;//Exception occured, let the string pass with truse the dev knows what's up
                }
            }


        #endregion

        #region(querying)
        /// <summary>
        /// Function to loop thru the directories and complie a list of files
        /// </summary>
        /// <returns>List - Return list of paths found</returns>
        public static List<string> DirSearch(string sDir) {
            return DirSearch(sDir, "", "", 0, 999, 0);
        }
        /// <summary> </summary>
        public static List<string> DirSearch(string sDir, string splitOn) {
            return DirSearch(sDir, splitOn, "", 0, 999, 0);
        }
        /// <summary> </summary>
        public static List<string> DirSearch(string sDir, string splitOn, string ext) {
            return DirSearch(sDir, splitOn, ext, 0, 999, 0);
        }
        /// <summary> </summary>
        public static List<string> DirSearch(string sDir, string splitOn, string ext, int start) {
            return DirSearch(sDir, splitOn, ext, start, 999, 0);
        }
        /// <summary> </summary>
        public static List<string> DirSearch(string sDir, string splitOn, string ext, int start, int end) {
            return DirSearch(sDir, splitOn, ext, start, end, 0);
        }
        /// <summary> </summary>
        public static List<string> DirSearch(string sDir, string splitOn, string ext, int start, int end, int recursion) {
            List<string> fileList = new List<string>();
            String path = file_handler.true_file_path(sDir,true);
            if (recursion >= start) {
                //get everything in this folder
                if (dir_exists(path)) {//Directory.Exists(path)) {
                    foreach (string f in Directory.GetFiles(path)) {
                        if ((!String.IsNullOrWhiteSpace(ext)) && !f.ToString().Contains(ext))
                            continue;
                        String File = file_handler.normalize_path(f);
                        if (!String.IsNullOrWhiteSpace(splitOn)) {
                            string[] flines = Regex.Split(File, splitOn);
                            File = flines[flines.Length-1].ToString();
                        }
                        fileList.Add(File);
                    }
                }
            }
            //get all the new dirs to loop thru
            if (dir_exists(path)) {//Directory.Exists(path)) {
                foreach (string d in Directory.GetDirectories(path)) {
                    if (!d.ToString().Contains(".svn")) {
                        if (recursion < end) {
                            fileList.AddRange(DirSearch(d, ext, splitOn, start, end, recursion + 1)); // dive one more lower if we can.
                        }
                    }
                }
            }
            fileList.Sort();
            return fileList;
        }








        /// <summary> </summary>
        public static Hashtable get_file_info(String file) {
            Hashtable info = new Hashtable();

            file = file_handler.true_file_path(file);

            FileInfo oFileInfo = new FileInfo(file);
            info.Add("name", oFileInfo.Name);
            DateTime dtCreationTime = oFileInfo.CreationTime;
            info.Add("CreationTime", dtCreationTime.ToString());
            info.Add("ext", oFileInfo.Extension);
            info.Add("filesize", oFileInfo.Length.ToString());
            info.Add("dirpath", oFileInfo.DirectoryName);
            info.Add("fullname", oFileInfo.FullName);

            return info;
        }

















        #endregion

        #region(file locking)

        /// <summary>
        /// Check if the file is locked
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public static bool is_locked(String file) {
            FileInfo fileinfo = new FileInfo(file);
            FileStream stream = null;

            try {
                stream = fileinfo.Open(FileMode.Open, FileAccess.ReadWrite, FileShare.None);
            } catch (IOException) {
                //the file is unavailable because it is:
                //still being written to
                //or being processed by another thread
                //or does not exist (has already been processed)
                return true;
            } finally {
                if (stream != null)
                    stream.Close();
            }

            //file is not locked
            return false;
        }
        //maybe who locked it? time of locking?  crossref with db on editing prop

        #endregion

    }
}
