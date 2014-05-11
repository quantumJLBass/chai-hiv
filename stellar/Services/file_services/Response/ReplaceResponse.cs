using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    [DataContract]
    internal class ReplaceResponse {
        [DataMember(Name = "added")]
        public List<DTOBase> added { get; private set; }

        [DataMember(Name = "removed")]
        public List<string> removed { get; private set; }

        public ReplaceResponse() {
            added = new List<DTOBase>();
            removed = new List<string>();
        }
    }
}