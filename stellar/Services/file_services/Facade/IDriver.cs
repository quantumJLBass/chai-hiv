using System.Collections.Generic;
using System.Web.Mvc;
using System.Web;
using System.Collections;

namespace ElFinder {
    public interface IDriver {
        JsonResult retrive_object(string target);
        JsonResult Open(string target, bool tree, Hashtable posting_json_obj);
        JsonResult Init(string target, Hashtable posting_json_obj);
        JsonResult Parents(string target);
        JsonResult Tree(string target);
        JsonResult List(string target);
        JsonResult MakeDir(string target, string name);
        JsonResult MakeFile(string target, string name);
        JsonResult Rename(string target, string name);
        JsonResult Remove(IEnumerable<string> targets);
        JsonResult Duplicate(IEnumerable<string> targets);
        JsonResult Get(string target);
        JsonResult Put(string target, string content);
        JsonResult Paste(string source, string dest, IEnumerable<string> targets, bool isCut);
        JsonResult Upload(string target, HttpFileCollectionBase targets);
        JsonResult Extract(string target, IEnumerable<string> targets);
        FullPath ParsePath(string target);
    }
}