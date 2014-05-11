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
using System.Text;
using System.Security.Cryptography.X509Certificates;
using System.Net.Security;
using log4net;
using HtmlAgilityPack;
using System.Collections.Specialized;
using System.Drawing;
#endregion

namespace stellar.Services {
    public class httpService {
        ILog log = log4net.LogManager.GetLogger("HTTPService");
        logger logService = new logger();
        cacheService cacheService = new cacheService();



        /// <summary>
        /// Gets the base url from the url passed in.
        /// </summary>
        /// <param name="url">String - url string to pull from</param>
        /// <returns>String - Return the domain.tld of a uri</returns>
        public static String getbaseUrl(string url) {
            Uri uriAddress = new Uri(url);
            return uriAddress.GetLeftPart(UriPartial.Authority);
        }

        /// <summary>
        /// Gets the base url from the current url location.
        /// </summary>
        /// <returns>String - Return the domain.tld of a uri</returns>
        public static String getCurrentBaseURL(){
            return getbaseUrl(System.Web.HttpContext.Current.Request.Url.AbsoluteUri);
        }

        /// <summary>
        /// Gets the base url from the current url location.
        /// </summary>
        /// <returns>String - Return the domain.tld of a uri</returns>
        public static string getRootUrl() {
            String root = "";
            if (!System.Web.HttpContext.Current.Request.IsLocal) {
                root = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.PathAndQuery, "/"); //"http://map.wsu.edu/";
            } else {
                root = System.Web.HttpContext.Current.Request.Url.AbsoluteUri.Replace(System.Web.HttpContext.Current.Request.Url.PathAndQuery, "/");
            }
            return root;
        }

        /// <summary>
        /// Grab all the parameters from a url.
        /// </summary>
        /// <returns>Dictionary<string, string> - Return a key and value Dictionary of the name  value pair of a url query</returns>
        public static Dictionary<string, string> getUrlParmas_obj() {
            String everUrl = System.Web.HttpContext.Current.Request.RawUrl;
            // URL comes in like http://sitename/edit/dispatch/handle404.castle?404;http://sitename/pagetorender.html
            // So strip it all out except http://sitename/pagetorender.html
            everUrl = Regex.Replace(everUrl, "(.*:80)(.*)", "$2");
            everUrl = Regex.Replace(everUrl, "(.*:443)(.*)", "$2");
            String urlwithnoparams = Regex.Replace(everUrl, @"(.*?)(\?.*)", "$1");
            String querystring = Regex.Replace(everUrl, @"(.*?)(\?.*)", "$2");

            return getUrlQueries(urlwithnoparams,querystring);
        }

        public static Dictionary<string, string> getUrlQueries(String urlwithnoparams, String querystring) {
            Dictionary<string, string> queryparams = new Dictionary<string, string>();
            if (urlwithnoparams != querystring) {
                foreach (string kvp in querystring.Split(',')) {
                    var tmp = kvp;
                    if (kvp.StartsWith("?")) tmp = kvp.TrimStart('?');
                    queryparams.Add(tmp.Split('=')[0], tmp.Split('=')[1]);
                }
            }
            return queryparams;
        }

        /// <summary>
        /// Check to see if the url is there
        /// </summary>
        /// <param name="url">Target url, fire</param>
        /// <returns></returns>
        public static Boolean is_url_online(String url){
            try {
                HttpWebRequest request = WebRequest.Create(url) as HttpWebRequest;
                request.Method = "HEAD";
                HttpWebResponse response = request.GetResponse() as HttpWebResponse;

                return response.StatusCode.Equals(response.StatusCode.Equals(HttpStatusCode.OK));
            } catch (Exception loi) {
                return false;
            }
        }


        /// <summary>
        /// Grab all the parameters from a POST.
        /// </summary>
        /// <returns>Dictionary<string, string> - Return a key and value Dictionary of the name  value pair of a POST</returns>
        public static Dictionary<string, string> getPostParmas_obj() {
            Dictionary<string, string> queryparams = new Dictionary<string, string>();
            foreach (String key in System.Web.HttpContext.Current.Request.Form.AllKeys) {
                queryparams.Add(key, System.Web.HttpContext.Current.Request.Form[key]);
            }
            return queryparams;
        }
        public static Dictionary<string, string> getPostParmasAsObj_obj(string name) {
            Dictionary<string, string> queryparams = new Dictionary<string, string>();
            foreach (String key in System.Web.HttpContext.Current.Request.Form.AllKeys) {
                if (key.StartsWith(name)) {
                    queryparams.Add(key.Split('.')[1], System.Web.HttpContext.Current.Request.Form[key]);
                }
            }
            return queryparams;
        }
        public static Dictionary<string, string> get_request_parmas_obj() {
            Dictionary<string, string> queryparams = new Dictionary<string, string>();
            foreach (String key in System.Web.HttpContext.Current.Request.Params.AllKeys) {
                queryparams.Add(key, System.Web.HttpContext.Current.Request.Params[key]);
            }
            return queryparams;
        }
        public static string get_request(string name) {
            string queryparams = "";
            foreach (String key in System.Web.HttpContext.Current.Request.Form.AllKeys) {
                if (key.StartsWith(name)) {
                    queryparams = System.Web.HttpContext.Current.Request.Form[key];
                }
            }
            return queryparams;
        }


