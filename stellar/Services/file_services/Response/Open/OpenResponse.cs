using System.Runtime.Serialization;
using ElFinder.DTO;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class OpenResponse : OpenResponseBase {
        /// <summary> </summary>
        public OpenResponse(DTOBase currentWorkingDirectory, FullPath fullPath)
            : base(currentWorkingDirectory) {
            options = new Options(fullPath);
            _files.Add(currentWorkingDirectory);
        }
    }
}