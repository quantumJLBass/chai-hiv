using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Castle.ActiveRecord;
using NHibernate.Exceptions;
using System.Collections.Generic;
using NHibernate.Criterion;
using System.Collections;
using System.Data.SqlTypes;
using stellar.Services;
using Castle.Components.Validator;
using System.Linq;
using System.Web.Script.Serialization;



namespace stellar.Models {

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 30)]
    public class appuser : _base {

        /// <summary> </summary>
       [JoinedKey("users_id")]
        virtual public int id { get; set; }
        //protected UserService userService = new UserService();

       /// <summary> </summary>
        [Property]
        virtual public String nid { get; set; }

        /// <summary> </summary>
        [Property] // we need to have this level for oAuth and other reasons thou not always required
        virtual public String password { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String display_name { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public user_group groups { get; set; }

        /*[BelongsTo]
        virtual public user_settings settings { get; set; }
        */

        /// <summary> </summary>
        [HasMany(typeof(contact_profile), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<contact_profile> contact_profiles { get; set; }

        /// <summary> </summary>
        [ScriptIgnore]
        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "_base_to_users", ColumnKey = "user_id", ColumnRef = "id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }

        /// <summary> </summary>
        [ScriptIgnore]
        [HasAndBelongsToMany(typeof(posting), Lazy = true, Table = "posting_to_users", ColumnKey = "user_id", ColumnRef = "post_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<posting> postings { get; set; }

        /// <summary> </summary>
        virtual public IList<posting> getUserPostings() {
            return getUserPostings(0, false);
        }
        /// <summary> </summary>
        virtual public IList<posting> getUserPostings(int limit) {
            return getUserPostings(limit,false);
        }

        /// <summary> </summary>
        virtual public IList<posting> getUserPostings(int limit,Boolean published_only) {
            IList<posting> temp = new List<posting>();
            appuser user = this;
            if (user.postings.Count > 0) {
                IList<posting> userevents = user.postings;
                if (published_only) {
                    object[] obj = new object[userevents.Count];
                    int i = 0;
                    foreach (posting p in userevents) {
                        obj[i] = p.baseid;
                        i++;
                    }
                    List<AbstractCriterion> baseEx = new List<AbstractCriterion>();
                    baseEx.Add(Expression.In("id", obj));
                    baseEx.Add(Expression.Eq("deleted", false));
                    List<AbstractCriterion> statusEx = new List<AbstractCriterion>();
                    statusEx.AddRange(baseEx);
                    //statusEx.Add(Expression.Eq("status", ActiveRecordBase<status>.Find(statusId)));
                    if (limit == 0) limit = 99999;
                    Order[] ord = new Order[1];
                    ord[0] = Order.Asc("name");
                    temp = ActiveRecordBase<posting>.SlicedFindAll(0, limit, ord, statusEx.ToArray());
                } else {
                    temp = userevents;
                }
            }
            return temp;
        }


        /* what is the user doing? */
        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public bool logedin { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public bool active { get; set; }

        
        private DateTime? _last_active;
        /// <summary> </summary>
        [Property]
        virtual public DateTime? last_active {
            get { return _last_active; }
            set {
                if ((value >= (DateTime)SqlDateTime.MinValue) && (value <= (DateTime)SqlDateTime.MaxValue)) {
                    _last_active = value;
                }
            }
        }
        /// <summary> </summary>
        [ScriptIgnore]
        [HasMany(typeof(logs), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<logs> user_logings { get; set; }


        /// <summary> </summary>
        [HasMany(typeof(user_meta_data), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<user_meta_data> user_meta_data { get; set; }


        /// <summary> </summary>
        virtual public String get_meta_data(String key) {
            String result = "";
            if (this.baseid > 0) {
                user_meta_data data = ActiveRecordBase<user_meta_data>.FindOne(
                       new List<AbstractCriterion>() { 
                       Expression.Eq("appuser", this), 
                       Expression.Eq("meta_key", key)
                   }.ToArray()
                   );

                if (data != null && data.id > 0) result = data.value;
            }
            return result;
        }

    }



    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 30)]
    public class user_meta_data : ActiveRecordBase<user_meta_data> {
        /// <summary> </summary>
        [PrimaryKey("meta_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string meta_key { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string value { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public appuser appuser { get; set; }
    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class contact_profile : _base {
        /// <summary> </summary>
        [JoinedKey("contact_profile_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string title { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string first_name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string middle_name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string last_name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string email { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string phone { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean isDefault { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean isPublic { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean allowContact { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public appuser owner { get; set; }

    }



    #region(Groups)

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class user_group : _base {
        /// <summary> </summary>
        private int _id = 0;
        [JoinedKey("user_groups_id")]
        virtual public int id { get { return base.baseid; } set { _id = value; } }

        /// <summary> </summary>
        [Property]
        virtual public String name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String alias { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean default_group { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean isAdmin { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean allow_signup { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(appuser), Lazy = true, Inverse = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<appuser> groupusers { get; set; }



        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(privilege), Lazy = true, BatchSize = 30, Table = "groups_to_privilege", ColumnKey = "user_groups_id", ColumnRef = "privileges_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<privilege> privileges { get; set; }

    }


    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class privilege : _base {
        /// <summary> </summary>
        [JoinedKey("privileges_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property("name")]
        [ValidateNonEmpty("Privilege name is required.")]
        virtual public String name { get; set; }

        /// <summary> </summary>
        [Property]
        [ValidateNonEmpty("Privilege alias is required.")]
        virtual public String alias { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean manager { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String discription { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public privilege_type owner { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(user_group), Lazy = true, Inverse = true, BatchSize = 30, Table = "groups_to_privilege", ColumnKey = "privileges_id", ColumnRef = "user_groups_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<user_group> groups { get; set; }

    }
    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class privilege_type : _base {
        /// <summary> </summary>
        [JoinedKey("privilege_type_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property("name")]
        [ValidateNonEmpty("privilege_type name is required.")]
        virtual public String name { get; set; }

        /// <summary> </summary>
        [Property]
        [ValidateNonEmpty("privilege_type alias is required.")]
        virtual public String alias { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public String discription { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(privilege), Lazy = true, Inverse = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<privilege> privileges { get; set; }

    }
    #endregion
    

}
