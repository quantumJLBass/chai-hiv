#region Directives
using stellar.Models;
using stellar.Services;
using Castle.ActiveRecord;
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
using NHibernate.Criterion;
using System.Security;
using System.Runtime.InteropServices;
using System.Security.Permissions;
using System.ComponentModel;

using System.Collections;
using System.Collections.Generic;
using System.IO.Compression;

#endregion

namespace stellar.Services {

    /// <summary>
    /// /* all file must match this pattern
    /// *    /foo/bar.html
    /// *  or
    /// *    C://root/foo/bar.html
    /// * Everything is front facing paths
    /// * 
    /// * This is the base for 
    /// * • Capturing 
    /// * • Managing 
    /// * • Storing  
    /// * • Preserving  
    /// * • Delivering
    /// * 
    /// * ALL diles coming must be paths.  FileInfo objects will be made here.
    /// * 
    /// */
    /// </summary>
    public class file_handler {

        #region(normalizing)
        public static String normalize_name(String filename) {
            if (String.IsNullOrWhiteSpace(filename)) return filename;
            filename = Path.GetFileNameWithoutExtension(filename)
                            .Replace("-", " ")
                            .Replace("_", " ")
                            .TrimEnd(new char[] { '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', ' ' });
            return filename;
        }

        /// <summary>
        /// Change all directory separators to face the same way
        /// </summary>
        /// <param name="file">file path given</param>
        /// <returns>the normalized file path</returns>
        public static String normalize_path(String file) {
            file = file.Replace('\\', '/');
            file = file.Replace("//", "/");
            return file;
        }


        /// <summary>
        /// Function to take any manor of path and resolve it and retrun the coreected path
        /// </summary>
        /// <param name="filepath">File path to be checked</param>
        /// <returns>String - Return the tested string if found</returns>
        /// 
        public static String relative_file_path(string filepath) {
            return relative_file_path(filepath, "");
        }
        public static String relative_file_path(string filepath, String base_path) {
            String dir_path = Path.GetDirectoryName(true_file_path(filepath));

            return "~/" + base_path.Trim('/') + "/" + filepath.Replace(dir_path, "").Trim('/');
        }
        public static String clear_root(String file) {
            file = file.Replace('\\', '/');
            String root = file_info.root_path().Replace('\\', '/');
            String[] tmp = file.Split(new string[] { @root }, StringSplitOptions.None);
            tmp = tmp[tmp.Length - 1].Split(new string[] { "../" }, StringSplitOptions.None);
            tmp = tmp[tmp.Length - 1].Split(new string[] { "~/" }, StringSplitOptions.None);
            file = "/" + tmp[tmp.Length - 1].TrimStart('/');
            return file;
        }




        /// <summary>
        /// Function to take any manor of path and resolve it and retrun the coreected path.
        /// We don't care if it exist or not, we just one to normalize it.
        /// </summary>
        /// <param name="filepath">File path to be checked</param>
        /// <returns>String - Return the tested string if found</returns>
        public static String true_file_path(string filepath) {
            return true_file_path(filepath, false);
        }

        /// <summary>
        /// Function to take any manor of path and resolve it and retrun the coreected path.
        /// We don't care if it exist or not, we just one to normalize it.
        /// </summary>
        /// <param name="filepath">File path to be checked</param>
        /// <param name="with_root">Should the file path start fromt he root (default false)</param>
        /// <returns>String - Return the normalized string</returns>
        public static String true_file_path(string filepath, Boolean with_root) {
            //correct root
            filepath = clear_root(filepath);
            filepath = filepath.Replace("//", "/"); //just in case colapse it
            filepath = filepath.Replace('\\', '/'); // we only work in forward facing paths
            String[] tmp = filepath.Split(new string[] { "../" }, StringSplitOptions.None);
            tmp = tmp[tmp.Length - 1].Split(new string[] { "~/" }, StringSplitOptions.None);
            filepath = (with_root ? file_info.root_path().Replace('\\', '/').Trim('/') : "") + "/" + tmp[tmp.Length - 1].Trim('/');
            return filepath.Trim('/');
        }
        #endregion

