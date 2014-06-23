using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class ReplaceResponse {
        [DataMember(Name = "added")]
        public List<DTOBase> added { get; private set; }

        [DataMember(Name = "removed")]
        public List<string> removed { get; private set; }

        /// <summary> </summary>
        public ReplaceResponse() {
            added = new List<DTOBase>();
            removed = new List<string>();
        }
    }
}