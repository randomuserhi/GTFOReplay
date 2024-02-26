namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Class)]
    public class ReplayData : Attribute {
        public string Typename { get; private set; }
        public string Version { get; private set; }

        private string Clean(string typename) {
            return typename.Replace(" ", "").Trim();
        }

        public ReplayData(string typename, string version) {
            Typename = Clean(typename);
            Version = Clean(version);
        }
    }
}
