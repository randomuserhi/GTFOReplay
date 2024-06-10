namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Marks a class as representing a DataStructure in the replay file.
    /// </summary>
    [AttributeUsage(AttributeTargets.Class)]
    public class ReplayData : Attribute {
        public string Typename { get; private set; }
        public string Version { get; private set; }

        private string Clean(string typename) {
            return typename.Replace(" ", "").Trim();
        }

        /// <summary>
        /// Marks a class as representing a DataStructure in the replay file.
        /// </summary>
        /// <param name="typename">Name of datastructure.</param>
        /// <param name="version">Version of datastructure. (Used for backwards compatability)</param>
        public ReplayData(string typename, string version) {
            Typename = Clean(typename);
            Version = Clean(version);
        }
    }
}
