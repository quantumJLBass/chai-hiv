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
    public class clinical : publish_base {
        [JoinedKey("clinical_id")]
        virtual public int id { get; set; }

        // so what I will want to do is make this
        // dynamic.  Read of the taxonomies so that
        // these are the same but looped over
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string title { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string ln_clinical_t { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string max_dose { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string min_dose { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherence { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string durability_tolerability { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string durability_resistance_barrier { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string durability_missed_dose { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string time_to_load_suppression { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string percentage_achieving_viral_load_suppression { get; set; }
        
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string viral_load_suppression_cutoff { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string pharmacology_comments { get; set; }
        



        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string biological_half_life { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string metabolites_of_parent { get; set; }
        


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_bioavailability { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_auc { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_auc_unit { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_auc_last_value { get; set; }



        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_cmax { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fasting_tmax { get; set; }



        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_bioavailability { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_auc { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_auc_unit { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_auc_last_value { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_cmax { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string fed_tmax { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string steady_state_cmax { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string steady_state_cmin { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string steady_state_tmax { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string steady_state_auc { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string steady_state_auc_unit { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string resistance { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string genetic_mutation { get; set; }
        

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string discontinuation_adverse_events { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string discontinuation_virologic_failure { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string discontinuation_followup { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string discontinuation_other { get; set; }




        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_type { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_phase { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_sample_size { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_location { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_sick_healthy { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_length { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string study_length_measurement { get; set; }






        /*toxicity*/
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_sae { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_sae_moa_dmpk { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_other { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_other_moa_dmpk { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_drug_to_drug_interactions { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_drug_to_drug_interactions_moa_dmpk { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_ae_chronic { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_ae_chronic_moa_dmpk { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_ae_advanced_grade { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string toxicity_ae_advanced_grade_moa_dmpk { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_pillburden { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_palatablilty { get; set; }

        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_diet_constraints { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_diet_constraints_moa_dmpk { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_co_dosing_constraints { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_co_dosing_constraints_moa_dmpk { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_dose_timing_constraints { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_dose_timing_constraints_moa_dmpk { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_frequency { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_convenience_frequency_moa_dmpk { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_lost_to_follow_up { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_other_tolerabilities { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_ae_acute { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_ae_acute_moa_dmpk { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_ae_mild_grade { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string adherance_tolerability_ae_mild_grade_moa_dmpk { get; set; }


        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_genetic_barrier_to_resistance { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_virological_failure { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_forgiveness { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_forgiveness_moa_dmpk { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_drug_to_drug_interactions_efficacy_reduction { get; set; }
        [Property(SqlType = "nvarchar(MAX)")]
        virtual public string forgiveness_drug_to_drug_interactions_efficacy_reduction_moa_dmpk { get; set; }
        
        








        [HasAndBelongsToMany(typeof(treatment), Lazy = true, Table = "clinical_to_treatments", ColumnKey = "clinical_id", ColumnRef = "treatment_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<treatment> treatments { get; set; }

        [HasAndBelongsToMany(typeof(drug), Lazy = true, Table = "clinical_to_drugs", ColumnKey = "clinical_id", ColumnRef = "drug_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<drug> drugs { get; set; }


    }

}
