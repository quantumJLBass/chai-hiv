using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class TreeResponse {
        [DataMember(Name = "tree")]
        public List<DTOBase> tree { get; private set; }

        /// <summary> </summary>
        public TreeResponse() {
            tree = new List<DTOBase>();
        }
    }
}