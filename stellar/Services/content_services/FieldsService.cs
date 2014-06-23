#region Directives
using System;
using System.Data;
using System.Configuration;
using stellar.Models;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
using System.Web;
using System.Web.UI;
//using MonoRailHelper;
using System.Xml;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Specialized;
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;
using stellar.Services;
using log4net;
using log4net.Config;

using System.Collections.ObjectModel;
using System.Dynamic;
using System.Linq;
using System.Web.Script.Serialization;
using System.Collections;

#endregion

namespace stellar.Services {
    /* 
     * this is only refered to when saving thru the databind, 
     * we need to break that addiction and remover this hardcoded pain
     */
    /// <summary> </summary>
    public class elementSet {
        /// <summary> </summary>
        [JsonProperty]
        public string type { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string label { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public Attr attr { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public IList<Option> options { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public Events events { get; set; }
    }
    /// <summary> </summary>
    public class selectionSet {
        /// <summary> </summary>
        [JsonProperty]
        public IList<Selection> selections { get; set; }
    }
    /// <summary> </summary>
    public class Selection {
        /// <summary> </summary>
        [JsonProperty]
        public string val { get; set; }
    }
    /// <summary> </summary>
    public class Option {
        /// <summary> </summary>
        [JsonProperty]
        public string label { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string val { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string selected { get; set; }
    }
    /// <summary> </summary>
    public class Attr {
        /// <summary> </summary>
        [JsonProperty]
        public string ele_class { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string name { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string title { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string dir { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string accesskey { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string placeholder { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string tabindex { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string id { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string style { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string multiple { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string data { get; set; }

        /// <summary> </summary>
        [JsonProperty]
        public string role { get; set; }

    }
    /// <summary> </summary>
    public class Events {
       
        private string onClick;
        /// <summary> </summary>
        [JsonProperty]
        public string onclick { get { return onClick; } set { onClick = value; } }

        
        private string onChange;
        /// <summary> </summary>
        [JsonProperty]
        public string onchange { get { return onChange; } set { onChange = value; } }

    }



    /// <summary> </summary>
    public class fieldsService {
        private static ILog log = log4net.LogManager.GetLogger("FieldsService");




        /// <summary> </summary>
        public static string get_field(field_types field_type) {
            string _ele = "";
            _ele = get_field(field_type, null);
            return _ele;
        }
        /// <summary> </summary>
        public static string get_field(field_types field_type, dynamic item) {
            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("type", field_type));
            if (!object.ReferenceEquals(item, null)) typeEx.Add(Expression.Eq("owner", item.baseid));
            fields field = ActiveRecordBase<fields>.FindFirst(typeEx.ToArray());
            string ele_str = fieldsService.getfieldmodel_dynamic(field_type, field == null ? null : field.value.ToString());
            return ele_str;
        }
        /// <summary> </summary>
        public static string[] get_short_codes(IList<field_types> ft) {
            string[] codes = new string[ft.Count];
            int i = 0;
            if (ft != null) {
                foreach (field_types ft_ in ft) {
                    codes[i] = "${" + ft_.alias + "}";
                    i++;
                }
            }
            return codes;
        }








        /* dynamic based */
        /// <summary> </summary>
        public static string getfieldmodel_dynamic(field_types field) {
            string ele = field.attr.ToString();
            string _ele = field.attr.ToString();
            _ele = getfieldmodel_dynamic(field, null);
            return _ele;
        }
        /// <summary> </summary>
        public static string getfieldmodel_dynamic(field_types field, string select_val) {
            string ele = field.attr.ToString();
            var jss = new JavaScriptSerializer();
            var dyn_ele = jss.Deserialize<Dictionary<string, dynamic>>(ele);
            var dyn_select_val = new Dictionary<string, dynamic>();
            dyn_select_val = String.IsNullOrWhiteSpace(select_val) ? dyn_select_val : jss.Deserialize<Dictionary<string, dynamic>>(select_val);


            // lets set up the attrs for the element
            SortedDictionary<string, string> attrs = new SortedDictionary<string, string>();

            dynamic value;
            if (dyn_ele.TryGetValue("attr", out value)) attrs = attrbase_dynamic(attrs, dyn_ele);
            if (dyn_ele.TryGetValue("events", out value)) attrs = eventbase_dynamic(attrs, dyn_ele);
            if (dyn_select_val.TryGetValue("selections", out value)) dyn_ele = selectedVal_dynamic(dyn_select_val, dyn_ele);

            string _ele = String.Empty;
            string type = dyn_ele["type"];
            switch (type) {
                case "dropdown": {
                        _ele = fieldsService.renderSelect_dynamic(dyn_ele, attrs); break;
                    }
                case "textinput": {
                        _ele = fieldsService.renderTextInput_dynamic(dyn_ele, attrs); break;
                    }
                case "textarea": {
                        _ele = fieldsService.renderTextarera_dynamic(dyn_ele, attrs); break;
                    }
                case "checkbox": {
                        _ele = fieldsService.renderCheckbox_dynamic(dyn_ele, attrs); break;
                    }
                case "slider": {
                        _ele = ""; break;// FieldsService.renderSlider_dynamic(dyn_ele, attrs); break;
                    }
            }

            if (!String.IsNullOrWhiteSpace(field.template.content)) {
                Hashtable parambag = new Hashtable();

                parambag.Add("element_html", _ele);
                parambag = objectService.marge_params(attrs, parambag);
                if (!String.IsNullOrWhiteSpace(field.notes.content)) parambag.Add("notes", field.notes.content);
                parambag.Add("field", field);

                

                /* now process the content template */
                String laidout = renderService.simple_field_layout(field.template.content, field.template, parambag);
                _ele = laidout;
            }
            // Return the result.
            return _ele;
        }
        /// <summary> </summary>
        public static SortedDictionary<string, string> attrbase_dynamic(SortedDictionary<string, string> attrs, dynamic ele) {
            dynamic value;
            if (ele.TryGetValue("attr", out value) && ele["attr"] != null) {
                if (ele["attr"].TryGetValue("placeholder", out value)) attrs.Add("Placeholder", ele["attr"]["placeholder"]);
                if (ele["attr"].TryGetValue("accesskey", out value)) attrs.Add("Accesskey", ele["attr"]["accesskey"]);
                if (ele["attr"].TryGetValue("dir", out value)) attrs.Add("Dir", ele["attr"]["dir"]);
                if (ele["attr"].TryGetValue("ele_class", out value)) attrs.Add("Class", ele["attr"]["ele_class"]);
                if (ele["attr"].TryGetValue("id", out value)) attrs.Add("Id", ele["attr"]["id"]);
                if (ele["attr"].TryGetValue("style", out value)) attrs.Add("Style", ele["attr"]["style"]);
                if (ele["attr"].TryGetValue("tabindex", out value)) attrs.Add("Tabindex", ele["attr"]["tabindex"]);
                if (ele["attr"].TryGetValue("title", out value)) attrs.Add("Title", ele["attr"]["title"]);
                if (ele["attr"].TryGetValue("name", out value)) attrs.Add("Name", ele["attr"]["name"]);
                if (ele["attr"].TryGetValue("role", out value)) attrs.Add("Role", ele["attr"]["role"]);
                if (ele["attr"].TryGetValue("data", out value)) attrs.Add("Data", ele["attr"]["data"]);


            }
            return attrs;
        }
        /// <summary> </summary>
        public static SortedDictionary<string, string> eventbase_dynamic(SortedDictionary<string, string> attrs, dynamic ele) {
            dynamic value;
            if (ele.TryGetValue("events", out value) && ele["events"] != null) {
                if (ele["events"].TryGetValue("onclick", out value)) attrs.Add("Onclick", ele["events"]["onclick"]);
                if (ele["events"].TryGetValue("onchange", out value)) attrs.Add("Onchange", ele["events"]["onchange"]);
            }
            return attrs;
        }
        /// <summary> </summary>
        public static dynamic selectedVal_dynamic(dynamic select_val, dynamic ele) {
            SortedDictionary<string, string> sel_val = new SortedDictionary<string, string>();

            if (select_val["selections"] != null && ele["type"] == "dropdown") {
                foreach (dynamic _option in ele["options"]) {
                    _option["selected"] = "";
                    foreach (dynamic _val in select_val["selections"]) {

                        if (!String.IsNullOrEmpty(_val["val"]) && _option["val"] == _val["val"]) _option["selected"] = _val["val"];
                    }
                }
            } else if (select_val["selections"][0]["val"] != null) {
                foreach (dynamic _option in ele["options"]) {
                    _option["selected"] = "";
                    if (select_val["selections"][0]["val"] != "") {
                        _option["selected"] = select_val["selections"][0]["val"];
                    }
                }
            }
            return ele;
        }

        /// <summary> </summary>
        public static string getFieldVal(field_types field_type, fields field) {
            dynamic value;
            string output = "";
            var jss = new JavaScriptSerializer();

            dynamic sel = null;
            if (field != null && !String.IsNullOrEmpty(field.value)) {
                sel = jss.Deserialize<Dictionary<string, dynamic>>(field.value.ToString());
            }

            var ele = jss.Deserialize<Dictionary<string, dynamic>>(field_type.attr.ToString());
            if (ele != null && sel != null && sel.TryGetValue("selections", out value) && ele["type"] == "dropdown") {
                foreach (dynamic _option in ele["options"]) {
                    foreach (dynamic _val in sel["selections"]) {
                        if (_val.TryGetValue("val", out value) && _option["val"] == _val["val"]) output = _val["val"];
                    }
                }
            } else if (sel != null && sel["selections"][0].TryGetValue("val", out value)) {
                foreach (dynamic _option in ele["options"]) {
                    _option["selected"] = "";
                    if (sel["selections"][0]["val"] != "") {
                        output = sel["selections"][0]["val"];
                    }
                }
            }
            return output;
        }

        /// <summary> </summary>
        public static string renderSelect_dynamic(dynamic ele, SortedDictionary<string, string> attrs) {
            dynamic value;
            // Initialize StringWriter instance.
            StringWriter stringWriter = new StringWriter();
            // Put HtmlTextWriter in using block because it needs to call Dispose.
            using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter)) {
                if (ele.TryGetValue("label", out value)) {
                    writer.RenderBeginTag(HtmlTextWriterTag.Label);
                    writer.Write(ele["label"] + "<br/>");
                    writer.RenderEndTag();
                }
                if (ele["attr"].TryGetValue("multiple", out value) && ele["attr"]["multiple"] != null) attrs.Add("Multiple", "multiple");

                foreach (KeyValuePair<string, string> attr in attrs) {
                    if (!object.ReferenceEquals(attr.Key, null) && !object.ReferenceEquals(attr.Value, null)) writer.AddAttribute(attr.Key, attr.Value.ToString());
                }

                writer.RenderBeginTag(HtmlTextWriterTag.Select); // Begin select

                // need to add default and seleceted
                foreach (dynamic _option in ele["options"]) {
                    if (_option.TryGetValue("label", out value)) {
                        writer.AddAttribute(HtmlTextWriterAttribute.Value, _option["val"]);
                        if (_option.TryGetValue("selected", out value)) {
                            writer.AddAttribute(HtmlTextWriterAttribute.Selected, "selected");
                        }
                        writer.RenderBeginTag(HtmlTextWriterTag.Option); // Begin Option
                        writer.WriteEncodedText(_option["label"] != null ? _option["label"] : String.Empty);
                    } else {
                        if (_option.TryGetValue("selected", out value)) {
                            writer.AddAttribute(HtmlTextWriterAttribute.Selected, "selected");
                        }
                        writer.RenderBeginTag(HtmlTextWriterTag.Option); // Begin Option
                        writer.WriteEncodedText(_option["val"] == "True" ? _option["val"] : String.Empty);
                    }
                    writer.RenderEndTag();
                }
                writer.RenderEndTag();
                writer.Write("<br/>");
            }
            return stringWriter.ToString();
        }
        /// <summary> </summary>
        public static string renderTextInput_dynamic(dynamic ele, SortedDictionary<string, string> attrs) {
            dynamic value;
            StringWriter stringWriter = new StringWriter();
            using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter)) {
                if (ele.TryGetValue("label", out value)) {
                    writer.RenderBeginTag(HtmlTextWriterTag.Label);
                    writer.Write(ele["label"] + "<br/>");
                    writer.RenderEndTag();
                }
                attrs.Add("Type", "text");
                attrs.Add("Value", (ele.TryGetValue("options", out value)) && (ele["options"][0].TryGetValue("selected", out value)) ? ele["options"][0]["selected"] : String.Empty);

                foreach (KeyValuePair<string, string> attr in attrs) {
                    if (!object.ReferenceEquals(attr.Key, null) && !object.ReferenceEquals(attr.Value, null)) writer.AddAttribute(attr.Key, attr.Value.ToString());
                }
                writer.RenderBeginTag(HtmlTextWriterTag.Input); // Begin select
                writer.RenderEndTag();
                writer.Write("<br/>");
            }
            return stringWriter.ToString();
        }
        /// <summary> </summary>
        public static string renderTextarera_dynamic(dynamic ele, SortedDictionary<string, string> attrs) {
            dynamic value;
            StringWriter stringWriter = new StringWriter();
            using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter)) {
                if (ele.TryGetValue("label", out value)) {
                    writer.RenderBeginTag(HtmlTextWriterTag.Label);
                    writer.Write(ele["label"] + "<br/>");
                    writer.RenderEndTag();
                }
                foreach (KeyValuePair<string, string> attr in attrs) {
                    if (!object.ReferenceEquals(attr.Key, null) && !object.ReferenceEquals(attr.Value, null)) writer.AddAttribute(attr.Key, attr.Value.ToString());
                }
                writer.RenderBeginTag(HtmlTextWriterTag.Textarea); // Begin select
                String val = (ele.TryGetValue("options", out value)) && (ele["options"][0].TryGetValue("selected", out value)) ? ele["options"][0]["selected"] : String.Empty;
                writer.Write(val);
                writer.RenderEndTag();
                writer.Write("<br/>");
            }

            return stringWriter.ToString();
        }
        /// <summary> </summary>
        public static string renderCheckbox_dynamic(dynamic ele, SortedDictionary<string, string> attrs) {
            dynamic value;
            StringWriter stringWriter = new StringWriter();
            using (HtmlTextWriter writer = new HtmlTextWriter(stringWriter)) {
                if (ele.TryGetValue("label", out value)) {
                    writer.RenderBeginTag(HtmlTextWriterTag.Label);
                    writer.Write(ele["label"] + "<br/>");
                    writer.RenderEndTag();
                }
                attrs.Add("Type", "checkbox");

                attrs.Add("Value", ele["options"][0]["val"]);
                if (ele["options"] != null && ele["options"][0]["selected"] != null) {
                    attrs.Add("Selected", "selected");
                }
                foreach (KeyValuePair<string, string> attr in attrs) {
                    if (!object.ReferenceEquals(attr.Key, null) && !object.ReferenceEquals(attr.Value, null)) writer.AddAttribute(attr.Key, attr.Value.ToString());
                }
                writer.RenderBeginTag(HtmlTextWriterTag.Input); // Begin select

                writer.RenderEndTag();
                writer.Write("<br/>");
            }
            return stringWriter.ToString();
        }


    }
}
