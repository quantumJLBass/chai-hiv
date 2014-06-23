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
using Castle.ActiveRecord;
using System.Text;

using System.Collections.ObjectModel;
using System.Dynamic;
using System.Linq;
using System.Web.Script.Serialization;
using System.Collections.Specialized;
using HtmlAgilityPack;

#endregion

namespace stellar.Services {
    /// <summary> </summary>
    public class htmlService {


        #region(tests)
        /// <summary>
        /// Is there an external link or url in the text?
        /// </summary>
        /// <param name="html">String - html string to check against</param>
        /// <returns>Boolean - Return true if match</returns>
        /// <summary> </summary>
        public static bool has_external_link(String html) {
            Regex RgxUrl2 = new Regex(@"(http://)|(https://)", RegexOptions.IgnoreCase | RegexOptions.Multiline);
            return RgxUrl2.IsMatch(html);
        }

        /// <summary> </summary>
        public bool is_empty_url(String url) {
            return (url == String.Empty || url == "/" || url == "./");
        }

        /// <summary> </summary>
        public bool is_anchor(String url) {
            return url.Contains("#");
        }
        #endregion








        #region(String methods)

        /// <summary>
        /// add tabs where tabs can't be inserted var the UI
        /// </summary>
        /// <param name="n">Int - number of tabs to return</param>
        /// <returns>String - string of tab chars</returns>
        public static String tabs(int n) {
            return new String('\t', n);
        }

        /// <summary>
        /// add tabs where tabs can't be inserted var the UI
        /// </summary>
        /// <param name="source">String - String of html to work with</param>
        /// <param name="length">Int - number of tabs to return</param>
        /// <returns>String - Return formated and truncated</returns>
        /// @TODO use template for this and from site level options
        public static String truncate(String source, int length) {
            return truncate(source, length,"","");
        }
        /// <summary> </summary>
        /// <param name="source">String - String of html to work with</param>
        /// <param name="length">Int - number of tabs to return</param>
        /// <param name="wrap">String - Text that must have {$i} in it which the source will replace</param>
        /// <param name="more_txt">String - a string to append to the back of the source string (outside of wrap)</param>
        public static String truncate(String source, int length, String wrap, String more_txt) {
            if (source.Length > length) {
                source = source.Substring(0, length);
            }
            if (wrap.Contains("{$i}")) {
                source = wrap.Replace("{$i}", source);
            }
            if (!String.IsNullOrWhiteSpace(more_txt)) {
                source += more_txt;
            }
            return source;
        }


        //-jb || this will repeate str and {$i} is a the number pattern insertion
        /// <summary> </summary>
        public static String repeat_str(string str, int n) {
            if(n>0){
                StringBuilder sb = new StringBuilder(str.Length * n);
                for (int i = 0; i < n; i++) {
                    string tmp = "";
                    if (str.Contains("{$i}")) {
                        tmp = str.Replace("{$i}", "" + i);
                    } else {
                        tmp = str;
                    }
                    sb.Append(tmp);
                }
                str = sb.ToString();
            }
            return str;
        }
        /// <summary> </summary>
        public static string capitalize(string s) {
            // Check for empty string.
            if (string.IsNullOrEmpty(s)) {
                return string.Empty;
            }
            // Return char and concat substring.
            return char.ToUpper(s[0]) + s.Substring(1);
        }
        /// <summary> </summary>
        public static string capitalize_all(string s) {
            return Regex.Replace(s, @"\b[a-z]\w+", delegate(Match match) {
                string v = match.ToString();
                return char.ToUpper(v[0]) + v.Substring(1);
            });
        }

        /// <summary> </summary>
        public static String htmlSafeEscape(String str) {
            return str.Replace("&", "&amp;").Replace("\"", "&quot;").Replace("\'", "&apos;");
        }

