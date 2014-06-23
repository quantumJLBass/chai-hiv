#region Directives
using System;
using System.Collections;
using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.MonoRail.Framework;
using Castle.MonoRail.Framework.Helpers;
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
using FastMember;
using stellar.Filters;
#endregion
namespace stellar.Controllers {

    /// <summary> </summary>
    [Layout("admin")]
    public class adminController : SecureBaseController {

        /// <summary> </summary>
        public adminController() {
            //this should be made to work
            //if (HttpContext.Current.Request.Params.AllKeys.Contains("skipLayout")) CancelLayout();
            Controllers.BaseController.current_controller = "admin";
        }
        ILog log = log4net.LogManager.GetLogger("adminController");

        /// <summary> </summary>
        public void share(int uid, int itemid) {
            dynamic item = ActiveRecordBase<_base>.Find(itemid);
            if (item.owner.baseid == userService.getUser().baseid) {
                appuser user = ActiveRecordBase<appuser>.Find(uid);
                    Flash["message"] = "Shared a " + item.post_type.name + " item with " + user.display_name + ".";
                    logger.writelog("Shared item with " + user.display_name, getView(), getAction(), item.baseid);
                    item.users.Add(user);
                    ActiveRecordMediator<publish_base>.Save(item);
                    RenderText("True");
            } else {
                logger.writelog("Failed to share item", getView(), getAction(), item.baseid);
                RenderText("False");
            }
        }

        #region VIEWS
        /// <summary> </summary>
        public void admin() {
            appuser user = userService.getUserFull();
            if (user != null) {
                IList<posting> events = user.getUserPostings(5);
                PropertyBag["events"] = events;

                IList<posting> temp = new List<posting>();

                posting[] erroredEvents = ActiveRecordBase<posting>.FindAll().Where(x => x.outputError != null).ToArray();
                PropertyBag["erroredEvents"] = erroredEvents;

                //PropertyBag["user"] = user;
                IList<appuser> activeUser = new List<appuser>();
                appuser[] _users = ActiveRecordBase<appuser>.FindAllByProperty("logedin", true);
                if (_users.ToList().Count > 0) {
                    foreach (appuser _user in _users) {
                        if (_user != null && _user.last_active > DateTime.Today.AddHours(-1)) {
                            activeUser.Add(_user);
                        }
                    }
                    PropertyBag["activeUsers"] = activeUser;
                }
                /*ExchangeService _service = new ExchangeService(ExchangeVersion.Exchange2007_SP1);
                _service.Credentials = new WebCredentials("jeremy.bass", "bA03s17s82!");
                _service.AutodiscoverUrl("jeremy.bass@wsu.edu");*/
                IList<Appointment> tmp = new List<Appointment>();
                /*CalendarView calendarView = new CalendarView(DateTime.Now, DateTime.Now.AddDays(5));
                foreach (Appointment appointment in _service.FindAppointments(WellKnownFolderName.Calendar, calendarView)) {
                    tmp.Add(appointment);
                }*/
                PropertyBag["ExchangeService"] = tmp;
                PropertyBag["activeUsers"] = activeUser;
                PropertyBag["analytics"] = seoService.getGAAnalytics();
            }
            //switch to the theme based one so there is customized dashboard
            RenderView("../admin/splash");
        }


        /// <summary> </summary>
        public void configuration(int siteid) {

            PropertyBag["frontend_themelist"] = themeService.list_themes();

            PropertyBag["posting_types"] = ActiveRecordBase<posting_type>.FindAll();
            PropertyBag["posting_type_actions"] = ActiveRecordBase<posting_type_action>.FindAll();
            site site_obj = new site();
            if (siteid > 0) {
                site_obj = ActiveRecordBase<site>.Find(siteid);
            } else {
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                filtering.Add(Expression.Eq("is_default", true));
                site_obj = ActiveRecordBase<site>.FindFirst(filtering.ToArray());
            }
            PropertyBag["site"] = site_obj;

            foreach (options option in site_obj.options){
                if (!String.IsNullOrWhiteSpace(option.option_key)) {
                    PropertyBag[option.option_key.ToUpper()] = option.value;//ie: post.get_meta("title");
                }
            }

            RenderView("../admin/configuration");
        }


