#region Directives
using System;
using System.Collections;
using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using stellar.Models;
//using MonoRailHelper;
using System.IO;
using System.Linq;
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
using System.Dynamic;
using System.Web.Script.Serialization;
using System.Runtime.Serialization;
using Microsoft.Exchange.WebServices.Data;
using System.Collections.Specialized;
using System.Reflection;
using log4net;
using Microsoft.SqlServer.Management.Smo;
using Microsoft.SqlServer.Management.Sdk.Sfc;
using System.Data.SqlClient;
using Microsoft.SqlServer.Management.Common;
using System.Configuration;
using Castle.ActiveRecord.Framework;
using Castle.Core.Configuration;
using System.Data;
using NHibernate.Engine;
using System.Web.Configuration;
using System.Xml.Linq;
using System.Xml.Serialization;
using System.Globalization;

#endregion
namespace stellar.Controllers {
    [Layout("admin")]
    public class installController : SecureBaseController {

        private static ILog log = log4net.LogManager.GetLogger("installController");



        /// <summary>
        /// This checks the config file for the state of installation.  We are reading from the web.config
        /// to insure that we are going about this the fastest way possible since the config is loaded and 
        /// cached.  Also when changed, it restarts the app.
        /// </summary>
        /// <returns></returns>
        public static Boolean is_installed() {
            log.Info("checking install");
            //return false;
            NameValueCollection section = (NameValueCollection)ConfigurationManager.GetSection("site_config");
            string setting = section["installed"];
            if (String.IsNullOrWhiteSpace(setting)) return false;
            return Convert.ToBoolean(setting);
        }
        /// <summary>
        /// This is what changes the web.config.  After which the app restarts and the install state is True/False
        /// </summary>
        /// <param name="state"></param>
        /// <returns></returns>
        private Boolean set_installed_state(String state) {
            var config = XDocument.Load(HttpContext.Current.Server.MapPath("~/Web.config"));

            //should be little more like.. which one? maybe the node with key = installed? yeah that's right.. come on.
            var targetNode = config.Root.Element("site_config").Element("add").Attribute("value");
            targetNode.Value = state;
            config.Save(HttpContext.Current.Server.MapPath("~/Web.config"));
            return true;
        }


        public static List<String> load_core_folders(String site) {
            List<String> struture = new List<String>();
            String BASEPATH = file_info.root_path() + "site_content/" + site + "/";

            struture.Add(BASEPATH);
            struture.Add(BASEPATH + "cache");
            struture.Add(BASEPATH + "cache/uploads");
            struture.Add(BASEPATH + "cache/uploads/images");
            struture.Add(BASEPATH + "cache/published");
            struture.Add(BASEPATH + "cache/revision");
            struture.Add(BASEPATH + "cache/scripts");
            struture.Add(BASEPATH + "cache/scripts/css");
            struture.Add(BASEPATH + "cache/scripts/js");

            struture.Add(BASEPATH + "themes");
            struture.Add(BASEPATH + "themes/base");
            struture.Add(BASEPATH + "themes/base/admin");
            struture.Add(BASEPATH + "themes/base/frontend");

            struture.Add(BASEPATH + "uploads");
            struture.Add(BASEPATH + "uploads/images");

            return struture;
        }

        public Boolean clean_system() {
            log.Info("cleaning");
            set_installed_state("False");

            string connectionSting = ConfigurationManager.ConnectionStrings[0].ConnectionString;
            var sfimpl = ActiveRecordMediator.GetSessionFactoryHolder().GetSessionFactory(typeof(object));
            IDbConnection conn = ((ISessionFactoryImplementor)sfimpl).ConnectionProvider.GetConnection();
            //set with a fresh data base.  Later an update script will be needed
            SqlConnection sqlConnection = new SqlConnection(conn.ConnectionString);
            ServerConnection svrConnection = new ServerConnection(sqlConnection);
            Server server = new Server(svrConnection);
            server.ConnectionContext.ExecuteNonQuery(File.ReadAllText(Context.Server.MapPath("/config/export.sql")));

            //clear_core_folders();

            return true;
        }

