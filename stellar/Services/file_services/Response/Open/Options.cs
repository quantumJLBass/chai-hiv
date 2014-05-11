using System.Runtime.Serialization;
using System.Collections.Generic;

namespace ElFinder.Response {
    [DataContract]
    internal class Archive {
        private static string[] _empty = new string[0];
        [DataMember(Name = "create")]
        public IEnumerable<string> Create { get { return _empty; } }

        [DataMember(Name = "extract")]
        public IEnumerable<string> Extract { get { return new string[] { "application/x-zip-compressed", "application/zip", "application/x-gzip", "application/x-tar", "application/x-bzip2" }; } }
    }
    [DataContract]
    internal class Options {
        private static string[] _empty = new string[0];
        private static string[] _disabled = new string[] { "create" };//"extract", 
        private static Archive _emptyArchives = new Archive();

        [DataMember(Name = "copyOverwrite")]
        public byte copyOverwrite { get { return 1; } }

        [DataMember(Name = "separator")]
        public string separator { get { return "/"; } }

        [DataMember(Name = "path")]
        public string path { get; set; }

        [DataMember(Name = "tmbUrl")]
        public string tmbUrl { get; set; }

        [DataMember(Name = "url")]
        public string url { get; set; }

        [DataMember(Name = "archivers")]
        public Archive archivers { get { return _emptyArchives; } }

        [DataMember(Name = "disabled")]
        public IEnumerable<string> disabled { get { return _disabled; } }

        public Options(FullPath fullPath) {

            path = fullPath.RelativePath;
            url = fullPath.Root.Url;
            tmbUrl = fullPath.Root.TmbUrl;
        }
        public Options() { }
    }
}