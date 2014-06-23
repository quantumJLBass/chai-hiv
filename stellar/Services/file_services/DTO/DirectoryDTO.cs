using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;

namespace ElFinder.DTO {
    /// <summary> </summary>
    [DataContract]
    internal class DirectoryDTO : DTOBase {
        /// <summary>
        ///  Hash of parent directory. Required except roots dirs.
        /// </summary>
        [DataMember(Name = "phash")]
        public string phash { get; set; }

        /// <summary>
        /// Is directory contains subfolders
        /// </summary>
        [DataMember(Name = "dirs")]
        public byte dirs { get; set; }
    }
}