        /// <summary> </summary>
        public void save_config(
                [ARDataBind("site", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] site site,
            String[] value,
            String[] option_key,
            String regen_sitemap,
            String regen_robots_txt
            ) {
            site.options.Clear();

            //todo abstract this since the taxonmies also have need for this.  
            //when it's done remeber it should account for children
            String[] keys = HttpContext.Current.Request.Params.AllKeys.Where(x => x.StartsWith("value[")).ToArray();
            for (int i = 0; i <= keys.Count(); i++) {
                if(!String.IsNullOrWhiteSpace(HttpContext.Current.Request.Form["value[" + i + "]"])){
                    String val = HttpContext.Current.Request.Form["value[" + i + "]"];
                    String option = HttpContext.Current.Request.Form["option_key[" + i + "]"];
                    if (!String.IsNullOrWhiteSpace(option)) {
                        options tmp = new options() {
                            value = val,
                            option_key = option
                        };
                        site.options.Add(tmp);
                    }
                }
            }
            ActiveRecordMediator<site>.Save(site);
            if (!String.IsNullOrWhiteSpace(regen_sitemap)) seoService.regen_sitemap(site.get_option("sitemap_location"), "<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\"><url> <loc>http://wsu.edu/</loc> <changefreq>daily</changefreq></url></urlset>");

            if (!String.IsNullOrWhiteSpace(regen_robots_txt)) seoService.regen_robots_txt("User-Agent: *\r\nDisallow:\r\nDisallow: /admin\r\n\r\nSitemap: http://www.domain.com/sitemap.xml\r\n");
            


            logger.writelog("Saved site setting.", getView(), getAction(), site.id);
            Flash["message"] = "Saved site setting.";

            RedirectToAction("configuration");
        }

        /// <summary> </summary>
        public void logs(string post_type, int page, string filter) {
            int pagesize = 15;
            List<AbstractCriterion> baseEx = new List<AbstractCriterion>();

            baseEx.AddRange(baseEx);
            if (!String.IsNullOrWhiteSpace(filter)) baseEx.Add(Expression.Like("entry", "%" + filter + "%"));

            IList<logs> listing_tems = ActiveRecordBase<logs>.FindAll(new Order[] { Order.Desc("date") }, baseEx.ToArray());
            PropertyBag["named_type"] = "logs";
            PropertyBag["named_type_dname"] = "System Logs";
            PropertyBag["All_list"] = PaginationHelper.CreatePagination(listing_tems, pagesize, page);
            PropertyBag["itemNamed"] = "logs";// postType.alias;
            RenderView("../admin/logs");
        }

        /// <summary> </summary>
        public void edit_posting_type(int id){
            posting_type item = ActiveRecordBase<posting_type>.Find(id);
            PropertyBag["item"] = item;
            PropertyBag["actions"] = ActiveRecordBase<posting_type_action>.FindAll();
            RenderView("../admin/postings/edit_posting_type");
        }
        /// <summary> </summary>
        public void update_posting_type([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting_type item) {
            ActiveRecordMediator<posting_type>.Save(item);
            RedirectToAction("list_siteSettings");
        }


        /// <summary> </summary>
        public void postings(Boolean is_admin){
            PropertyBag["is_admin"] = is_admin;
        }

        /// <summary> </summary>
        public void sites(){
            PropertyBag["buttons"] = new String[] { "edit", "delete" };
            PropertyBag["default_site"] = ActiveRecordBase<site>.FindAll().Where(x => x.is_default == true);
            PropertyBag["sites"] = ActiveRecordBase<site>.FindAll().Where(x => x.is_default == false);


        }

        /// <summary> </summary>
        public void connections() {
            PropertyBag["slaves"] = ActiveRecordBase<connections_slave>.FindAll();
            PropertyBag["masters"] = ActiveRecordBase<connections_master>.FindAll();
        }



        /// <summary> </summary>
        public void edit_slave_connection(int id) {
            connections_slave item = ActiveRecordBase<connections_slave>.Find(id);
            PropertyBag["item"] = item;
            RenderView("../admin/slave_con");
        }
        /// <summary> </summary>
        public void edit_master_connection(int id) {
            connections_master item = ActiveRecordBase<connections_master>.Find(id);
            PropertyBag["item"] = item;
            RenderView("../admin/master_con");
        }





        /// <summary> </summary>
        public void getMainCalendar(String callback) {

            CancelView();
            CancelLayout();
            /* get user */
            /*get user default calendar*/

            /*output main calendar*/
            /* var values = new Dictionary<string, object>();
             if (!String.IsNullOrWhiteSpace(view.options_obj) && view.options_obj != "{}")
             {
                 var jss = new JavaScriptSerializer();
                 var options = jss.Deserialize<Dictionary<string, dynamic>>(view.options_obj);
                 options.ToList<KeyValuePair<string, dynamic>>();
                 foreach (KeyValuePair<string, dynamic> option in options)
                 {
                     values.Add(option.Key, option.Value);
                 }
             }
             */

            String JSON = "";

            JSON = @"[{""id"":1,""title"":""Event1"",""start"":""2012-10-23"",""url"":""http:\/\/yahoo.com\/"",""description"":""blaaa blaa"",""wsu"":true,""editable"":true},{""id"":99,""title"":""Event1"",""start"":""2012-10-23"",""url"":""http:\/\/yahoo.com\/"",""description"":""blaaa blaa"",""wsu"":true},{""id"":101,""title"":""Event1"",""start"":""2012-10-23"",""url"":""http:\/\/yahoo.com\/"",""description"":""blaaa blaa"",""wsu"":true},{""id"":111,""title"":""Event1"",""start"":""2012-10-23"",""url"":""http:\/\/yahoo.com\/"",""description"":""blaaa blaa"",""wsu"":true},{""id"":222,""title"":""Event2"",""start"":""2012-10-23"",""end"":""2012-10-25"",""url"":""http:\/\/yahoo.com\/"",""description"":""blaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaablaaa blaa"",""wsu"":true,""editable"":true}]";
            //JSON = [{"id":111,"title":"Event1","start":"2012-10-10","url":"http:\/\/yahoo.com\/"},{"id":222,"title":"Event2","start":"2012-10-20","end":"2012-10-22","url":"http:\/\/yahoo.com\/"}]
            if (!string.IsNullOrEmpty(callback)) {
                JSON = callback + "(" + JSON + ")";
            }
            Response.ContentType = "application/json; charset=UTF-8";

            RenderText(JSON);
        }

        /// <summary> </summary>
        public void help(int iid) {

           
                
                //if (!usedev) filtering.Add(Expression.Eq("revision", 0));
                posting post = null;
                if (iid > 0) {
                    post = ActiveRecordBase<posting>.Find(iid).get_published();
                } else {
                    List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                    filtering.Add(Expression.Eq("is_default", true));
                    filtering.Add(Expression.Eq("deleted", false));
                    filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                new List<AbstractCriterion>() { 
                                    Expression.Eq("alias", "documentation")
                                }.ToArray())
                            ));
                    post = ActiveRecordBase<posting>.FindFirst(filtering.ToArray());
                    if(post != null)post = post.get_published();
                }
                if(post==null){
                    post = postingService.get_posting_by_url("/404.html", usedev);
                    Response.StatusCode = 404;
                }
                /* Items that should be globaly accessed */
                //PropertyBag["campus"] = ActiveRecordBase<campus>.FindAllByProperty("name", "Pullman")[0];

