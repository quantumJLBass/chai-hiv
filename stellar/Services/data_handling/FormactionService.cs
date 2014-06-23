#region Directives
using stellar.Models;
using stellar.Services;

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
#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class formactionService {

        /// <summary>
        /// Is the checksome a match?
        /// </summary>
        /// <param name="post">object posting - a posting object to pull the checksum from</param>
        /// <param name="poststr">String - checksum string to check against</param>
        /// <returns>Boolean - Return true if match</returns>
        public static Boolean form_entry_match(posting post, String poststr) {
            return post.checksum == helperService.CalculateMD5Hash(poststr);
        }




    }
}
