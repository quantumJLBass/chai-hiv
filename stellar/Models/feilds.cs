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

namespace stellar.Models {
    /// <summary> </summary>
    [ActiveRecord(Lazy=true, BatchSize=30)]
    public class fields : ActiveRecordBase<fields> {
        /// <summary> </summary>
        public fields() { }

        /// <summary> </summary>
        [PrimaryKey("field_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public field_types type { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string value { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public int owner { get; set; }
    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 10)]
    public class field_types : _base {
        /// <summary> </summary>
        [JoinedKey("field_type_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string name { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public posting notes { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public posting template { get; set; }

        /// <summary> </summary>
        [Property]
        virtual new public string alias { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string attr { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string type { get; set; }

        /// <summary> </summary>
        [Property("fieldset")]
        virtual public int set { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public bool is_public { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(user_group), Lazy = true, BatchSize = 5, Table = "user_groups_to_field_type", ColumnKey = "field_type_id", ColumnRef = "user_group_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<user_group> groups { get; set; }

    }
}

