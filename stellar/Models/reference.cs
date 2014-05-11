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
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class reference : publish_base {
        [JoinedKey("reference_id")]
        virtual public int id { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string url { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string type { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string notes { get; set; }

        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "reference_to_base", ColumnKey = "reference_id", ColumnRef = "id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }

    }
}
