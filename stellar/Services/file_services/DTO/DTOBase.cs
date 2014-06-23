using System;
using System.Runtime.Serialization;
using System.IO;
using System.Collections;
using Newtonsoft.Json;
using System.Runtime.Serialization.Json;
using System.Xml;
using System.Collections.Generic;
using System.Linq;
using Castle.ActiveRecord;
using Castle.ActiveRecord.Queries;
using Castle.ActiveRecord.Framework;
using Castle.MonoRail.Framework;
using Castle.MonoRail.ActiveRecordSupport;
using stellar.Models;
using System.Web;
using stellar.Services;
using stellar.Controllers;
using NHibernate.Criterion;
//using System.Web.Script.Serialization;

namespace ElFinder.DTO {
    /// <summary> </summary>
    [DataContract]
    internal abstract class DTOBase {
        protected static DateTime _unixOrigin = new DateTime(1970, 1, 1, 0, 0, 0);

        /// <summary>
        ///  Name of file/dir. Required
        /// </summary>
        [DataMember(Name = "name")]
        public string name { get; protected set; }

        /// <summary>
        ///  Hash of current file/dir path, first symbol must be letter, symbols before _underline_ - volume id, Required.
        /// </summary>
        [DataMember(Name = "hash")]
        public string hash { get; protected set; }


        /// <summary>
        ///  Posting json object.
        /// </summary>
        [DataMember(Name = "post")]
        public Hashtable post {
            get;
            protected set;
        }

        /// <summary>
        ///  mime type. Required.
        /// </summary>
        [DataMember(Name = "mime")]
        public string mime { get; protected set; }

        /// <summary>
        /// file modification time in unix timestamp. Required.
        /// </summary>
        [DataMember(Name = "ts")]
        public long ts { get; protected set; }

        /// <summary>
        ///  file size in bytes
        /// </summary>
        [DataMember(Name = "size")]
        public long size { get; protected set; }

        /// <summary>
        ///  is readable
        /// </summary>
        [DataMember(Name = "read")]
        public byte read { get; protected set; }

        /// <summary>
        /// is writable
        /// </summary>
        [DataMember(Name = "write")]
        public byte write { get; protected set; }

        /// <summary>
        ///  is file locked. If locked that object cannot be deleted and renamed
        /// </summary>
        [DataMember(Name = "locked")]
        public byte locked { get; protected set; }



        /// <summary> </summary>
        public static DTOBase Create(FileInfo info, Root root) {
            return Create(info, root, null);
        }

        /// <summary> </summary>
        public static DTOBase Create(FileInfo info, Root root, Hashtable posting_json_obj) {
            if (info == null)
                throw new ArgumentNullException("info");
            if (root == null)
                throw new ArgumentNullException("root");
            string ext = info.Extension.ToLower();
            string parentPath = info.Directory.FullName.Substring(root.Directory.FullName.Length);
            FileDTO response;
            String relative_path = info.FullName.Substring(root.Directory.FullName.Length);
            string hash = root.VolumeId + file_helper.encode_path(relative_path);
            if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || info.Extension == ".gif") {
                response = new ImageDTO();
            } else {
                response = new FileDTO();
            }
            response.read = 1;
            response.write = root.IsReadOnly ? (byte)0 : (byte)1;
            response.locked = root.IsReadOnly ? (byte)1 : (byte)0;
            response.name = info.Name;
            response.size = info.Length;
            response.ts = (long)(info.LastWriteTimeUtc - _unixOrigin).TotalSeconds;
            response.mime = file_helper.get_mime_type(info);
            response.hash = hash;
            response.phash = root.VolumeId + file_helper.encode_path(parentPath.Length > 0 ? parentPath : info.Directory.Name);

