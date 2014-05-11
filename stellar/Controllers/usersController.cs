using System.Collections.Generic;
using Castle.ActiveRecord;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
//using MonoRailHelper;
using NHibernate.Criterion;
using System.IO;
using System.Web;
using System;
using stellar.Models;
using stellar.Services;
using System.Xml;
using System.Linq;
using Castle.MonoRail.Framework.Helpers;
using System.Collections;
using Castle.ActiveRecord.Queries;
using log4net;

namespace stellar.Controllers
{
    


    #region usersController
    [Layout("admin")]
    public class usersController : adminController {
        ILog log = log4net.LogManager.GetLogger("usersController");
        public usersController() {
            Controllers.BaseController.current_controller = "users";
        }







        public void list_users(int page, int searchId, string target, string filter, Boolean ajax) {
            userService.clearConnections<posting>();

            var pageing = new Dictionary<string, int>();

            switch (target) {
                case "admin": {
                        pageing.Add("adminPaging", page); break;
                    }
                case "feu": {
                        pageing.Add("feuPaging", page); break;
                    }
            }

            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();


            var userpool = ActiveRecordBase<appuser>.FindAll();
            int pag = 0;
            PropertyBag["admin_users"] = PaginationHelper.CreatePagination((IList)userpool.Where(x => x.groups.isAdmin == true).ToList(), 15, (pageing.TryGetValue("adminPaging", out pag) ? pag : 0));

            pag = 0;
            PropertyBag["FEusers"] = PaginationHelper.CreatePagination((IList)userpool.Where(x => x.groups.isAdmin == false).ToList(), 15, (pageing.TryGetValue("feuPaging", out pag) ? pag : 0));
            //PropertyBag["user_groups"] = ActiveRecordBase<user_groups>.FindAll();
            RenderView("list");
        }




        public void new_user() {
            appuser user = new appuser();
            PropertyBag["user"] = user;
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            RenderView("edit");
        }
        public void edit_user(int id, int page) {
            appuser user = ActiveRecordBase<appuser>.Find(id);
            if (!userService.checkPrivleage("edit_users") && user != userService.getUser()) {
                Flash["error"] = "Sorry you are not able to edit this user.";
                RedirectToAction("list");
                return;
            }

            PropertyBag["history"] = PaginationHelper.CreatePagination((IList)ActiveRecordBase<logs>.FindAll(Order.Desc("date"),
                   new List<AbstractCriterion>() { Expression.Eq("nid", user.nid) }.ToArray()
               ).ToList(), 15, page);
            //media_types imgtype = ActiveRecordBase<media_types>.Find(1); //TODO restore
            //PropertyBag["images"] = imgtype.media_typed; //Flash["images"] != null ? Flash["images"] : 
            //PropertyBag["userimages"] = user.media; //TODO restore
            PropertyBag["user"] = user;
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            RenderView("edit");
        }