                site site = siteService.getCurrentSite();
                PropertyBag["site"] = site;

                PropertyBag["baseurl"] = "admin/help.castle";
                PropertyBag["htmlService"] = new htmlService();

                /* add site options */
                if (site.options != null && site.options.Count > 0) {
                    foreach (options item in site.options) {
                        PropertyBag[item.option_key.ToUpper()] = item.value;//ie: post.get_meta("title");
                    }
                }

                /* add meta */
                if (post.meta_data!=null && post.meta_data.Count > 0) {
                    foreach (meta_data item in post.meta_data) {
                        PropertyBag[item.meta_key.ToUpper()] = item.value;//ie: post.get_meta("title");
                    }
                }

                String urlQueries = "";
                PropertyBag["urlQueries"] = String.IsNullOrWhiteSpace(urlQueries) ? "" : "iid[]=" + urlQueries.TrimStart(',');
                if (iid > 0) {
                    PropertyBag["urlQueries"] += (String.IsNullOrWhiteSpace(urlQueries) ? "" : "&") + "iid=" + iid.ToString();
                }

                PropertyBag["siteroot"] = httpService.getRootUrl().TrimEnd('/');
                PropertyBag["Controller"] = base.MemberwiseClone();
                Hashtable content_params = objectService.marge_params(PropertyBag, new Hashtable());
                String output = new renderService().render(post, content_params);



