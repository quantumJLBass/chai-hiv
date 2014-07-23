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
    public class drug : publish_base {
        /// <summary> </summary>
        [JoinedKey("drug_id")]
        virtual public int id { get; set; }

        #region(Regulatory Information)

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string lab_code { get; set; }

            /// <summary> </summary>
            [Property]
            virtual public Boolean attached { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string common_name_or_abbreviation { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string brand_name { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string manufacturer { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string approved_for { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string new_drug_code { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string investigational { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra_approval_status { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra_approval_date { get; set; }
        #endregion

        #region(Dosing and Administration)
            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string label_claim { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string dosing { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string dose_form { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string route_of_administration { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string frequency { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string pill_burden { get; set; }

            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string coadministration { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string inactive_ingredients { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string alternative_indications { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string special_considerations { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string special_populations { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string storage_condition { get; set; }     
        #endregion

        #region(Clinical Study)
            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string pre_clin { get; set; }

            //Come back to .. HasAndBelongsToMany it
            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_1 { get; set; }
            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_1_date { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_2 { get; set; }
            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_2_date { get; set; }

            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_3 { get; set; }
            /// <summary> </summary>
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_3_date { get; set; }

            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string clin_phase_4 { get; set; }
        #endregion

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(trial), Lazy = true, Table = "trial_to_drugs", ColumnKey = "drug_id", ColumnRef = "trial_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
            virtual public IList<trial> trials { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(clinical), Lazy = true, Table = "clinical_to_drugs", ColumnKey = "drug_id", ColumnRef = "clinical_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<clinical> clinicals { get; set; }

        /*/// <summary> </summary>
        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "drug_to_drug_family", ColumnKey = "drug_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> families { get; set; }*/


        /// <summary> </summary>
        [BelongsTo("substance_id")]
        virtual public drug_family families { get; set; }


        /// <summary> </summary>
        virtual public String get_named() {
            String name = "";
                if(!String.IsNullOrWhiteSpace(this.lab_code))name = this.lab_code;    
                if(!String.IsNullOrWhiteSpace(this.brand_name))name = this.brand_name;
                if (!String.IsNullOrWhiteSpace(this.common_name_or_abbreviation)) name = this.common_name_or_abbreviation;

            return name;
        }


    }

}
