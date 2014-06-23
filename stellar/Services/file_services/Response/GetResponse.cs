using System.Runtime.Serialization;

namespace ElFinder.Response {
    /// <summary> </summary>
    [DataContract]
    internal class GetResponse {
        [DataMember(Name = "content")]
        public string content { get; set; }
    }
}