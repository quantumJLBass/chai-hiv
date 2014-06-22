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
    public class substance : publish_base {
        [JoinedKey("substance_id")]
        virtual public int id { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string generic_name { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lab_code { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string chemical_name { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string molecular_formula { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string mechanism_of_action { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string pro_drug { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string active_moiety { get; set; }
        



        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string major_metabolites { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string active_agent_structure { get; set; }       

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string cas_reg_number { get; set; }

        //[Property(SqlType = "nvarchar(MAX)")]
        //virtual public string intnl_nonproprietary_name { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string japanese_accepted_name { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string british_accepted_name { get; set; }



        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "drug_to_substances", ColumnKey = "substance_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }

        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "substance_to_drug_family", ColumnKey = "substance_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> families { get; set; }

    }

}
