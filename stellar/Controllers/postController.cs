namespace stellar.Controllers {
    #region Directives
    using System.Collections.Generic;
    using System.Collections.Specialized;
    using Castle.ActiveRecord;
    using Castle.MonoRail.Framework;
    using Castle.MonoRail.ActiveRecordSupport;
    using Castle.MonoRail.Framework.Helpers;
    //using MonoRailHelper;
    using NHibernate.Criterion;
    using System.IO;
    using System.Web;
    using System;
    using System.Net;
    using stellar.Models;
    using System.Net.Mail;
    using Castle.Components.Common.EmailSender;
    using Castle.Components.Common.EmailSender.Smtp;
    using Castle.ActiveRecord.Queries;
    using System.Text.RegularExpressions;
    using System.Collections;
    using stellar.Services;
    using Microsoft.SqlServer.Types;
    using System.Data.SqlTypes;
    using System.Xml;
    using System.Text;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Utilities;
    using Newtonsoft.Json.Linq;

    using System.Collections.ObjectModel;
    using System.Dynamic;
    using System.Linq;
    using System.Web.Script.Serialization;

    using AutoMapper;

    #endregion

    /// <summary> </summary>
    [Layout("admin")]
    public class postController : adminController {
        /*
         * 
         * MAY BE A FIELDS HELPER SERVICES WOULD BE WISE ?
         * 
         */

        /// <summary> </summary>
        public postController() {
            Controllers.BaseController.current_controller = "post";
        }



        /// <summary> </summary>
        public posting_type getPostType(String posttype) {
            posting tmp = new posting();
            tmp.tmp = true;

            dynamic type;
            if (String.IsNullOrWhiteSpace(posttype)) {
                type = ActiveRecordBase<posting_type>.FindFirst(
                       new List<AbstractCriterion>() { Expression.Eq("_default", 1) }.ToArray()
                );
            } else {
                type = ActiveRecordBase<posting_type>.FindFirst(
                       new List<AbstractCriterion>() { Expression.Eq("alias", posttype) }.ToArray()
                );
            }
            return type;
        }



        /// <summary> </summary>
        public void create(String post_type, Boolean skipLayout) {
            posting tmp = new posting();
            tmp.tmp = true;

            tmp.site = siteService.getCurrentSite();
            tmp.theme = themeService.current_theme_alias();
            tmp.published = false;

            appuser user = userService.getUserFull();
            tmp.owner = user;
            tmp.editors = new List<appuser>() { user };
            tmp.editing = user;
            tmp.post_type = getPostType(post_type);
            ActiveRecordMediator<posting>.Save(tmp);
            RedirectToUrl("~/post/edit_post.castle?id=" + tmp.baseid + (skipLayout ? "&skipLayout=true" : ""));
        }
        /// <summary> </summary>
        public void edit_post(int id,int rev,Boolean skipLayout) {
            
            posting post = ActiveRecordBase<posting>.Find(id);

            PropertyBag["lastversions"] = post.get_latest_revisions();
            PropertyBag["full"] = false;
            
            /* load a revision other then the working copy? */
            if(rev>0){
                posting lastversion = new posting();
                lastversion = post.get_revision(rev);
                if (lastversion != null && lastversion.baseid > 0 && lastversion.baseid != post.baseid) {
                    post = lastversion;
                }
            }

            appuser user = userService.getUserFull();



            /* todo abstract this out of here */
                List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
                typeEx.Add(Expression.Eq("set", post.post_type.baseid));
                field_types[] ft = ActiveRecordBase<field_types>.FindAll(typeEx.ToArray());
                List<string> fields = new List<string>();

                PropertyBag["short_codes"] = fieldsService.get_short_codes(ft);

                List<string> user_fields = new List<string>();
                if (ft != null) {
                    foreach (field_types ft_ in ft) {
                        if ((ft_.users.Count > 0) || (ft_.users.Count > 0)) {
                            if (ft_.users.Contains(user)) {
                                user_fields.Add(fieldsService.get_field(ft_, post));
                            } else {
                                fields.Add(fieldsService.get_field(ft_, post));
                            }
                        } else {
                            user_fields.Add(fieldsService.get_field(ft_, post));
                        }
                    }
                }
            /*end*/
            PropertyBag["user_fields"] = user_fields;
            PropertyBag["fields"] = fields;
            


            PropertyBag["post"] = post;
            PropertyBag["taxonomy"] = ActiveRecordBase<taxonomy_type>.FindAll();

            PropertyBag["postCustom"] = file_info.DirSearch("/Views/admin/postings/custom_post_blocks/" + post.post_type.alias + "/editor_blocks/", @"/editor_blocks/", ".vm");

            PropertyBag["named_type"] = post.post_type.alias;
            PropertyBag["named_type_dname"] = post.post_type.name;
            PropertyBag["item"] = post;


            /* this needs to be rethinked.  It should be so hard coded here */
            PropertyBag["posting_templates"] = themeService.get_published_templates("posting_template");
            PropertyBag["layout_templates"] = themeService.get_published_templates("layout_template");
            PropertyBag["menu_templates"] = themeService.get_published_templates("menu_template");
            if (post.post_type.alias == "menu") PropertyBag["menuItems"] = post.menuoptions.OrderBy(x => x.sort);
            PropertyBag["categories"] = taxonomyService.get_taxonomies("categories");



            /* Set up render */
            if (skipLayout) CancelLayout();
            PropertyBag["skipLayout"] = skipLayout;


            //what file
            //this is the setup for the admin to get fully themed
            /*String actionfile = "/Views/admin/postings/custom_post_blocks/" + post.post_type.alias + "/_editor.vm";
            if (file_info.file_exists(actionfile)) {

                String layoutfile = "/Views/admin/default/layout_template/admin.vm";
                String layout = file_handler.read_from_file(layoutfile);

                PropertyBag["siteroot"] = httpService.getRootUrl().TrimEnd('/');
                PropertyBag["Controller"] = base.MemberwiseClone();


                Hashtable content_params = objectService.marge_params(PropertyBag, new Hashtable());
                String output = renderService.proccessText(content_params, file_handler.read_from_file(actionfile));

                PropertyBag["childContent"] = output;

                content_params = objectService.marge_params(PropertyBag, new Hashtable());

                output = renderService.proccessText(content_params, layout);
                Boolean tmpB = false;
                if (tmpB) output = htmlService.stripNonSenseContent(output, false);
                RenderText(output);
                return;
            }*/
            String editorpath = "../admin/postings/_editor";
            if (file_info.file_exists("/Views/admin/postings/custom_post_blocks/" + post.post_type.alias + "/_editor.vm")) {
                editorpath = "../admin/postings/custom_post_blocks/" + post.post_type.alias + "/_editor";
            }
            RenderView(editorpath);
        }

        /// <summary> </summary>
        public void update([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting item,
            bool    ajaxed_update,
            bool    forced_tmp,
            string  LongLength,
            string  Length,
            string  apply,
            String  pushlive,
            string  cancel,
            String transition,
            [ARDataBind("menuoptions", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] menu_option[] menuoptions
            ) {

            /*
             * 1.) test if there is any changes
             * 2.) save values
             * 3.) make copy version stuff
             * 4.) Move to the next page
             * 
             */

             Flash["item"] = item;
            String poststr = httpService.get_post_str();
            if (item.baseid != 0 && formactionService.form_entry_match(item, poststr)) {
                logger.writelog("The saved entry appered that same.  Nothing happened.", getView(), getAction(), item.baseid);
                Flash["message"] = "The saved entry appered that same.  Nothing happened.";
                if (apply != null || ajaxed_update) {
                    RedirectToReferrer();
                    return;
                }else{
                    item.editing = null;
                    ActiveRecordMediator<posting>.Save(item);
                    // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                    Hashtable hashtable = new Hashtable();
                    hashtable.Add("post_type", item.post_type.alias);
                    Redirect("post", "posting_list", hashtable);
                }
                


                return;
            }

            //dynamic value;
            if (cancel != null) {
                if (forced_tmp && item.baseid != 0) {
                    logger.writelog("Canceled event creation", getView(), getAction());
                    ActiveRecordMediator<posting>.DeleteAndFlush(item);
                } else if (!forced_tmp) {
                    logger.writelog("Canceled event edit ", getView(), getAction(), item.baseid);
                    item.editing = null;
                    ActiveRecordMediator<posting>.Save(item);
                }
                Hashtable hashtable = new Hashtable();
                hashtable.Add("post_type", item.post_type.alias);
                Redirect("post", "posting_list", hashtable);
                return;
            }
            appuser user = userService.getUserFull();
            item.editing = user;
            if (String.IsNullOrWhiteSpace(item.name)) {
                if (!forced_tmp) {
                    Flash["error"] = "You are missing the basic parts of: " + item.post_type.name;
                    RedirectToReferrer();
                    return;
                } else {
                    item.name = "TEMP NAME";
                }
            }
            if (String.IsNullOrWhiteSpace(item.name)) {
                if (!forced_tmp) {
                    Flash["error"] = "You are missing the basic parts of: " + item.post_type.name;
                    RedirectToReferrer();
                    return;
                } else {
                    item.name = "TEMP NAME";
                }
            }
            if (!item.users.Contains(user)) item.users.Add(user);
           
            if (menuoptions.Count()>0){
                IList<menu_option> tmplist = item.menuoptions;
                item.menuoptions.Clear();
                foreach (menu_option kill in tmplist) {
                    ActiveRecordMediator<menu_option>.DeleteAndFlush(kill);
                }
                
                foreach (menu_option menuitem in menuoptions){
                    ActiveRecordMediator<menu_option>.Save(menuitem);
                    item.menuoptions.Add(menuitem);
                }
            }
            
            ActiveRecordMediator<posting>.Save(item);




            item.checksum = helperService.CalculateMD5Hash(poststr);
            if (item.baseid == 0) {
                //PlaceStatus stat = ActiveRecordBase<PlaceStatus>.Find(1);
                //events.Status = stat;
                item.creation_date = DateTime.Now;
            } else {
                item.updated_date = DateTime.Now;
            }



            item = versionService.make_post_revision(item);


            if (item != null && item.baseid > 0) {
                Flash["message"] = "revision made for " + item.name;
            } else {
                Flash["error"] = "Failed to revision of item.";
            }


            


            //Controllers.BaseController.theme





            // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?

            //this will com later
            //Redirect(item.post_type.alias, "list");
            //for now just redirect to post list

            if (apply != null || ajaxed_update) {
                logger.writelog("Applied "+item.post_type.name+" edits", getView(), getAction(), item.baseid);
                Flash["message"] = "Applied " + item.post_type.name + " edits for " + item.name;
                if (item.baseid > 0) {
                    if (ajaxed_update) {
                        CancelLayout();
                        RenderText(item.baseid.ToString());
                    } else {
                        RedirectToUrl("~/post/edit_post.castle?id=" + item.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                item.editing = null;
                logger.writelog("Saved " + item.post_type.name + " (Ver: " + item.version + " Rev: " + item.revision + ") edits on", getView(), getAction(), item.baseid);
                Flash["message"] = "Saved " + item.post_type.name + " edits for " + item.name;
                ActiveRecordMediator<posting>.Save(item);

                if (pushlive == "Push Live" && versionService.publish_post(item)){
                    logger.writelog("Published " + item.post_type.name + " edits on", getView(), getAction(), item.baseid);
                    Flash["message"] = "You have Saved and Published a " + item.post_type.name + " named " + item.name + "(" + item.baseid + ")";
                } else if (pushlive == "Push Live") {
                    logger.writelog("Failed to Publish " + item.post_type.name + " edits on", getView(), getAction(), item.baseid);
                    Flash["Error"] = "Opps, something failed by you Saved just not Published a " + item.post_type.name + " named " + item.name + "(" + item.baseid + ")";
                }

                // ok this is where it gets merky.. come back to   Redirect(post.post_type.alias, "update", post); ?
                Hashtable hashtable = new Hashtable();
                hashtable.Add("post_type", item.post_type.alias);
                Redirect("post", "posting_list", hashtable );
                return;
            }
        }
        /// <summary> </summary>
        public void copy_post(int id, String name) {
            CancelLayout();
            CancelView();
            var newObj = versionService._copy<posting>(id, name, false);
            if (newObj != null && newObj.baseid > 0) {
                Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                RedirectToUrl("~/cal_events/edit_event.castle?id=" + newObj.baseid);
            } else {
                Flash["error"] = "Failed to copy item.";
                RedirectToUrl("~/cal_events/list_events.castle");
            }

        }


        /// <summary> </summary>
        public void list_revisions(int id) {
            posting post = ActiveRecordBase<posting>.Find(id);
            posting[] lastversions = ActiveRecordBase<posting>.FindAll(new Order("revision", false),
                   new List<AbstractCriterion>() { Expression.Eq("parent", post), Expression.Gt("revision", 0) }.ToArray()
               );
            PropertyBag["full"] = true;
            PropertyBag["lastversions"] = lastversions;
            RenderView("../admin/postings/post_blocks/revisions");
        }

        //note that the xxxxxxmass arg should be a switch
        /// <summary> </summary>
        public new void massaction(int[] mass, String deletemass, String publishmass) {
            foreach (int id in mass) {
                if (!String.IsNullOrWhiteSpace(publishmass)) {
                    dynamic item = ActiveRecordBase<_base>.Find(id);
                    if (item.owner.baseid == userService.getUser().baseid) {
                        versionService.publish_post(item);
                    }
                } else if (!String.IsNullOrWhiteSpace(deletemass)) {
                    dynamic item = ActiveRecordBase<_base>.Find(id);
                    if (item.owner.baseid == userService.getUser().baseid) {
                        item.deleted = true;
                        ActiveRecordMediator<posting>.Save(item);
                    }
                }
            }
            RedirectToReferrer();
        }


























        /// <summary> </summary>
        public void posting_list(string post_type,Boolean show_core) {
            posting_list(post_type, 0, 0, "", "", false, false, show_core);
        }
        /// <summary> </summary>
        public void posting_list(string post_type){
            posting_list(post_type, 0, 0, "", "", false, false, false);
        }
        /// <summary> </summary>
        public void posting_list(string post_type, int page, int searchId, string target, string filter, Boolean ajax, bool skiplayout, Boolean show_core) {

            posting_type postType = getPostType(post_type);
            userService.clearConnections<posting>();

            var pageing = new Dictionary<string, int>();

            switch (target) {
                case "templates": {
                        pageing.Add("templatePaging", page); break;
                    }
                case "name_types": {
                        pageing.Add("name_typesPaging", page); break;
                    }
                case "types": {
                        pageing.Add("typesPaging", page); break;
                    }
                case "draft": {
                        pageing.Add("draftPaging", page); break;
                    }
                case "review": {
                        pageing.Add("reviewPaging", page); break;
                    }
                case "published": {
                        pageing.Add("publishedPaging", page); break;
                    }
                case "filteredResults": {
                        pageing.Add("filterPaging", page); break;
                    }
                default: {
                        pageing.Add("AllPaging", page); break;
                    }
            }

            //SETUP SEARCHID and parts
            if (searchId.Equals(0)) {
                searchId = -2;
            } else {
                //event_type type = new event_type();
            }
            PropertyBag["searchId"] = searchId;

            //user.categories.Contains(events.categories);

            //IList<cal_events> items;
            int pagesize = 15;
            List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
            if (searchId > 0) {
                // find all places of cat

                IList<_base> cats = ActiveRecordBase<posting>.FindAll(new Order("sort", false),
                           new List<AbstractCriterion>() { 
                                Expression.Eq("deleted", false),
                                Expression.Eq("revision", 0),
                                Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                    new List<AbstractCriterion>() { 
                                        Expression.Eq("alias", "page") }.ToArray()
                                    )
                                )
                            }.ToArray()
                       );



                IList<posting> pitems = new List<posting>();
                foreach (_base c in cats) {
                    foreach (posting p in c.children.Where(x => x.GetType().Name.Contains(postType.alias))) {
                        pitems.Add(p);
                    }
                }
                int[] obj = new int[pitems.Count];
                int i = 0;
                foreach (posting p in pitems) {
                    obj[i] = p.baseid;
                    i++;
                }
                baseEx.Add(Expression.In("baseid", obj));
            }
            if (searchId.Equals(-2)) {
                IList<posting> userevents = userService.getUserFull().getUserPostings() ;
                object[] obj = new object[userevents.Count];
                int i = 0;
                foreach (posting e in userevents) {
                    obj[i] = e.baseid;
                    i++;
                }
                baseEx.Add(Expression.In("baseid", obj));
            }

            String cachePath = file_info.root_path();




            IList<string> buttons = new List<string>();
            int pag = 0;
            if (!String.IsNullOrWhiteSpace(filter)) {
                List<posting> listtems = searchService.filterPage(filter.Replace("+", " "));

                PropertyBag["filteredResults_list"] = PaginationHelper.CreatePagination((IList)listtems, 15, (pageing.TryGetValue("fliterPaging", out pag) ? pag : 0));
                buttons = new List<string>();
                foreach (posting_type_action action in postType.actions) {
                    buttons.Add(action.alias);
                }
                PropertyBag["filteredResults_ButtonSet"] = buttons;
            }



            string name = "All";


            List<AbstractCriterion> revEx = new List<AbstractCriterion>();
            revEx.AddRange(baseEx);
            revEx.Add(Expression.Eq("deleted", false));
            revEx.Add(Expression.Eq("post_type", postType));
            PropertyBag["show_core"] = true;
            if (!show_core) {
                revEx.Add(Expression.Not(Expression.Eq("is_core", true)));
                PropertyBag["show_core"] = false;
            }

            IList<posting> listing_tems = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("sort")}, revEx.ToArray())
                .Where(x => x.parent == null).ToArray();

            PropertyBag[name + "_list"] = PaginationHelper.CreatePagination(listing_tems, pagesize, (pageing.TryGetValue(name + "Paging", out pag) ? pag : 0));
            buttons = new List<string>();
            foreach (posting_type_action action in postType.actions) {
                buttons.Add(action.alias);
            }
            PropertyBag[name + "ButtonSet"] = buttons;

            PropertyBag["users"] = ActiveRecordBase<appuser>.FindAll();
            PropertyBag["user_groups"] = ActiveRecordBase<user_group>.FindAll();
            PropertyBag["statuses"] = new List<string> { "All" };
            PropertyBag["ajax"] = ajax;


            PropertyBag["named_type"] = postType.alias;
            PropertyBag["named_type_dname"] = postType.name;

            PropertyBag["itemNamed"] = "post";// postType.alias;
            if (!skiplayout) RenderView("../admin/listings/list");
        }



        /// <summary> </summary>
        public void delete_post(int id) {
            posting post = ActiveRecordBase<posting>.Find(id);
            if (post.owner.baseid == userService.getUser().baseid) {
                Flash["message"] = "A Place, <strong>" + post.name + "</strong>, has been <strong>deleted</strong>.";
                logger.writelog("Moved event to the trash", getView(), getAction(), post.baseid);
                post.deleted = true;
                ActiveRecordMediator<posting>.Save(post);
            } else {
                Flash["message"] = "You can't delete something you don't own.  Contact the owner, " + post.owner.display_name + ", for farther action.";
                logger.writelog("Attepted to delete an event they didn't own", getView(), getAction(), post.baseid);
            }
            CancelLayout();
            
            RedirectToAction("posting_list", new string[] { "post_type="+post.post_type.alias });
        }
        /// <summary> </summary>
        public void restorePostRevision(int id) {
            posting post = ActiveRecordBase<posting>.Find(id);
            if (versionService.restorePost(ActiveRecordBase<posting>.Find(post.parent.baseid), post.version, post.revision)){
                Flash["message"] = "Restored post " + post.name + ".";
                logger.writelog("Restored post " + post.name + "", getView(), getAction(), post.baseid);
            }
            CancelLayout();
            RedirectToAction("posting_list", new string[] { "post_type="+post.post_type.alias });
        }









        /// <summary> </summary>
        public void generate_stub(Boolean skiplayout, String view) {
            if (skiplayout) CancelLayout();
            RenderView(!String.IsNullOrWhiteSpace(view) ? view : "../admin/postings/custom_post_blocks/post_stub");
        }

        /// <summary> </summary>
        public void save_stub([ARDataBind("item", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting item,
            String post_type,
            Boolean skiplayout
            ) {
            if (skiplayout) CancelLayout();
            CancelView();

            item.site = siteService.getCurrentSite();
            item.theme = themeService.current_theme_alias();
            item.published = false;

            appuser user = userService.getUserFull();
            item.owner = user;
            item.editors = new List<appuser>() { user };

            item.post_type = getPostType(post_type);
            item.alias = item.name.Replace(' ', '-').ToLower();//should add a check here
            ActiveRecordMediator<posting>.Save(item);
            RenderText("true");
        }













    }
}