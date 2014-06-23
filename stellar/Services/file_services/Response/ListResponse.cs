using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class ListResponse {
        [DataMember(Name = "list")]
        public List<string> list { get; private set; }

        /// <summary> </summary>
        public ListResponse() {
            list = new List<string>();
        }
    }
}