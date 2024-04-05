namespace ReplayRecorder.API.Attributes {
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnElevatorStop : Attribute {
        public ReplayOnElevatorStop() {

        }
    }
}
