namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method when elevator ride begins to end. Not when gameplay necessarily starts. 
    /// 
    /// Synonymous with Replay.OnElevatorStop
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnElevatorStop : Attribute {
        public ReplayOnElevatorStop() {

        }
    }
}
