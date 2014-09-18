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

        /*/// <summary> </summary>
        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "drug_to_drug_family", ColumnKey = "drug_family_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }*/
        /// <summary> </summary>
        [HasMany(typeof(drug), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<drug> drugs { get; set; }



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


}
