using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class PutResponse {
        [DataMember(Name = "changed")]
        public List<FileDTO> changed { get; private set; }

        /// <summary> </summary>
        public PutResponse() {
            changed = new List<FileDTO>();
        }
    }
}