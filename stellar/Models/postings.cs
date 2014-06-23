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
using System.Linq;
using System.Web.Script.Serialization;

namespace stellar.Models {

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class posting : publish_base {
        /// <summary> </summary>
        [JoinedKey("post_id")]
        virtual public int id { get; set; }

        /*[BelongsTo]
        virtual public menu_option menu_option { get; set; }*/

        /// <summary> </summary>
        [Property]
        virtual public Boolean? is_Code { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public Boolean? useTiny { get; set; }

        
        [ScriptIgnore]
        private IList<posting> _parent = null;
        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(posting), Lazy = true, Table = "posting_to_postings", ColumnKey = "parent", ColumnRef = "child", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<posting> postparents {
            get { return _parent; }
            set { _parent = value; }
        }
        /// <summary> </summary>
        [ScriptIgnore]
        [HasAndBelongsToMany(typeof(posting), Lazy = true, Table = "posting_to_postings", ColumnKey = "child", ColumnRef = "parent", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<posting> postchildren { get; set; }


        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(appuser), Lazy = true, Table = "posting_to_users", ColumnKey = "post_id", ColumnRef = "user_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<appuser> editors { get; set; }


        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(fields), Lazy = true, Table = "posting_to_fields", ColumnKey = "post_id", ColumnRef = "field_id", NotFoundBehaviour = NotFoundBehaviour.Ignore, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<fields> fields { get; set; }




        /// <summary> </summary>
        virtual public String load_published_content() {
            return load_content("published");
        }
        /// <summary> </summary>
        virtual public String load_working_content() {
            return load_content("working");
        }


        /// <summary> </summary>
         virtual public String load_content(String state) {
            String content = "";
            if(this.loads_file){
                string filepath = "";

                String mode = this.post_type.is_admin ? "admin" : "frontend";
                if (state == "published")
                    filepath = versionService.published_path(mode).Trim('/') + "/" + this.post_type.alias + "/" + this.static_file.Trim('/');
                if (state == "revision")
                    filepath = postingService.get_revision_path(this.post_type.alias).Trim('/') + "/" + this.post_type.alias + "/" + this.static_file.Trim('/');
                if (state == "working")
                    filepath = versionService.working_path(mode).Trim('/') + "/" + this.post_type.alias + "/" + this.static_file.Trim('/');
                content = postingService.strip_post_file_info(file_handler.read_from_file(filepath));
            }else{
                content = postingService.strip_post_file_info(this.content);
            }
            return content;
        }

         /// <summary> </summary>
         virtual public String load_rendered_content() {
             return load_rendered_content("working");
         }
         /// <summary> </summary>
         virtual public String load_rendered_content(String mode) {
             return new renderService().renderposting(this.load_content(mode), this, new Hashtable());
        }

         /// <summary> </summary>
        virtual public List<string> get_post_feilds(posting post) {
            List<AbstractCriterion> typeEx = new List<AbstractCriterion>();
            typeEx.Add(Expression.Eq("set", post.post_type.baseid));
            field_types[] ft = ActiveRecordBase<field_types>.FindAll(typeEx.ToArray());
            List<string> fields = new List<string>();

            List<string> user_fields = new List<string>();
            if (ft != null) {
                foreach (field_types ft_ in ft) {
                    if ((ft_.users.Count > 0) || (ft_.users.Count > 0)) {
                        if (ft_.users.Contains(userService.getUser())) {
                            user_fields.Add(fieldsService.get_field(ft_, post));
                        } else {
                            fields.Add(fieldsService.get_field(ft_, post));
                        }
                    } else {
                        user_fields.Add(fieldsService.get_field(ft_, post));
                    }
                }
            }
            return fields;
        }

    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class posting_type : _base {
        /// <summary> </summary>
        [JoinedKey("posting_type_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual new public String alias { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean is_Code { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean is_Core { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean useTiny { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean overwriteable { get; set; }
        /// <summary> </summary>
        virtual public Boolean is_overwriteable(posting post) {
            return (post.tmp) ? false : this.overwriteable;
        }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean use_posting_templates { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean use_layout_templates { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(posting), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<posting> postings { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(posting_type_action), Lazy = true, Table = "posting_type_to_action", ColumnKey = "posting_type_id", ColumnRef = "posting_type_actions_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<posting_type_action> actions { get; set; }

    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class posting_type_action : _base {
        /// <summary> </summary>
        [JoinedKey("posting_type_actions_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual new public String alias { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(posting_type_action), Lazy = true, Table = "posting_type_to_action", ColumnKey = "posting_type_actions_id", ColumnRef = "posting_type_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<posting_type_action> actions { get; set; }

    }
}