        /// <summary> </summary>
        public static String Escape(String str) {
            return htmlSafeEscape(str).Replace("<", "&lt;").Replace(">", "&gt;");
        }
        const string HTML_TAG_PATTERN = "<.*?>";
        /// <summary> </summary>
        public static string StripHTML(string inputString) {
            return Regex.Replace
                (inputString, HTML_TAG_PATTERN, string.Empty);
        }

        /// <summary> </summary>
        public static string stripNonSenseContent(string inputString) {
            return stripNonSenseContent(inputString, false);
        }
        /// <summary> </summary>
        public static string stripNonSenseContent(string inputString, bool stripComments) {
            String output = Regex.Replace(inputString, @"<p>\s{0,}</p>", string.Empty);
            output = Regex.Replace(output, @"\t{1,}", " ");
            output = output.Replace('\t', ' ');
            output = Regex.Replace(output, @"\r\n{1,}", " ");
            output = Regex.Replace(output, @"=""\s{0,}(.*?)\s{0,}""", @"=""$1""");
            output = Regex.Replace(output, @"='\s{0,}(.*?)\s{0,}'", @"='$1'");
            output = Regex.Replace(output, @">\s{1,}<", @"><");//set for code with idea never presented in copy too
            if (stripComments) output = Regex.Replace(output, @"<!--(?!<!)[^\[>].*?-->", @"");
            //Just in case it's in type string
            output = output.Replace("\\r\\n", " ");
            output = output.Replace("\r\n", " ");
            output = output.Replace('\r', ' ');
            output = output.Replace('\n', ' ');
            //the retrun is for real.  clears both dos and machine carrage returns but not string
            output = output.Replace(@"
", "");
            output = Regex.Replace(output, @"\s{2,}", " ");
            return output;
        }
        /// <summary> </summary>
        public static string jsonEscape(string inputString) {
            String output = stripNonSenseContent(inputString);
            output = output.Replace("\"", @"\""");
            output = output.Replace("\\\"", "\"");
            return output;
        }

        #endregion

        /// <summary> </summary>
        public static String decodeString(String text) {
            StringWriter str = new StringWriter();
            HttpUtility.HtmlDecode(text, str);
            string decodedStr = str.ToString();
            return decodedStr;
        }
        /// <summary> </summary>
        public static String HtmlEncode(String value) {
            String tmp = value
                .Replace("&", "&amp;")
                .Replace("&&amp;", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#39;"); // &apos; does not work in IE 
            return tmp;
        }


        #region(html cleaning and filters)

        /// <summary> </summary>
        public static String stripAllHTMLElements(String str) {
            return StripTagsCharArray(str);
        }
        /// <summary>
        /// Remove HTML tags from string using char array.
        /// </summary>
        public static string StripTagsCharArray(string source) {
            char[] array = new char[source.Length];
            int arrayIndex = 0;
            bool inside = false;

            for (int i = 0; i < source.Length; i++) {
                char let = source[i];
                if (let == '<') {
                    inside = true;
                    continue;
                }
                if (let == '>') {
                    inside = false;
                    continue;
                }
                if (!inside) {
                    array[arrayIndex] = let;
                    arrayIndex++;
                }
            }
            return new string(array, 0, arrayIndex);
        }

        /*
        public static String stripHTMLElements(String str) {
            List<KeyValue> htmlElments = new List<KeyValue>();
            htmlElments.Add(new KeyValue("<div(.*?)>", "</div>"));
            htmlElments.Add(new KeyValue("<hr>", "<hr(.*?)/>"));
            htmlElments.Add(new KeyValue("<span(.*?)>", "</span>"));
            htmlElments.Add(new KeyValue("<h1(.*?)>", "</h1>"));
            htmlElments.Add(new KeyValue("<h2(.*?)>", "</h2>"));
            htmlElments.Add(new KeyValue("<h3(.*?)>", "</h3>"));
            htmlElments.Add(new KeyValue("<h4(.*?)>", "</h4>"));
            htmlElments.Add(new KeyValue("<h5(.*?)>", "</h5>"));
            htmlElments.Add(new KeyValue("<h6(.*?)>", "</h6>"));
            htmlElments.Add(new KeyValue("<table(.*?)>", "</table>"));
            htmlElments.Add(new KeyValue("<tr(.*?)>", "</tr>"));
            htmlElments.Add(new KeyValue("<td(.*?)>", "</td>"));
            htmlElments.Add(new KeyValue("<thead(.*?)>", "</thead>"));
            htmlElments.Add(new KeyValue("<tbody(.*?)>", "</tbody>"));
            htmlElments.Add(new KeyValue("<input(.*?)>", "<input(.*?)>"));
            htmlElments.Add(new KeyValue("<img(.*?)>", "<img(.*?)>"));

            for (int j = 0; j < htmlElments.Count - 1; j++) {
                str = Regex.Replace(str, htmlElments[j].Key, string.Empty, RegexOptions.IgnoreCase);
                str = Regex.Replace(str, htmlElments[j].Value, string.Empty, RegexOptions.IgnoreCase);
            }
            return str;
        }*/

        /// <summary> </summary>
        public static string clearMSWordFormating(String text) {
            return clearMSWordFormating(text, false);
        }
        /// <summary> </summary>
        public static string clearMSWordFormating(String text, Boolean verbosely) {

            //Cleans all manner of evils from the rich text editors in IE, Firefox, Word, and Excel
            // Only returns acceptable HTML, and converts line breaks to <br />
            // Acceptable HTML includes HTML-encoded entities.

            text = text.Replace("&" + "nbsp;", " ").Trim(); //concat here due to SO formatting
            // Does this have HTML tags?

            if (text.IndexOf("<") >= 0) {
                // Make all tags lowercase
                text = Regex.Replace(text, "<(?!img)[^>]+>", delegate(Match m) {
                    return m.ToString().ToLower();
                });
                // Filter out anything except allowed tags
                // Problem: this strips attributes, including href from a
                // http://stackoverflow.com/questions/307013/how-do-i-filter-all-html-tags-except-a-certain-whitelist
                string AcceptableTags = "i|b|u|sup|sub|ol|ul|li|br|hr|h2|h3|h4|h5|span|div|p|a|img|blockquote";
                string WhiteListPattern = "</?(?(?=" + AcceptableTags + @")notag|[a-zA-Z0-9]+)(?:\s[a-zA-Z0-9\-]+=?(?:([""']?).*?\1?)?)*\s*/?>";
                text = Regex.Replace(text, WhiteListPattern, "", RegexOptions.Compiled);
                // Make all BR/br tags look the same, and trim them of whitespace before/after
                text = Regex.Replace(text, @"\s*<br[^>]*>\s*", "<br />", RegexOptions.Compiled);
            }

            /*
            // No CRs
            text = text.Replace("\r", "");
            // Convert remaining LFs to line breaks
            text = text.Replace("\n", "<br />");
            // Trim BRs at the end of any string, and spaces on either side
            return Regex.Replace(text, "(<br />)+$", "", RegexOptions.Compiled).Trim();
            */
            text = Regex.Replace(text, @"line-height:\s*\d{0,}.?\d{0,}pt\s*;|px\s*;$", "", RegexOptions.Compiled);
            if (verbosely) text = Regex.Replace(text, @"vertical-align:\s*top\s*;$", "", RegexOptions.Compiled);

            //strip the color
            if (verbosely) text = Regex.Replace(text, @"color:\s*(\#[a-z0-9]+)\s*;", "", RegexOptions.Compiled);

            //remove the MS word css crap
            text = Regex.Replace(text, @"mso-(([a-z]+)?(-)?){0,}\s*?:\s*?\d+\w+\s*?;", "", RegexOptions.Compiled);
            /*HtmlAgilityPack.HtmlDocument doc = new HtmlAgilityPack.HtmlDocument();
            doc.LoadHtml(text);

            text = doc.DocumentNode.SelectNodes("//span[@*]")
                            .Select(s => s.InnerText)
                            .ToList().ToString();*/
            return text;
        }

        /// <summary> </summary>
        public static string cleanTinyCode(string text) {
            bool has = text.IndexOf("tinyImgHolder") >= 0;
            //<img class="tinyImgHolder" title="#Inline_Iamge(210 434 180 336 ' fLeft')" src="../media/download.castle?id=210&aeventsid=434&m=crop&w=180&h=336&pre=TMP" alt="imagingIt|210" width="180" height="336" />
            if (has) {
                string strRegex = @"<img(.*?)class=\""infotabTemplate(.*?)title=\""(.*?)\""(.*?)\/\>";
                RegexOptions myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.IgnorePatternWhitespace;
                Regex myRegex = new Regex(strRegex, myRegexOptions);
                text = myRegex.Replace(text, "${3}");
            }

            has = text.IndexOf("infotabTemplate") >= 0;
            //<img src="../Content/images/tinyMCE/template_whats_inside.png" rel="'+result[i].baseid+'" alt="'+result[i].alias+'" class="infotabTemplate" width="150" height="55" />
            if (has) {
                string wholeStrRegex = @".*?<img.*?class=\""infotabTemplate\"".*?alt=\""(.*?)\"".*?\/\>.*?$";
                RegexOptions myRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline | RegexOptions.IgnorePatternWhitespace;
                Regex myRegex = new Regex(wholeStrRegex, myRegexOptions);
                int id = 0;
                int.TryParse(myRegex.Replace(text, "${1}"), out id);
                if (id > 0) {
                    // infotabs_templates tmp = ActiveRecordBase<infotabs_templates>.Find(id);
                    string strRegex = @"<img.*?class=\""infotabTemplate\"".*?alt=\""(.*?)\"".*?\/\>";
                    myRegex = new Regex(strRegex, myRegexOptions);
                    // text = myRegex.Replace(text, tmp.content);
                }
            }
            return text;
        }


        #endregion



        /// <summary> </summary>
        public static string roughHtmlEncoder(string value) {
            // call the normal HtmlEncode first
            char[] chars = HttpUtility.HtmlEncode(value).ToCharArray();
            StringBuilder encodedValue = new StringBuilder();
            foreach (char c in chars) {
                /*if ((int)c > 127) // above normal ASCII
                    encodedValue.Append("&#" + (int)c + ";");
                else
                    encodedValue.Append(c);
                 * */
                encodedValue.Append("&#" + (int)c + ";");
            }
            return encodedValue.ToString();
        }


        /// <summary> </summary>
        public static String mailto(String strEmail) {
            String strNewAddress;
            String[] arrEmail;
            String strTag;

            strNewAddress = roughHtmlEncoder(strEmail);

            arrEmail = strNewAddress.Split(new string[] { "&#64;" }, StringSplitOptions.None);
		
	        strTag = "<script language=\"javascript\" type=\"text/javascript\">";
	        strTag += "<!--\r";
	        strTag += "document.write('<a href=\"mai');";
	        strTag += "document.write('lto');";
	        strTag += "document.write(':" + arrEmail[0] + "');";
	        strTag += "document.write('@');";
	        strTag += "document.write('" + arrEmail[1] + "\">');";
	        strTag += "document.write('" + arrEmail[0] + "');";
	        strTag += "document.write('@');";
	        strTag += "document.write('" + arrEmail[1]+"</a>');";
            strTag += "\r// -->";
	        strTag += "</script><noscript>" + arrEmail[0] + " at ";
	        strTag += arrEmail[1].Replace("&#46;"," dot ") + "</noscript>";
		
	         return strTag;
        }














        /*
        public string changeAllLinks(String html, Story story, String oldlink, String newlink) {
            String baseurl = "";
            if (story != null && story.Parent != null)
                baseurl = story.Parent.FullURL;
            String initialtext = html;
            HtmlAgilityPack.HtmlDocument htmlDoc = new HtmlAgilityPack.HtmlDocument();
            htmlDoc.LoadHtml(initialtext);
            HtmlAgilityPack.HtmlNodeCollection nodes = htmlDoc.DocumentNode.SelectNodes("//a");
            if (nodes != null && !String.IsNullOrEmpty(baseurl)) {
                for (int i = 0; i < nodes.Count; i++) {
                    HtmlAgilityPack.HtmlNode node = nodes[i];
                    HtmlAgilityPack.HtmlAttributeCollection attribs = node.Attributes;
                    for (int z = 0; z < attribs.Count; z++) {
                        string href = attribs[z].Value;
                        Uri uri = null;
                        if (attribs[z].Name == "href" && Uri.TryCreate(new Uri(baseurl), href, out uri)) {
                            if (!href.StartsWith("http") && !href.StartsWith("mailto") && !href.StartsWith("#")) {
                                href = uri.ToString();
                            }
                            href = makeInternalLinksRelative(href, story.Site);
                            oldlink = makeInternalLinksRelative(oldlink, story.Site);
                            if (href.ToLower() == oldlink.ToLower()) {
                                attribs[z].Value = newlink.ToLower();
                            }
                        }
                    }
                }
            }
            return htmlDoc.DocumentNode.InnerHtml;
        }

        public void changeAllLinks(String oldlink, String newlink) {
            changeAllLinksAction(oldlink, newlink);
            if (oldlink.Contains(" ")) {
                oldlink = oldlink.Replace(" ", "%20");
                changeAllLinksAction(oldlink, newlink);
            } else if (oldlink.Contains("%20")) {
                oldlink = oldlink.Replace("%20", "");
                changeAllLinksAction(oldlink, newlink);
            }
        }

        public void changeAllLinksAction(String oldlink, String newlink) {
            foreach (RegionText rt in ActiveRecordBase<RegionText>.FindAll()) {
                if (rt != null && rt.Revision != null && rt.Revision.Story != null) {
                    String newtext = changeAllLinks(rt.Text, rt.Revision.Story, oldlink, newlink);
                    if (newtext != rt.Text) {
                        rt.Text = newtext;
                        ActiveRecordMediator<RegionText>.Save(rt);
                        cacheService.clearCachedVersion(rt.Revision.Story.ResourceId);
                    }
                }
            }
        }

        public String makeInternalLinksRelative(String html, Site site) {
            foreach (SiteAlias alias in site.Aliases) {
                html = Regex.Replace(html, "(" + alias.Alias + ")", "/", RegexOptions.IgnoreCase);
            }
            html = Regex.Replace(html, "(" + site.URL + ")", "/", RegexOptions.IgnoreCase);
            return html;
        }
        */




        /// <summary> </summary>
        public bool PageIsExternal(String url, String sitebaseurl) {
            if (url.IndexOf("http") == -1) {
                return false;
            } else {
                String leftside = url.ToLower();
                String rightside = sitebaseurl.ToLower();  //crawlingurl.ToLower();
                leftside = leftside.Replace("www.", "");
                // for ehs
                //foreach(String site in "http://cmstest2.wsu.edu/,http://cs.ehs.wsu.edu/,http://ohs.ehs.wsu.edu/,http://labsafety.ehs.wsu.edu/,http://ph.ehs.wsu.edu/,http://training.ehs.wsu.edu/,http://operations.ehs.wsu.edu/".Split(','))
                //{
                //    if(leftside.Contains(site))
                //        return false;
                //}
                // normalize htm vs. html
                if (leftside.EndsWith("l"))
                    leftside.Substring(0, leftside.Length - 1);
                if (rightside.EndsWith("l"))
                    rightside.Substring(0, rightside.Length - 1);


                if (leftside.Contains(rightside))
                    return false;
                return true;
            }
        }



        // handle pages that returned text even though it was a 404
        /// <summary> </summary>
        public bool pageIsNice404(String text) {
            if (text.Contains("Oops! You have stumbled onto an invalid address."))
                return true;
            return false;
        }


        #region(url alteration)
        /// <summary> </summary>
        public string RelativePath(string url, String sitebaseurl) {
            return url.Replace(sitebaseurl, "");
        }

        /// <summary> </summary>
        public string RelativeFilePath(string url, String sitebaseurl) {
            String newurl = RelativePath(url, sitebaseurl);
            return newurl.Replace("/", "\\");
        }
        #endregion

        #region(url and path fitters)


        /// <summary>
        /// Fixes a path. Makes sure it is a fully functional absolute url.
        /// </summary>
        /// <param name="sitebaseurl"></param>
        /// <param name="originatingUrl">The url that the link was found in.</param>
        /// <param name="link">The link to be fixed up.</param>
        /// <returns>A fixed url that is fit to be fetched.</returns>
        public string AbsolutePath(String sitebaseurl, string originatingUrl, string link) {
            string formattedLink = String.Empty;
            if (link == "/")
                return originatingUrl;

            if (link.Contains("http"))
                return link;
            if (link.StartsWith("/")) {
                Uri uri = new Uri(new Uri(originatingUrl), link);
                return uri.ToString();
                //return originatingUrl + link.Substring(1);
            }
            if (link.IndexOf("../") > -1) {
                formattedLink = ResolveRelativePaths(link, originatingUrl);
            } else if (originatingUrl.IndexOf(sitebaseurl.ToString()) > -1
                  && link.IndexOf(sitebaseurl.ToString()) == -1) {
                formattedLink = originatingUrl.Substring(0, originatingUrl.LastIndexOf("/") + 1) + link;
            } else if (link.IndexOf(sitebaseurl.ToString()) == -1) {
                formattedLink = sitebaseurl.ToString() + link;
            }
            if (!formattedLink.Contains("http:")) {
                Uri uri = new Uri(new Uri(originatingUrl), formattedLink);
                return uri.ToString();
            }
            return formattedLink;
        }

        /// <summary>
        /// Needed a method to turn a relative path into an absolute path. And this seems to work.
        /// </summary>
        /// <param name="relativeUrl">The relative url.</param>
        /// <param name="originatingUrl">The url that contained the relative url.</param>
        /// <returns>A url that was relative but is now absolute.</returns>
        public string ResolveRelativePaths(string relativeUrl, string originatingUrl) {
            string resolvedUrl = String.Empty;

            string[] relativeUrlArray = relativeUrl.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            string[] originatingUrlElements = originatingUrl.Split(new char[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
            int indexOfFirstNonRelativePathElement = -1;
            // this only works if there is a non relative path element
            for (int i = 0; i <= relativeUrlArray.Length - 1; i++) {
                if (relativeUrlArray[i] != "..") {
                    indexOfFirstNonRelativePathElement = i;
                    break;
                }
            }

            // handle if there is no non-relative path element
            if (indexOfFirstNonRelativePathElement == -1)
                indexOfFirstNonRelativePathElement = relativeUrlArray.Length;

            int countOfOriginatingUrlElementsToUse = originatingUrlElements.Length - indexOfFirstNonRelativePathElement - 1;
            if (originatingUrl.EndsWith("/"))
                countOfOriginatingUrlElementsToUse += 1;
            for (int i = 0; i <= countOfOriginatingUrlElementsToUse - 1; i++) {
                if (originatingUrlElements[i] == "http:" || originatingUrlElements[i] == "https:")
                    resolvedUrl += originatingUrlElements[i] + "//";
                else
                    resolvedUrl += originatingUrlElements[i] + "/";
            }

            for (int i = 0; i <= relativeUrlArray.Length - 1; i++) {
                if (i >= indexOfFirstNonRelativePathElement) {
                    resolvedUrl += relativeUrlArray[i];

                    if (i < relativeUrlArray.Length - 1)
                        resolvedUrl += "/";
                }
            }

            // handle http://www.spokane.wsu.edu/Academics/Design/doctor
            String[] splitbyslash = resolvedUrl.Split('/');
            if (!splitbyslash[splitbyslash.Length - 1].Contains(".") && !resolvedUrl.EndsWith("/")) {
                resolvedUrl += "/";
            }

            return resolvedUrl;
        }


        /* this should be moved to the http services 
         ::start*/
        /// <summary> </summary>
        public static string GetAbsoluteUrlString(string baseUrl, string url) {
            var uri = new Uri(url, UriKind.RelativeOrAbsolute);
            if (!uri.IsAbsoluteUri)
                uri = new Uri(new Uri(baseUrl), uri);
            return uri.ToString();
        }

        /// <summary> </summary>
        public static string GetbaseUrl(string url) {
            Uri uriAddress = new Uri(url);
            return uriAddress.GetLeftPart(UriPartial.Authority);
        }
        /*end*/

        /// <summary> </summary>
        public static string filter_file_images_paths(string text, string url) {
            return filter_file_images_paths(text, url, new String[] {"jpg","gif","png","woff","ttf","svg#webfont","svg","eot","eot?"} );
        }
        /// <summary> </summary>
        public static string filter_file_images_paths(string text, string url, String[] included_ext) {

            Boolean has_body_end = false;
            string bodysrtRegex = @"url\(";
            RegexOptions bodyRegexOptions = RegexOptions.IgnoreCase | RegexOptions.Multiline;
            Regex bodyRegex = new Regex(bodysrtRegex, bodyRegexOptions);
            has_body_end = bodyRegex.IsMatch(text);
            if (has_body_end) {
                string body_pattern = @"(?<target>url\((?<url>(.*?))\))";
                MatchCollection body_matches = Regex.Matches(text, body_pattern);
                foreach (Match matched in body_matches) {
                    String body = matched.Groups["target"].Value;
                    String org_url = matched.Groups["url"].Value;
                    org_url = Regex.Replace(org_url, @"\.\./", "");
                    org_url = org_url.Trim('"').Trim('\'').Replace("~/", "").Trim('/');
                    if ( org_url.IndexOf("http") < 0 && included_ext.Contains( org_url.Split('.')[1] ) ) {
                        String[] tmp = org_url.Split(new String[] { "images/" }, StringSplitOptions.None);
                        String[] tmpurl = url.Split(new String[] { "/images" }, StringSplitOptions.None);
                        String urlpath = tmpurl[0].TrimEnd('/') + "/images/" + tmp[tmp.Length - 1];
                        if (httpService.is_url_online(urlpath)){
                            text = text.Replace(body, "url(" + urlpath + ")");
                        }
                    }
                    
                }
            }
            return text;
        }





        #endregion





        #region( agai)

        /// <summary> </summary>
        public static void normalizUrls(HtmlNode root, string baseUrl, string attrName) {
            var query =
                from node in root.Descendants()
                let attr = node.Attributes[attrName]
                where attr != null
                select attr;
            foreach (var attr in query) {
                var url = GetAbsoluteUrlString(baseUrl, attr.Value);
                attr.Value = url;
            }
        }

        /// <summary> </summary>
        public static void stripJavasctipt(HtmlNode root, string baseUrl, string attrName) {
            var query =
                from node in root.Descendants()
                let attr = node.Attributes[attrName]
                where attr != null
                select attr;
            foreach (var attr in query) {
                var url = GetAbsoluteUrlString(baseUrl, attr.Value);
                attr.Value = url;
            }
        }






        /// <summary> </summary>
        static List<string> _notToRemove;

        /// <summary> </summary>
        public static void RemoveEmptyNodes(HtmlNode tag) {
            if (tag.Attributes.Count == 0 && !_notToRemove.Contains(tag.Name) && String.IsNullOrWhiteSpace(tag.InnerText)) {
                tag.Remove();
            } else {
                for (int i = tag.ChildNodes.Count - 1; i >= 0; i--) {
                    RemoveEmptyNodes(tag.ChildNodes[i]);
                }
            }
        }

        #endregion



















    }
}