        #region(file locking)
            public static FileStream lock_file(String file) {
                FileStream fileStream = new FileStream(file, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.Read);
                //FileStream fileStream = new FileStream(file, FileMode.Open, FileAccess.Read, FileShare.None);
                return fileStream;
            }
            public static Boolean unlock_file(FileStream fileStream) {
                try {
                    fileStream.Close();
                    return true;
                } catch {
                    return false;
                }
            }
        #endregion

        #region(ReadWrite)


        /// <summary>
        /// Function to write to file with checks making sure to log creation
        /// </summary>
        /// <param name="file">File with path name to write to</param>
        /// <param name="content">String to write to file</param>
        /// <returns>Return Boolean - did the file get writen?</returns>
        public static Boolean write_to_file(String file, String content) {
            return write_to_file(file, content,false);
        }
        /// <summary>
        /// Function to write to file with checks making sure to log creation
        /// </summary>
        /// <param name="file">File with path name to write to</param>
        /// <param name="content">String to write to file</param>
        /// <param name="append">should we append or overwirte. (false)</param>
        /// <returns>Return Boolean - did the file get writen?</returns>
        public static Boolean write_to_file(String file, String content, Boolean append) {
            file = true_file_path(file,true);//dont ever trust
            Boolean result = false;
            if (append) {
                if (!File.Exists(file)) {
                    if (!logger.is_logfile(file)) logger.writelog("created : " + file);
                    using (StreamWriter sw = File.CreateText(file)) {
                        sw.WriteLine(content);
                        result = true;
                        sw.Close();
                        GC.Collect();//force release of thread
                    }
                }
                // This text is always added, making the file longer over time 
                // if it is not deleted. 
                using (StreamWriter sw = File.AppendText(file)) {
                    sw.WriteLine(content);
                    sw.Close();
                    GC.Collect();//force release of thread
                    if (!logger.is_logfile(file)) logger.writelog("altered : " + file);
                    result = true;
                }
            } else {
                if (!File.Exists(file)) {
                    if (!logger.is_logfile(file)) logger.writelog("created : " + file);
                }
                File.WriteAllText(file, content);
                GC.Collect();//force release of thread
                if (!logger.is_logfile(file))logger.writelog("altered : " + file);
                result = true;
            }
            return result;
        }


        /// <summary>
        /// Function output a string from file
        /// </summary>
        /// <param name="file">File name to read from</param>
        /// <returns>Return String - a string of the file contents.  If the file doesn't exists it retruns empty</returns>
        public static String read_from_file(string file) {
            return read_from_file(file, 3, 0);
        }

        /// <summary>
        /// Function output a string from file
        /// </summary>
        /// <param name="file">File name to read from</param>
        /// <param name="limit">If the file is locked, give it a timed amount to try again</param>
        /// <param name="recursion"></param>
        /// <returns>Return String - a string of the file contents.  If the file doesn't exists it retruns empty</returns>
        public static String read_from_file(string file, int limit, int recursion) {
            String contents = "";
            file = true_file_path(file, true);
            if (file_info.file_exists(file)) {
                if (file_info.is_locked(file)) {
                    System.Threading.Thread.Sleep(100);// ms to wait to recheck.  This should be a site option too
                    read_from_file(file, limit, recursion + 1);
                } else {
                    StreamReader SR;
                    string S;
                    SR = File.OpenText(file);
                    contents = SR.ReadToEnd();
                    SR.Close();
                    GC.Collect();//force release of thread
                }
            }
            return contents;
        }





        /// <summary>
        /// Function to save byte array to a file
        /// </summary>
        /// <param name="_FileName">File name to save byte array</param>
        /// <param name="_ByteArray">Byte array to save to external file</param>
        /// <returns>Return true if byte array save successfully, if not return false</returns>
        public static bool ByteArrayToFile(string _FileName, byte[] _ByteArray) {
            try {
                // Open file for reading
                System.IO.FileStream _FileStream = new System.IO.FileStream(true_file_path(_FileName), System.IO.FileMode.Create, System.IO.FileAccess.Write);

                // Writes a block of bytes to this stream using data from a byte array.
                _FileStream.Write(_ByteArray, 0, _ByteArray.Length);

                // close file stream
                _FileStream.Close();

                return true;
            } catch (Exception _Exception) {
                // Error
                Console.WriteLine("Exception caught in process: {0}", _Exception.ToString());
            }

            // error occured, return false
            return false;
        }



