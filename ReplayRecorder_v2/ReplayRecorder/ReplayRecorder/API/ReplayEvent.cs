/// ReplayEvent.cs

namespace ReplayRecorder.API {
    /// <summary>
    /// Represents an event data type.
    /// 
    /// Event data types are triggered once and are time-accurate.
    /// </summary>
    public abstract class ReplayEvent {
        public virtual string? Debug => null;

        /// <summary>
        /// Write event data.
        /// </summary>
        /// <param name="buffer">Buffer to write data to.</param>
        public virtual void Write(ByteBuffer buffer) { }
    }
}
