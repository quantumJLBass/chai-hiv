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
    public class reference : publish_base {
        /// <summary> </summary>
        [JoinedKey("reference_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual new public string url { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string type { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string notes { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "reference_to_base", ColumnKey = "reference_id", ColumnRef = "id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }

    }
}
