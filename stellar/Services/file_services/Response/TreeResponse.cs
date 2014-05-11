using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    [DataContract]
    internal class TreeResponse {
        [DataMember(Name = "tree")]
        public List<DTOBase> tree { get; private set; }

        public TreeResponse() {
            tree = new List<DTOBase>();
        }
    }
}