                // bool ActiveRecordBase<site_base>.FindFirst(new List<AbstractCriterion>() { Expression.Eq("name", "minhtml") }.ToArray())
                Boolean tmpB = false;
                if (tmpB)
                    output = htmlService.stripNonSenseContent(output, false);

                //RenderText(output);
                PropertyBag["content"] = output;
                RenderView("../admin/default/actions/help");
        }
















































        #endregion


        #region(Trashbin)
        /// <summary> </summary>
            public void trashbin() {
                PropertyBag["postingtypes"] = ActiveRecordBase<posting_type>.FindAll();
                List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
                baseEx.Add(Expression.Eq("deleted", true));
                int limit = 99999;
                Order[] ord = new Order[1];
                ord[0] = Order.Asc("name");
                PropertyBag["trashbin"] = ActiveRecordBase<_base>.SlicedFindAll(0, limit, ord, baseEx.ToArray());

                RenderView("../admin/trashbin");
            }

            /// <summary> </summary>
            public void empty_trash() {
                PropertyBag["postingtypes"] = ActiveRecordBase<posting_type>.FindAll();
                List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
                baseEx.Add(Expression.Eq("deleted", true));
                int limit = 99999;
                Order[] ord = new Order[1];
                ord[0] = Order.Asc("name");
                dynamic[] items = ActiveRecordBase<_base>.SlicedFindAll(0, limit, ord, baseEx.ToArray());
                foreach (dynamic item in items) {
                    //if (item.owner.baseid == userService.getUser().baseid) { // add item.users.Contains(userService.getUser()) and has rights
                        Flash["message"] = "All files in the trashbin have been <strong>deleted forever!</strong>. If this was by mistake, please contact your web contact and request for a database restore.";
                        //logger.writelog("Removed " + item.post_type.name + " from the trash", getView(), getAction(), item.baseid);
                        postingService.delete_item_forever(item);
                   /* } else {
                        Flash["message"] = "You can't undelete something you don't own.  Contact the owner, " + item.owner.display_name + ", for farther action.";
                        logger.writelog("Attepted to restore an event they didn't own", getView(), getAction(), item.baseid);
                    }*/
                }


                items = ActiveRecordBase<_base>.SlicedFindAll(0, limit, ord, baseEx.ToArray());
                if (items.Count() > 0) {
                    String message = "";
                    foreach (dynamic item in items) {
                        if (item.owner.baseid == userService.getUser().baseid) {
                            message += item.post_type.name + " (owner: " + item.owner + ")" + "<br/>";
                        }
                    }
                    Flash["error"] = "Some files have not been deleted since you didn't have rights to do so. Files Skiped:<br/><ul>" + message + "</ul><br/>Contact the owners of the content for them to share it with you.";


                }
                RedirectToAction("trashbin");
            }
            /// <summary> </summary>
            public void massaction(int[] mass, String deletemass, String restoremass) {
                foreach (int id in mass) {
                    if (!String.IsNullOrWhiteSpace(restoremass)) {
                        dynamic item = ActiveRecordBase<_base>.Find(id);
                       // if (item.owner.baseid == userService.getUser().baseid) {
                            item.deleted = false;
                            ActiveRecordMediator<_base>.Save(item);
                        //}
                    } else if (!String.IsNullOrWhiteSpace(deletemass)) {
                        dynamic item = ActiveRecordBase<_base>.Find(id);
                       // if (item.owner.baseid == userService.getUser().baseid) {
                            postingService.delete_item_forever(item);
                        //}
                    }
                }
                if (!String.IsNullOrWhiteSpace(restoremass)) {
                    Flash["message"] = "Items " + mass.ToString() + ", has been <strong>restored</strong>.";
                    logger.writelog("Removed Items " + mass.ToString() + ",  from the trash", getView(), getAction());
                } else if (!String.IsNullOrWhiteSpace(deletemass)) {
                    Flash["message"] = "Items " + mass.ToString() + ", has been <strong>deleted</strong>.";
                    logger.writelog("Removed  Items " + mass.ToString() + " from the trash", getView(), getAction());
                }
                RedirectToAction("trashbin");
            }


