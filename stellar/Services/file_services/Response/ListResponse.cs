using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    [DataContract]
    internal class ListResponse {
        [DataMember(Name = "list")]
        public List<string> list { get; private set; }

        public ListResponse() {
            list = new List<string>();
        }
    }
}