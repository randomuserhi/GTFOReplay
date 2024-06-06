namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method each snapshot tick prior any data writes.
    /// 
    /// Synonymous with Replay.OnTick
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayTick : Attribute {
        public ReplayTick() {

        }
    }
}
