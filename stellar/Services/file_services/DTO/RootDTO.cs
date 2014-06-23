using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace ElFinder.DTO {
    /// <summary> </summary>
    [DataContract]
    internal class RootDTO : DTOBase {
        [DataMember(Name = "volumeId")]
        public string volumeId { get; set; }

        [DataMember(Name = "dirs")]
        public byte dirs { get; set; }
    }
}