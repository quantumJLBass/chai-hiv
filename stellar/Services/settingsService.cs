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
    public class settingsService {



        /* this is to choose the option starting from global site options with user consideration */

        /// <summary> </summary>
        public static String get_option(String name){
            String result = "";
            options sdata = ActiveRecordBase<options>.FindOne(
                   new List<AbstractCriterion>() { 
                       Expression.Eq("site", siteService.getCurrentSite()), 
                       Expression.Eq("option_key", name)
                   }.ToArray()
               );

            if (sdata != null) result = sdata.value;

            if (sdata != null && sdata.is_overwritable) {
                user_meta_data udata = ActiveRecordBase<user_meta_data>.FindOne(
                       new List<AbstractCriterion>() { 
                           Expression.Eq("_user", userService.getUserFull()), 
                           Expression.Eq("meta_key", name)
                       }.ToArray()
                   );

                if (udata != null) result = udata.value;
            }
            return result;
        }


        
    }
}
