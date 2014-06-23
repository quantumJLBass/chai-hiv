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
    using log4net;

    #endregion

    /// <summary> </summary>
    [Layout("admin")]
    public class cal_eventsController : adminController {
        ILog log = log4net.LogManager.GetLogger("cal_eventsController");
        /*
        public void test() {
            log.Info("got to test");
            //list_events(0, -2, "", "", false);

            RenderText("made it here");

        }

        public void list_events() { list_events(0, -2, "", "", false); }
        public void list_events(int page, int searchId, string target, string filter, Boolean ajax) {

            posting_type post_type = ActiveRecordBase<posting_type>.FindFirst(new ICriterion[] { Expression.Eq("alias", "cal_event") });
            UserService.clearConnections<cal_events>();
            log.Info("got to list_events");
            //int typesPaging = 0;
            //int fieldsPaging = 0;
            //int templatePaging = 0;

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
            }

            //SETUP SEARCHID and parts
            if (searchId.Equals(0)) {
                searchId = -2;
            } else {
                event_type type = new event_type();
            }
            PropertyBag["searchId"] = searchId;

            //user.categories.Contains(events.categories);

            //IList<cal_events> items;
            int pagesize = 15;
            List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
            if (searchId > 0) {
                // find all places of cat
                IList<categories> cats = ActiveRecordBase<categories>.FindAll(new ICriterion[] { Expression.Eq("baseid", searchId) });
                IList<_base> pitems = new List<_base>();
                foreach (categories c in cats) {
                    foreach (_base p in c.items.Where(x => x.GetType().Name.Contains(post_type.alias))) {
                        pitems.Add(p);
                    }
                }
                int[] obj = new int[pitems.Count];
                int i = 0;
                foreach (_base p in pitems) {
                    obj[i] = p.baseid;
                    i++;
                }
                baseEx.Add(Expression.In("baseid", obj));
            }
            if (searchId.Equals(-3)) {
                IList<_base> pitems = new List<_base>();
                foreach (categories ucats in UserService.getUser().groups.categories) {
                    IList<categories> cats = ActiveRecordBase<categories>.FindAll(new ICriterion[] { Expression.Eq("baseid", ucats.id) });
                    foreach (categories c in cats) {
                        foreach (_base p in c.items.Where(x => x.GetType().Name.Contains(post_type.alias))) {
                            pitems.Add(p);
                        }
                    }
                }
                int[] obj = new int[pitems.Count];
                int i = 0;
                foreach (_base p in pitems) {
                    obj[i] = p.baseid;
                    i++;
                }
                baseEx.Add(Expression.In("baseid", obj));
            }
            if (searchId.Equals(-2)) {
                IList<_base> userevents = UserService.getUserFull().items;
                object[] obj = new object[userevents.Count];
                int i = 0;
                foreach (_base e in userevents) {
                    obj[i] = e.baseid;
                    i++;
                }
                baseEx.Add(Expression.In("baseid", obj));
            }

            String cachePath = getRootPath();

            


            IList<string> buttons = new List<string>();
            int pag = 0;
            if (!String.IsNullOrWhiteSpace(filter)) {
                List<cal_events> listtems = publicController.filterPage(filter.Replace("+", " "));

                PropertyBag["filteredResults_list"] = PaginationHelper.CreatePagination((IList)listtems, 15, (pageing.TryGetValue("fliterPaging", out pag) ? pag : 0));
                buttons = new List<string>();
                foreach (posting_type_actions action in post_type.actions) {
                    buttons.Add(action.alias);
                }
                PropertyBag["filteredResults_ButtonSet"] = buttons;
            }

           

            status[] states = ActiveRecordBase<status>.FindAll();
            foreach (status stat in states) {
                string name = stat.name;

                IList<cal_events> listtems;
                List<AbstractCriterion> revEx = new List<AbstractCriterion>();
                revEx.AddRange(baseEx);
                revEx.Add(Expression.Eq("status", stat));
                revEx.Add(Expression.Eq("deleted", false));
                listtems = ActiveRecordBase<cal_events>.FindAll(Order.Asc("name"), revEx.ToArray());

                PropertyBag[name + "_list"] = PaginationHelper.CreatePagination(listtems, pagesize, (pageing.TryGetValue(name + "Paging", out pag) ? pag : 0));
                buttons = new List<string>();
                foreach (posting_type_actions action in post_type.actions) {
                    buttons.Add(action.alias);
                }
                PropertyBag[name + "ButtonSet"] = buttons;
            }
            PropertyBag["users"] = ActiveRecordBase<users>.FindAll();
            PropertyBag["user_groups"] = ActiveRecordBase<user_groups>.FindAll();
            PropertyBag["statuses"] = ActiveRecordBase<status>.FindAll();
            PropertyBag["ajax"] = ajax;

            PropertyBag["itemNamed"] = "event";
            RenderView("../admin/listings/list");
          
        }




        public void list_location(int page, int searchId, string target, string filter, Boolean ajax) {
            UserService.clearConnections<event_location>();

            //place feilds
            int pagesize = 50;
            IList<event_location> event_locations;
            event_locations = UserService.getUserFull().event_locations;
            IList<string> buttons = new List<string>();
            buttons.Add("edit");
            buttons.Add("delete");
            //buttons.Add("publish");
            //buttons.Add("view");
            buttons.Add("copy");

            PropertyBag["buttons"] = buttons;
            PropertyBag["itemNamed"] = "location";
            PropertyBag["list_items"] = PaginationHelper.CreatePagination(event_locations, pagesize, page);

            RenderView("../admin/listings/general");
        }

        public void delete_location(int id) {
            event_location location = ActiveRecordBase<event_location>.Find(id);
            Flash["message"] = "A Place, <strong>" + location.name + "</strong>, has been <strong>deleted</strong>.";
            ActiveRecordMediator<cal_events>.Delete(location);
            LogService.writelog("Deleted location", getView(), getAction(), id);
            CancelLayout();
            RedirectToAction("list_location");
        }


        public static void addEvent_exchange(posting events) {


        }


        public void edit_event(int id, int page, bool ajax) {


            PropertyBag["ajaxed"] = ajax;
            LogService.writelog("Editing events", getView(), getAction(), id);
            CancelView();
            PropertyBag["credits"] = "";
            PropertyBag["imagetypes"] = ActiveRecordBase<media_types>.FindAll();
            PropertyBag["images_inline"] = ActiveRecordBase<media_repo>.FindAll();

            cal_events one_event = ActiveRecordBase<cal_events>.Find(id);
            users user = UserService.getUserFull();
            PropertyBag["locations"] = ActiveRecordBase<event_location>.FindAll().Where(x => x.isPublic || x.editors.Contains(UserService.getUserFull()));

            contact_profile profile = user.contact_profiles.FirstOrDefault(x => x.isDefault == true);
            PropertyBag["username"] = profile.first_name + " " + profile.last_name;
            one_event.editing = user;
            ActiveRecordMediator<cal_events>.Save(one_event);



            //String locationList = Getlocation();
            //PropertyBag["locations"] = locationList; // string should be "location1","location2","location3"

            PropertyBag["loginUser"] = user; //needed? i think get rid of
            PropertyBag["eventsimages"] = one_event.images;
            //$one_events.campus.zipcode


            PropertyBag["named_type"] = "cal_event";
            PropertyBag["named_type_dname"] = "Event";
            PropertyBag["postCustom"] = FileService.DirSearch("/Views/admin/postings/custom_post_blocks/cal_event/editor_blocks/", @"\\editor_blocks\\", ".vm");
           
            if (Flash["cal_event"] != null) {
                cal_events flashevents = Flash["cal_event"] as cal_events;

                ActiveRecordMediator<cal_events>.Refresh(flashevents);

                //flashevents.Refresh();
                PropertyBag["item"] = flashevents;
            } else {
                PropertyBag["item"] = one_event;
            }


            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("model", this.GetType().Name));


            PropertyBag["users"] = ActiveRecordBase<users>.FindAll();

            PropertyBag["user_groups"] = ActiveRecordBase<user_groups>.FindAll();
            PropertyBag["statuslists"] = ActiveRecordBase<status>.FindAll();


            List<users> users = new List<users>();
            if (!one_event.users.Contains(user)) users.Add(user);
            users.AddRange(one_event.users);

            List<media_repo> images = new List<media_repo>();
            images.AddRange(one_event.images);
            if (images.Count == 0) {
                images.Add(new media_repo());
                PropertyBag["eventsimages"] = images;
            }






            PropertyBag["eventsusers"] = users;
            //RenderView("new");
            RenderView("../admin/postings/_editor");
            return;
        }
        public void create() {
            CancelView();
            PropertyBag["credits"] = "";
            PropertyBag["imagetypes"] = ActiveRecordBase<media_types>.FindAll();
            PropertyBag["images_inline"] = ActiveRecordBase<media_repo>.FindAll();

            cal_events cal_event = new cal_events();

            List<media_repo> images = new List<media_repo>();

            if (images.Count == 0) {
                images.Add(new media_repo());
            }

            PropertyBag["eventsimages"] = images;
            //PropertyBag["loginUser"] = UserService.getUser();
            //String locationList = Getlocation();
            //PropertyBag["locations"] = locationList; // string should be "location1","location2","location3"

            String availableImagesList = "";
            PropertyBag["availableImages"] = availableImagesList; // string should be "location1","location2","location3"


            PropertyBag["images"] = Flash["images"] != null ? Flash["images"] : ActiveRecordBase<media_repo>.FindAll();
            PropertyBag["cal_event"] = Flash["cal_event"] != null ? Flash["cal_event"] : cal_event;

            PropertyBag["user"] = Flash["user"] != null ? Flash["user"] : ActiveRecordBase<users>.FindAll();

            PropertyBag["user_groups"] = ActiveRecordBase<user_groups>.FindAll();
            PropertyBag["statuslists"] = ActiveRecordBase<status>.FindAll();
            PropertyBag["locations"] = ActiveRecordBase<event_location>.FindAll().Where(x => x.isPublic || x.editors.Contains(UserService.getUserFull()));

            RenderView("_editor");
            return;
        }
        public void create_loaction() {
            CancelLayout();
            PropertyBag["locations"] = UserService.getUser().event_locations;

            RenderView("event_assests/locations_editor");
            return;
        }
        public void setStatus(int id, int status, bool ajax) {
            cal_events one_events = ActiveRecordBase<cal_events>.Find(id);
            PropertyBag["events"] = one_events;
            status published = ActiveRecordBase<status>.Find(status);
            //events.Status = published;
            ActiveRecordMediator<cal_events>.Save(one_events);

            //if(!ajax)
            //RedirectToReferrer();
            string myTime = DateTime.Now.ToString("yyyy.MM.dd HH:mm:ss:ffff");
            NameValueCollection myCol = new NameValueCollection();
            myCol.Add("time", myTime);

            Redirect("events", "list", myCol);
            //}
        }

        public void cleanUpEvent_media(int id) {
            string uploadPath = Context.ApplicationPath + @"\uploads\";
            uploadPath += @"events\" + id + @"\";
            if (!HelperService.DirExists(uploadPath)) {
                return;
            }

            //ok the events has image as the dir was created already to hold them
            string[] filePaths = Directory.GetFiles(uploadPath, "*_TMP_*");
            foreach (string file in filePaths) {
                FileInfo ImgFile = new FileInfo(file);
                ImgFile.Delete();
            }
        }
        public void copy_event(int id, String name) {
            CancelLayout();
            CancelView();
            var newObj = HelperService._copy<cal_events>(id, name, false);
            if (newObj !=null  && newObj.baseid > 0) {
                Flash["message"] = "New copy saved to the system.  You may now edit " + name;
                RedirectToUrl("~/cal_events/edit_event.castle?id=" + newObj.baseid);
            } else {
                Flash["error"] = "Failed to copy item.";
                RedirectToUrl("~/cal_events/list_events.castle");
            }

        }
        public void update_location(
            [ARDataBind("location", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] event_location location,
            bool ajaxed_update,
            string apply,
            string cancel
            ) {
            Boolean newitem = false;
            if (location.baseid == 0) newitem = true;

            users user = UserService.getUser();
            if (user != null) {
                location.editors = new List<users>();
                location.editors.Add(user);
            }


            ActiveRecordMediator<event_location>.Save(location);

            if (apply != null || ajaxed_update) {

                if (newitem) {
                    LogService.writelog("Created location edits on", getView(), getAction(), location.baseid);
                    if (ajaxed_update) {
                        CancelLayout();
                        RenderText(location.baseid.ToString() + ":" + location.name);
                    } else {
                        RedirectToUrl("~/cal_events/edit_location.castle?id=" + location.baseid);
                    }
                    return;
                } else {
                    LogService.writelog("Applied location edits on", getView(), getAction(), location.baseid);
                    RedirectToUrl("~/cal_events/edit_location.castle?id=" + location.baseid);
                    return;
                }
            } else {
                LogService.writelog("Saved location edits on", getView(), getAction(), location.baseid);
                //events.Refresh();
                RedirectToAction("list");
                return;
            }
        }


        public void update(
            [ARDataBind("cal_event", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] cal_events cal_event,
            int[] cats,
            String[] massTag,
            String[] newtab,
            [ARDataBind("images", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)]media_repo[] images,
            [ARDataBind("users", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)]users[] users,
            [ARDataBind("events_media", Validate = true, AutoLoad = AutoLoadBehavior.OnlyNested)]events_media[] events_media,
            String[][] fields,
            bool ajaxed_update,
            bool forced_tmp,
            string LongLength,
            string Length,
            string apply,
            string cancel
            ) {
            Flash["events"] = cal_event;
            Flash["tags"] = cal_event;
            Flash["tabs"] = cal_event;
            Flash["cats"] = cal_event;
            Flash["images"] = cal_event;
            Flash["users"] = cal_event;

            dynamic value;
            if (cancel != null) {
                if (forced_tmp && cal_event.baseid != 0) {
                    LogService.writelog("Canceled event creation", getView(), getAction());
                    ActiveRecordMediator<cal_events>.DeleteAndFlush(cal_event);
                } else if (!forced_tmp) {
                    LogService.writelog("Canceled event edit ", getView(), getAction(), cal_event.baseid);
                    cal_event.editing = null;
                    ActiveRecordMediator<cal_events>.Save(cal_event);
                }
                RedirectToAction("list_events");
                return;
            }
            users user = UserService.getUserFull();

            if (forced_tmp && cal_event.baseid == 0){
                cal_event.tmp = true;
                cal_event.owner = user;
                cal_event.post_type = ActiveRecordBase<posting_type>.FindFirst(
                            new List<AbstractCriterion>() { Expression.Eq("alias", "cal_event") }.ToArray()
                        );
            }

            cal_event.editing = user;
            if ((cal_event.name == null || cal_event.name.Length == 0)) {
                if (!forced_tmp) {
                    Flash["error"] = "You are missing the basic parts of a events";
                    RedirectToReferrer();
                    return;
                } else {
                    cal_event.name = "TEMP NAME";
                }
            }
            int requestedStatus = UserService.checkPrivleage("can_publish") && cal_event.status != null ? cal_event.status.id : 1;
            cal_event.status = ActiveRecordBase<status>.Find(requestedStatus);
            cal_event.images.Clear();
            cal_event.users.Clear();
            if (apply != null) {

            } else {
                cal_event.editing = null;
            }


            if (cal_event.baseid == 0) {
                //PlaceStatus stat = ActiveRecordBase<PlaceStatus>.Find(1);
                //events.Status = stat;
                cal_event.creation_date = DateTime.Now;
            } else {
                cal_event.updated_date = DateTime.Now;
            }

            foreach (events_media si in events_media) {
                if (si.media != null && si.media.id > 0) {
                    events_media find = ActiveRecordBase<events_media>.FindFirst(new ICriterion[] { Expression.Eq("media", si.media), Expression.Eq("events", cal_event) });
                    find.event_order = si.event_order;
                    ActiveRecordMediator<events_media>.Save(find);
                }
            }
            if (images != null) {
                foreach (media_repo media in images) {
                    if (media.id > 0 && !cal_event.images.Contains(media)) {
                        cal_event.images.Add(media);
                    }
                }
            }
            cal_event.users.Add(user);
            foreach (users _user in users) {
                if (_user.baseid > 0 && !cal_event.users.Contains(_user))
                    cal_event.users.Add(_user);
            }


            cal_event.outputError = null;
            ActiveRecordMediator<cal_events>.Save(cal_event);

            String cachePath = getRootPath() + "cache/events/";

            string file = cal_event.baseid + "_centralevents" + ".ext";
            String file_path = cachePath + file;
            if (File.Exists(file_path)) {
                File.Delete(file_path);
            }


            cleanUpEvent_media(cal_event.baseid);

            Flash["events"] = null;
            Flash["tags"] = null;
            Flash["tabs"] = null;
            Flash["cats"] = null;
            Flash["images"] = null;
            Flash["users"] = null;
            value = "";
            if (!forced_tmp) {
                using (WebClient wc = new WebClient()) {
                    //value = wc.DownloadString(getRootUrl() + "public/get_events.castle?all=yes&dyno=yes&id=" + cal_event.baseid);
                }
            } else {
                value = "";
            }


            if (!forced_tmp && value.Contains("{\"error\":")) {
                cal_event.outputError = DateTime.Now;
            } else {
                cal_event.outputError = null;
            }
            ActiveRecordMediator<cal_events>.Save(cal_event);

            //events.Refresh();

            if (apply != null || ajaxed_update) {
                LogService.writelog("Applied event edits", getView(), getAction(), cal_event.baseid);
                if (cal_event.baseid > 0) {

                    if (ajaxed_update) {

                        CancelLayout();
                        RenderText(cal_event.baseid.ToString());
                    } else {
                        RedirectToUrl("~/cal_events/edit_event.castle?id=" + cal_event.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                cal_event.editing = null;
                LogService.writelog("Saved event edits on", getView(), getAction(), cal_event.baseid);
                ActiveRecordMediator<cal_events>.Save(cal_event);
                //events.Refresh();
                RedirectToAction("list_events");
                return;
            }
        }

        public void delete_event(int id) {
            cal_events cal_event = ActiveRecordBase<cal_events>.Find(id);
            if (cal_event.owner.baseid == UserService.getUser().baseid) {
                Flash["message"] = "A Place, <strong>" + cal_event.name + "</strong>, has been <strong>deleted</strong>.";
                LogService.writelog("Moved event to the trash", getView(), getAction(), cal_event.baseid);
                cal_event.deleted = true;
                ActiveRecordMediator<cal_events>.Save(cal_event);
            } else {
                Flash["message"] = "You can't delete something you don't own.  Contact the owner, " + cal_event.owner.display_name + ", for farther action.";
                LogService.writelog("Attepted to delete an event they didn't own", getView(), getAction(), cal_event.baseid);
            }
            CancelLayout();
            RedirectToAction("list_events");
        }
       */
    }
}