            //more some of this to a service
            /// <summary> </summary>
            public void delete_item(int id) {
                dynamic item = ActiveRecordBase<_base>.Find(id);
                if (item.owner.baseid == userService.getUser().baseid) {
                    Flash["message"] = "A " + item.post_type.name + ", <strong>" + item.name + "</strong>, has been <strong>deleted</strong>.";
                    logger.writelog("Removed " + item.post_type.name + " from the trash", getView(), getAction(), item.baseid);
                    postingService.delete_item_forever(item);
                } else {
                    Flash["message"] = "You can't undelete something you don't own.  Contact the owner, " + item.owner.display_name + ", for farther action.";
                    logger.writelog("Attepted to restore an event they didn't own", getView(), getAction(), item.baseid);
                }
                RedirectToAction("trashbin");
            }
            /// <summary> </summary>
            public void restore_item(int id) {
                dynamic item = ActiveRecordBase<_base>.Find(id);
                if (item.owner.baseid == userService.getUser().baseid) {
                    Flash["message"] = "A " + item.post_type.name + ", <strong>" + item.name + "</strong>, has been <strong>restored</strong>.";
                    logger.writelog("Removed " + item.post_type.name + " from the trash", getView(), getAction(), item.baseid);
                    item.deleted = false;
                    ActiveRecordMediator<publish_base>.Save(item);
                } else {
                    Flash["message"] = "You can't undelete something you don't own.  Contact the owner, " + item.owner.display_name + ", for farther action.";
                    logger.writelog("Attepted to restore an event they didn't own", getView(), getAction(), item.baseid);
                }
                CancelLayout();
                RedirectToAction("trashbin");
            }

        #endregion


        #region METHODS

            /// <summary> </summary>
        public void checkAlias(String alias, String typeName) {

            CancelView();
            CancelLayout();
            object[] temp = helperService.alias_exsits(alias, typeName);
            if (temp.Length > 0) {
                RenderText("true");
            } else {
                RenderText("false");
            }
        }

