using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using NHibernate.Criterion;
using Castle.ActiveRecord;
using System.Collections;
using System.Collections.Generic;
using System.Data.SqlTypes;
using stellar.Services;
using Castle.Components.Validator;
using System.Linq;
using System.Web.Script.Serialization;
using Microsoft.SqlServer.Types;
using System.IO;

namespace stellar.Models {
    [ActiveRecord,JoinedBase]
    public class _base {
        [PrimaryKey("id")]
        virtual public int baseid { get; set; }

        [Property()]
        virtual public string alias { get; set; }

        private DateTime Creation_date;
        [Property(NotNull = true,Default = "GETDATE()")]
        virtual public DateTime creation_date {
            get {
                if (Creation_date == DateTime.MinValue)
                    return DateTime.Now;
                else
                    return Creation_date;
            }
            set { Creation_date = value; }
        }

        private DateTime Updated_date;
        [Property(NotNull = true, Default = "GETDATE()")]
        virtual public DateTime updated_date {
            get {
                if (Updated_date == DateTime.MinValue)
                    return DateTime.Now;
                else
                    return Updated_date;
            }
            set { Updated_date = value; }
        }

        /* id'ing */

        [Property]
        virtual public Boolean published { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String checksum { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String filehash { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String static_file { get; set; }

        /* permalink */
        [Property()]
        virtual public string url { get; set; }

        [Property(Default = "0")]
        virtual public int position { get; set; }

        [Property(Default = "0")]
        virtual public int sort { get; set; }

        [Property]
        virtual public int revision { get; set; }

        [Property]
        virtual public int version { get; set; }

        [Property]
        virtual public Boolean root { get; set; }


        /* state */
        [Property(Default = "0")]
        virtual public Boolean deleted { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_active { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_default { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_visible { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_core { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_visible_to_others { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_frontend { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_admin { get; set; }
        [Property()]
        virtual public string admin_url { get; set; }



        [Property(Default = "0")]
        virtual public bool is_link { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_editable { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_frontend_editable { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_Public { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String protect_post { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_deletable { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_cachable { get; set; }

        [Property(Default = "1")]
        virtual public Boolean is_trackable { get; set; }

        [Property(Default = "0")]
        virtual public Boolean loads_file { get; set; }

        [Property(Default = "0")]
        virtual public Boolean tmp { get; set; }

        [Property(Default = "0")]
        virtual public Boolean editable { get; set; }

        /* options */
        [Property(Default = "0")]
        virtual public Boolean gets_media { get; set; }
        virtual public Boolean this_gets_media() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.gets_media : post_obj.gets_media;
        }

        



        [Property(Default = "0")]
        virtual public Boolean gets_url { get; set; }

        [Property(Default = "0")]
        virtual public Boolean is_tabable_content { get; set; }
        virtual public Boolean this_is_tabable_content() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_tabable_content : post_obj.is_tabable_content;
        }

        [Property(Default = "0")]
        virtual public Boolean is_summarizable { get; set; }
        virtual public Boolean this_is_summarizable() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_summarizable : post_obj.is_summarizable;
        }


        [Property(Default = "1")]
        virtual public Boolean is_taggable { get; set; }
        virtual public Boolean this_is_taggable() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_taggable : post_obj.is_taggable;
        }


        [Property(Default = "1")]
        virtual public Boolean gets_metadata { get; set; }
        virtual public Boolean this_gets_metadata() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.gets_metadata : post_obj.gets_metadata;
        }

        [Property(Default = "1")]
        virtual public Boolean is_taxonomyable { get; set; }
        virtual public Boolean this_is_taxonomyable() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_taxonomyable : post_obj.is_taxonomyable;
        }

        [Property(Default = "1")]
        virtual public Boolean is_categorized { get; set; }
        virtual public Boolean this_is_categorized() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_categorized : post_obj.is_categorized;
        }

        [Property(Default = "1")]
        virtual public Boolean is_templatable { get; set; }
        virtual public Boolean this_is_templatable() {
            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            return (!post_obj.post_type.is_overwriteable(post_obj)) ? post_obj.post_type.is_templatable : post_obj.is_templatable;
        }

        




        /* relation */
        
        private _base _parent = null;
        
        [BelongsTo(NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public _base parent {
            get { return _parent; }
            set { _parent = value; }
        }

        
        [HasMany(typeof(_base), Lazy = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> children { get; set; }

        
        [HasMany(typeof(menu_option), Lazy = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<menu_option> menuoptions { get; set; }

        /* Stats */
        [Property]
        virtual public int seen { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string options { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string theme { get; set; }



        /* attach some base properties to the group level */
        
        [HasAndBelongsToMany(typeof(appuser), Lazy = true, Table = "_base_to_users", ColumnKey = "id", ColumnRef = "user_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<appuser> users { get; set; }
        
        [HasAndBelongsToMany(typeof(taxonomy_type), Lazy = true, Table = "_base_to_taxonomy_types", ColumnKey = "baseid", ColumnRef = "taxonomy_type_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<taxonomy_type> taxonomy_types { get; set; }
        /**/
        
        [HasAndBelongsToMany(typeof(taxonomy), Lazy = true, Table = "_base_to_taxonomy", ColumnKey = "baseid", ColumnRef = "taxonomy_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<taxonomy> taxonomies { get; set; }



        /* not right i don't think.. */
        virtual public String get_taxonomy(String alias) {
            String result = "";
            taxonomy data = ActiveRecordBase<taxonomy>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("alias", alias)
                   }.ToArray()
               );

            if (data != null) result = data.alias;


            return result;
        }




        
        [BelongsTo]
        virtual public site site { get; set; }

        
        [HasMany(typeof(meta_data), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<meta_data> meta_data { get; set; }

        virtual public String get_meta(String key) {
            String result = "";
            meta_data data = ActiveRecordBase<meta_data>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("post", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
               );

            if (data != null) result = data.value;


            return result;
        }
        virtual public Hashtable get_all_meta() {
            return this.get_all_meta("");
        }
        virtual public Hashtable get_all_meta(String exclude) {
            String[] ex = objectService.explode(exclude,",");
            meta_data[] meta = ActiveRecordBase<meta_data>.FindAll(new List<AbstractCriterion>() { Expression.Eq("post", this) }.ToArray());
            Hashtable meta_table = new Hashtable();
            foreach (meta_data data in meta) {
                if(!ex.Contains(data.meta_key)) meta_table.Add(data.meta_key, data.value);
            }
            return meta_table;
        }



        [HasMany(typeof(meta_data_date), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<meta_data_date> meta_data_date { get; set; }

        virtual public String get_meta_date(String key) {
            String result = null;
            meta_data_date data = ActiveRecordBase<meta_data_date>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("post", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
               );

            if (data != null) result = data.value.ToString();
            return result;
        }

        virtual public String get_meta_date_date(String key) {
            String result = null;
            meta_data_date data = ActiveRecordBase<meta_data_date>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("post", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
               );

            if (data != null) result = data.value.ToShortDateString().ToString();
            return result;
        }
        virtual public String get_meta_date_time(String key) {
            String result = null;
            meta_data_date data = ActiveRecordBase<meta_data_date>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("post", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
               );

            if (data != null) result = data.value.ToShortTimeString().ToString();
            return result;
        }


        virtual public Hashtable get_all_meta_date() {
            return this.get_all_meta_date("");
        }
        virtual public Hashtable get_all_meta_date(String exclude) {
            String[] ex = objectService.explode(exclude, ",");
            meta_data_date[] meta = ActiveRecordBase<meta_data_date>.FindAll(new List<AbstractCriterion>() { Expression.Eq("post", this) }.ToArray());
            Hashtable meta_table = new Hashtable();
            foreach (meta_data_date data in meta) {
                if (!ex.Contains(data.meta_key)) meta_table.Add(data.meta_key, data.value);
            }
            return meta_table;
        }


        [HasMany(typeof(meta_data_geo), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<meta_data_geo> meta_data_geo { get; set; }

        virtual public String get_meta_geo(String key) {
            String result = null;
            meta_data_geo data = ActiveRecordBase<meta_data_geo>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("post", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
               );

            if (data != null) result = data.getLat()+","+data.getLong();
            return result;
        }
        virtual public Hashtable get_all_meta_geo() {
            return this.get_all_meta_geo("");
        }
        virtual public Hashtable get_all_meta_geo(String exclude) {
            String[] ex = objectService.explode(exclude, ",");
            meta_data_geo[] meta = ActiveRecordBase<meta_data_geo>.FindAll(new List<AbstractCriterion>() { Expression.Eq("post", this) }.ToArray());
            Hashtable meta_table = new Hashtable();
            foreach (meta_data_geo data in meta) {
                if (!ex.Contains(data.meta_key)) meta_table.Add(data.meta_key, data.getLat()+","+data.getLong());
            }
            return meta_table;
        }
        

        
        [HasMany(typeof(logs), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<logs> logings { get; set; }

        virtual public IList<logs> get_logs() {
            return ActiveRecordBase<logs>.FindAll(new Order("date", false),
                   new List<AbstractCriterion>() { 
                       Expression.Eq("item", this)
                   }.ToArray()
               );
        }

        virtual public posting latest_copy() {
            int top_version = this.version;
            posting[] lastversion = ActiveRecordBase<posting>.FindAll(
                new Order[] { Order.Desc("version"), Order.Desc("revision") },
                new List<AbstractCriterion>() { 
                       Expression.Eq("parent",this),
                       Expression.Eq("deleted", false)
                   }.ToArray()
                          );
            return (lastversion.Length > 0) ? lastversion.First() : null;
        }

        virtual public int getLastRevision() {
            posting lastversion = this.latest_copy();
            int rev = lastversion != null ? lastversion.revision : 0;
            return rev;
        }

        virtual public void set_admin_menu(String admin_menu, int position, int sort) {
            this.url = admin_menu;
            this.position = position;
            this.sort = sort;
        }


        virtual public string post_url() {
            String baseurl = siteService.getCurrentSite().base_url;
            if (System.Web.HttpContext.Current.Request.IsLocal) baseurl = baseurl.Trim('/') + "/ams/";
            return post_url(baseurl);
        }

        virtual public string post_url(String base_url) {
            if (Controllers.BaseController.current_controller == "visible_editor") {
                if ((this.is_link)) {
                    return "#Simulated-external-link," + this.url;
                } else {
                    return "/visible_editor/posting.castle?iid=" + this.baseid;
                }
            }
            String Url = "";
            if ((this.is_link || !String.IsNullOrWhiteSpace(this.url))) {
                Url = this.url;
            } else {
                Url = "?iid=" + this.baseid;//this.post.post_type.url + 
            }

            Url = (System.Web.HttpContext.Current.Request.IsLocal && !this.is_link ? base_url.Trim('/') +"/" : "/") + Url.Trim('/') + "";// ((Controllers.BaseController.usedev) ? "&dev=1" : "");
            return Url;
        }

        [HasAndBelongsToMany(typeof(reference), Lazy = true, Table = "reference_to_base", ColumnKey = "id", ColumnRef = "reference_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<reference> references { get; set; }
    }


    [ActiveRecord(Lazy = true, BatchSize = 30)]
    public class meta_data : ActiveRecordBase<meta_data> {
        [PrimaryKey("meta_id")]
        virtual public int id { get; set; }

        [Property]
        virtual public string meta_key { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string value { get; set; }

        [BelongsTo]
        virtual public _base post { get; set; }
    }

    [ActiveRecord(Lazy = true, BatchSize = 30)]
    public class meta_data_date : ActiveRecordBase<meta_data_date> {
        [PrimaryKey("meta_id")]
        virtual public int id { get; set; }

        [Property]
        virtual public string meta_key { get; set; }

        private DateTime _value;
        [Property]
        virtual public DateTime value {
            get {
                if (_value == DateTime.MinValue)
                    return DateTime.Now;
                else
                    return _value;
            }
            set { _value = value; }
        }

        [BelongsTo]
        virtual public _base post { get; set; }
    }

    [ActiveRecord(Lazy = true, BatchSize = 30)]
    public class meta_data_geo : ActiveRecordBase<meta_data_geo> {
        [PrimaryKey("meta_id")]
        virtual public int id { get; set; }

        [Property]
        virtual public string meta_key { get; set; }

        [Property(SqlType = "geography")]
        virtual public Byte[] coordinate { get; set; }

        public static SqlGeography AsGeography(byte[] bytes) {
            SqlGeography geo = new SqlGeography();
            using (MemoryStream stream = new System.IO.MemoryStream(bytes)) {
                using (BinaryReader rdr = new System.IO.BinaryReader(stream)) {
                    geo.Read(rdr);
                }
            }
            return geo;
        }
        virtual public string getLat() {
            SqlGeography spatial = meta_data_geo.AsGeography(this.coordinate);
            return spatial.Lat.ToString();
        }
        virtual public string getLong() {
            SqlGeography spatial = meta_data_geo.AsGeography(this.coordinate);
            return spatial.Long.ToString();
        }
        [BelongsTo]
        virtual public _base post { get; set; }
    }


    /* extend the base with some expanded bases */


    public class publish_base : _base {
        [Property]
        virtual public string name { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string content { get; set; }

        private DateTime _publish_time;
        [Property(NotNull = true,Default = "GETDATE()")]
        virtual public DateTime publish_time {
            get {
                if (_publish_time == DateTime.MinValue)
                    return DateTime.Now;
                else
                    return _publish_time;
            }
            set { _publish_time = value; }
        }

        [BelongsTo]
        virtual public posting_type post_type { get; set; }


        private DateTime? _outputError;
        [Property]
        virtual public DateTime? outputError {
            get {
                if (_outputError == DateTime.MinValue)
                    return DateTime.Now;
                else
                    return _outputError;
            }
            set { _outputError = value; }
        }

        [BelongsTo]
        virtual public appuser editing { get; set; }

        [BelongsTo]
        virtual public appuser owner { get; set; }


        virtual public bool isCheckedOut() {
            bool flag = false;
            if (this.editing != null && this.editing != userService.getUser())
                flag = true;
            return flag;
        }





        /* what is the state of object? */
        virtual public bool is_published() {
            float top_version = this.version;
            if (
                    this.published == true
                    && (this.publish_time != null && this.publish_time.CompareTo(DateTime.Now) <= 0)
                ) {
                return true;
            }
            return false;
        }


        //this should be removed
        /* does this have a revison in the same version? */
        virtual public bool has_draft() {
            return (this.get_draft() != null) ? true : false;
        }
        /* get revison in the same version ie: working copy */
        virtual public posting get_draft() {
            IList<posting> lastversion = this.get_latest_revisions();
            return (lastversion.Count>0)?lastversion.First():null;
        }






        virtual public posting get_working_copy() {
            _base target = this;
            if (target.parent != null && target.parent.baseid > 0) {
                target = target.parent;
            }
            return ActiveRecordBase<posting>.Find(target.baseid);
        }

            






        /* what revisions are there */ // may want to rethink this one
        virtual public IList<posting> get_latest_revisions() {
            _base target = this;
            if (target.parent != null && target.parent.baseid > 0) {
                target = target.parent;
            }
            return ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("version"), Order.Desc("revision") },
                   new List<AbstractCriterion>() { 
                       Expression.Eq("parent", target), 
                       Expression.Gt("revision", 0),
                       Expression.Eq("version", target.version)
                   }.ToArray()
               );
        }
        /* what is it's working copy */
        virtual public posting get_revision(int rev) {
            IList<posting> lastrevision = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("version"), Order.Desc("revision") },
                   new List<AbstractCriterion>() { 
                       Expression.Eq("parent", this), 
                       Expression.Eq("revision", rev),
                       Expression.Eq("version", this.version)
                   }.ToArray()
               );
            return (lastrevision.Count > 0) ? lastrevision.First() : null;
        }

        /// <summary>
        /// Travel up to the parent post (working post) as a percaution then get the children and find the newest published version
        /// </summary>
        /// <returns></returns>
        virtual public posting get_published(){
            _base target = this;
            if(target.parent!=null && target.parent.baseid>0){
                target = target.parent;
            }
            if (target.children!= null && target.children.Count() > 0) {
                target = target.children.Where(x => x.published = true).OrderByDescending(x => x.version).FirstOrDefault();
            }
            if (target != null && target.baseid>0 && target.published == true){
                return ActiveRecordBase<posting>.Find(target.baseid);
            }else{
                return null;
            }
        }


        /* rethink this.. */
        virtual public String get_template() {
            return get_template("posting_template");
        }
        virtual public String get_template(String type) {
            if (!this.post_type.is_templatable) return "";

            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            posting template = post_obj.get_template_obj(type);
            site site = siteService.getCurrentSite();
            String theme = site.get_option("current_site_theme"); // Controllers.BaseController.theme;// 

            String result = "";
            if (template != null) {
                if (template.loads_file) {
                    String template_file = themeService.theme_path(site, theme, this.is_admin ? "admin" : "frontend", type).Trim('/') +'/'+ template.static_file.Trim('/');
                    if (file_info.file_exists(template_file))
                        result = file_handler.read_from_file(template_file);
                } else {
                    result = template.content;
                }
            }
            return result;
        }


        virtual public String get_template_obj() {
            return get_template("posting_template");
        }

        //this = posting
        virtual public posting get_template_obj(String type) {
            if (!this.is_templatable) return null;

            posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
            posting[] templatelist = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Asc("baseid") },
                                    new List<AbstractCriterion>() { 
                                        Expression.Eq("deleted", false),
                                        Expression.IsNull("parent"),// the  parent null makes it the working copy
                                        Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                                            new List<AbstractCriterion>() { Expression.Eq("alias", type) }.ToArray()
                                                        )
                                                    )
                                    }.ToArray()
                                );
            if (templatelist.Length > 0) {
                templatelist = templatelist.Where(
                                x => ( x.postchildren.Contains(post_obj) && post_obj.postparents.Contains(x)
                                            || (post_obj.postparents.Count == 0 && x.is_default)
                                        ) ).ToArray();
                 if (templatelist.Length > 0) {
                     posting template = templatelist.First();
                     return template;
                 }
            } 
            return null;
        }

        virtual public string title() {
            String title = this.get_meta("title");
            if (String.IsNullOrWhiteSpace(title)) {
                posting post_obj = ActiveRecordBase<posting>.Find(this.baseid);
                title = post_obj.name.Replace("&", "&amp;").Replace("&&amp;", "&amp;");
            }
            return title;
        }


    }

    public class _templates : publish_base{

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string content { get; set; }

        [Property]
        virtual public bool process { get; set; }


        virtual public String get_processed() {
            if (this.process) {
                List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
                typeEx.Add(Expression.Eq("model", "placeController"));
                //typeEx.Add(Expression.Eq("set", this.model.baseid));

                field_types[] ft = ActiveRecordBase<field_types>.FindAll(typeEx.ToArray());
                List<string> fields = new List<string>();
                Hashtable hashtable = new Hashtable();
                hashtable["item"] = this;

                if (ft != null) {
                    foreach (field_types ft_ in ft) {
                        //string value = "";
                        //value = FieldsService.getFieldVal(ft_, this);
                        //hashtable["" + ft_.alias] = value;
                        //log.Info("hashtable[" + ft_.alias+"]" + value);
                    }
                }
                return renderService.proccessText(hashtable, this.content);
            }
            return "false";
        }
    }

    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class menu_option : publish_base {
        [JoinedKey("menu_option_id")]
        virtual public int id { get; set; }

        [Property]
        virtual public string menu_text { get; set; }

        [Property]
        virtual public Boolean show { get; set; }

        [BelongsTo]
        virtual public posting post { get; set; }
        
        virtual public string url(){
            return url(System.Web.HttpContext.Current.Request.IsLocal ? "/ams" : "");
        }
        virtual public string url(String base_url){
            if(Controllers.BaseController.current_controller=="visible_editor"){
                if( (this.post.is_link) ){
                    return "#Simulated-external-link," + this.post.url;
                }else{
                    return "/visible_editor/posting.castle?iid=" + this.post.baseid;
                }
            }
            String Url = "";
            if( (this.post.is_link || !String.IsNullOrWhiteSpace(this.post.url)) ){
                   Url = this.post.url;
            }else{
                Url = "?iid=" + this.post.baseid;//this.post.post_type.url + 
            }

            Url = (!this.post.is_link ? base_url : "") + Url + "";// ((Controllers.BaseController.usedev) ? "&dev=1" : "");
            return Url;
        }

        virtual public string name(){
            String name = "";
            if (this.post != null) {
                name = this.post.name.Replace("&", "&amp;").Replace("&&amp;", "&amp;");
            }
            return name;
        }





        virtual public string target() {
            String name = "";
            return (this.post != null && this.post.is_link && this.post.url != "") ? "target='_blank'" : "";
        }


    }

/*

    public class site_base {
        [PrimaryKey]
        virtual public int id { get; set; }
        [Property]
        virtual public String name { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public String settings { get; set; }
    }
*/
    /* this shoulld be in a service in it's self */
    /*[ActiveRecord(Lazy = true)]
    public class small_url : ActiveRecordBase<small_url> {
        [PrimaryKey("small_url_id")]
        virtual public int id { get; set; }

        [Property("small_url")]
        virtual public String sm_url { get; set; }

        [Property("original")]
        virtual public String or_url { get; set; }
    }*/
}
