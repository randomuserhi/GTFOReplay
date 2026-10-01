namespace ReplayRecorder.IO {
    internal enum RecordingPhase { Starting, Recording, Saving, Saved, Failed }

    internal sealed class RecordingStatus {
        public static RecordingStatus? Current;
        public volatile RecordingPhase Phase = RecordingPhase.Starting;
        public string Path = "";
        public string? Error;
        public long DurationMs;
        public long Bytes;
        public int Markers;

        public string Caption {
            get {
                string phase = Phase switch {
                    RecordingPhase.Starting => "REC preparing",
                    RecordingPhase.Recording => "REC",
                    RecordingPhase.Saving => "REC saving",
                    RecordingPhase.Saved => "REC saved",
                    _ => "REC FAILED - see BepInEx log"
                };
                var duration = TimeSpan.FromMilliseconds(Interlocked.Read(ref DurationMs));
                return $"{phase} {((int)duration.TotalMinutes):00}:{duration.Seconds:00} | {Interlocked.Read(ref Bytes) / 1048576d:0.0} MB | markers {Markers}";
            }
        }

        public void Fail(string reason) {
            Error = reason;
            Phase = RecordingPhase.Failed;
        }
    }
}