        /// <summary> </summary>
        public void show_diff(int parent,int rev1id, int rev2id,Boolean ajxed) {
            if (ajxed) CancelLayout();
            posting parent_post = ActiveRecordBase<posting>.Find(parent);
            posting rev1 = ActiveRecordBase<posting>.FindFirst(new Order("revision", false),
                       new List<AbstractCriterion>() { 
                           Expression.Eq("revision", rev1id),
                           Expression.Eq("parent", parent_post)
                       }.ToArray()
                   );
            posting rev2 = ActiveRecordBase<posting>.FindFirst(new Order("revision", false),
                       new List<AbstractCriterion>() { 
                           Expression.Eq("revision", rev2id),
                           Expression.Eq("parent", parent_post)
                       }.ToArray()
                   );
            String text1 = rev1.content;
            String text2 = rev2.content;
            PropertyBag["rev1"] = rev1;
            PropertyBag["rev2"] = rev2;
            PropertyBag["parent_post"] = parent_post;
            PropertyBag["rev1text"] = text1;
            PropertyBag["rev2text"] = text2;
            PropertyBag["diff"] = cms.utils.Diff.PrintItems(cms.utils.Diff.DiffText(text1, text2, true, true, true));
            RenderView("/admin/diff/show_diff.vm");
        }




        #endregion