        /// <summary>
        /// Get a string of the response from a url.
        /// </summary>
        /// <param name="address">The address you wish to capture</param>
        /// <returns>String - the content of a url without the javascript and all urls normalized to be absolute to the url the content come from</returns>
        public static string GetPageAsString(Uri address) {
            string result = "";
            String path = System.Web.HttpContext.Current.Server.UrlDecode(address.ToString());
            // Create the web request   
            HttpWebRequest request = WebRequest.Create(address) as HttpWebRequest;

            // Get response   
            using (HttpWebResponse response = request.GetResponse() as HttpWebResponse) {
                // Get the response stream   
                StreamReader reader = new StreamReader(response.GetResponseStream());

                // Read the whole contents and return as a string   
                result = reader.ReadToEnd();
            }

            HtmlDocument doc = new HtmlDocument();
            doc.LoadHtml(result);
            try {
                foreach (HtmlNode tag in doc.DocumentNode.SelectNodes("//script")) {
                    tag.Remove();
                }
            } catch { }
            try {
                
                var selectedNodes = doc.DocumentNode.SelectNodes("//*");
                foreach (var node in selectedNodes) {
                    htmlService.normalizUrls(node, path, "href");
                    htmlService.normalizUrls(node, path, "src");
                }
            } catch { }

            result = doc.DocumentNode.InnerHtml.ToString();
            result = htmlService.filter_file_images_paths(result, path);

            return result;
        }


        /// <summary>
        /// Copies a stream into a new steam for manipulation
        /// </summary>
        /// <param name="input">The Stream to copy</param>
        /// <param name="output">The Stream to recive the copy</param>
        /// <returns>void - This will only copy a stream to another stream already created</returns>
        public static void CopyStream(Stream input, Stream output) {
            byte[] buffer = new byte[32768];
            int read;
            while ((read = input.Read(buffer, 0, buffer.Length)) > 0) {
                output.Write(buffer, 0, read);
            }
        }

        /* this should be changed so that it's a file and the output is changed to the image or what have you */
        /// <summary>
        /// Copies an image file from a url to a Image type object for manipulation
        /// </summary>
        /// <param name="_URL">The url of the image you wish to capture</param>
        /// <returns>Image - This will creat a Object typed as Image for manipulation</returns>
        public static Image DownloadImage(string _URL) {
            Image _tmpImage = null;

            try {
                // Open a connection
                System.Net.HttpWebRequest _HttpWebRequest = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(_URL);

                _HttpWebRequest.AllowWriteStreamBuffering = true;

                // You can also specify additional header values like the user agent or the referer: (Optional)
                _HttpWebRequest.UserAgent = "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)";
                _HttpWebRequest.Referer = "http://www.google.com/";

                // set timeout for 20 seconds (Optional)
                _HttpWebRequest.Timeout = 20000;

                // Request response:
                System.Net.WebResponse _WebResponse = _HttpWebRequest.GetResponse();

                // Open data stream:
                System.IO.Stream _WebStream = _WebResponse.GetResponseStream();

                // convert webstream to image
                _tmpImage = Image.FromStream(_WebStream);

                // Cleanup
                _WebResponse.Close();
                _WebResponse.Close();
            } catch (Exception _Exception) {
                // Error
                Console.WriteLine("Exception caught in process: {0}", _Exception.ToString());
                return null;
            }

            return _tmpImage;
        }


        /// <summary>
        /// POST a file to a url with optional params
        /// </summary>
        /// <param name="url">The url of where the file you wish to upload is to go</param>
        /// <param name="file">The file path of the file you with to POST</param>
        /// <param name="paramName">The parameter name of the file</param>
        /// <param name="contentType">the content type of the file in "text/plain" for a foo.txt file</param>
        /// <param name="nvc">Additional POST Data</param>
        /// <returns>String - the respones of the file post to the url</returns>
        public static String HttpUploadFile(string url, string file, string paramName, string contentType, NameValueCollection nvc) {
            //log.Debug(string.Format("Uploading {0} to {1}", file, url));
            string boundary = "---------------------------" + DateTime.Now.Ticks.ToString("x");
            byte[] boundarybytes = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "\r\n");

