using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Runtime.Serialization;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class Debug {
        private static string[] _empty = new string[0];
        [DataMember(Name = "connector")]
        public string connector { get { return ".net"; } }

        [DataMember(Name = "mountErrors")]
        public string[] mountErrors { get { return _empty; } }
    }
}
