namespace ReplayRecorder.API.Attributes {

    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayConfig : Attribute {
        public ReplayConfig() {

        }
    }
}
