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
    public class substance : publish_base {
        /// <summary> </summary>
        [JoinedKey("substance_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string generic_name { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string abbreviated { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string lab_code { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string chemical_name { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string molecular_formula { get; set; }


        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string mechanism_of_action { get; set; }




        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string major_metabolites { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string active_agent_structure { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string cas_reg_number { get; set; }

        //[Property(SqlType = "nvarchar(MAX)")]
        //virtual public string intnl_nonproprietary_name { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string japanese_accepted_name { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string british_accepted_name { get; set; }

        /*/// <summary> </summary>
        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "substance_to_drug_family", ColumnKey = "substance_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> families { get; set; }
        */

        private IList<family_substance> Family_Substance = new List<family_substance>();
        /// <summary> </summary>
        [HasMany(Lazy = true, ColumnKey = "substance_id")]
        virtual public IList<family_substance> family_substance {
            get { return Family_Substance; }
            set { Family_Substance = value; }
        }
        private IList<family_substance> ordering = new List<family_substance>();
        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(family_substance), Lazy = true, BatchSize = 30, Table = "family_substance", ColumnKey = "drug_family_id", ColumnRef = "substance_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<family_substance> substance_order {
            get { return ordering; }
            set { ordering = value; }
        }
        private IList<family_substance> Families = new List<family_substance>();
        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(family_substance), Lazy = true, BatchSize = 30, Table = "family_substance", ColumnKey = "substance_id", ColumnRef = "drug_family_id", Inverse = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<family_substance> families {
            get { return Families; }
            set { Families = value; }
        }


        /// <summary> </summary>
        [HasMany(typeof(substance_salt), Lazy = true, Cascade = ManyRelationCascadeEnum.AllDeleteOrphan)]
        virtual public IList<substance_salt> salts { get; set; }


    }




    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class substance_salt : ActiveRecordBase<substance_salt> {
        /// <summary> </summary>
        [PrimaryKey("salt_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string pro_drug { get; set; }

        /// <summary> </summary>
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string active_moiety { get; set; }


        /// <summary> </summary>
        [BelongsTo]
        virtual public substance substance { get; set; }

    }

}
