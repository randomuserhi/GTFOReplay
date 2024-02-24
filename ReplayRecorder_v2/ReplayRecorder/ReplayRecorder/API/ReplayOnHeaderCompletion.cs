namespace ReplayRecorder.API {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnHeaderCompletion : Attribute {
        public ReplayOnHeaderCompletion() {

        }
    }
}
