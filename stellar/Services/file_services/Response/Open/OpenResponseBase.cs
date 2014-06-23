using System.Collections.Generic;
using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class OpenResponseBase {
        private static Debug _debug = new Debug();
        protected List<DTOBase> _files;
        private DTOBase _currentWorkingDirectory;

        [DataMember(Name = "files")]
        public IEnumerable<DTOBase> files { get { return _files; } }

        [DataMember(Name = "cwd")]
        public DTOBase cwd { get { return _currentWorkingDirectory; } }

        [DataMember(Name = "options")]
        public Options options { get; protected set; }

        [DataMember(Name = "debug")]
        public Debug debug { get { return _debug; } }

        /// <summary> </summary>
        public OpenResponseBase(DTOBase currentWorkingDirectory) {
            _files = new List<DTOBase>();
            _currentWorkingDirectory = currentWorkingDirectory;
        }
        /// <summary> </summary>
        public void AddResponse(DTOBase item) {
            _files.Add(item);
        }
    }
}