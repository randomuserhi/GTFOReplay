using System.Text.Json;

namespace ReplayRecorder.IO {
    internal sealed class RecordingDiagnostics {
        public long Ticks { get; private set; }
        public double TotalTickMs { get; private set; }
        public double MaxTickMs { get; private set; }
        public long TickAllocatedBytes { get; private set; }
        public long PeakQueueBytes { get; private set; }
        public double AverageTickMs => Ticks == 0 ? 0 : TotalTickMs / Ticks;
        public void Tick(double milliseconds, long allocated, long queued) {
            ++Ticks;
            TotalTickMs += milliseconds;
            MaxTickMs = Math.Max(MaxTickMs, milliseconds);
            TickAllocatedBytes += allocated;
            PeakQueueBytes = Math.Max(PeakQueueBytes, queued);
        }
        public string Report(long rawBytes, long fileBytes, string sessionId, string? failure) => JsonSerializer.Serialize(new {
            SchemaVersion = 1, ClosedUtc = DateTime.UtcNow.ToString("o"),
            SessionId = sessionId, Failure = failure,
            Ticks, AverageTickMs, MaxTickMs, TickAllocatedBytes, PeakQueueBytes,
            RawBytes = rawBytes, FileBytes = fileBytes,
            StoredRatio = rawBytes == 0 ? 0d : (double)fileBytes / rawBytes
        }, new JsonSerializerOptions { WriteIndented = true });
    }
}
