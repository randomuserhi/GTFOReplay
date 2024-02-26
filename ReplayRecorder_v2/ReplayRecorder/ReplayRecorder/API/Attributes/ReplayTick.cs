namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayTick : Attribute {
        public ReplayTick() {

        }
    }
}
