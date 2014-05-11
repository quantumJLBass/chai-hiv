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
using System.Globalization;
using System.Xml;
#endregion

namespace stellar.Services {
    public class validationService {
        bool invalid = false;








        #region(user data)

        public bool IsValidEmail(string strIn) {
            invalid = false;
            if (String.IsNullOrEmpty(strIn))
                return false;

            // Use IdnMapping class to convert Unicode domain names.
            strIn = Regex.Replace(strIn, @"(@)(.+)$", this.DomainMapper);
            if (invalid)
                return false;

            // Return true if strIn is in valid e-mail format.
            return Regex.IsMatch(strIn,
                   @"^(?("")(""[^""]+?""@)|(([0-9a-z]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z])@))" +
                   @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z][-\w]*[0-9a-z]*\.)+[a-z0-9]{2,17}))$",
                   RegexOptions.IgnoreCase);
        }

        private string DomainMapper(Match match) {
            // IdnMapping class with default property values.
            IdnMapping idn = new IdnMapping();

            string domainName = match.Groups[2].Value;
            try {
                domainName = idn.GetAscii(domainName);
            } catch (ArgumentException) {
                invalid = true;
            }
            return match.Groups[1].Value + domainName;
        }

        public bool isEmail(string inputEmail) {
            string pattern = @"^(?!\.)(""([^""\r\\]|\\[""\r\\])*""|"
              + @"([-a-z0-9!#$%&'*+/=?^_`{|}~]|(?<!\.)\.)*)(?<!\.)"
              + @"@[a-z0-9][\w\.-]*[a-z0-9]\.[a-z][a-z\.]*[a-z]$";
            Regex regex = new Regex(pattern, RegexOptions.IgnoreCase);
            if (regex.IsMatch(inputEmail)) {
                return (true);
            } else {
                return (false);
            }
        }
        #endregion

        #region(is human tests)
        public bool passedCaptcha(String Asirra_Ticket) {
            XmlDocument doc = new XmlDocument();
            doc.Load(@"http://challenge.asirra.com/cgi/Asirra?action=ValidateTicket&ticket=" + Asirra_Ticket);
            //String Result = doc.GetElementsBytagsName("Result")[0].Value;
            String Result = "";
            if (Result == "Fail") {
                return false;
            }
            return true;
        }
        #endregion

        #region(socialnetwork checks)

        public bool passedHasFb(String uid, String accessToken) {
            /*
             * FIX THIS SO CHECK IF TRUE
             * 
             * XmlDocument doc = new XmlDocument();
            doc.Load(@"http://graph.facebook.com/" + uid);
            String Result = doc.GetElementsByTagName("Result")[0].Value;
            if (Result == "Fail")
            {
                return false;
            }*/

            //look to this as the format of what is retruned
            /*
               {
                   "id": "1330497256",
                   "name": "Jeremy Bass",
                   "first_name": "Jeremy",
                   "last_name": "Bass",
                   "link": "http://www.facebook.com/jeremy.bass2",
                   "username": "jeremy.bass2",
                   "gender": "male",
                   "locale": "en_US"
                }
             */

            return true;
        }
        #endregion


    }
}
