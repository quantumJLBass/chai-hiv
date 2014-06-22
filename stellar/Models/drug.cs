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
    public class drug : publish_base {
        [JoinedKey("drug_id")]
        virtual public int id { get; set; }

        #region(Regulatory Information)

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string lab_code { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string common_name_or_abbreviation { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string brand_name { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string innovator_company { get; set; }        				

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string commercial_company { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string manufacturer { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string approved_for { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string new_drug_code { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string investigational { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra_approval_status { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string sra_approval_date { get; set; }
        #endregion

        #region(Dosing and Administration)
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string label_claim { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string dosing { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string dose_form { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string route_of_administration { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string frequency { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string pill_burden { get; set; }

            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string coadministration { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string inactive_ingredients { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string alternative_indications { get; set; }        

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string special_considerations { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string special_populations { get; set; }     
       
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string storage_condition { get; set; }     
        #endregion

        #region(ART Regimen Use)
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string lmic_1l { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string lmic_2l { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string lmic_3l { get; set; }
        #endregion

        #region(Clinical Study)
            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string pre_clin { get; set; }

            //Come back to .. HasAndBelongsToMany it
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_1 { get; set; }
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_1_date { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_2 { get; set; }
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_2_date { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_3 { get; set; }
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string clin_phase_3_date { get; set; }

            //[Property(SqlType = "nvarchar(MAX)")]
            //virtual public string clin_phase_4 { get; set; }
        #endregion

        #region(Market)
            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string chai_ceiling_price { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string chai_ceiling_price_date { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string patients_on_therapy { get; set; }

            [Property(SqlType = "nvarchar(MAX)")]
            virtual public string patients_on_therapy_year { get; set; }
        #endregion

        [HasAndBelongsToMany(typeof(trial), Lazy = true, Table = "trial_to_drugs", ColumnKey = "drug_id", ColumnRef = "trial_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
            virtual public IList<trial> trials { get; set; }

        [HasAndBelongsToMany(typeof(clinical), Lazy = true, Table = "clinical_to_drugs", ColumnKey = "drug_id", ColumnRef = "clinical_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<clinical> clinicals { get; set; }

        [HasAndBelongsToMany(typeof(substance), Lazy = true, Table = "drug_to_substances", ColumnKey = "drug_id", ColumnRef = "substance_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<substance> substances { get; set; }

        [HasAndBelongsToMany(typeof(drug_market), Lazy = true, Table = "drug_to_drug_market", ColumnKey = "drug_id", ColumnRef = "drug_market_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_market> markets { get; set; }

        [HasAndBelongsToMany(typeof(drug_family), Lazy = true, Table = "drug_to_drug_family", ColumnKey = "drug_id", ColumnRef = "drug_family_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug_family> famlies { get; set; }

        



        virtual public String get_named() {
            String name = "";
                if(!String.IsNullOrWhiteSpace(this.lab_code))name = this.lab_code;    
                if(!String.IsNullOrWhiteSpace(this.brand_name))name = this.brand_name;
                if (!String.IsNullOrWhiteSpace(this.common_name_or_abbreviation)) name = this.common_name_or_abbreviation;

            return name;
        }


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


        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "drug_to_drug_market", ColumnKey = "drug_market_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }

    }



}