            HttpWebRequest wr = (HttpWebRequest)WebRequest.Create(url);
            wr.ContentType = "multipart/form-data; boundary=" + boundary;
            wr.Method = "POST";
            wr.KeepAlive = true;
            wr.Credentials = System.Net.CredentialCache.DefaultCredentials;

            Stream rs = wr.GetRequestStream();

            string formdataTemplate = "Content-Disposition: form-data; name=\"{0}\"\r\n\r\n{1}";
            foreach (string key in nvc.Keys) {
                rs.Write(boundarybytes, 0, boundarybytes.Length);
                string formitem = string.Format(formdataTemplate, key, nvc[key]);
                byte[] formitembytes = System.Text.Encoding.UTF8.GetBytes(formitem);
                rs.Write(formitembytes, 0, formitembytes.Length);
            }
            rs.Write(boundarybytes, 0, boundarybytes.Length);

            string headerTemplate = "Content-Disposition: form-data; name=\"{0}\"; filename=\"{1}\"\r\nContent-Type: {2}\r\n\r\n";
            string header = string.Format(headerTemplate, paramName, file, contentType);
            byte[] headerbytes = System.Text.Encoding.UTF8.GetBytes(header);
            rs.Write(headerbytes, 0, headerbytes.Length);

            FileStream fileStream = new FileStream(file, FileMode.Open, FileAccess.Read);
            byte[] buffer = new byte[4096];
            int bytesRead = 0;
            while ((bytesRead = fileStream.Read(buffer, 0, buffer.Length)) != 0) {
                rs.Write(buffer, 0, bytesRead);
            }
            fileStream.Close();

            byte[] trailer = System.Text.Encoding.ASCII.GetBytes("\r\n--" + boundary + "--\r\n");
            rs.Write(trailer, 0, trailer.Length);
            rs.Close();

