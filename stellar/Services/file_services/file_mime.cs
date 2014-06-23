using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Reflection;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.ActiveRecord.Framework;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using stellar;
using stellar.Models;
using System.Web;
using stellar.Services;
using NHibernate.Criterion;
using System.Runtime.InteropServices;
using System.Collections;

namespace stellar {
    /// <summary>
    /// Start with a quick lookup in a hardcoded list of known mime
    /// and if it is not found then a there is a chance it's something 
    /// custom that would have had to be loaded and so look to the system for help
    /// </summary>
    internal static class file_mime {
        private static Dictionary<string, string> _mimeTypes;
        /// <summary> </summary>
        static file_mime() {
            _mimeTypes = new Dictionary<string, string>();
            Assembly assembly = Assembly.GetExecutingAssembly();
            if (assembly != null) {

                StreamReader reader = new StreamReader(new FileStream(file_info.root_path() + "/Services/file_services/mimeTypes.txt", FileMode.Open, FileAccess.Read));
                while (!reader.EndOfStream) {
                    string line = reader.ReadLine();
                    line = line.Trim();
                    if (!string.IsNullOrWhiteSpace(line) && line[0] != '#') {
                        string[] parts = line.Split(' ');
                        if (parts.Length > 1) {
                            string mime = parts[0];
                            for (int i = 1; i < parts.Length; i++) {
                                string ext = parts[i].ToLower();
                                if (!_mimeTypes.ContainsKey(ext)) {
                                    _mimeTypes.Add(ext, mime);
                                }
                            }
                        }
                    }
                }
                try {//file_handler.read_from_file("mimeTypes.txt");
                } catch {
                    //ok yes dropping it here.. but just come back and fix it.
                }
            }
        }


        /// <summary> </summary>
        public static string mime_type(string ext) {
            if (_mimeTypes.ContainsKey(ext)) {
                return _mimeTypes[ext];
            } else {
                return detect_mime(ext);
            }
        }

        /// <summary> </summary>
        private static String detect_mime(string ext) {
            String result = "applicaton/unknown";
            String contentType = GetMimeTypeFromFileAndRegistry("x." + ext);

            if (contentType == "application/unknown" || contentType == "applicaton/image") { // last chance.  may be to redundent thou
                Hashtable image_mime = new Hashtable();
                image_mime.Add("gif", "image/gif");
                image_mime.Add("jpg", "image/jpeg");
                image_mime.Add("jpe", "image/jpeg");
                image_mime.Add("jpeg", "image/jpeg");
                image_mime.Add("bmp", "image/bmp");
                image_mime.Add("tif", "image/tiff");
                image_mime.Add("tiff", "image/tiff");
                image_mime.Add("eps", "application/postscript");
                if (image_mime.ContainsKey(ext)) contentType = image_mime[ext].ToString();
            }
            if (!String.IsNullOrWhiteSpace(contentType))
                result = contentType;
            return result;
        }

        /// <summary> </summary>
        [DllImport(@"urlmon.dll", CharSet = CharSet.Auto)]
        private extern static System.UInt32 FindMimeFromData(
            System.UInt32 pBC,
            [MarshalAs(UnmanagedType.LPStr)] System.String pwzUrl,
            [MarshalAs(UnmanagedType.LPArray)] byte[] pBuffer,
            System.UInt32 cbSize,
            [MarshalAs(UnmanagedType.LPStr)] System.String pwzMimeProposed,
            System.UInt32 dwMimeFlags,
            out System.UInt32 ppwzMimeOut,
            System.UInt32 dwReserverd
        );

        /// <summary> </summary>
        private static string GetMimeFromRegistry(string Filename) {
            string mime = "application/octetstream";
            string ext = System.IO.Path.GetExtension(Filename).ToLower();
            Microsoft.Win32.RegistryKey rk = Microsoft.Win32.Registry.ClassesRoot.OpenSubKey(ext);
            if (rk != null && rk.GetValue("Content Type") != null)
                mime = rk.GetValue("Content Type").ToString();
            return mime;
        }

        /// <summary> </summary>
        private static string GetMimeTypeFromFileAndRegistry(string filename) {
            if (!File.Exists(filename)) {
                return GetMimeFromRegistry(filename);
            }

            byte[] buffer = new byte[256];

            using (FileStream fs = new FileStream(filename, FileMode.Open)) {
                if (fs.Length >= 256)
                    fs.Read(buffer, 0, 256);
                else
                    fs.Read(buffer, 0, (int)fs.Length);
            }

            try {
                System.UInt32 mimetype;

                FindMimeFromData(0, null, buffer, 256, null, 0, out mimetype, 0);

                System.IntPtr mimeTypePtr = new IntPtr(mimetype);

                string mime = Marshal.PtrToStringUni(mimeTypePtr);

                Marshal.FreeCoTaskMem(mimeTypePtr);

                if (string.IsNullOrWhiteSpace(mime) ||
                    mime == "text/plain" || mime == "application/octet-stream") {
                    return GetMimeFromRegistry(filename);
                }

                return mime;
            } catch (Exception e) {
                return GetMimeFromRegistry(filename);
            }
        }

    }
}
