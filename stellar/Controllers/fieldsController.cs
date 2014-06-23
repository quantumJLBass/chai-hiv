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
    using stellar.Models;
    using System.Net.Mail;
    using Castle.Components.Common.EmailSender;
    using Castle.Components.Common.EmailSender.Smtp;
    using Castle.ActiveRecord.Queries;
    using System.Text.RegularExpressions;
    using System.Collections;
    using stellar.Services;


    using System.Collections.ObjectModel;
    using System.Dynamic;
    using System.Linq;
    using System.Web.Script.Serialization;

    using AutoMapper;


    #endregion

    /// <summary> </summary>
    [Layout("admin")]
    public class fieldsController : adminController {

        /// <summary> </summary>
        public fieldsController() {
            Controllers.BaseController.current_controller = "fields";
        }


        /// <summary> </summary>
        public string[] get_feild_short_codes(posting cal_events) {
            //log.Info("________________________________________________________________________________\nLoading feilds For:" + place.prime_name+"("+place.baseid+")\n");
            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("model", "placeController"));
            // typeEx.Add(Expression.Eq("set", cal_events.model.baseid));

            field_types[] ft = ActiveRecordBase<field_types>.FindAll(typeEx.ToArray());
            List<string> fields = new List<string>();

            string[] codes = new string[ft.Length];
            int i = 0;
            if (ft != null) {
                foreach (field_types ft_ in ft) {
                    codes[i] = "${" + ft_.alias + "}";
                    i++;
                }
            }
            return codes;
        }
        /// <summary> </summary>
        public void list_fields(int page) {
            userService.clearConnections<field_types>();

            IList<field_types> place_fields_items;
            List<AbstractCriterion> fieldsEx = new List<AbstractCriterion>();
            //fieldsEx.AddRange(baseEx);
            //fieldsEx.Add(Expression.Eq("type", this.GetType().Name));
            place_fields_items = ActiveRecordBase<field_types>.FindAll(fieldsEx.ToArray());
            PropertyBag["fields"] = PaginationHelper.CreatePagination(place_fields_items, 50, page);

        }



        /// <summary> </summary>
        public void new_field() {
            field_types field = new field_types();
            PropertyBag["field"] = field;
            PropertyBag["p_models"] = ActiveRecordBase<posting_type>.FindAll();
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            PropertyBag["users"] = ActiveRecordBase<appuser>.FindAll();

            RenderView("../admin/fields/new");
        }
        /// <summary> </summary>
        public void edit_field(int id) {
            field_types field = ActiveRecordBase<field_types>.Find(id);
            PropertyBag["field"] = field;

            PropertyBag["p_models"] = ActiveRecordBase<posting_type>.FindAll();

            string ele_str = fieldsService.getfieldmodel_dynamic(field);
            PropertyBag["nat_html_ele"] = ele_str;


            //string json = "{\"Items\":[{ \"Name\":\"Apple\", \"Price\":12.3 },{ \"Name\":\"Grape\", \"Price\":3.21 }],\"Date\":\"21/11/2010\"}";
            var jss = new JavaScriptSerializer();
            var ele = jss.Deserialize<Dictionary<string, dynamic>>(field.attr.ToString());

            //elementSet ele = (elementSet)JsonConvert.DeserializeObject(field.attr.ToString(), typeof(elementSet));
            //string ele_str = FieldsService.getfieldmodel(ele);
            PropertyBag["groups"] = ActiveRecordBase<user_group>.FindAll();
            PropertyBag["users"] = ActiveRecordBase<appuser>.FindAll();

            PropertyBag["html_ele"] = ele_str;
            PropertyBag["ele"] = ele;

            RenderView("../admin/fields/new");
        }



        /// <summary> </summary>
        public void delete_field(int id) {
            field_types place_fields = ActiveRecordBase<field_types>.Find(id);
            Flash["message"] = "A field for places, <strong>" + place_fields.name + "</strong>, has been <strong>deleted</strong>.";
            ActiveRecordMediator<field_types>.Delete(place_fields);
            CancelLayout();
            RedirectToAction("list");
        }

        /// <summary> </summary>
        public void update_field(
                    [ARDataBind("field", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] field_types field,
                    [DataBind("ele", Validate = false)] elementSet ele,
                    [ARDataBind("template", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting template,
                    [ARDataBind("note", Validate = true, AutoLoad = AutoLoadBehavior.NewRootInstanceIfInvalidKey)] posting note,
                    string ele_type,
                    int placemodel,
                    bool ajaxed_update,
                    string apply,
                    string cancel
                ) {
            if (cancel != null) {
                RedirectToAction("list");
                return;
            }

            //dynamic value;
            var jss = new JavaScriptSerializer();
            ActiveRecordMediator<fields>.Save(field);

            field.type = this.GetType().Name;
            field.set = ActiveRecordBase<posting_type>.Find(placemodel).baseid;  // NOTE THIS IS THE ONLY REASON WE CAN ABSTRACT YET... FIX?

            ele.attr.name = "fields[" + field.baseid + "]";//+ (ele.type == "dropdown"?"[]":"");
            ele.options.RemoveAt(ele.options.Count - 1);//to remove ele.options[9999] at the end
            string tmpNull = null;
            dynamic jsonstr = new {
                type = ele.type,
                label = ((ele.label == "") ? field.name : ele.label),
                attr = ele.attr,
                events = tmpNull,
                options = ele.options
            };
            var json = jss.Serialize(jsonstr);
            field.attr = json;
            ActiveRecordMediator<fields>.Save(field);


            posting tmpTemplate = new posting();
            if (template.baseid == 0) {
                tmpTemplate = new posting() {
                    alias = template.alias.Replace("__TEMP__", field.baseid.ToString()),
                    post_type = template.post_type,
                    content = template.content
                };
            } else {
                tmpTemplate = template;
            }
            ActiveRecordMediator<posting>.Save(tmpTemplate);
            field.template = tmpTemplate;


            posting tmpNotes = new posting();
            if (note.baseid == 0) {
                tmpNotes = new posting() {
                    alias = note.alias.Replace("__TEMP__", field.baseid.ToString()),
                    post_type = note.post_type,
                    content = note.content
                };
            } else {
                tmpNotes = note;
            }
            ActiveRecordMediator<posting>.Save(tmpNotes);
            field.notes = tmpNotes;



            ActiveRecordMediator<fields>.Save(field);
            if (apply != null || ajaxed_update) {
                if (field.baseid > 0) {
                    RedirectToUrl("edit_field.castle?id=" + field.baseid);
                    return;
                } else {
                    RedirectToReferrer();
                }
            } else {
                RedirectToAction("list");
            }
        }
    }
}