            WebResponse wresp = null;
            try {
                wresp = wr.GetResponse();
                Stream stream2 = wresp.GetResponseStream();
                StreamReader reader2 = new StreamReader(stream2);
                String wantedData = reader2.ReadToEnd().ToString();
                return wantedData;

                //log.Debug(string.Format("File uploaded, server response is: {0}", reader2.ReadToEnd()));

            } catch (Exception ex) {
                log4net.LogManager.GetLogger("hhtpService").Error("Error uploading file", ex);
                if (wresp != null) {
                    wresp.Close();
                    wresp = null;
                }
                return "false";

            } finally {
                wr = null;
            }
            //return "false";
        }

        public static byte[] DownloadBinary(string url) {
            byte[] file;
            using (WebClient wc = new WebClient()) {
                wc.Headers.Add("user-agent", "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)");
                file = wc.DownloadData(url);
            }

            //webRequest.UserAgent = "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)";
            return file;
        }


        public static String get_post_str(){
            //Page.Response.ContentType = "application/x-www-form-urlencoded"; 
            StreamReader sr = new StreamReader(System.Web.HttpContext.Current.Request.InputStream);
            string main = System.Web.HttpContext.Current.Server.UrlDecode(sr.ReadToEnd());
            return main;
        }




        public string HttpPost(string uri, string parameters, String referrer) {
            return HttpAction(uri, parameters, "POST", referrer);
        }

        public string HttpGetWithCache(string uri, string parameters, String referrer) {
            String cache = "";// cacheService.getCacheContents(uri + parameters) as String;
            if (cache == null)
                return cache;
            String result = HttpAction(uri, parameters, "GET", referrer);
            if (result == null) {
                log.Info("webget returned null");
                result = "";
            }
            //cacheService.setCacheContents(uri + parameters, result);
            return result;
        }

        public string HttpGet(string uri, string parameters, String referrer) {
            return HttpAction(uri, parameters, "GET", referrer);
        }

        // callback used to validate the certificate in an SSL conversation
        private static bool ValidateRemoteCertificate(
        object sender,
            X509Certificate certificate,
            X509Chain chain,
            SslPolicyErrors policyErrors
        ) {
            bool ignoresslerrors = true;
            if (Convert.ToBoolean(ignoresslerrors)) {
                // allow any old dodgy certificate...
                return true;
            } else {
                return policyErrors == SslPolicyErrors.None;
            }
        }

        public string HttpAction(string uri, string parameters, String method, String referrer) {
            if (HttpContext.Current.Cache[uri + parameters] != null)
                return HttpContext.Current.Cache[uri + parameters] as String;

            if (uri == HttpContext.Current.Request.Url.AbsoluteUri)
                return null;

            CookieContainer cookiecontainer = new CookieContainer();
            if (HttpContext.Current != null && HttpContext.Current.Session != null)
                cookiecontainer = HttpContext.Current.Session["cookiecontainer"] as CookieContainer;
            if (cookiecontainer == null)
                cookiecontainer = new CookieContainer();
            HttpWebRequest webRequest = (HttpWebRequest)HttpWebRequest.Create(uri);
            if (method == "POST")
                webRequest.ContentType = "application/x-www-form-urlencoded";
            webRequest.Method = method;
            //webRequest.ContentType = "text/xml; charset=iso-8859-1";
            if (uri.Contains("https://") && method == "GET") {
                // allows for validation of SSL conversations
                ServicePointManager.ServerCertificateValidationCallback += new RemoteCertificateValidationCallback(
                    ValidateRemoteCertificate
                );
            }
            webRequest.Timeout = 60000;
            webRequest.CookieContainer = cookiecontainer;
            webRequest.UserAgent = "Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 5.1)";
            if (HttpContext.Current.Request.UrlReferrer != null && String.IsNullOrEmpty(referrer))
                referrer = HttpContext.Current.Request.UrlReferrer.ToString();

            webRequest.Referer = referrer;
            WebHeaderCollection myWebHeaderCollection = webRequest.Headers;
            //Add the Accept-Language header (for Danish) in the request.
            myWebHeaderCollection.Add("Accept-Charset: utf8");

            byte[] bytes = Encoding.ASCII.GetBytes(parameters);
            String errorText = null;
            Stream os = null;
            if (method == "POST") {
                try {
                    // send the Post
                    webRequest.ContentLength = bytes.Length;   //Count bytes to send
                    os = webRequest.GetRequestStream();
                    os.Write(bytes, 0, bytes.Length);         //Send it
                } catch (WebException ex) {
                    Console.Write(ex.Message, "HttpPost: Request error");
                } finally {
                    if (os != null) {
                        os.Close();
                    }
                }
            }
            try { // get the response
                WebResponse webResponse = webRequest.GetResponse();
                if (webResponse == null) { return null; }
                Encoding enc = Encoding.UTF8;
                StreamReader sr = new StreamReader(webResponse.GetResponseStream(), enc);
                if (HttpContext.Current.Session != null)
                    HttpContext.Current.Session["cookiecontainer"] = cookiecontainer;
                String results = sr.ReadToEnd().Trim();
                HttpContext.Current.Cache[uri + parameters] = results;
                return results;
            } catch (WebException e) {
                log.Error("URL: " + uri + parameters + "     This program is expected to throw WebException on successful run." +
                    "\n\nException Message :" + e.Message);
                if (e.Status == WebExceptionStatus.ProtocolError) {
                    HttpWebResponse response = ((HttpWebResponse)e.Response);
                    Console.WriteLine("Status Code : {0}", response.StatusCode);
                    Console.WriteLine("Status Description : {0}", response.StatusDescription);

                    try {
                        using (Stream stream = response.GetResponseStream()) {
                            using (StreamReader reader = new StreamReader(stream)) {
                                String text = reader.ReadToEnd();
                                log.Error(text);
                                errorText = text;
                            }
                        }
                    } catch (WebException) {
                        // Oh, well, we tried
                    }
                }

            }
            if (errorText != null)
                return errorText;
            return null;
        } // end HttpPost 

        public String ConvertRelativePathsToAbsolute(String text, String absoluteUrl) {
            // Absolute url could be http://research.wsu.edu/Innovators/
            // Site root would be http://research.wsu.edu/
            String value = text;
            String siteroot = Regex.Replace(absoluteUrl, "http://(.*?/)(.*)", "http://$1");
            if (!String.IsNullOrEmpty(value)) {
                value = Regex.Replace(value,
                    "<(.*?)(src|href)=['\"](?!http)(?!mailto)(?!#)(?!javascript)(/)(.*?)['\"](.*?)>",
                    "<$1$2=\"" + siteroot + "$4\"$5>",
                    RegexOptions.IgnoreCase | RegexOptions.Multiline);
            }
            if (!String.IsNullOrEmpty(value)) {
                value = Regex.Replace(value,
                    "<(.*?)(src|href)=['\"](?!http)(?!mailto)(?!#)(?!javascript)(.*?)['\"](.*?)>",
                    "<$1$2=\"" + absoluteUrl + "$3\"$4>",
                    RegexOptions.IgnoreCase | RegexOptions.Multiline);
            }
            if (!String.IsNullOrEmpty(value)) {
                value = Regex.Replace(value, @"(javascript:WebForm_DoPostBackWithOptions\(.*&quot;)(?!http)(.*.aspx)",
                      "$1" + absoluteUrl + "$2",
                       RegexOptions.IgnoreCase | RegexOptions.Multiline);
            }
            if (!String.IsNullOrEmpty(value)) {
                value = value.Replace(absoluteUrl + "/", absoluteUrl);
            }
            // Now just make sure that there isn't a // because if
            // the original relative path started with a / then the
            // replacement above would create a //.

            return value;
        }

    }
}
