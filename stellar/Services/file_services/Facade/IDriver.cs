using System.Collections.Generic;
using System.Web.Mvc;
using System.Web;
using System.Collections;

namespace ElFinder {
    /// <summary> </summary>
    public interface IDriver {
        /// <summary> </summary>
        JsonResult retrive_object(string target);
        /// <summary> </summary>
        JsonResult Open(string target, bool tree, Hashtable posting_json_obj);
        /// <summary> </summary>
        JsonResult Init(string target, Hashtable posting_json_obj);
        /// <summary> </summary>
        JsonResult Parents(string target);
        /// <summary> </summary>
        JsonResult Tree(string target);
        /// <summary> </summary>
        JsonResult List(string target);
        /// <summary> </summary>
        JsonResult MakeDir(string target, string name);
        /// <summary> </summary>
        JsonResult MakeFile(string target, string name);
        /// <summary> </summary>
        JsonResult Rename(string target, string name);
        /// <summary> </summary>
        JsonResult Remove(IEnumerable<string> targets);
        /// <summary> </summary>
        JsonResult Duplicate(IEnumerable<string> targets);
        /// <summary> </summary>
        JsonResult Get(string target);
        /// <summary> </summary>
        JsonResult Put(string target, string content);
        /// <summary> </summary>
        JsonResult Paste(string source, string dest, IEnumerable<string> targets, bool isCut);
        /// <summary> </summary>
        JsonResult Upload(string target, HttpFileCollectionBase targets);
        /// <summary> </summary>
        JsonResult Extract(string target, IEnumerable<string> targets);
        /// <summary> </summary>
        FullPath ParsePath(string target);
    }
}