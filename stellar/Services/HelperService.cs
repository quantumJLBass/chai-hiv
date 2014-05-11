#region Directives
using System;
using System.Data;
using System.Globalization;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using stellar.Models;
using NVelocity;
using NVelocity.App;
using NVelocity.App.Events;
using NVelocity.Util;
using NVelocity.Tool;
using NVelocity.Context;
using NVelocity.Runtime;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
//using MonoRailHelper;
using System.Xml;
using Commons.Collections;
using System.Collections;
using log4net;
using log4net.Config;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using Castle.MonoRail.Framework;

using stellar.Controllers;
using System.Dynamic;
using System.Linq;
using Omu.ValueInjecter;
using AutoMapper;

#endregion

namespace stellar.Services {

    public class helperService {
        ILog log = log4net.LogManager.GetLogger("HelperService");

        public static String CalculateMD5Hash(string input) {
            // step 1, calculate MD5 hash from input
            MD5 md5 = MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);

            // step 2, convert byte array to hex string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hash.Length; i++) {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }
        public static String convertHexToARGB(String hex, String Alpha) {

            System.Drawing.Color col = System.Drawing.ColorTranslator.FromHtml(hex);
            String argb = col.ToArgb().ToString();


            return argb;
        }

        public static object[] alias_exsits(String alias, String typeName) {
            object[] temp = new object[] { };
            try {
                /*
                 * the switch should be reeventsd.  There has to be a way to 
                 * make the class for ActiveRecordBase<> be called by 
                 * (string)name 
                 */
                string type = typeName.Replace("Controller", "");
                switch (type) {
                    case "events": {
                            temp = ActiveRecordBase<posting>.FindAllByProperty("alias", alias); break;
                        }
                }
            } catch { }

            return temp;
        }

        public DateTime date_return(int i) {
            return DateTime.Now.AddDays(i);
        }


    }

}
