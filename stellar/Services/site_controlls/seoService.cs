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
using System.Xml.Linq;
using System.Linq;
#endregion

namespace stellar.Services {

    /// <summary> </summary>
    public class seoService {

        /// <summary> </summary>
        public static Boolean regen_sitemap(String content) { return regen_sitemap("", content); }
        /// <summary> </summary>
        public static Boolean regen_sitemap(String location, String content) {
            if (String.IsNullOrWhiteSpace(location)) location = "/";
            file_handler.write_to_file(file_info.root_path() + location.Trim('/') + "/sitemap.xml", content);

            return true;

        }



        /// <summary> </summary>
        public static Boolean regen_robots_txt(String content) { return regen_robots_txt("", content); }
        /// <summary> </summary>
        public static Boolean regen_robots_txt(String location, String content) {
            if (String.IsNullOrWhiteSpace(location)) location = "/";
            file_handler.write_to_file(file_info.root_path() + location.Trim('/') + "/robots.txt", content);

            return true;

        }






        /// <summary> </summary>
        public static String getGAAnalytics() {

            string queryString = String.Format("https://www.google.com/accounts/ClientLogin?accountType=GOOGLE&Email={0}&Passwd={1}&service=analytics&source={2}", "user@gmail.com", "fff!", "http://domain.xxx");

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(queryString);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

            string responseContent = new StreamReader(response.GetResponseStream()).ReadToEnd();
            string authCode = responseContent.Substring(responseContent.LastIndexOf("Auth=") + 5);

            queryString = "https://www.googleapis.com/analytics/v2.4/management/accounts/~all/webproperties/~all/profiles";

            request = (HttpWebRequest)WebRequest.Create(queryString);

            request.Headers.Add("Authorization", String.Format("GoogleLogin auth={0}", authCode));
            response = (HttpWebResponse)request.GetResponse();

           


           
            XDocument doc = XDocument.Load(new StreamReader(response.GetResponseStream()));
            XNamespace dxp = doc.Root.GetNamespaceOfPrefix("dxp");
            XNamespace dns = doc.Root.GetDefaultNamespace();
            String returning = new StreamReader(response.GetResponseStream()).ToString();
            return returning;
            /*var entries = (from item in doc.Root.Elements("{http://www.w3.org/2005/Atom}entry")
            select new {
                tableid = item.Elements("{http://schemas.google.com/analytics/2009}property").ElementAt(4).Attribute("value").Value,
                //tableid = item.Element(dxp + "tableid").Value,
                accountId = item.Elements(dxp + "property")
                                .Where(x => x.Attribute("name")
                                .Value == "ga:accountId")
                                .First()
                                .Attribute("value").Value,
                profileid = item.Elements("{http://schemas.google.com/analytics/2009}property")
                                .ElementAt(1)
                                .Attribute("value").Value,
                accountname = item.Elements(dxp + "property")
                                    .Where(x => x.Attribute("name")
                                    .Value == "ga:accountName")
                                    .First()
                                    .Attribute("value").Value,
                webpropertyid = item.Elements("{http://schemas.google.com/analytics/2009}property")
                                    .ElementAt(1)
                                    .Attribute("value").Value,
                title = item.Element(dns + "title").Value
            });
            var es = from i in doc.Root.Elements("{http://www.w3.org/2005/Atom}entry") select i;
            var ie = from iy in entries where iy.accountname == "5085964" select iy;
            */
        }

        /// <summary> </summary>
        private void doGoals() {
            string queryString = String.Format("https://www.google.com/accounts/ClientLogin?accountType=GOOGLE&Email={0}&Passwd={1}&service=analytics&source={2}", "goo...@domain.com", "password", "BoWeb");

            HttpWebRequest request = (HttpWebRequest)WebRequest.Create(queryString);
            HttpWebResponse response = (HttpWebResponse)request.GetResponse();

            string responseContent = new StreamReader(response.GetResponseStream()).ReadToEnd();
            string authCode = responseContent.Substring(responseContent.LastIndexOf("Auth=") + 5);

            queryString = "https://www.googleapis.com/analytics/v2.4/management/accounts/5085964/webproperties/UA-5085964-1/profiles/10252202/goals";
            request = (HttpWebRequest)WebRequest.Create(queryString);
            request.Headers.Add("Authorization", String.Format("GoogleLogin auth={0}", authCode));
            response = (HttpWebResponse)request.GetResponse();
            XDocument doc = XDocument.Load(new StreamReader(response.GetResponseStream()));
        }


    }
}
