namespace ReplayRecorder.API {
    [AttributeUsage(AttributeTargets.Class)]
    public class ReplayData : Attribute {
        public string Typename { get; private set; }

        public ReplayData(string typename) {
            Typename = typename;
        }
    }
}
