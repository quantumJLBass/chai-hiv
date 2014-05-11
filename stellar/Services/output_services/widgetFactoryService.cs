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
    public class widgetFactoryService {



        public static Boolean method_exists(String method) {
            MethodInfo[] methodInfos = Type.GetType("stellar.Services.widgetFactoryService").GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance);
            foreach (MethodInfo item in methodInfos) {
                String name = item.Name;
                if (name == "" + method) return true;
            }
            return false;
        }
        public static dynamic reference_method(String method) {
            string[] parameters = { };
            return reference_method(method, parameters);
        }
        public static dynamic reference_method(String method, string[] parameters) {
            // Get MethodInfo.
            Type type = typeof(widgetFactoryService);
            MethodInfo info = type.GetMethod(method);

            // Loop over parameters.
            foreach (string parameter in parameters) {
                return info.Invoke(null, new object[] { parameter });
            }
            return false;
        }



        /* goal here is that we would have extendable plugin style utillies*/
        public static String fech(String url) {
            return httpService.GetPageAsString(new Uri(url));
        }

        public static String mailto(String email) {
            return htmlService.mailto(email);
        }

        public static String strip(String text) {
            return htmlService.stripAllHTMLElements(text);
        }

        public static String clearMSWordFormating(String text) {
            return htmlService.clearMSWordFormating(text);
        }

        public static String encodeHtml(String text) {
            return htmlService.HtmlEncode(text);
        }


        public static String[] explode(String csv) {
            return objectService.explode(csv);
        }
        


        
        public static String tabs(int n) {
            return htmlService.tabs(n);
        }

        public static String truncate(string text, int length) {
            return htmlService.truncate(text, length);
        }

        public static String capitalize(string text) {
            return htmlService.capitalize(text);
        }

        public static String repeatStr(string text, int n) {
            return htmlService.repeat_str(text, n);
        }

        public static String condense(string text, bool stripComments) {
            return htmlService.stripNonSenseContent(text, stripComments);
        }

        public static int math(int x, int y, String action, String asign) {
            int result = 0;
            switch(action){
                case("-"):
                    result = x - y;
                    break;
                case ("+"):
                    result = x + y;
                    break;
            }

            Controllers.BaseController.sodo_PropertyBag.Add("test","result");


            return result;
        }























        public static String skin_image_path() {
            return themeService.theme_skin_url("images");
        }



























    }
}
