namespace ReplayRecorder.API.Attributes {
    /// <summary>
    /// Calls a static void method with the recording file path when recording starts.
    /// Synonymous with Replay.OnStartRecording.
    /// </summary>
    [AttributeUsage(AttributeTargets.Method)]
    public class ReplayOnStartRecording : Attribute {
    }
}
