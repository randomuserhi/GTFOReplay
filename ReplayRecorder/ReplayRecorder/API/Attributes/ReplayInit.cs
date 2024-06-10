namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method when an expedition starts. 
    /// 
    /// Synonymous with Replay.OnExpeditionStart
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayInit : Attribute {
        public ReplayInit() {

        }
    }
}
