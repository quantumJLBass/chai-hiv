using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class AddResponse {
        private List<DTOBase> _added;

        [DataMember(Name = "added")]
        public List<DTOBase> added { get { return _added; } }

        /// <summary> </summary>
        public AddResponse(FileInfo newFile, Root root) {
            _added = new List<DTOBase>() { DTOBase.Create(newFile, root) };
        }
        /// <summary> </summary>
        public AddResponse(DirectoryInfo newDir, Root root) {
            _added = new List<DTOBase>() { DTOBase.Create(newDir, root) };
        }
        /// <summary> </summary>
        public AddResponse() {
            _added = new List<DTOBase>();
        }
    }
}