        public void update_user(
                [ARDataBind("user", Validate = true, AutoLoad = AutoLoadBehavior.NewInstanceIfInvalidKey)] appuser user,
                [ARDataBind("image", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting image,
                HttpPostedFile newimage,
                int[] Sections,
                string apply,
                string cancel,
                Boolean ajaxed,
                String[] value,
                String[] meta_key
            ) {
                if (user.user_meta_data != null) {
                    user.user_meta_data.Clear();
                } else {
                    user.user_meta_data = new List<user_meta_data>();
                }
            int i = 0;
            foreach (String item in value) {
                user_meta_data tmp = new user_meta_data() {
                    value = item,
                    meta_key = meta_key[i]
                };
                i++;
                user.user_meta_data.Add(tmp);

                
            }

            if (cancel != null) {
                RedirectToAction("list_user");
                return;
            }
            if (user.groups == null || user.groups.baseid == 0) {
                List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
                baseEx.Add(Expression.Eq("default_group", true));
                baseEx.Add(Expression.Eq("isAdmin", true));
                user.groups = ActiveRecordBase<user_group>.FindFirst(baseEx.ToArray());
            }

            try {
                ActiveRecordMediator<appuser>.Save(user);
                if (user == userService.getUser()) userService.setUser();
            } catch (Exception ex) {
                Flash["error"] = ex.Message;
                Flash["user"] = user;
            }
            if (apply != null || ajaxed) {
                logger.writelog("Applied user edits", getView(), getAction(), user.baseid);
                if (user.baseid > 0) {
                    if (ajaxed) {

                        CancelLayout();
                        RenderText(user.baseid.ToString());
                    } else {
                        RedirectToUrl("~/users/edit_user.castle?id=" + user.baseid);
                    }
                    return;
                } else {
                    RedirectToReferrer();
                    return;
                }
            } else {
                logger.writelog("Saved user edits on", getView(), getAction(), user.baseid);
                RedirectToAction("list_users");
                return;
            }
            
        }


        public void absorb_user(int absorber, int absorbed) {
            appuser absorbing_auth = ActiveRecordBase<appuser>.Find(absorber);
            appuser auth_absorbed = ActiveRecordBase<appuser>.Find(absorbed);
            //ActiveRecordMediator<appuser>.Delete(auth);
            RedirectToReferrer();
        }



        public void delete_user(int id) {
            appuser auth = ActiveRecordBase<appuser>.Find(id);
            ActiveRecordMediator<appuser>.Delete(auth);
            RedirectToReferrer();
        }

        public void view_ContactProfile(int id) {
            CancelLayout();
            CancelView();
            PropertyBag["profile"] = ActiveRecordBase<contact_profile>.Find(id);
            RenderView("view_profile");
        }

        public void edit_ContactProfile(int id) {
            PropertyBag["profile"] = ActiveRecordBase<contact_profile>.Find(id);
            RenderView("edit_profile");
        }








        /* this needs to be abstracted too this can and should be able to search anything */
        public static SortedDictionary<string, int> search_user_string(string term) {
            // Use hashtable to store name/value pairs
            SortedDictionary<string, int> results = new SortedDictionary<string, int>();
            //id is for order
            int i = 0;

            // Trying a different Query method
            // Here was the all inclusive query (not used for now except for reference)
            /*String overallsqlstring = @"from place p where 
                   p.abbrev_name LIKE :searchterm 
                or p.prime_name like :searchterm
                or (p in (select p from p.tags as t where t.name like :searchterm)) 
                or (p in (select p from p.names as n where n.name like :searchterm))
                ";
            */

            // Search place prime name
            String searchprime_name = @"SELECT u FROM users AS u WHERE u.display_name LIKE '%" + term + "%'";

            SimpleQuery<appuser> pq = new SimpleQuery<appuser>(typeof(appuser), searchprime_name);
            appuser[] users = pq.Execute();

            foreach (appuser user in users) {
                //results[i.ToString() + ":" + place.prime_name] = place.baseid;
                if (results.Any(item => item.Key.Split(':')[1].Trim() == user.display_name.Trim())
                    && results.Any(item => item.Value == user.baseid)
                    ) {
                } else {
                    results.Add(i.ToString() + ":" + user.display_name.Trim(), user.baseid);

                    i++;
                }
            }

            // Search place abbrev
            String searchabbrev = @"from contact_profile u where 
                    u.first_name LIKE :searchterm 
                    OR u.last_name LIKE :searchterm 
                    OR u.email LIKE :searchterm 
                    AND u.isDefault=1
                ";
            SimpleQuery<contact_profile> query = new SimpleQuery<contact_profile>(typeof(contact_profile), searchabbrev);
            query.SetParameter("searchterm", "%" + term + "%");
            contact_profile[] profiles = query.Execute();

            foreach (contact_profile profile in profiles) {
                //results[i.ToString()+":"+place.abbrev_name] = place.baseid;
                if (results.Any(item => item.Key.Split(':')[1].Trim() == profile.last_name + ", " + profile.first_name.Trim())
                    && results.Any(item => item.Value == profile.owner.baseid)
                    ) {
                } else {
                    results.Add(i.ToString() + ":" + profile.last_name + ", " + profile.first_name.Trim(), profile.owner.baseid);
                    i++;
                }
            }
            return results;
        }







    }
    #endregion
}
                                                      