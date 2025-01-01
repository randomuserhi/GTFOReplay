namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method once when an expedition ends.
    /// 
    /// Synonymous with Replay.OnExpeditionEnd
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnExpeditionEnd : Attribute {
    }
}
