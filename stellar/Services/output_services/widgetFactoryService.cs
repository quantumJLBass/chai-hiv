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
    public class widgetFactoryService {



        /// <summary> </summary>
        public static Boolean method_exists(String method) {
            MethodInfo[] methodInfos = Type.GetType("stellar.Services.widgetFactoryService").GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.Instance);
            foreach (MethodInfo item in methodInfos) {
                String name = item.Name;
                if (name == "" + method) return true;
            }
            return false;
        }
        /// <summary> </summary>
        public static dynamic reference_method(String method) {
            string[] parameters = { };
            return reference_method(method, parameters);
        }
        /// <summary> </summary>
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
        /// <summary> </summary>
        public static String fech(String url) {
            return httpService.GetPageAsString(new Uri(url));
        }

        /// <summary> </summary>
        public static String mailto(String email) {
            return htmlService.mailto(email);
        }

        /// <summary> </summary>
        public static String strip(String text) {
            return htmlService.stripAllHTMLElements(text);
        }

        /// <summary> </summary>
        public static String clearMSWordFormating(String text) {
            return htmlService.clearMSWordFormating(text);
        }

        /// <summary> </summary>
        public static String encodeHtml(String text) {
            return htmlService.HtmlEncode(text);
        }


        /// <summary> </summary>
        public static String[] explode(String csv) {
            return objectService.explode(csv);
        }




        /// <summary> </summary>
        public static String tabs(int n) {
            return htmlService.tabs(n);
        }

        /// <summary> </summary>
        public static String truncate(string text, int length) {
            return htmlService.truncate(text, length);
        }

        /// <summary> </summary>
        public static String capitalize(string text) {
            return htmlService.capitalize(text);
        }

        /// <summary> </summary>
        public static String repeatStr(string text, int n) {
            return htmlService.repeat_str(text, n);
        }

        /// <summary> </summary>
        public static String condense(string text, bool stripComments) {
            return htmlService.stripNonSenseContent(text, stripComments);
        }

        /// <summary> </summary>
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























        /// <summary> </summary>
        public static String skin_image_path() {
            return themeService.theme_skin_url("images");
        }



























    }
}
