using System.Runtime.Serialization;
using ElFinder.DTO;
using System.Collections.Generic;
using System.Linq;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class InitResponse : OpenResponseBase {
        private static string[] _empty = new string[0];
        [DataMember(Name = "api")]
        public string api { get { return "2.0"; } }

        [DataMember(Name = "uplMaxSize")]
        public string uplMaxSize { get { return string.Empty; } }

        [DataMember(Name = "netDrivers")]
        public IEnumerable<string> netDrivers { get { return _empty; } }

        /// <summary> </summary>
        public InitResponse(DTOBase currentWorkingDirectory)
            : base(currentWorkingDirectory) {
            options = new Options();
        }
    }
}