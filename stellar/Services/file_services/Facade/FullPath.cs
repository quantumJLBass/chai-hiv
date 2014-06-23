using System.IO;

namespace ElFinder {
    /// <summary> </summary>
    public class FullPath {
        /// <summary> </summary>
        public Root Root { get; set; }
        /// <summary> </summary>
        public string RelativePath { get; set; }
        /// <summary> </summary>
        public DirectoryInfo Directory { get; set; }
        /// <summary> </summary>
        public FileInfo File { get; set; }
    }
}