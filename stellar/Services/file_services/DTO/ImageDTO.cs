using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace ElFinder.DTO {
    /// <summary> </summary>
    [DataContract]
    internal class ImageDTO : FileDTO {
        [DataMember(Name = "tmb")]
        public string tmb { get; set; }
    }
}