        public static Boolean clear_core_folders() {
            List<String> struture = new List<String>();

            struture.Add(file_info.root_path() + "site_content/");

            foreach (String dir in struture) {
                try {
                   // Directory.Delete(dir,true);
                    logger.writelog( String.Format("The directory {0} was deleted successfully.", dir) );
                } catch (Exception e) {
                    logger.writelog( String.Format("The Deletetion process failed: {0}", e.ToString()) );
                } finally {
                }
            }
            return true;
        }

        public static Boolean make_core_folders(site site) {
            String BASEPATH = file_info.root_path() + "site_content/" + site.alias + "/";

            List<String> struture = load_core_folders(site.alias);
            foreach (String dir in struture) {
                try {
                    // Determine whether the directory exists. 
                    if (Directory.Exists(dir)) {
                        //Console.WriteLine("That path exists already.");
                        return true;
                    }
                    DirectoryInfo di = Directory.CreateDirectory(dir);
                    logger.writelog(String.Format("The directory was created successfully at {0}.", Directory.GetCreationTime(dir)));
                } catch (Exception e) {
                    logger.writelog(String.Format("The process failed: {0}", e.ToString()));
                } finally {
                }
            }

            file_handler.DirectoryCopy(new DirectoryInfo(file_info.root_path() + "install/default_content/"), BASEPATH, true);
            
            //This would be on some option controll type thing... 
            seoService.regen_sitemap(file_info.relative_site_content_path().Trim('/') + "/" + site.get_option("sitemap_location").Trim('/'), "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\"><url> <loc>" + site.base_url + "</loc> <changefreq>daily</changefreq></url></urlset>");
            seoService.regen_robots_txt(file_info.relative_site_content_path().Trim('/') + "/" + site.get_option("sitemap_location").Trim('/'),"User-Agent: *\r\nDisallow:\r\nDisallow: /admin\r\n\r\nSitemap: " + site.base_url + "/sitemap.xml\r\n");
            file_handler.DirectoryCopy(new DirectoryInfo(BASEPATH + "themes/"), BASEPATH + "cache/published/", true);
            return true;
        }
        [SkipFilter()]
        public static void start_install() {
            /* this is for later for a install wizard
             */
            HttpContext.Current.Response.Redirect("/install/install.castle");
        }
        [SkipFilter()]
        public void install() {
            log.Info("install page");
            CancelLayout();
            //Start form
            //if (is_installed()) { HttpContext.Current.Response.Redirect("/install/finish_install.castle?state=already"); return; }
            RenderView("../admin/install/install_start");
        }

        public void uninstall_app() {
            set_installed_state("False");// the redirect act will insure a app restart and your now installed.
            HttpContext.Current.Response.Redirect("/install/run_install.castle");
        }


        //.rework this all here .. the xml laoding should be alittle more adaptive
        /// <summary>
        /// what should happen is load file choose mode, loop thru model properties and check for them
        /// If found in the xml then apply to the new object created. save objects
        /// </summary>
        public static void load_from_content_xml() {
            XElement contactsFromFile = XElement.Load(HttpContext.Current.Server.MapPath(@"~/install/content.xml"));
            IEnumerable<XElement> posting_elements = contactsFromFile.Elements("postings");
            if (posting_elements.Count()>0) xml_to_posting(posting_elements);
        }
        public static void xml_to_posting(IEnumerable<XElement> posting_elements) {
            foreach (XElement x in posting_elements.Elements()) {
                String file = (string)x.Attribute("file");
                String type = (string)x.Attribute("type");

                posting page_post = postingService.create_post_from_file(file, type);

                page_post.name = (string)x.Element("name");
                page_post.alias = (string)x.Element("alias");

                List<posting> templates = new List<posting>() { };

                foreach (XElement t in x.Elements("templates")) {
                    String temp_type = (string)t.Element("type");
                    String alias = (string)t.Element("alias");
                    templates.Add(ActiveRecordBase<posting>.FindFirst(
                                    new Order[] { Order.Desc("revision"), Order.Desc("version") },
                                        new List<AbstractCriterion>() {  
                                                Expression.Eq("deleted", false),
                                                Expression.Eq("published", true),
                                                Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                                    new List<AbstractCriterion>() { 
                                                        Expression.Eq("alias", temp_type)
                                                    }.ToArray())),
                                                Expression.Eq("alias",alias)
                                            }.ToArray()
                                    ));
                }
                page_post.postparents = templates;

