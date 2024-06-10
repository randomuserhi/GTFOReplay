namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Triggers a static method once all headers have been written to the replay file.
    /// 
    /// Synonymous with Replay.OnHeaderCompletion
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnHeaderCompletion : Attribute {
        public ReplayOnHeaderCompletion() {

        }
    }
}