        static CopyFileCallbackAction myCallback(FileInfo source, FileInfo destination, object state, long totalFileSize, long totalBytesTransferred) {
            double dProgress = (totalBytesTransferred / totalFileSize) * 100.0;
            //progressBar1.Value = (int)dProgress;
            return CopyFileCallbackAction.Continue;
        }

        public static String copyfile(string src, string dest) {
            src = true_file_path(src, true);
            dest = true_file_path(dest, true);
            //file_routines.copy_file_to(new FileInfo(src), new FileInfo(dest), new CopyFileOptions() {  }, myCallback);

            File.Copy(src, dest, true);

            return "";
        }


        /* lets beef this up a little here to match the rest */
        public static Boolean deletefile(string dest) {
            Boolean completed = true;
            try {
                File.Delete(true_file_path(dest));
            } catch {
                completed = false;
            }
            return completed;
        }


        public static void DirectoryCopy(DirectoryInfo sourceDir, string destDirName, bool copySubDirs) {
            DirectoryInfo[] dirs = sourceDir.GetDirectories();

            // If the source directory does not exist, throw an exception.
            if (!sourceDir.Exists) {
                throw new DirectoryNotFoundException("Source directory does not exist or could not be found: " + sourceDir.FullName);
            }

            // If the destination directory does not exist, create it.
            if (!Directory.Exists(destDirName)) {
                Directory.CreateDirectory(destDirName);
            }

            // Get the file contents of the directory to copy.
            FileInfo[] files = sourceDir.GetFiles();

            foreach (FileInfo file in files) {
                // Create the path to the new copy of the file.
                string temppath = Path.Combine(destDirName, file.Name);

                // Copy the file.
                file.CopyTo(temppath, false);
            }

            // If copySubDirs is true, copy the subdirectories.
            if (copySubDirs) {

                foreach (DirectoryInfo subdir in dirs) {
                    // Create the subdirectory.
                    string temppath = Path.Combine(destDirName, subdir.Name);

                    // Copy the subdirectories.
                    DirectoryCopy(subdir, temppath, copySubDirs);
                }
            }
        }


        #endregion


        #region(zip)
        public static void Compress(FileInfo fileToCompress) {
            using (FileStream originalFileStream = fileToCompress.OpenRead()) {
                if ((File.GetAttributes(fileToCompress.FullName) & FileAttributes.Hidden) != FileAttributes.Hidden & fileToCompress.Extension != ".gz") {
                    using (FileStream compressedFileStream = File.Create(fileToCompress.FullName + ".gz")) {
                        using (GZipStream compressionStream = new GZipStream(compressedFileStream, CompressionMode.Compress)) {
                            originalFileStream.CopyTo(compressionStream);
                            Console.WriteLine("Compressed {0} from {1} to {2} bytes.",
                                fileToCompress.Name, fileToCompress.Length.ToString(), compressedFileStream.Length.ToString());
                        }
                    }
                }
            }
        }

        public static void Decompress(FileInfo fileToDecompress) {
            using (FileStream originalFileStream = fileToDecompress.OpenRead()) {
                string currentFileName = fileToDecompress.FullName;
                string newFileName = currentFileName.Remove(currentFileName.Length - fileToDecompress.Extension.Length);

                using (FileStream decompressedFileStream = File.Create(newFileName)) {
                    using (GZipStream decompressionStream = new GZipStream(originalFileStream, CompressionMode.Decompress)) {
                        decompressionStream.CopyTo(decompressedFileStream);
                        Console.WriteLine("Decompressed: {0}", fileToDecompress.Name);
                    }
                }
            }
        }

        #endregion



    }
    


}