                ActiveRecordMediator<posting>.Save(page_post);
                page_post = versionService.make_post_revision(page_post);//make the first revision as would happen in the saving process
                versionService.publish_post(page_post);
            }
        }


        /// <summary>
        /// This it the
        /// </summary>
        /// <param name="type"></param>
        /// <param name="site"></param>
        public static void load_from_xml(String type, site site) {
            XElement contactsFromFile = XElement.Load(HttpContext.Current.Server.MapPath(@"~/install/manifest-hiv.xml"));
            IEnumerable<XElement> _elements = contactsFromFile.Elements(type);
            if (_elements.Count() > 0) xml_to_object(_elements, site);
        }

        public static void xml_to_object(IEnumerable<XElement> elements) {
            xml_to_object(elements, siteService.getCurrentSite() );
        }
        /// <summary>
        /// we are going to make and fill objects the best we can by first taking the roor 
        /// element and looking at it's child nodes and it's attributes.  An node will repersent a 
        /// list to match AR in the sense that it's a HasMany or HasManyBelongsTo.  All attributes
        /// are the other flat properties of the object.
        /// 
        /// Note: The root element name is the object name.
        /// </summary>
        /// <param name="elements"></param>
        /// <param name="site"></param>
        public static void xml_to_object(IEnumerable<XElement> elements, site site) {

            Assembly assembly = Assembly.GetExecutingAssembly();

            
            

            int i = 0;
            foreach (XElement x in elements.Elements()) {
                String type = x.Name.ToString();
                List<string> properties = objectService.get_type_properties(type);
                dynamic item = assembly.CreateInstance("stellar.Models."+type);

                foreach (XAttribute attr in x.Attributes()) {
                    String propertyName = attr.Name.ToString();
                    if (properties.Contains(propertyName)) {
                        PropertyInfo propInfo = item.GetType().GetProperty(propertyName);
                        if (propInfo != null){
                            String prop_type = propInfo.PropertyType.Namespace;
                            if (prop_type == "System") {
                                String value = attr.Value;
                                if (value.IndexOf("{$i}") > -1) {
                                    value = "{$i}".Replace("{$i}", i.ToString());
                                    i++;
                                }
                                if (value != null && value != "")
                                    propInfo.SetValue(item, Convert.ChangeType(value, propInfo.PropertyType, CultureInfo.InvariantCulture), null);
                            } else {
                                String value = attr.Value;
                                dynamic val = null;
                                if (propertyName == "actions") val = objectService.make_model_property_item<posting_type_action>(value);
                                if (propertyName == "taxonomy_type") val = objectService.make_model_property_item<taxonomy_type>(value);
                                if (propertyName == "privileges") val = objectService.make_model_property_item<privilege>(value);
                                if (propertyName == "taxonomies") val = objectService.make_model_property_item<taxonomy>(value);
                                propInfo.SetValue(item, Convert.ChangeType(val, propInfo.PropertyType), null);
                            }
                        }
                    }
                }
                ActiveRecordMediator<dynamic>.Save(item);
                Type tColl = typeof(ICollection<>);
                foreach (XElement child in x.Elements()) {
                    String ele_type = child.Name.ToString();
                    if (properties.Contains(ele_type)) {

                        PropertyInfo propInfo = item.GetType().GetProperty(ele_type);
                        Type t = propInfo.PropertyType;
                        Type listtype = t.GetGenericArguments()[0];

                        String value = child.Value;

                        dynamic tmplist = null;
                        if (ele_type == "actions") tmplist = new List<posting_type_action>();
                        if (ele_type == "taxonomy_types") tmplist = new List<taxonomy_type>();
                        if (ele_type == "privileges") tmplist = new List<privilege>();
                        if (ele_type == "taxonomies") tmplist = new List<taxonomy>();
                        if (value != null && value != "") {
                            int j = 0;
                            foreach (String prop_child in value.Split(',')) {
                                String val = prop_child;
                                if (val.IndexOf("{$i}") > -1) {
                                    val = "{$i}".Replace("{$i}", j.ToString());
                                    j++;
                                }
                                if (val == "all") {
                                    //really was hoping to not have to do this bs.. but seems that you can't all all convert a list to another using t
                                    if (ele_type == "actions") tmplist = objectService.make_model_property_list<posting_type_action>();
                                    if (ele_type == "taxonomy_types") tmplist = objectService.make_model_property_list<taxonomy_type>();
                                    if (ele_type == "privileges") tmplist = objectService.make_model_property_list<privilege>();
                                    if (ele_type == "taxonomies") tmplist = objectService.make_model_property_list<taxonomy>();
                                } else {
                                    if (ele_type == "actions") tmplist.Add(objectService.make_model_property_item<posting_type_action>(val));
                                    if (ele_type == "taxonomy_types") tmplist.Add(objectService.make_model_property_item<taxonomy_type>(val));
                                    if (ele_type == "privileges") tmplist.Add(objectService.make_model_property_item<privilege>(val));
                                    if (ele_type == "taxonomies") tmplist.Add(objectService.make_model_property_item<taxonomy>(val));

                                    


                                }
                            }
                        }
                        if (tmplist!= null && tmplist.Count > 0) {
                            
                            propInfo.SetValue(item, tmplist, null);
                        }
                    }
                }
                ActiveRecordMediator<dynamic>.Save(item);
            }
        }


        [SkipFilter()]
        public void run_install(){
            log.Info("starting install");
            CancelLayout();
            CancelView();

            if (is_installed()){ uninstall_app(); return; }

            String renderPath = file_info.root_path();
            String theme = "default";

            //HttpContext.Current.Response.Flush();
            clean_system();

            /* WILD WEST install
             * so the deal is that we are going to have an xml to load from
             * it'll install so that the site could be anything we need it 
             * to be, from a Script service to a Calendar or a blog or a 
             * file service, and even a redirection and print service.
             * This is done via discribing what is what and all the options of the posts.
             * by doing this we are able to discribe pages, files, events and more.
             * 
             * NOTE this should be a side job.  We run it off to the side and ajax to the 
             * server to check on it's status.  This way we can avoid the time out issues of IE
             */

            /* set up the site .. most of this part would be in the WIZ */
            String getBaseURL = "";//from the wiz
            if (siteService.is_localhost()) {
                Uri uri = HttpContext.Current.Request.Url;
                getBaseURL = uri.Scheme + Uri.SchemeDelimiter + uri.Host + ":" + uri.Port;
            }

            site site = new site() {
                name = "AMS",
                alias = "ams",
                is_default = true,
                base_url = getBaseURL,
                local_path = file_info.root_path()
            };
            //it seems that we need to flush the session that has the default site in it.  
            //look into this.  For now just rerun install again and the session clears
            ActiveRecordMediator<site>.Save(site);
            site.options = new List<options>(){
                    #region(siteoptions)
                   new options() {
                        option_key = "use_static",
                        value = "0"
                    }, 

                    new options(){
                        option_key = "filters_only_wsu",
                        value = @"0"
                    },
                    new options(){
                        option_key = "filters_only_wsu_expression",
                        value = @"^134\.121\.|^192\.94\.2[1-2]\.|^192\.138\.182\.|^198\.17\.13\.|^69\.166\.([3-5][0-9]|6[0-3])\.|^172\.16\.([0-9]|1[0-9]|2[0-3])\.|^172\.17\.(([0-9]|1[0-5]|[2-7][0-9]|8[0-7])\.|255\.([0-9]|[1-9][0-9]|1[0-5][0-9])$)|^172\.18\.[1-6]\."
                    },
                    new options(){
                        option_key = "filters_allowed_ips",
                        value = @"0"
                    },
                    new options(){
                        option_key = "filters_allowed_ips_expression",
                        value = @""
                    },
                    new options() {
                        option_key = "state_debug",
                        value = "0"
                    },
                    new options() {
                        option_key = "filters_debug_ips",
                        value = @""
                    },
                    new options() {
                        option_key = "filters_debug_ips_expression",
                        value = @""
                    },                    

                    new options() {
                        option_key = "site_ext",
                        value = "html"
                    },
                    new options() {
                        option_key = "usedev",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_print_service",
                        value = "1"
                    },
                    new options() {
                        option_key = "print_notable",
                        value = "0"
                    },
                    new options() {
                        option_key = "current_site_theme",
                        value = "default"
                    },
                    new options() {
                        option_key = "default_head_html_title",
                        value = "Stellar AMS"
                    },
                    new options() {
                        option_key = "default_head_html_description",
                        value = "An Amorphic Management System you can shape to your heart's content. ;) "
                    },
                    new options() {
                        option_key = "default_head_html_keywords",
                        value = "site cms, stuff"
                    },
                    new options() {
                        option_key = "default_head_html_robots",
                        value = "INDEX,FOLLOW"
                    },
                    new options() {
                        option_key = "email_asHtml",
                        value = "1"
                    },
                    new options() {
                        option_key = "default_sender_name",
                        value = "Admin"
                    }, 
                    new options() {
                        option_key = "default_sender_email",
                        value = "noreply@wsu.edu"
                    },
                    new options() {
                        option_key = "tidy_html",
                        value = "0"
                    },
                    new options() {
                        option_key = "minify_html",
                        value = "0"
                    },
                    new options() {
                        option_key = "minify_js",
                        value = "1"
                    },
                    new options() {
                        option_key = "minify_css",
                        value = "1"
                    },
                    new options() {
                        option_key = "GA_account_id",
                        value = "UA-25040747-1"
                    },
                    new options() {
                        option_key = "google_site_verification",
                        value = "hMQT0jjLAQ7ZvVY91SCAMHNNBjEWVgpJMqIbzt0XAd0"
                    },
                    new options() {
                        option_key = "ga_track_events",
                        value = "1"
                    },
                    new options() {
                        option_key = "ga_use_custom",
                        value = "0"
                    },
                    new options() {
                        option_key = "bing_site_verification",
                        value = "73B464C828058D51A426DC1B61D99824"
                    },
                    new options() {
                        option_key = "generate_sitemap",
                        value = "1"
                    },
                    new options() {
                        option_key = "generate_robots_txt",
                        value = "1"
                    },
                    new options() {
                        option_key = "use_faceabook",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_twitter",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_linkedin",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_tumblr",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_yahoo",
                        value = "0"
                    },
                    new options() {
                        option_key = "use_tinymce",
                        value = "1"
                    },
                    new options() {
                        option_key = "code_theme",
                        value = "rubyblue",
                        is_overwritable = true
                    }
                    #endregion
            };
            ActiveRecordMediator<site>.Save(site);
            String site_folder_name = site.alias;
            make_core_folders(site);

            String site_ext = site.get_option("site_ext");

            load_from_xml("privilege_types", site);
            load_from_xml("privileges", site);
            load_from_xml("user_groups", site);
            load_from_xml("taxonomy_types", site);
            load_from_xml("taxonomys", site);

            //SINCE THIS WOULD BE APART OF THE WIZ, REMOVE
            #region(add users)


            List<user_meta_data> default_user_meta_data = new List<user_meta_data>(){
                        new user_meta_data(){
                            meta_key = "code_theme",
                            value = "ambiance"
                        },
                        new user_meta_data(){
                            meta_key = "use_tinymce",
                            value = "1"
                        },
                        new user_meta_data(){
                            meta_key = "user_stealth",
                            value = "1"
                        },
                        new user_meta_data(){
                            meta_key = "user_hotkeys",
                            value = "1"
                        },
                        new user_meta_data(){
                            meta_key = "display_name_as",
                            value = "display_name"
                        }
                    };




                // NOTE THIS IS WIZDAR MATERIAL
                // add event models
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "jeremy.bass",
                    display_name = "Jeremy Bass",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="Mr",
                                first_name="Jeremy",
                                middle_name="Lee",
                                last_name="Bass",
                                email="jeremy.bass@wsu.edu",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });


                // NOTE THIS IS WIZDAR MATERIAL
                // add event models
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "ldapquery",
                    display_name = "global_admin",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="",
                                middle_name="",
                                last_name="",
                                email="ldapquery@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "jcampbell",
                    display_name = "Jennifer Campbell",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Jennifer",
                                middle_name=" ",
                                last_name="Campbell",
                                email="jcampbell@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "kcatlin",
                    display_name = "Kelly Catlin",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Kelly",
                                middle_name="",
                                last_name="Catlin",
                                email="kcatlin@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "pdomanico",
                    display_name = "Paul L Domanico",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Paul",
                                middle_name="L",
                                last_name="Domanico",
                                email="pdomanico@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "jfast",
                    display_name = "Jessica Fast",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Jessica",
                                middle_name="",
                                last_name="Fast",
                                email="jfast@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "mnowakowski",
                    display_name = "Michelle Nowakowski",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Michelle",
                                middle_name="",
                                last_name="Nowakowski",
                                email="mnowakowski@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "dripin",
                    display_name = "Dave Ripin",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Dave",
                                middle_name="",
                                last_name="Ripin",
                                email="dripin@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "astaple",
                    display_name = "Alan Staple",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Alan",
                                middle_name="",
                                last_name="Staple",
                                email="astaple@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "nsugandhi",
                    display_name = "Nandita Sugandhi",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Nandita",
                                middle_name="",
                                last_name="Sugandhi",
                                email="nsugandhi@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "mwatkins",
                    display_name = "Melynda Watkins",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Melynda",
                                middle_name="",
                                last_name="Watkins",
                                email="mwatkins@clintonhealthaccess.org",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });
                ActiveRecordMediator<appuser>.Save(new appuser() {
                    nid = "rramabhadran",
                    display_name = "Ram Ramabhadran",
                    site = site,
                    groups = ActiveRecordBase<user_group>.FindFirst(
                        new List<AbstractCriterion>() { Expression.Eq("name", "system_admin") }.ToArray()
                        ),
                    contact_profiles = new List<contact_profile>() {        
                            new contact_profile() {
                                title="",
                                first_name="Ram",
                                middle_name="",
                                last_name="Ramabhadran",
                                email="ram.ramabhadran@gmail.com",
                                isDefault=true,
                                isPublic=true,
                                allowContact=true
                            }
                    },
                    user_meta_data = default_user_meta_data
                });

            #endregion          
            appuser user = ActiveRecordBase<appuser>.FindFirst( new List<AbstractCriterion>() { Expression.Eq("nid", "jeremy.bass") }.ToArray() );

            load_from_xml("posting_type_actions", site);

            load_from_xml("posting_types", site);



            set_installed_state("True");// the redirect act will insure a app restart and your now installed.
            HttpContext.Current.Response.Redirect("/install/finish_install.castle");

        }


        public void finish_install(String state) {
            CancelLayout();
            CancelView();
            if (!String.IsNullOrWhiteSpace(state) && state == "already")PropertyBag["state"]=true;
            RenderView("../admin/install/install_complete");
        }


    }
}