namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnGameplayStart : Attribute {
        public ReplayOnGameplayStart() {

        }
    }
}
