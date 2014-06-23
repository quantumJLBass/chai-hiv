using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using Castle.ActiveRecord;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.Components.Validator;
using log4net;

namespace stellar.Models
{
    /*[ActiveRecord(Lazy = true, BatchSize = 5)]
    public class categories : ActiveRecordBase<categories>
    {

        [PrimaryKey("category_id")]
        virtual public int id { get; set; }

        [ValidateNonEmpty("Event Category Name is required.")]
        [Property]
        virtual public string name { get; set; }

        [Property]
        virtual public int level { get; set; }

        [Property]
        virtual public int position { get; set; }

        [Property]
        virtual public string url { get; set; }

        [Property]
        virtual public bool asLink { get; set; }

        [Property]
        virtual public bool active { get; set; }

        [Property]
        virtual public string friendly_name { get; set; }

        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "_base_to_categories", ColumnKey = "category_id", ColumnRef = "id", Inverse = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }

    }*/

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 10)]
    public class taxonomy_type : ActiveRecordBase<taxonomy_type> {
        /// <summary> </summary>
        [PrimaryKey("taxonomy_type_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string name { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string alias { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean allows_multiple { get; set; }

        /// <summary> </summary>
        [Property(Default = "1")]
        virtual public Boolean is_mergable { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean is_visible { get; set; }

        /// <summary> </summary>
        [Property(Default = "0")]
        virtual public Boolean is_core { get; set; }

        /// <summary> </summary>
        [HasMany(typeof(taxonomy), Lazy = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<taxonomy> taxonomies { get; set; }

        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "_base_to_taxonomy_types", ColumnKey = "taxonomy_type_id", ColumnRef = "baseid", Inverse = true, NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }
    }

    /// <summary> </summary>
    [ActiveRecord(Lazy = true, BatchSize = 10)]
    public class taxonomy : publish_base {
        ILog log = log4net.LogManager.GetLogger("taxonomyModel");

        /// <summary> </summary>
        [JoinedKey("taxonomy_id")]
        virtual public int id { get; set; }

        /// <summary> </summary>
        [Property]
        virtual public string attr { get; set; }

        /// <summary> </summary>
        [BelongsTo(NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public taxonomy_type taxonomy_type { get; set; }


        /// <summary> </summary>
        [HasAndBelongsToMany(typeof(_base), Lazy = true, Table = "_base_to_taxonomy", ColumnKey = "taxonomy_id", ColumnRef = "baseid", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<_base> items { get; set; }


        /* not right i don't think.. */
        /// <summary> </summary>
        virtual public IList<_base> get_taxonomy_items(String type, String alias) {
            log.Info("looking for " + type + " with  alias " + alias);
            IList<_base> data = new List<_base>();
            try {
                data = ActiveRecordBase<_base>.FindAll(
                    new List<AbstractCriterion>() { 
                        Expression.Eq("taxonomy_type", ActiveRecordBase<taxonomy_type>.FindOne(
                                new List<AbstractCriterion>() { 
                                    Expression.Eq("alias", type)
                                }.ToArray()
                            )
                        ),
                        Expression.Eq("alias", alias)
                    }.ToArray()
                );
                log.Info("found " + data.Count + " item ");
            } catch {

            }
            return data;
        }





    }


    /* this can go away when it's in the install.  It's now fully able to be 
     * created from with in.




    [ActiveRecord(Lazy = true, BatchSize = 5)]
    public class campus : ActiveRecordBase<campus>
    {
        [PrimaryKey("campus_id")]
        virtual public int id { get; set; }

        [Property]
        virtual public string city { get; set; }

        [Property]
        virtual public string name { get; set; }

        [Property]
        virtual public string url { get; set; }

        [Property]
        virtual public string state { get; set; }

        [Property]
        virtual public string state_abbrev { get; set; }

        [Property]
        virtual public int zipcode { get; set; }

        [Property]
        virtual public decimal latitude { get; set; }

        [Property]
        virtual public decimal longitude { get; set; }

        [HasAndBelongsToMany(typeof(site), Lazy = true, Table = "site_to_campus", ColumnKey = "campus_id", ColumnRef = "site_id", NotFoundBehaviour = NotFoundBehaviour.Ignore)]
        virtual public IList<site> items { get; set; }
    }
     */ 
}