        #region WSU MATRIX
        /// <summary> </summary>
        public void taxonomy() {
            //PropertyBag["campuses"] = ActiveRecordBase<campus>.FindAll(Order.Asc("name"));
            PropertyBag["taxonomy_types"] = ActiveRecordBase<taxonomy_type>.FindAll(Order.Asc("name"));

            RenderView("../admin/taxonomy/list");
        }
        /// <summary> </summary>
        public void edit_taxonomy(string type, int id, Boolean skiplayout) {
            taxonomy taxonomy_type = new taxonomy();
            if(id>0){
                taxonomy_type = ActiveRecordBase<taxonomy>.Find(id);
            }
            PropertyBag["item"] = taxonomy_type;
            PropertyBag["taxonomy_types"] = ActiveRecordBase<taxonomy_type>.FindAll(Order.Asc("name"));

            PropertyBag["action"] = String.IsNullOrWhiteSpace(type)? taxonomy_type.name : type;
            PropertyBag["skiplayout"] = skiplayout;
            if (skiplayout) CancelLayout();
            RenderView("../admin/taxonomy/_editor");
        }
        /// <summary> </summary>
        public void delete_taxonomy(int id) {
            taxonomy taxonomy = ActiveRecordBase<taxonomy>.Find(id);
            Flash["message"] = "A taxonomy, <strong>" + taxonomy.name + "</strong>, has been <strong>deleted</strong>.";
            ActiveRecordMediator<taxonomy>.Delete(taxonomy);
            CancelLayout();
            RedirectToAction("taxonomy");
        }
        /// <summary> </summary>
        public void update_taxonomy([ARDataBind("taxonomy", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] taxonomy taxonomy, Boolean ajax, String oldtax_alias, String oldtax_type_alias) {
            ActiveRecordMediator<taxonomy>.Save(taxonomy);
            
            dynamic items = new List<_base>();
            string name = "";
            taxonomy_type type = null;

            if (!String.IsNullOrWhiteSpace(oldtax_alias) && !String.IsNullOrWhiteSpace(oldtax_type_alias)) {
                type = taxonomy.taxonomy_type;
                name = taxonomy.name;
                ActiveRecordMediator<_base>.Save(taxonomy);

                //find old ones and clean them up
                taxonomy tax = ActiveRecordBase<taxonomy>.Find(taxonomy.baseid);
                try {
                    IList<_base> taxed = tax.get_taxonomy_items(oldtax_type_alias, oldtax_alias);
                    if (taxed.Count() > 0) {
                        items.AddRange(taxed);
                        String alias = taxonomy.alias;
                        foreach (_base p in items) {
                            log.Info("appling taxonomy " + type.alias + " to " + p.baseid + "/" + p.alias);
                            PropertyInfo propInfo = p.GetType().GetProperty(type.alias);
                            propInfo.SetValue(p, alias, new object[] { });
                            log.Info("adding new taxonomy back to items");
                            ActiveRecordMediator<_base>.Save(p);
                        }
                    }
                } catch {

                }
                Flash["message"] = "taxonomy has " + items.Count + " items to change from: <b>" + oldtax_type_alias + "/" + oldtax_alias +
                    "</b>  TO   <b>" + type.alias + "/" + taxonomy.alias+"</b>";
                log.Info("taxonomy has " + items.Count + " items to change to " + oldtax_type_alias + "/" + oldtax_alias);
                
            }
            if (ajax) {
                CancelLayout();
                if (taxonomy.baseid>0){
                    RenderText("{\"state\":\"true\",\"name\":\"" + taxonomy.name + "\",\"alias\":\"" + taxonomy.alias + "\"}");
                }else{
                    RenderText("{\"state\":\"false\"}");
                }
                return;
            }
            RedirectToAction("taxonomy");
        }

        /// <summary> </summary>
        public void merge_taxonomy(int[] ids, string newname) {
            CancelLayout();
            CancelView();
            log.Info("starting merge proccess");
            if (!String.IsNullOrEmpty(Request.Params["deleteTags"])) { mass_delete_taxonomy(ids); return; }
            dynamic items = new List<_base>();
            string name = "";
            taxonomy_type oldtype = null;
            foreach (int id in ids) {
                taxonomy tax = ActiveRecordBase<taxonomy>.Find(id);
                oldtype = tax.taxonomy_type;
                name = tax.name;
                log.Info("found taxonomy" + name);
                items.AddRange(tax.get_taxonomy_items(oldtype.alias, tax.alias));
                foreach (dynamic p in tax.items) {
                    log.Info("removing taxonomy from item " + p.alias);
                    p.taxonomies.Remove(tax);
                    ActiveRecordMediator<_base>.Save(p);
                }
                ActiveRecordMediator<taxonomy>.Delete(tax);
            }

            taxonomy t = new taxonomy();
            name = String.IsNullOrEmpty(newname) ? name : newname;
            t.name = name;
            String alias = name.Replace(' ', '_').ToLower();
            t.alias = alias;
            t.taxonomy_type = oldtype;
            ActiveRecordMediator<taxonomy>.Save(t);
            log.Info("created taxonomy with new name");
            foreach (_base p in items) {
                log.Info("appling taxonomy " + oldtype.alias);
                PropertyInfo propInfo = p.GetType().GetProperty(oldtype.alias);

                propInfo.SetValue(p, alias, new object[] { });

                //postingService.get_taxonomy(p.innovator_company).name
                p.taxonomies.Add(t);
                log.Info("adding new taxonomy back to items");
                ActiveRecordMediator<_base>.Save(p);
            }
            RedirectToAction("taxonomy");
        }


        /// <summary> </summary>
        public void mass_delete_taxonomy(int[] ids) {
            foreach (int id in ids) {
                taxonomy tag = ActiveRecordBase<taxonomy>.Find(id);
                ActiveRecordMediator<taxonomy>.Delete(tag);
            }
            RedirectToAction("taxonomy");
        }



        /* campus
        public void _new_campuses() {
            campus campuses = new campus();
            PropertyBag["itmes"] = campuses;
            PropertyBag["action"] = "campuses";
            RenderView("../admin/taxonomy/_editor");
        }
        public void _edit_campuses(int id) {
            campus campuses = ActiveRecordBase<campus>.Find(id);
            PropertyBag["itmes"] = campuses;
            PropertyBag["action"] = "campuses";
            RenderView("../admin/taxonomy/campus_editor");
        }
        public void _delete_campuses(int id) {
            campus campuses = ActiveRecordBase<campus>.Find(id);
            Flash["message"] = "A campuse, <strong>" + campuses.name + "</strong>, has been <strong>deleted</strong>.";
            ActiveRecordMediator<campus>.Delete(campuses);
            CancelLayout();
            RedirectToAction("taxonomy");
        }
        public void _update_campuses([ARDataBind("campuses", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] campus campuses) {
            ActiveRecordMediator<campus>.Save(campuses);
            RedirectToAction("taxonomy");
        }
         */
        #endregion

    }





}