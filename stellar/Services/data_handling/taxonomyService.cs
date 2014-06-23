#region Directives
using stellar.Models;
using stellar.Services;
using Castle.ActiveRecord;
using System;
using System.Data;
using System.Configuration;
using System.Net;
using System.IO;
using System.Web;
//using MonoRailHelper;

using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Reflection;
using NHibernate.Criterion;
using System.Security;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.ComponentModel;
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class taxonomyService {

        /// <summary> </summary>
        public static taxonomy get_taxonomy(String alias) {
            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
            filtering.Add(Expression.Eq("alias", alias));
            taxonomy taxonomy = ActiveRecordBase<taxonomy>.FindFirst(filtering.ToArray());
            return taxonomy;
        }
        /// <summary> </summary>
        public static IList<taxonomy> get_taxonomies(String type_alias) {
            return ActiveRecordBase<taxonomy>.FindAll(
                        new List<AbstractCriterion>() {
                            Expression.Eq("taxonomy_type", ActiveRecordBase<taxonomy_type>.FindFirst(
                                new List<AbstractCriterion>() { Expression.Eq("alias", type_alias) }.ToArray()
                                ))
                        }.ToArray()
                    );
        }
        /// <summary> </summary>
        public static taxonomy_type get_taxonomy_type(String type_alias) {
            return ActiveRecordBase<taxonomy_type>.FindFirst(
                                new List<AbstractCriterion>() { Expression.Eq("alias", type_alias) }.ToArray()
                                );
        }
        /* todo serach_taxonomies */









    }


}
