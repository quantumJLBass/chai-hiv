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
    public class drug_family : publish_base {
        /// <summary> </summary>
        [JoinedKey("drug_family_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(clinical), Lazy = true, Table = "clinical_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "clinical_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<clinical> clinicals { get; set; }

        /*/// <summary> </summary>
        [HasAndBelongsToMany(typeof(substance), Lazy = true, Table = "substance_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "substance_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<substance> substances { get; set; }
        */

        private IList<substance> SUBSTANCES = new List<substance>();
        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(substance), Lazy = true, BatchSize = 30, Table = "family_substance", ColumnKey = "drug_family_id", ColumnRef = "substance_id", OrderBy = "substance_order", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<substance> substances {
            get { return SUBSTANCES; }
            set { SUBSTANCES = value; }
        }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "drug_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }


        /// <summary> </summary>
        [HasMany(typeof(drug_market), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<drug_market> markets { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(drug_interaction), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<drug_interaction> interactions { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(drug_lmic), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<drug_lmic> lmics { get; set; }


    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 10)]
    public class family_substance : ActiveRecordBase<family_substance> {

        /// <summary> </summary>
        [PrimaryKey]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [BelongsTo("drug_family_id")]
        virtual public drug_family family { get; set; }

        /// <summary> </summary>
        [BelongsTo("substance_id")]
        virtual public substance substance { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public int substance_order { get; set; }
    }





    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_interaction : ActiveRecordBase<drug_interaction> {
        /// <summary> </summary>
        [PrimaryKey("interaction_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string descriptions { get; set; }

        /// <summary> </summary>
        [BelongsTo]
        virtual public drug_family drug_family { get; set; }

    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_lmic : ActiveRecordBase<drug_lmic> {
        /// <summary> </summary>
        [PrimaryKey("lmic_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_1l { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_2l { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lmic_3l { get; set; }


        /// <summary> </summary>
        [BelongsTo]
        virtual public drug_family drug_family { get; set; }

    }



    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class drug_market : ActiveRecordBase<drug_market> {
        /// <summary> </summary>
        [PrimaryKey("drug_market_id")]
        virtual public int id { get; set; }


        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string year { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string chai_ceiling_price { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string patients_on_therapy { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_one { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_one_price { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_two { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string source_two_price { get; set; }



        /// <summary> </summary>
        [BelongsTo]
        virtual public drug_family drug_family { get; set; }



    }
}
