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


    }



}
