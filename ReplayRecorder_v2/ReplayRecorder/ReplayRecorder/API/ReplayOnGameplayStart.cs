namespace ReplayRecorder.API {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnGameplayStart : Attribute {
        public ReplayOnGameplayStart() {

        }
    }
}
