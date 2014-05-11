#region Directives
using System;
using System.Data;
using System.Configuration;
using stellar.Models;
using NHibernate.Criterion;
using System.Collections.Generic;
using Castle.ActiveRecord;
using System.Net;
using System.Text.RegularExpressions;
using System.IO;
using System.Web;
//using MonoRailHelper;
using System.Xml;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;
using System.Collections.Specialized;
using Newtonsoft.Json;
using Newtonsoft.Json.Utilities;
using Newtonsoft.Json.Linq;
using stellar.Services;
using log4net;
using log4net.Config;
using Goheer.EXIF;
using System.Security.Permissions;
using System.ComponentModel;
using System.Security;
using System.Runtime.InteropServices;
#endregion

namespace stellar.Services {
    /// <summary>
    /// These are methods of file crud that will keep us from error when possible.  Mostly to copy.
    /// </summary>
    public sealed class file_routines {


        public static string duplicate(FileInfo file) {
            var parentPath = file.DirectoryName;

            var name = file.Name;

            var ext = string.Empty;

            var nameArr = name.Split(".".ToCharArray());

            if (nameArr.Length > 1) {

                ext = "." + nameArr[nameArr.Length - 1];
                name = name.Remove(name.LastIndexOf("."));
            }

            var newName = string.Format(@"{0}\{1} copy{2}", parentPath, name, ext);

            if (!File.Exists(newName)) {
                file.CopyTo(newName);
            } else {
                for (int i = 1; i < 100; i++) {
                    newName = string.Format(@"{0}\{1} copy {2}{3}", parentPath, name, i, ext);
                    if (!File.Exists(newName)) {
                        file.CopyTo(newName);
                        break;
                    }
                }
            }

            return newName;
        }




        public static void copy_file_to(FileInfo source, FileInfo destination) {
            copy_file_to(source, destination, CopyFileOptions.None);
        }

        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileOptions options) {
            copy_file_to(source, destination, options, null);
        }
        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileCallback callback) {
            copy_file_to(source, destination, CopyFileOptions.None, callback, null);
        }
        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileOptions options, CopyFileCallback callback) {
            copy_file_to(source, destination, options, callback, null);
        }

        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileOptions options, CopyFileCallback callback, object state) {
            if (source == null)
                throw new ArgumentNullException("source");
            if (destination == null)
                throw new ArgumentNullException("destination");
            if ((options & ~CopyFileOptions.All) != 0)
                throw new ArgumentOutOfRangeException("options");

            new FileIOPermission(
                FileIOPermissionAccess.Read, source.FullName).Demand();
            new FileIOPermission(
                FileIOPermissionAccess.Write, destination.FullName).Demand();

            CopyProgressRoutine cpr = callback == null ?
                null : new CopyProgressRoutine(new CopyProgressData(
                    source, destination, callback, state).CallbackHandler);

            bool cancel = false;
            if (!CopyFileEx(source.FullName, destination.FullName, cpr,
                IntPtr.Zero, ref cancel, (int)options)) {
                String custom_message = "\r\n source:" + source.FullName + "\r\n destination:" + destination.FullName;
                logger.writelog("file handling failure:" + custom_message);
                throw new IOException(new Win32Exception().Message.Insert(0, custom_message));
            }
        }

        private class CopyProgressData {
            private FileInfo _source = null;
            private FileInfo _destination = null;
            private CopyFileCallback _callback = null;
            private object _state = null;

            public CopyProgressData(FileInfo source, FileInfo destination,
                CopyFileCallback callback, object state) {
                _source = source;
                _destination = destination;
                _callback = callback;
                _state = state;
            }

            public int CallbackHandler(
                long totalFileSize, long totalBytesTransferred,
                long streamSize, long streamBytesTransferred,
                int streamNumber, int callbackReason,
                IntPtr sourceFile, IntPtr destinationFile, IntPtr data) {
                return (int)_callback(_source, _destination, _state,
                    totalFileSize, totalBytesTransferred);
            }
        }

        private delegate int CopyProgressRoutine(
            long totalFileSize, long TotalBytesTransferred, long streamSize,
            long streamBytesTransferred, int streamNumber, int callbackReason,
            IntPtr sourceFile, IntPtr destinationFile, IntPtr data);

        [SuppressUnmanagedCodeSecurity]
        [DllImport("Kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool CopyFileEx(
            string lpExistingFileName, string lpNewFileName,
            CopyProgressRoutine lpProgressRoutine,
            IntPtr lpData, ref bool pbCancel, int dwCopyFlags);
    }

    public delegate CopyFileCallbackAction CopyFileCallback(
        FileInfo source, FileInfo destination, object state,
        long totalFileSize, long totalBytesTransferred);

    public enum CopyFileCallbackAction {
        Continue = 0,
        Cancel = 1,
        Stop = 2,
        Quiet = 3
    }

    [Flags]
    public enum CopyFileOptions {
        None = 0x0,
        FailIfDestinationExists = 0x1,
        Restartable = 0x2,
        AllowDecryptedDestination = 0x8,
        All = FailIfDestinationExists | Restartable | AllowDecryptedDestination
    }
}
