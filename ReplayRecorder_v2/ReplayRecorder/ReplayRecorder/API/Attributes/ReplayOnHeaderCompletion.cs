namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnHeaderCompletion : Attribute {
        public ReplayOnHeaderCompletion() {

        }
    }
}
