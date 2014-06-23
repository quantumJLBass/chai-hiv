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


        /// <summary> </summary>
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




        /// <summary> </summary>
        public static void copy_file_to(FileInfo source, FileInfo destination) {
            copy_file_to(source, destination, CopyFileOptions.None);
        }

        /// <summary> </summary>
        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileOptions options) {
            copy_file_to(source, destination, options, null);
        }
        /// <summary> </summary>
        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileCallback callback) {
            copy_file_to(source, destination, CopyFileOptions.None, callback, null);
        }
        /// <summary> </summary>
        public static void copy_file_to(FileInfo source, FileInfo destination, CopyFileOptions options, CopyFileCallback callback) {
            copy_file_to(source, destination, options, callback, null);
        }

        /// <summary> </summary>
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

        /// <summary> </summary>
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

        /// <summary> </summary>
        private delegate int CopyProgressRoutine(
            long totalFileSize, long TotalBytesTransferred, long streamSize,
            long streamBytesTransferred, int streamNumber, int callbackReason,
            IntPtr sourceFile, IntPtr destinationFile, IntPtr data);

        /// <summary> </summary>
        [SuppressUnmanagedCodeSecurity]
        [DllImport("Kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool CopyFileEx(
            string lpExistingFileName, string lpNewFileName,
            CopyProgressRoutine lpProgressRoutine,
            IntPtr lpData, ref bool pbCancel, int dwCopyFlags);
    }

    /// <summary> </summary>
    public delegate CopyFileCallbackAction CopyFileCallback(
        FileInfo source, FileInfo destination, object state,
        long totalFileSize, long totalBytesTransferred);

    /// <summary> </summary>
    public enum CopyFileCallbackAction {
        /// <summary> </summary>
        Continue = 0,
        /// <summary> </summary>
        Cancel = 1,
        /// <summary> </summary>
        Stop = 2,
        /// <summary> </summary>
        Quiet = 3
    }

    /// <summary> </summary>
    [Flags]
    public enum CopyFileOptions {
        /// <summary> </summary>
        None = 0x0,
        /// <summary> </summary>
        FailIfDestinationExists = 0x1,
        /// <summary> </summary>
        Restartable = 0x2,
        /// <summary> </summary>
        AllowDecryptedDestination = 0x8,
        /// <summary> </summary>
        All = FailIfDestinationExists | Restartable | AllowDecryptedDestination
    }
}
