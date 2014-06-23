namespace stellar.Controllers {
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
    using System.Net.Mail;
    using Castle.Components.Common.EmailSender;
    using Castle.Components.Common.EmailSender.Smtp;
    using Castle.ActiveRecord.Queries;
    using System.Text.RegularExpressions;
    using System.Collections;
    using Castle.MonoRail.Framework.Helpers;

    /// <summary> </summary>
    [Layout("default")]
    public class tagsController : adminController {
        /// <summary> </summary>
        public void index(int page, string filter, string target) {
            // IList<usertags> usertags_items;
            int pagesize = 100;
            int paging = 1;
            int uPaging = 1;

            //this needs to be fixes some how to set them speperatly.  
            if (target == "tag") {
                paging = page;
            } else {
                uPaging = page;
            }

            if (String.IsNullOrEmpty(filter)) filter = "all";
            String by = String.Empty;
            switch (filter) {
                case "unassigned": {
                        by = "NOT exists"; break;
                    }
                case "assigned": {
                        by = "exists"; break;
                    }
                case "all": {
                        by = String.Empty; break;
                    }
            }
            String sql = "from tags t " + (String.IsNullOrEmpty(by) ? "" : " where " + by + " elements(t.places)") + " Order BY name Asc";
            SimpleQuery<taxonomy> q = new SimpleQuery<taxonomy>(typeof(taxonomy), sql);
            IList<taxonomy> items = q.Execute();
            PropertyBag["tags"] = PaginationHelper.CreatePagination(items, pagesize, paging);

            sql = "from tags t where NOT exists elements(t.places)";
            q = new SimpleQuery<taxonomy>(typeof(taxonomy), sql);
            items = q.Execute();
            PropertyBag["unassignedCount"] = items.Count;

            sql = "SELECT t.name FROM tags t GROUP BY t.name HAVING ( COUNT(t.name) > 1 )";
            SimpleQuery<String> dub = new SimpleQuery<String>(typeof(taxonomy), sql);
            String[] dubItems = dub.Execute();
            PropertyBag["doubledCount"] = dubItems.Length;

            PropertyBag["selected"] = filter;

            //usertags_items = ActiveRecordBase<usertags>.FindAll(Order.Asc("name"));
            //PropertyBag["usertags"] = PaginationHelper.CreatePagination(usertags_items, pagesize, uPaging);
        }
        /// <summary> </summary>
        public void Edit(int id) {
            PropertyBag["tag"] = ActiveRecordBase<taxonomy>.Find(id);
            RenderView("new");
        }
        /// <summary> </summary>
        public void New() {
            PropertyBag["tags"] = ActiveRecordBase<taxonomy>.FindAll();
        }

        /// <summary> </summary>
        public void Update(int id, [DataBind("tag")] taxonomy tag) {
            try {
                ActiveRecordMediator<taxonomy>.Save(tag);
            } catch (Exception ex) {
                Flash["error"] = ex.Message;
                Flash["tag"] = tag;

            }
            RedirectToAction("index");
        }

        /// <summary> </summary>
        public void delete(int id) {
            taxonomy tag = ActiveRecordBase<taxonomy>.Find(id);
            ActiveRecordMediator<taxonomy>.Delete(tag);
            RedirectToReferrer();
        }
        /// <summary> </summary>
        public void merge(int[] ids, string newname) {
            if (!String.IsNullOrEmpty(Request.Params["deleteTags"])) {
                massDeleteTags(ids);
                return;
            }
            dynamic places = new List<_base>();
            string name = "";
            foreach (int id in ids) {
                taxonomy tag = ActiveRecordBase<taxonomy>.Find(id);
                name = tag.name;
                places.AddRange(tag.taxonomies);
                foreach (dynamic p in tag.items) {
                    p.taxonomies.Remove(tag);
                    ActiveRecordMediator<_base>.Save(p);
                }
                ActiveRecordMediator<taxonomy>.Delete(tag);
            }

            taxonomy t = new taxonomy();
            t.name = String.IsNullOrEmpty(newname) ? name : newname;
            ActiveRecordMediator<taxonomy>.Save(t);

            foreach (posting p in places) {
                p.taxonomies.Add(t);
                ActiveRecordMediator<posting>.Save(p);
            }

            RedirectToReferrer();
        }


        /// <summary> </summary>
        public void massDeleteTags(int[] ids) {
            foreach (int id in ids) {
                taxonomy tag = ActiveRecordBase<taxonomy>.Find(id);
                ActiveRecordMediator<taxonomy>.Delete(tag);
            }
            RedirectToReferrer();
        }

    }
}
