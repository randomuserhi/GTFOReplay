namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Class)]
    public class ReplayData : Attribute {
        public string Typename { get; private set; }
        public string Version { get; private set; }

        public ReplayData(string typename, string version) {
            Typename = typename;
            Version = version;
        }
    }
}
