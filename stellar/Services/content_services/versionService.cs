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
using Omu.ValueInjecter;
using AutoMapper; //<< i think we can remove this.. check back on that
using System.Linq;
using System.Collections;


namespace stellar.Services {

    /// <summary>
    ///  This will be the handler for versioning.  We will try to infer version information from 4 spots
    ///  1.) DB 2.)by location 3.)in filename 4.) in file metadata
    ///
    /// What is the process path:
    /// - on update, is it an autosave or apply?
    /// - if yes then don't make a new reversion post, just save the working post
    /// - if(it's save/subbmit) make revision post and save the working post
    /// - if(it's publish) make revision, save the working post, copy working to published post
    /// 
    /// For redunency initally the revision is copy of the saved working post.  Initally the published post
    /// is copy of the working post.  A working copy is just a data storage area the user directly accesses.
    /// We don't want to every let the user touch the revisions or published files.  Reverting back to a revision
    /// makes a new revision and copies it to the working post.
    /// </summary>
    public class versionService {
        #region(paths)
        // There are 3 states.  Working, a revision, and published
        // working is what a used sees, and the other two are hidden
        // from the user for protection

        //published is code for live content
        /// <summary> </summary>
            public static String relative_revison_path() {
                return relative_revison_path(siteService.getCurrentSite(), "frontend");
            }
            /// <summary> </summary>
            public static String relative_revison_path(String mode) {
                return relative_revison_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String relative_revison_path(site site) {
                return relative_revison_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String relative_revison_path(site site, String mode) {
                return file_info.relative_site_content_path(site.alias) + "cache/revision/" + themeService.current_theme_alias() + "/" + mode + "/";
            }
            //version is code for backup
            /// <summary> </summary>
            public static String revison_path() {
                return revison_path(siteService.getCurrentSite(), "frontend");
            }
            /// <summary> </summary>
            public static String revison_path(String mode) {
                return revison_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String revison_path(site site) {
                return revison_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String revison_path(site site, String mode) {
                return file_info.normalize_path(file_info.site_path().Trim('/') + "/" + versionService.relative_revison_path(site, mode).Trim('/') + "/");
            }





            /// <summary> </summary>
            public static String relative_published_path() {
                return relative_published_path(siteService.getCurrentSite(), "frontend");
            }
            /// <summary> </summary>
            public static String relative_published_path(String mode) {
                return relative_published_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String relative_published_path(site site) {
                return relative_published_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String relative_published_path(site site, String mode) {
                return file_info.relative_site_content_path(site.alias) + "cache/published/" + themeService.current_theme_alias() + "/" + mode + "/";
            }

            /// <summary> </summary>
            public static String published_path() {
                return published_path(siteService.getCurrentSite(), "frontend");
            }
            /// <summary> </summary>
            public static String published_path(String mode) {
                return published_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String published_path(site site) {
                return published_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String published_path(site site, String mode) {
                return file_info.normalize_path(file_info.site_path().Trim('/') + "/" + versionService.relative_published_path(site, mode).Trim('/') + "/");
            }




            //Note themes are code for working
            /// <summary> </summary>
            public static String relative_working_path() {
                return relative_working_path(siteService.getCurrentSite(),"frontend");
            }
            /// <summary> </summary>
            public static String relative_working_path(site site) {
                return relative_working_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String relative_working_path(String mode) {
                return relative_working_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String relative_working_path(site site, String mode) {
                return file_info.relative_site_content_path(site.alias) + "themes/" + themeService.current_theme_alias() + "/" + mode + "/";
            }

            /// <summary> </summary>
            public static String working_path() {
                return working_path(siteService.getCurrentSite(), "frontend");
            }
            /// <summary> </summary>
            public static String working_path(String mode) {
                return working_path(siteService.getCurrentSite(), mode);
            }
            /// <summary> </summary>
            public static String working_path(site site) {
                return working_path(site, "frontend");
            }
            /// <summary> </summary>
            public static String working_path(site site, String mode) {
                return file_info.normalize_path(file_info.site_path().Trim('/') + "/" + versionService.relative_working_path(site,mode).Trim('/') + "/");
            }





            /// <summary> </summary>
            public static String remove_filepath_version(String file) {
                String[] fileparts = file.Split('.');
                String dest = fileparts[0] + "." + fileparts[fileparts.Length - 1];
                return dest;
            }
            /// <summary> </summary>
            public static String adjust_filepath_version(String file, int version, int revision) {
                String[] fileparts = file.Split('.');
                String dest = fileparts[0] + "." + version + "." + revision + "." + fileparts[fileparts.Length - 1];
                return dest;
            }

        #endregion

            #region(Replication)
            /// <summary> </summary>
            public static void CopyPropertyValues(object source, object destination) {
                var destProperties = destination.GetType().GetProperties();

                foreach (var sourceProperty in source.GetType().GetProperties()) {
                    foreach (var destProperty in destProperties) {
                        if (destProperty.Name == sourceProperty.Name &&
                    destProperty.PropertyType.IsAssignableFrom(sourceProperty.PropertyType)) {
                            destProperty.SetValue(destination, sourceProperty.GetValue(
                                source, new object[] { }), new object[] { });

                            break;
                        }
                    }
                }
            }

            /// <summary> </summary>
            public static dynamic _copy<t>(int id, String name, Boolean returnObj) where t : new() {

                if (returnObj) {
                    return _copy_fast<t>(id, name);
                } else {
                    return _copy_slow<t>(id, name);
                }

            }
            /// <summary> </summary>
            public static Boolean _copy_fast<t>(int id, String name) {
                var org = ActiveRecordBase<t>.Find(id);

                Mapper.Reset();

                Mapper.CreateMap<dynamic, dynamic>();//.ForMember(x => x.baseid, o => o.Ignore());
                var copy = new object[] { };
                Mapper.Map(org, copy);
                ActiveRecordMediator<dynamic>.SaveAndFlush(copy);
                return true;
            }

            /// <summary> </summary>
            public static dynamic _copy_slow<t>(int id, String name) where t : new() {
                dynamic org;

                org = ActiveRecordBase<t>.TryFind(id);
                if (org == null) {
                    return org;
                }


                if (String.IsNullOrWhiteSpace(name)) name = org.name + "_copy";

                dynamic copy = new t();
                copy.name = name;
                ActiveRecordMediator<dynamic>.Save(copy);
                copy = (t)copy;
                int copy_id = copy.baseid;
                IValueInjecter injecter = new ValueInjecter();
                injecter.Inject<CloneInjection>(copy, org);

                copy.name = name;
                copy.baseid = copy_id;
                //copy.owner.baseid = userService.getUserFull().baseid;
                copy.users.Clear();
                copy.users.Add(userService.getUserFull());
                copy.updated_date = DateTime.Now;
                //copy.status.id = 1;
                //copy = (dynamic)copy;
                try {
                    ActiveRecordMediator<dynamic>.Save(copy);
                } catch {
                    ActiveRecordMediator<dynamic>.Delete(copy);
                }

                return copy;
            }

            /// <summary> </summary>
            public static dynamic copy_post_to_post(posting to, posting from) {
                dynamic org;

                org = (posting)from;
                dynamic old_meta = org.meta_data;
                dynamic old_meta_date = org.meta_data_date;
                dynamic old_meta_geo = org.meta_data_geo;

                dynamic old_menu_ops = org.menuoptions;

                ActiveRecordMediator<posting>.Save(to);
                int copy_id = to.baseid;

                IValueInjecter injecter = new ValueInjecter();
                injecter.Inject<CloneInjection>(to, from);

                to.baseid = copy_id;

                //can we ditch this?
                List<meta_data> new_meta = new List<meta_data>();
                if (old_meta != null && old_meta.Count > 0) {
                     
                    foreach(meta_data data in old_meta){
                        new_meta.Add(new meta_data() {
                            meta_key = data.meta_key,
                            post = to,
                            value = data.value
                        });
                    }
                    to.meta_data = new_meta;
                }
                List<meta_data_date> new_meta_date = new List<meta_data_date>();
                if (old_meta_date != null && old_meta_date.Count > 0) {

                    foreach (meta_data_date data in old_meta_date) {
                        new_meta_date.Add(new meta_data_date() {
                            meta_key = data.meta_key,
                            post = to,
                            value = data.value
                        });
                    }
                    to.meta_data_date = new_meta_date;
                }
                List<meta_data_geo> new_meta_geo = new List<meta_data_geo>();
                if (old_meta_geo != null && old_meta_geo.Count > 0) {

                    foreach (meta_data_geo data in old_meta_geo) {
                        new_meta_geo.Add(new meta_data_geo() {
                            meta_key = data.meta_key,
                            post = to,
                            coordinate = data.coordinate
                        });
                    }
                    to.meta_data_geo = new_meta_geo;
                }



                List<menu_option> new_menu_ops = new List<menu_option>();
                if (old_menu_ops != null && old_menu_ops.Count > 0) {
                    
                    foreach (menu_option data in old_menu_ops) {
                        if (data.post != null) {
                            menu_option tmp = new menu_option() {
                                site = data.site,
                                alias = "menu-item",
                                sort = data.post.sort,
                                position = data.post.position,
                                post = data.post
                            };
                            ActiveRecordMediator<menu_option>.Save(tmp);
                            new_menu_ops.Add(tmp);
                        }
                    }
                    to.menuoptions = new_menu_ops;
                }

                String dest = "";

                try {
                    ActiveRecordMediator<posting>.Save(to);
                    return to;
                } catch {
                    //Clean up the puke that is on the floor here... 
                    foreach (meta_data data in new_meta) {
                        ActiveRecordMediator<meta_data>.Delete(data);
                    }

                    foreach (menu_option data in new_menu_ops) {
                        ActiveRecordMediator<menu_option>.Delete(data);
                    }

                    if (!String.IsNullOrWhiteSpace(dest)) file_handler.deletefile(dest);
                    if (to!=null) ActiveRecordMediator<posting>.Delete(to);

                    ActiveRecordMediator<posting>.Save(org);//restore the orginal post on fail
                    
                    return false;
                }
            }
        #endregion

        #region(revision methods)
            /// <summary>
            /// This function will take a working copy, add the version it to both the file and 
            /// the object and move the file to the revision folder for safe keeping.  
            /// </summary>
            /// <param name="working_copy"></param>
            /// <returns></returns>
            /// <remarks> DB >> FILE    (THIS MAY ONLY COME FROM THE WORKING POSTING)</remarks>
            public static posting make_post_revision(posting working_copy) {
                posting_type type = working_copy.post_type;
                posting revision_copy = copy_post_to_post(new posting(), working_copy);
                //set the path of old file
                String new_dst = "";
                if (revision_copy.loads_file) {
                    new_dst = adjust_filepath_version(revision_copy.static_file, revision_copy.version, revision_copy.revision + 1);
                }
                revision_copy.revision = revision_copy.revision + 1;
                ActiveRecordMediator<posting>.Save(revision_copy); // end of object versioning


                if (!String.IsNullOrWhiteSpace(revision_copy.static_file)) {// start of file versioning
                    // get the content
                    String content = revision_copy.content;
                    String basepath = working_path().Trim('/') + "/" + type.alias.Trim('/'); //since we are always making a revision of a working post
                    String old_dst = basepath + "/" + revision_copy.static_file.Trim('/');

                    content = file_handler.read_from_file(old_dst);

                    if (file_info.does_in_content_metadata(file_info.file_extension(old_dst))) {
                        content = postingService.create_post_file_info(revision_copy) + "\r\n" + postingService.strip_post_file_info(content);
                        revision_copy.content = content;
                    }

                    revision_copy.static_file = new_dst;

                    if (!String.IsNullOrWhiteSpace(new_dst)) {
                        new_dst = file_info.site_cache_path().Trim('/') + "/revision/" + type.alias + "/" + new_dst.Trim('/');

                        String dir = Path.GetDirectoryName(new_dst);
                        if (!Directory.Exists(dir)) {
                            DirectoryInfo di = Directory.CreateDirectory(dir);
                        }
                        file_handler.write_to_file(new_dst, content);
                    }
                }

                if (revision_copy.parent == null || revision_copy.parent.baseid <= 0)
                    revision_copy.parent = working_copy;

                revision_copy.published = false;
                ActiveRecordMediator<posting>.Save(revision_copy);
                //we move this up one now that we have finished making the revision
                working_copy.revision = revision_copy.revision;
                working_copy.version = revision_copy.version;
                working_copy.published = false;
                ActiveRecordMediator<posting>.Save(working_copy);

                return working_copy;// was revision_post returned.. but seems better to pass the working copy.  That is what everything works off after all.
            }
        /* all parent posts are a working copy so we never 'make' this one
            /// <summary>
            /// In the version handling process this is the first stop.  This will make a copy of the object
            /// and or file (in the site_content>>...>>working folder) and make version adjustments to match.
            /// Really, it should only be done on the first ingestion of the post.
            /// </summary>
            /// <param name="post"></param>
            /// <param name="version"></param>
            /// <param name="revision"></param>
            /// <retruns></retruns>
            public static posting make_post_working_version(posting post, int version, int revision) {
                //first since the working version is the start of the edit saving process, we will 
                //only have to do something if this is a file
                posting_type type = post.post_type;
                posting working_post = copy_post_to_post(new posting(), post);

                if (working_post.loads_file) {
                    // get the content
                    String content = working_post.content;
                    
                    if (!String.IsNullOrWhiteSpace(working_post.static_file)) {
                        String fullpath = file_handler.true_file_path(working_path().Trim('/') + "/" + working_post.static_file.Trim('/'));
                        content = file_handler.read_from_file(fullpath);
                    }
                    String dst = working_post.static_file;

                    if (file_info.does_in_content_metadata(file_info.file_extension(dst))) {
                        content = postingService.create_post_file_info(working_post) + "\r\n" + postingService.strip_post_file_info(content);
                        working_post.content = content;
                        dst = remove_filepath_version(working_post.static_file);
                    }

                    if (!String.IsNullOrWhiteSpace(working_post.static_file)) {
                        dst = working_path().Trim('/') + "/" + type.alias + "/" + dst.Trim('/');

                        String dir = Path.GetDirectoryName(dst);
                        if (!Directory.Exists(dir)) {
                            DirectoryInfo di = Directory.CreateDirectory(dir);
                        }
                        file_handler.write_to_file(dst, content);
                    }
                }

                if (working_post.parent == null || working_post.parent.baseid <=0)
                    working_post.parent = post;

                ActiveRecordMediator<posting>.Save(working_post);
                return working_post;
            }

        //MAY BE update working?
        */
            //DB to File  (um hardcoded?)
            /// <summary> </summary>
            public static String make_post_working_file(posting working_post,String file) {
                String dst = file;
                String content = file_handler.read_from_file(dst);
                if (file_info.does_in_content_metadata(file_info.file_extension(dst))) {
                    content = postingService.create_post_file_info(working_post) + "\r\n" + content;
                    dst = remove_filepath_version(dst);
                }
                String basepath = "/working/" + working_post.post_type.alias + "/" + dst.Trim('/');
                dst = file_info.site_content_path().Trim('/') + basepath;

                String dir = Path.GetDirectoryName(dst);
                if (!Directory.Exists(dir)) {
                    DirectoryInfo di = Directory.CreateDirectory(dir);
                }


                if (!String.IsNullOrWhiteSpace(content)) {
                    file_handler.write_to_file(dst, content);
                }else{
                    dst = file;
                }
                return dst;
            }

            //Should be benign to a working post but refit a published or revision configured post
            /// <summary> </summary>
            public static posting make_working_post(posting working_post, String file) {
                if( String.IsNullOrWhiteSpace(file) )
                    file = working_post.static_file;

                String dst = remove_filepath_version(file);

                String content =file_handler.read_from_file(dst);

                String basepath = relative_working_path().Trim('/') + "/" +working_post.post_type.alias;
                dst = basepath + "/" + dst.Trim('/');

                String dir = Path.GetDirectoryName(dst);
                if (!Directory.Exists(dir)) {
                    DirectoryInfo di = Directory.CreateDirectory(dir);
                }
                if (String.IsNullOrWhiteSpace(content)) content = file_handler.read_from_file(dst);
                if (!String.IsNullOrWhiteSpace(content)) {
                    if (file_info.does_in_content_metadata(file_info.file_extension(dst))) {
                        content = postingService.create_post_file_info(working_post) + "\r\n" + postingService.strip_post_file_info(content);
                        dst = remove_filepath_version(dst);
                    }
                    file_handler.write_to_file(dst, content);
                    String[] tmpf = dst.Split(new string[] { working_post.post_type.alias + "/" }, StringSplitOptions.None);
                    file = tmpf[tmpf.Length - 1];

                    working_post.static_file = file.Trim('/');
                }
                 if (!String.IsNullOrWhiteSpace(content)) working_post.content = content;
                ActiveRecordMediator<posting>.Save(working_post);
                return working_post;
            }



            /// <summary>
            /// The post partent will be updated with the latest content and setting.  
            /// Also this is push a file copy to the published folder as well as make the copies.
            /// </summary>
            /// <param name="working_copy"></param>
            /// <returns></returns>
            public static Boolean publish_post(posting working_copy) {
                posting published_copy = make_post_publised_version(working_copy);
                return (published_copy.baseid > 0);
            }
            /// <summary>
            /// The post partent will be updated with the latest content and setting.  
            /// Also this is push a file copy to the published folder as well as make the copies.
            /// </summary>
            /// <returns></returns>
            public static posting make_post_publised_version(posting working_copy) {
                //first since the working version is the start of the edit saving process, we will 
                //only have to do something if this is a file
                posting published_copy = copy_post_to_post(new posting(), working_copy);


                published_copy.version = published_copy.version + 1;
                published_copy.revision = 0;
                ActiveRecordMediator<posting>.Save(published_copy);

                posting_type type = working_copy.post_type;
                String content = "";
                String file = published_copy.static_file;
                if (!String.IsNullOrWhiteSpace(file)) {
                    file = file_info.normalize_path(published_copy.static_file);

                    String[] fpath = file.Split(new string[] { type.alias + "/" }, StringSplitOptions.None);
                    String static_file = fpath[fpath.Length - 1].Trim('/');

                    String dst = remove_filepath_version(static_file);
                    //find the working to make the published
                    String basepath = working_path().Trim('/') + "/" + type.alias;
                    dst = basepath + "/" + dst.Trim('/');
                    content = file_handler.read_from_file(dst);

                    
                    //create the published path
                    fpath = file.Split(new string[] { type.alias + "/" }, StringSplitOptions.None);
                    static_file = fpath[fpath.Length - 1].Trim('/');
                    basepath = published_path().Trim('/') + "/" + type.alias;
                    dst = basepath + "/" + static_file.Trim('/');

                    String dir = Path.GetDirectoryName(dst);
                    if (!Directory.Exists(dir)) {
                        DirectoryInfo di = Directory.CreateDirectory(dir);
                    }

                    
                    if (!String.IsNullOrWhiteSpace(content)) {
                        if (file_info.does_in_content_metadata(file_info.file_extension(dst))) {
                            content = postingService.create_post_file_info(published_copy) + "\r\n" + postingService.strip_post_file_info(content);
                        }
                        file_handler.write_to_file(dst, content);
                    }
                }
                published_copy.published = true;
                if (published_copy.parent == null || published_copy.parent.baseid <= 0)
                    published_copy.parent = working_copy;
                if (!String.IsNullOrWhiteSpace(content)) published_copy.content = content;


                

                ActiveRecordMediator<posting>.Save(published_copy);

                working_copy.revision = published_copy.revision;
                working_copy.version = published_copy.version;
                working_copy.published = true;
                ActiveRecordMediator<posting>.Save(working_copy);


                return working_copy;// was published_copy returned.. but seems better to pass the working copy.  That is what everything works off after all.
            }








            /// <summary> </summary>
            public static int getRevisionCount(dynamic item) {
                posting[] lastversion = ActiveRecordBase<posting>.FindAll(new Order("revision", false),
                           new List<AbstractCriterion>() { Expression.Eq("parent", item), Expression.Gt("revision", 0) }.ToArray()
                       );
                return lastversion.Count();
            }

            /// <summary> </summary>
            public static int get_last_revision(dynamic item) {
                List<AbstractCriterion> filtering = new List<AbstractCriterion>();

                filtering.Add(Expression.Gt("revision", 0));
                filtering.Add(Expression.Eq("deleted", false));
                filtering.Add(Expression.Eq("parent", item));
                filtering.Add(Expression.Eq("version", item.version));
            
                posting lastversion = ActiveRecordBase<posting>.FindFirst(
                    new Order[] { Order.Desc("revision") },
                    filtering.ToArray()
                );
                int rev = lastversion != null ? lastversion.revision : 0;
                return rev;
            }





            // may need to remove this .. out dated i think
            //UserService._copy<map_views>(id,name);
            /// <summary> </summary>
            public static dynamic make_revision<t>(int id) where t : new() {
                return make_revision<t>(id,0,0);
            }
            /// <summary> </summary>
            public static dynamic make_revision<t>(int id, int version, int revision) where t : new() {
                dynamic org;

                org = ActiveRecordBase<t>.TryFind(id);
                if (org == null) {
                    return org;
                }
                int oldrevision = get_last_revision(org);
                dynamic copy = new t();
                ActiveRecordMediator<dynamic>.Save(copy);
                copy = (t)copy;
                int copy_id = copy.baseid;
                IValueInjecter injecter = new ValueInjecter();
                injecter.Inject<CloneInjection>(copy, org);
                if (revision > 0) {
                    copy.revision = revision + 1;
                }else{
                    copy.revision = oldrevision + 1;
                }
                if (version > 0) copy.version = version;
                copy.parent = org;
                copy.baseid = copy_id;

                String dest = "";
                if (copy.loads_file) {
                    //use the file ext to split.. fix it
                    String[] fileparts = copy.static_file.Split('.');
                    if (
                        helperService.CalculateMD5Hash(file_handler.read_from_file(copy.static_file)) 
                        != helperService.CalculateMD5Hash(file_handler.read_from_file(fileparts[0] + "." + copy.version + "." + revision + "." + fileparts[1]))
                        ) {
                        dest = fileparts[0] + "." + copy.version + "." + copy.revision + "." + fileparts[1];
                        file_handler.copyfile(copy.static_file, dest);
                    }
                }

                //copy.status.id = 1;
                //copy = (dynamic)copy;
                try {
                    ActiveRecordMediator<dynamic>.Save(copy);
                    return copy;
                } catch {
                    ActiveRecordMediator<dynamic>.Delete(copy);
                    if (!String.IsNullOrWhiteSpace(dest)) file_handler.deletefile(dest);
                    return false;
                }
            }














            /// <summary> </summary>
            public static Boolean restorePost(posting post, int version, int revision) {
                posting copy = null;
                String dest = "";

                if (copy.loads_file) {
                    String[] fileparts = copy.static_file.Split('.');
                    dest = fileparts[0] + "." + version + "." + revision + "." + fileparts[0];
                }

                try {
                    copy = make_revision<posting>(post.baseid, version, revision);
                    if (copy != null) {
                        if (copy.loads_file) {
                            file_handler.copyfile(copy.static_file, dest);
                        }
                    }
                    return true;
                } catch {
                    ActiveRecordMediator<dynamic>.Delete(copy);
                    if (!String.IsNullOrWhiteSpace(dest)) file_handler.deletefile(dest);
                    return false;
                }
            }

        #endregion
    }
    
}
