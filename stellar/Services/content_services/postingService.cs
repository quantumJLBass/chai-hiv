#region Directives
using stellar.Models;
using stellar.Services;
using Castle.ActiveRecord;
using System;
using System.Linq;
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
using System.Globalization;
#endregion

namespace stellar.Services {
    public class postingService {

        #region(queries)
            /// <summary>
            /// Get a list of post_type objects
            /// </summary>
            /// <returns></returns>
            public static IList<posting_type> get_post_types() {
                return get_post_types(false);
            }

            public static IList<taxonomy> get_taxonomies(String taxonomy_type) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("taxonomy_type", ActiveRecordBase<taxonomy_type>.FindAll(
                           new List<AbstractCriterion>() { Expression.Eq("alias", taxonomy_type) }.ToArray()
                       ).FirstOrDefault()));
                return ActiveRecordBase<taxonomy>.FindAll(new Order[] { Order.Asc("name") },filtering.ToArray());
            }



            public static taxonomy get_taxonomy(String alias) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("alias", alias));

                taxonomy taxonomy = ActiveRecordBase<taxonomy>.FindFirst(filtering.ToArray());
                return taxonomy;
            }
            public static taxonomy get_taxonomy(String alias, String taxonomy_type) {
                return get_taxonomy("", alias, taxonomy_type);
            }
            public static taxonomy get_taxonomy(String prefix, String alias, String taxonomy_type) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("alias", String.IsNullOrWhiteSpace(prefix) ? "" : prefix + "__" + alias));
                filtering.Add(Expression.Eq("taxonomy_type", ActiveRecordBase<taxonomy_type>.FindAll(
                                           new List<AbstractCriterion>() { Expression.Eq("alias", taxonomy_type) }.ToArray()
                                       ).FirstOrDefault()));
                taxonomy taxonomy = ActiveRecordBase<taxonomy>.FindFirst(filtering.ToArray());
                if(taxonomy==null)taxonomy=get_taxonomy(alias);//fallback on single

                return taxonomy;
            }



            public static IList<posting_type> get_post_types(Boolean is_admin){
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("is_admin", is_admin));
                return ActiveRecordBase<posting_type>.FindAll(filtering.ToArray());
            }


            public static posting_type get_post_type(String alias) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("alias", alias));
                return ActiveRecordBase<posting_type>.FindFirst(filtering.ToArray());
            }


            public static int get_postype_id(dynamic item) {
                posting_type posting_type = ActiveRecordBase<posting_type>.FindAll(new Order("revision", false),
                           new List<AbstractCriterion>() { Expression.Eq("alias", item) }.ToArray()
                       ).FirstOrDefault();
                return posting_type.baseid;
            }

            public static String get_published_path(String type) {
                String tmptype = !String.IsNullOrWhiteSpace(type) ? type + "/" : "";
                String basePath = file_info.relative_site_content_path() + "published/" + tmptype;
                return basePath;
            }
            public static String get_working_path(String type) {
                String tmptype = !String.IsNullOrWhiteSpace(type) ? type + "/" : "";
                String basePath = file_info.relative_site_content_path() + "working/" + tmptype;
                return basePath;
            }
            public static String get_revision_path(String type) {
                String tmptype = !String.IsNullOrWhiteSpace(type) ? type + "/" : "";
                String basePath = file_info.relative_site_content_path() + "revision/" + tmptype;
                return basePath;
            }


            public static IList<posting> get_published_postings(String type_alias) {
                return get_published_postings(type_alias, false);
            }
            public static IList<posting> get_published_postings(String type_alias, Boolean usedev) {
                return get_general_postings(type_alias, false, false, null);
            }

            public static IList<posting> get_working_postings(String type_alias) {
                return get_working_postings(type_alias, false);
            }
            public static IList<posting> get_working_postings(String type_alias, Boolean usedev) {
                return get_general_postings(type_alias, usedev, false, null);
            }


            public static posting get_posting_by_url(String url, Boolean usedev) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add( Expression.Eq("site", siteService.getCurrentSite() ) );
                filtering.Add(Expression.Eq("url", url));
                posting[] post = ActiveRecordBase<posting>.FindAll(filtering.ToArray());
                return (post.Count() > 0) ? post.First() : new posting();
            }
            public static posting get_posting_by_hash(String hash, Boolean usedev) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("filehash", hash));
                posting[] post = ActiveRecordBase<posting>.FindAll(filtering.ToArray());
                return (post.Count() > 0) ? post.First() : new posting();
            }
            /// <summary>
            /// This will look up a posting by the static file.   It will look from the back of the path so foo.css 
            /// would pull up a posting that had it's static_file matching the fragment.  For example, we have a 
            /// posting that has a static_file property of /Content/css/frontend/foo.css and we looked it up by
            /// foo.css.  But if we had two postings with teh same file name then looking it up would only return the 
            /// fist matched posting.  It is suggested that you use as much of the path as you can to avoid this.  In the case
            /// just outlined, if the first posting had static_file property of /Content/css/frontend/foo.css and the second 
            /// posting had static_file property of /Content/css/admin/foo.css then the filepath argument for this s function
            /// should be /admin/foo.css for ensurence that the right one was returned.
            /// </summary>
            /// <param name="filepath">This is the fragment to look up for.</param>
            /// <param name="usedev"></param>
            /// <returns></returns>
            public static posting get_posting_by_file(String filepath, Boolean usedev) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filepath = filepath.Replace('\\', '/');
                filtering.Add(Expression.Like("static_file", "%" + filepath));
                posting[] post = ActiveRecordBase<posting>.FindAll(filtering.ToArray());
                return (post.Count() > 0) ? post.First() : new posting();
            }


            public static IList<posting> get_postings(String type_alias){
                return get_postings(type_alias,false,false,null);
            }
            public static IList<posting> get_postings(String type_alias, Boolean usedev, Boolean deleted, posting parent) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.IsNull("parent"));//make it the working post
                filtering.Add(Expression.Eq("deleted", deleted));
                filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                new List<AbstractCriterion>() { 
                                    Expression.Eq("alias", type_alias)
                                }.ToArray())
                            ));
                posting[] postlist = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("baseid") }, filtering.ToArray());
                List<posting> outputlist = new List<posting>();
                if (postlist.Count()>0){
                    foreach(posting post in postlist){
                        posting posting = post.get_published();
                        if (posting!=null) outputlist.Add(posting);
                    }
                }
                return outputlist;
            }


            public static IList<posting> get_general_postings(String type_alias, Boolean usedev, Boolean deleted, posting parent) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                if (parent == null) {
                    filtering.Add(Expression.IsNull("parent"));
                } else {
                    filtering.Add(Expression.Eq("parent", parent));
                }
                filtering.Add(Expression.Eq("deleted", deleted));
                filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                new List<AbstractCriterion>() { 
                                    Expression.Eq("alias", type_alias)
                                }.ToArray())
                            ));
                posting[] postlist = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("baseid") }, filtering.ToArray());
                return postlist;
            }
        #endregion

        #region(read/write)
            internal void delete_post<t>(int id) {
                dynamic post = ActiveRecordBase<t>.Find(id);
                post.deleted = true;
                ActiveRecordMediator<dynamic>.SaveAndFlush(post);
            }
            internal static void delete_item_forever(dynamic item) {
                if (item.owner == null || (item.owner.baseid == userService.getUser().baseid)) {
                    item = postingService.remove_item_ties(item);
                    ActiveRecordMediator<dynamic>.Delete(item);
                }
            }
            internal static _base remove_item_ties(_base item) {
                if (item.children != null && item.children.Count > 0) {//setup recursion
                    foreach (dynamic child in item.children) {// find revisions and published versions
                        delete_item_forever(child);
                    }
                }




                //get rid of any meta_data
                meta_data[] target_item_meta_data = ActiveRecordBase<meta_data>.FindAll().Where(x => x.post == item).ToArray();
                if (target_item_meta_data != null && target_item_meta_data.Count() > 0) {
                    foreach (dynamic meta_data in target_item_meta_data) {
                        ActiveRecordMediator<dynamic>.Delete(meta_data);
                    }
                }
                meta_data_date[] target_item_meta_data_date = ActiveRecordBase<meta_data_date>.FindAll().Where(x => x.post == item).ToArray();
                if (target_item_meta_data_date != null && target_item_meta_data.Count() > 0) {
                    foreach (dynamic meta_data_date in target_item_meta_data_date) {
                        ActiveRecordMediator<dynamic>.Delete(meta_data_date);
                    }
                }
                meta_data_geo[] target_item_meta_data_geo = ActiveRecordBase<meta_data_geo>.FindAll().Where(x => x.post == item).ToArray();
                if (target_item_meta_data_geo != null && target_item_meta_data_geo.Count() > 0) {
                    foreach (dynamic meta_data_geo in target_item_meta_data_geo) {
                        ActiveRecordMediator<dynamic>.Delete(meta_data_geo);
                    }
                }


                //get rid of any menu_options for the item
                menu_option[] target_item_menu_ops = ActiveRecordBase<menu_option>.FindAll().Where(x => x.post == item).ToArray();
                if (target_item_menu_ops != null && target_item_menu_ops.Count() > 0) {
                    foreach (dynamic menu_op in target_item_menu_ops) {
                        ActiveRecordMediator<dynamic>.Delete(menu_op);
                    }
                }










                ActiveRecordMediator<dynamic>.SaveAndFlush(item);//maybe update?
                return item;
            }

        #endregion

        #region(post metadata)
        /// <summary>
        /// This is to make the meta string block for a non-meta files.
        /// </summary>
        /// <param name="post"></param>
        /// <returns></returns>
            internal static String create_post_file_info(posting post) {
            String Block = "";
            Block = @"
#*
*   name:"+post.name+@"
*	alias:" + post.alias + @"
*	theme:" + post.theme + @"
*   version:" + post.version.ToString() + @"
*   revision:" + post.revision.ToString() + @"
*   owner:" + post.owner.nid + @"
*   discription: This is the comtentblock
*#

";
            return Block;
        }


        /// <summary>
        /// Strip the meta block for a non-meta files.
        /// </summary>
        /// <param name="file_content"></param>
        /// <returns></returns>
        public static String strip_post_file_info(String file_content) {
            if(!String.IsNullOrWhiteSpace(file_content)){
                string body_pattern = @"\s+?\#\*(?:\r?\n?)(?:(\s+)?\*\s?(?:.*?)\s+?(?:\r?\n?))+?\s+?\*\#";
                MatchCollection body_matches = Regex.Matches(file_content, body_pattern);
                file_content = Regex.Replace(file_content, body_pattern, "");
            }
            return file_content;
        }

        /// <summary>
        /// This is for non-meta files.
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        public static Hashtable get_post_file_info(String file) {
                string content = System.IO.File.ReadAllText(file);
                string body_pattern = @"\*\s+?\t?theme\s?:\s?(?<theme>(.*))\r?";
                MatchCollection body_matches = Regex.Matches(content, body_pattern);

                String theme = "";
                foreach (Match matched in body_matches) {
                    theme = matched.Groups["theme"].Value.Trim();
                }
                if (theme == ""){
                    String[] parts = file.Split(new String[] { "themes" }, StringSplitOptions.None);
                    if (parts.Count()>1) theme = parts[1].Split('/')[2];

                }

                body_pattern = @"\*\s+?\t?owner\s?:\s?(?<owner>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String owner = "";
                foreach (Match matched in body_matches) {
                    owner = matched.Groups["owner"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?version\s?:\s?(?<version>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String version = "";
                foreach (Match matched in body_matches) {
                    version = matched.Groups["version"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?revision\s?:\s?(?<revision>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String revision = "";
                foreach (Match matched in body_matches) {
                    revision = matched.Groups["revision"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?discription\s?:\s?(?<discription>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String discription = "";
                foreach (Match matched in body_matches) {
                    discription = matched.Groups["discription"].Value.Trim();
                }


                body_pattern = @"\*\s+?\t?alias\s?:\s?(?<alias>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String alias = "";
                foreach (Match matched in body_matches) {
                    alias = matched.Groups["alias"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?name\s?:\s?(?<name>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String name = "";
                foreach (Match matched in body_matches) {
                    name = matched.Groups["name"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?is_core\s?:\s?(?<is_core>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String is_core = "";
                foreach (Match matched in body_matches) {
                    is_core = matched.Groups["is_core"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?is_admin\s?:\s?(?<is_admin>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String is_admin = "";
                foreach (Match matched in body_matches) {
                    is_admin = matched.Groups["is_admin"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?is_frontend_editable\s?:\s?(?<is_frontend_editable>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String is_frontend_editable = "";
                foreach (Match matched in body_matches) {
                    is_frontend_editable = matched.Groups["is_frontend_editable"].Value.Trim();
                }


                body_pattern = @"\*\s+?\t?is_visible\s?:\s?(?<is_visible>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String is_visible = "";
                foreach (Match matched in body_matches) {
                    is_visible = matched.Groups["is_visible"].Value.Trim();
                }

                body_pattern = @"\*\s+?\t?is_default\s?:\s?(?<is_default>(.*))\r?";
                body_matches = Regex.Matches(content, body_pattern);

                String is_default = "";
                foreach (Match matched in body_matches) {
                    is_default = matched.Groups["is_default"].Value.Trim();
                }


            
                Hashtable output = new Hashtable();
                output.Add("theme", theme);
                output.Add("owner", owner);
                output.Add("version", version);
                output.Add("revision", revision);
                output.Add("discription", discription);
                output.Add("alias", alias);
                output.Add("name", name);
                output.Add("is_core", is_core);
                output.Add("is_admin", is_admin);
                output.Add("is_frontend_editable", is_frontend_editable);
                output.Add("is_visible", is_visible);
                output.Add("is_default", is_default);

            
            
                return output;
        }
    #endregion

        #region(post creation from files)

            public static posting create_admin_post_from_file(String file, String posting_type) {
                return create_post_from_file(file, file_handler.normalize_name(file), "", posting_type, "admin", 0, 1, userService.getUser(), false);
            }
            public static posting create_admin_post_from_file(String file, String posting_type, Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), "", posting_type, "admin", 0, 1, userService.getUser(), loads_file);
            }

            public static posting create_admin_post_from_file(String file, String theme, String posting_type, Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), theme, posting_type, "admin", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_admin_post_from_file(String file, String name, String theme, String posting_type, Boolean loads_file) {
                return create_post_from_file(file, name, theme, posting_type, "admin", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_admin_post_from_file(String file, String theme, String posting_type, int version, int revision, Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), theme, posting_type, "admin", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_admin_post_from_file(String file, String name, String theme, String posting_type, int version, int revision, Boolean loads_file) {
                return create_post_from_file(file, name, theme, posting_type, "admin", 0, 1, userService.getUser(), loads_file);
            }

            #region(create_post_from_file stubs)
            public static posting create_post_from_file(String file, String posting_type) {
                return create_post_from_file(file, file_handler.normalize_name(file), "", posting_type,"frontend", 0, 1, userService.getUser(), false);
            }
            public static posting create_post_from_file(String file, String posting_type,Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), "", posting_type, "frontend", 0, 1, userService.getUser(), loads_file);
            }

            public static posting create_post_from_file(String file, String theme, String posting_type, Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), theme, posting_type, "frontend", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_post_from_file(String file, String name, String theme, String posting_type, Boolean loads_file) {
                return create_post_from_file(file, name, theme, posting_type, "frontend", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_post_from_file(String file, String theme, String posting_type, int version, int revision, Boolean loads_file) {
                return create_post_from_file(file, file_handler.normalize_name(file), theme, posting_type, "frontend", 0, 1, userService.getUser(), loads_file);
            }
            public static posting create_post_from_file(String file, String name, String theme, String posting_type, int version, int revision, Boolean loads_file) {
                return create_post_from_file(file, name, theme, posting_type, "frontend", 0, 1, userService.getUser(), loads_file);
            }
            #endregion
            /// <summary>
            /// This take a file, regardless of if there is a post already for this file, 
            /// and ingests it to the database as a posting.
            /// </summary>
            /// <param name="file">What file to use</param>
            /// <param name="name">Basic post data.</param>
            /// <param name="theme">What theme should it respond to?</param>
            /// <param name="posting_type">What posting type should be used</param>
            /// <param name="version">The starting version</param>
            /// <param name="revision">The starting revision</param>
            /// <param name="user">the user the post belongs to</param>
            /// <param name="loads_file">Should the post use the file or the database.</param>
            /// <returns></returns>
            /// <remarks>A new pst from file may only be created from a file with in the working folder or it'll fail to make the post.</remarks>
            public static posting create_post_from_file(String file, String name, String theme, String posting_type, String mode, int version, int revision, appuser user, Boolean loads_file) {
                posting doc_tmp = new posting();
                site site = siteService.getCurrentSite();
                file = file_handler.normalize_path(file);

                String[] fpath = file.Split(new string[] { posting_type + "/" }, StringSplitOptions.None);
                String static_file = fpath[fpath.Length - 1].Trim('/');

                String dst = "";
                
                String basepath = themeService.theme_path(site, theme, mode, posting_type);
                dst = basepath.Trim('/') + "/" + static_file.Trim('/');

                if (!file_info.file_exists(dst)) {
                    basepath = themeService.theme_path(site, "base", mode, posting_type);
                    dst = basepath.Trim('/') + "/" + static_file.Trim('/');
                }
                /*if (!file_info.is_relative_path(file)) { //if it's not absoulte then lets try to figure out what was wanted
                } else {
                    //the path was absolute so lets trust it's what was meant to be
                    dst = file;
                }*/
                if(file_info.file_exists(dst)){
                    posting_type ptype = ActiveRecordBase<posting_type>.FindFirst(new List<AbstractCriterion>() { Expression.Eq("alias", posting_type) }.ToArray());

                    Hashtable fileinfo = get_post_file_info(dst);
                    // if there was any file metadata that belongs to this app, apply it to the post
                    doc_tmp = new posting() {
                        loads_file = loads_file,
                        static_file = static_file,
                        content = file_handler.read_from_file(dst),
                        post_type = ptype,
                        useTiny = ptype.useTiny,
                        is_Code = ptype.is_Code,
                        owner = user,
                        editors = new List<appuser>() { user }
                    };

                    // loop over the object properties and see if they are in the file meta info
                    // if they are apply them.
                    List<string> properties = objectService.get_type_properties("posting");
                    foreach (String property in fileinfo.Keys) {
                        if (properties.Contains(property)) {
                            PropertyInfo propInfo = doc_tmp.GetType().GetProperty(property);
                            if (propInfo != null) {
                                String prop_type = propInfo.PropertyType.Namespace;
                                if (prop_type == "System") {
                                    String value = fileinfo[property].ToString();
                                    if (value != null && value != "") {
                                        dynamic val = Convert.ChangeType(value, propInfo.PropertyType, CultureInfo.InvariantCulture);
                                        propInfo.SetValue(doc_tmp, val, null);
                                    }
                                }
                            }
                        }
                    }
                    ActiveRecordMediator<posting>.SaveAndFlush(doc_tmp);
                    //backup minimums for a respectably factioning out object
                    if (String.IsNullOrWhiteSpace(doc_tmp.name)) doc_tmp.name = name;
                    if (String.IsNullOrWhiteSpace(doc_tmp.alias)) doc_tmp.alias = doc_tmp.name.Replace(' ', '-').ToLower();
                    if (doc_tmp.version>0) doc_tmp.version = version;
                    if (doc_tmp.revision > 0) doc_tmp.revision = revision;
                    if (String.IsNullOrWhiteSpace(doc_tmp.theme)) doc_tmp.theme = theme;
                    if (fileinfo["is_core"] == null) doc_tmp.is_core = ptype.is_core;
                    if (fileinfo["is_admin"] == null) doc_tmp.is_admin = ptype.is_admin;
                    if (fileinfo["is_frontend_editable"] == null) doc_tmp.is_frontend_editable = true;
                    if (fileinfo["is_visible"] == null) doc_tmp.is_visible = true;
                    if (fileinfo["is_default"] == null) doc_tmp.is_default = true;
                    

                    ActiveRecordMediator<posting>.Save(doc_tmp);
                    doc_tmp = versionService.make_working_post(doc_tmp, static_file);
                }
                return doc_tmp;
            }

        #endregion

        #region(post type handling)

            public static Boolean make_postype_folders(String posttype) {

                if (!Directory.Exists(file_info.site_content_path().Trim('/') + "/revision/" + posttype)) {
                    DirectoryInfo di = Directory.CreateDirectory(file_info.site_content_path().Trim('/') + "/revision/" + posttype);
                }
                if (!Directory.Exists(file_info.site_content_path().Trim('/') + "/working/" + posttype)) {
                    DirectoryInfo di = Directory.CreateDirectory(file_info.site_content_path().Trim('/') + "/working/" + posttype);
                }
                if (!Directory.Exists(file_info.site_content_path().Trim('/') + "/published/" + posttype)) {
                    DirectoryInfo di = Directory.CreateDirectory(file_info.site_content_path().Trim('/') + "/published/" + posttype);
                }

                return true;
            }
        #endregion

        #region(post object to tables)
        public static Hashtable make_all_post_json_table(String type, Boolean dev) {
            Hashtable all = new Hashtable();
            Dictionary<string, string> queries = httpService.get_request_parmas_obj();
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
            filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                        new List<AbstractCriterion>() { 
                                Expression.Eq("alias", type)
                            }.ToArray())
                    ));
            posting[] posts = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("revision"), Order.Desc("version") }, filtering.ToArray());
            var i = 0;
            foreach (posting post in posts) {
                String name = (queries.ContainsKey("format") && queries["format"] == "xml") ? ("post_" + i.ToString()) : i.ToString();
                all.Add(name, make_post_json_table(post.baseid, type, dev));
                i++;
            }

            return all;

        }

        public static Hashtable make_post_json_table(int iid) {
            return make_post_json_table(iid, "", false);
        }


        public static Hashtable make_post_json_table(int iid, Boolean dev) {
            return make_post_json_table(iid, "", dev);
        }

        public static Hashtable make_post_json_table(int iid, String type, Boolean dev) {

            //posting post = ActiveRecordBase<posting>.Find(iid);
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
            //if (!usedev) filtering.Add(Expression.Eq("revision", 0));
            if (iid > 0) {
                posting tmp = ActiveRecordBase<posting>.Find(iid);
                if (tmp.children.Count > 0) {
                    filtering.Add(Expression.Eq("parent", tmp));
                } else {
                    filtering.Add(Expression.Eq("baseid", iid));
                }
            } else {
                filtering.Add(Expression.Eq("is_default", true));
            }
            //parent
            filtering.Add(Expression.Eq("deleted", false));
            if (!String.IsNullOrWhiteSpace(type)) {
                filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                        new List<AbstractCriterion>() { 
                                Expression.Eq("alias", type)
                            }.ToArray())
                    ));
            }
            posting post = ActiveRecordBase<posting>.FindFirst(new Order[] { Order.Desc("revision"), Order.Desc("version") }, filtering.ToArray());

            Hashtable post_json_obj = new Hashtable();


            Hashtable post_options_object = new Hashtable();

            String post_type = post.post_type.alias;
            List<string> properties = objectService.get_type_properties("posting");
            Assembly assembly = Assembly.GetExecutingAssembly();
            dynamic item = assembly.CreateInstance("stellar.Models."+type);

            foreach (String prop in properties) {
                PropertyInfo propInfo = post.GetType().GetProperty(prop);
                String prop_type = propInfo.PropertyType.Namespace;
                if (prop_type == "System") {//keep it to the basics to aviod a circular reference while serializing

                    dynamic value = propInfo.GetValue(post, null);

                    if (prop == "static_file"){
                        if(post.post_type.alias == "media"){
                            string uploads_path = file_info.relative_site_uploads_path();
                            string[] generalized_file_path = value.Split(new String[] { "uploads/", "images/" }, StringSplitOptions.RemoveEmptyEntries);
                            string file_path = file_handler.normalize_path(uploads_path.Trim('/') + "/images/" + generalized_file_path[generalized_file_path.Length - 1].Trim('/'));
                            value = file_path; 
                        }
                    }


                    post_options_object.Add(prop, value);
                }
            }


            Hashtable post_content_object = new Hashtable();
            post_content_object.Add("is_Code", post.is_Code);
            post_content_object.Add("useTiny", post.useTiny);

            List<Hashtable> post_partents = new List<Hashtable>();
            foreach (posting par_post in post.postparents) {
                Hashtable post_partent = new Hashtable();
                post_partent.Add("id", par_post.baseid);
                post_partent.Add("alias", par_post.alias);
                post_partent.Add("name", par_post.name);
                post_partent.Add("post_type", par_post.post_type.alias);
                post_partents.Add(post_partent);
            }
            post_content_object.Add("post_parents", post_partents);

            List<Hashtable> post_children = new List<Hashtable>();
            foreach (posting par_post in post.postchildren) {
                Hashtable post_child = new Hashtable();
                post_child.Add("id", par_post.baseid);
                post_child.Add("alias", par_post.alias);
                post_child.Add("name", par_post.name);
                post_child.Add("post_type", par_post.post_type.alias);
                post_children.Add(post_child);
            }
            post_content_object.Add("post_children", post_children);


            List<Hashtable> post_editors = new List<Hashtable>();
            foreach (appuser par_post in post.editors) {
                Hashtable post_editor = new Hashtable();
                post_editor.Add("id", par_post.baseid);
                post_editor.Add("alias", par_post.nid);
                post_editor.Add("name", par_post.display_name);
                post_editors.Add(post_editor);
            }
            post_content_object.Add("editors", post_editors);


            post_content_object.Add("fields", post.fields);

            post_content_object.Add("content", post.content);

            post_content_object.Add("post_type", post.post_type.alias);

            post_json_obj.Add("post_content", post_content_object);





            post_json_obj.Add("post_options", post_options_object);
            post_json_obj.Add("meta_data", post.get_all_meta());
            post_json_obj.Add("post_id", post.baseid);

            return post_json_obj;
        }
    #endregion


        #region(feilds_n_inputs)



        #endregion




    }
}
