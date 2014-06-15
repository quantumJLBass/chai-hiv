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
    public class trial : publish_base {
        [JoinedKey("trial_id")]
        virtual public int id { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string record_id { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string acronym { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string discription { get; set; }

        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "trial_to_drugs", ColumnKey = "trial_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }

        [HasAndBelongsToMany(typeof(clinical), Lazy = true, Table = "clinical_to_trials", ColumnKey = "trial_id", ColumnRef = "clinical_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<clinical> clinicals { get; set; }


    }

}
