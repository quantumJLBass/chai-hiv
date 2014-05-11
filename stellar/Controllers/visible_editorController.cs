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

    [Layout("admin")]
    public class visible_editorController : adminController {
        /*
         * 
         * MAY BE A FIELDS HELPER SERVICES WOULD BE WISE ?
         * 
         */
/*
        public static string get_field(field_types field_type) {
            string _ele = "";
            _ele = get_field(field_type, null);
            return _ele;
        }
        public static string get_field(field_types field_type, dynamic item) {
            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("type", field_type));
            if (!object.ReferenceEquals(item, null)) typeEx.Add(Expression.Eq("owner", item.baseid));
            fields field = ActiveRecordBase<fields>.FindFirst(typeEx.ToArray());
            string ele_str = fieldsService.getfieldmodel_dynamic(field_type, field == null ? null : field.value.ToString());
            return ele_str;
        }

        */
        public visible_editorController() {
            Controllers.BaseController.current_controller = "visible_editor";
        }




        private int areacount =0;

        private List<posting> used_contentblocks = new List<posting>();

        





        /*
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
        */







        //this is the match to the public one with all the editing parts in it.. maybe they can be combined?
        protected htmlService HtmlService = new htmlService();
        public void posting(int iid, string[] cat, int activeitem, Boolean eb, Boolean hasUrl, string sm_url, Boolean dev) {
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
            editing = true;
            PropertyBag["dev"] = dev;

            //if (!usedev) filtering.Add(Expression.Eq("revision", 0));
            if (iid > 0){
                posting tmp = ActiveRecordBase<posting>.Find(iid);
                if (tmp.children.Count>0){
                    filtering.Add(Expression.Eq("parent", tmp));
                }else{
                    filtering.Add(Expression.Eq("baseid", iid));
                }
            }else{
                filtering.Add(Expression.Eq("is_default",true));
                //parent
                filtering.Add(Expression.Eq("deleted", false));
                filtering.Add(Expression.In("post_type", ActiveRecordBase<posting_type>.FindAll(
                            new List<AbstractCriterion>() { 
                            Expression.Eq("root",true)
                        }.ToArray())
                    ));
            }

            

            posting post = ActiveRecordBase<posting>.FindFirst(new Order[] { Order.Desc("revision"), Order.Desc("version") }, filtering.ToArray());

            PropertyBag["post"] = post;

            //posting post = ActiveRecordBase<posting>.Find(iid);
            posting[] lastversions = ActiveRecordBase<posting>.FindAll(Order.Asc("revision"),
               new List<AbstractCriterion>() { Expression.Eq("parent", post), Expression.Gt("revision", 0) }.ToArray()
           );
            PropertyBag["lastversions"] = lastversions;
            /* Items that should be globaly accessed */
            PropertyBag["url"] = sm_url;
            //PropertyBag["campus"] = ActiveRecordBase<campus>.FindAllByProperty("name", "Pullman")[0];

            PropertyBag["selected_taxanony"] = cat;
            PropertyBag["activeitem"] = activeitem;
            PropertyBag["embeded"] = eb;

            site site = siteService.getCurrentSite();
            PropertyBag["site"] = site;
            PropertyBag["siteroot"] = httpService.getRootUrl().TrimEnd('/');
            PropertyBag["baseurl"] = "visible_editor/posting.castle";
            PropertyBag["htmlService"] = HtmlService; // maybe get rid of this?
            PropertyBag["Controller"] = base.MemberwiseClone();


            /* add site options */
            foreach (options item in site.options) {
                PropertyBag[item.option_key.ToUpper()] = item.value;//ie: post.get_meta("title");
            }

            /* add meta */
            if (post.meta_data != null) {
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

            PropertyBag["mode"] = "published";
            
            Hashtable content_params = objectService.marge_params(PropertyBag, new Hashtable());
            String output = new renderService().render(post, content_params);
            output = editingService.ini_editor(output, post, PropertyBag);

            RenderText(output);
        }

    }

}