            Hashtable post = new Hashtable();
            int pid = 0;
            posting posting = postingService.get_posting_by_hash(hash, false);
            pid = posting.baseid;
            if (pid > 0) {
                post = postingService.make_post_json_table(pid);
            } else {
                posting = postingService.get_posting_by_file(relative_path, false);
                pid = posting.baseid;
                if (pid > 0) {
                    post = postingService.make_post_json_table(pid);
                    if (String.IsNullOrWhiteSpace(posting.filehash)) {
                        posting.filehash = hash;
                        ActiveRecordMediator<posting>.Save(posting);
                    }

                } else {
                    if (HttpContext.Current.Request.Params.AllKeys.Contains("iid")) {
                        pid = Int16.Parse(HttpContext.Current.Request.Params["iid"]);
                        post = postingService.make_post_json_table(pid);
                    } else {
                        if (HttpContext.Current.Request.Params.AllKeys.Contains("ptype")) {

                            //Boolean dev = false; // for now

                            String type = HttpContext.Current.Request.Params["ptype"];
                            Hashtable all = new Hashtable();
                            Dictionary<string, string> queries = httpService.get_request_parmas_obj();
                            List<AbstractCriterion> filtering = new List<AbstractCriterion>();
                            filtering.Add(Expression.Eq("post_type", ActiveRecordBase<posting_type>.FindFirst(
                                        new List<AbstractCriterion>() { 
                                            Expression.Eq("alias", type)
                                        }.ToArray())
                                    ));
                            posting[] posts = ActiveRecordBase<posting>.FindAll(new Order[] { Order.Desc("revision"), Order.Desc("version") }, filtering.ToArray());
                            //var i = 0;
                            foreach (posting posted in posts) {
                                if (posted.static_file.IndexOf(info.Name) > -1)
                                    pid = posted.baseid;
                                post = postingService.make_post_json_table(pid);

                            }
                        }
                    }
                }
            }
            response.post = post;

            if (pid > 0 && (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || info.Extension == ".gif")) {
                //response = new ImageDTO();

                String path = image_handler.image(pid, 50, 50, 0, "constrain", false, "thumb_", "", false);
                String[] path_parts = path.Split(new string[] { "uploads/" }, StringSplitOptions.None);
                //note that the root will always be uploads?  well it is atm
                ((ImageDTO)response).tmb = path_parts[path_parts.Length - 1].Trim('/');
            }



            return response;
        }
        /// <summary> </summary>
        public static DTOBase Create(DirectoryInfo directory, Root root) {
            if (directory == null)
                throw new ArgumentNullException("directory");
            if (root == null)
                throw new ArgumentNullException("root");
            if (root.Directory.FullName == directory.FullName) {
                RootDTO response = new RootDTO() {
                    mime = "directory",
                    dirs = directory.GetDirectories().Length > 0 ? (byte)1 : (byte)0,
                    hash = root.VolumeId + file_helper.encode_path(directory.Name),
                    locked = root.IsReadOnly ? (byte)1 : (byte)0,//(directory.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly ? (byte)1 : (byte)0,
                    name = root.Alias,
                    read = 1,
                    size = 0,
                    ts = (long)(directory.LastWriteTimeUtc - _unixOrigin).TotalSeconds,
                    volumeId = root.VolumeId,
                    write = root.IsReadOnly ? (byte)0 : (byte)1//(directory.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly ? (byte)0 : (byte)1
                };
                return response;
            } else {
                string parentPath = directory.Parent.FullName.Substring(root.Directory.FullName.Length);
                DirectoryDTO response = new DirectoryDTO() {
                    mime = "directory",
                    dirs = directory.GetDirectories().Length > 0 ? (byte)1 : (byte)0,
                    hash = root.VolumeId + file_helper.encode_path(directory.FullName.Substring(root.Directory.FullName.Length)),
                    locked = root.IsReadOnly ? (byte)1 : (byte)0,//(directory.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly ? (byte)1 : (byte)0,
                    read = 1,
                    size = 0,
                    name = directory.Name,
                    ts = (long)(directory.LastWriteTimeUtc - _unixOrigin).TotalSeconds,
                    write = root.IsReadOnly ? (byte)0 : (byte)1,//(directory.Attributes & FileAttributes.ReadOnly) == FileAttributes.ReadOnly ? (byte)0: (byte)1,
                    phash = root.VolumeId + file_helper.encode_path(parentPath.Length > 0 ? parentPath : directory.Parent.Name)
                };
                return response;
            }
        }

    }
}