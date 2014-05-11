using System.IO;
using System.Web;
using stellar;

namespace ElFinder {
    internal static class file_helper {
        public static string get_mime_type(FileInfo file) {
            return file_mime.mime_type(file.Extension.ToLower().Substring(1));
        }
        public static string get_mime_type(string ext) {
            return file_mime.mime_type(ext);
        }
        public static string encode_path(string path) {
            return HttpServerUtility.UrlTokenEncode(System.Text.UTF8Encoding.UTF8.GetBytes(path));
        }
        public static string decode_path(string path) {
            return System.Text.UTF8Encoding.UTF8.GetString(HttpServerUtility.UrlTokenDecode(path));
        }


    }
}