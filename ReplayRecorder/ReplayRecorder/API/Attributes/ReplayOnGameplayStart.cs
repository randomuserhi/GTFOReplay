namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method when players are dropped from elevator and gameplay begins. 
    /// 
    /// Synonymous with Replay.OnGameplayStart
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnGameplayStart : Attribute {
        public ReplayOnGameplayStart() {

        }
    }
}
