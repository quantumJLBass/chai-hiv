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
    public class drug_family : publish_base {
        [JoinedKey("drug_family_id")]
        virtual public int id { get; set; }

        [HasAndBelongsToMany(typeof(clinical), Lazy = true, Table = "clinical_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "clinical_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<clinical> clinicals { get; set; }

        [HasAndBelongsToMany(typeof(substance), Lazy = true, Table = "substance_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "substance_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<substance> substances { get; set; }

        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "drug_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }

        [HasAndBelongsToMany(typeof(drug_interaction), Lazy = true, Table = "drug_to_drug_interaction", ColumnKey = "drug_family_id", ColumnRef = "interaction_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_interaction> interactions { get; set; }

        [HasAndBelongsToMany(typeof(drug_lmic), Lazy = true, Table = "drug_family_to_drug_lmic", ColumnKey = "drug_family_id", ColumnRef = "lmic_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_lmic> lmics { get; set; }


        [HasAndBelongsToMany(typeof(drug_market), Lazy = true, Table = "drug_family_to_drug_market", ColumnKey = "drug_family_id", ColumnRef = "drug_market_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_market> markets { get; set; }

    }

    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_interaction : publish_base {
        [JoinedKey("interaction_id")]
        virtual public int id { get; set; }


        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "drug_to_drug_interaction", ColumnKey = "interaction_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> drugs { get; set; }

    }

    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_lmic : publish_base {
        [JoinedKey("lmic_id")]
        virtual public int id { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_1l { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_2l { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_3l { get; set; }

        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "drug_family_to_drug_lmic", ColumnKey = "lmic_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> drugs { get; set; }

    }



    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_market : publish_base {
        [JoinedKey("drug_market_id")]
        virtual public int id { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string year { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string chai_ceiling_price { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string patients_on_therapy { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_one { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_one_price { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_two { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_two_price { get; set; }


        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "drug_family_to_drug_market", ColumnKey = "drug_market_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> drugs { get; set; }

    }
}
