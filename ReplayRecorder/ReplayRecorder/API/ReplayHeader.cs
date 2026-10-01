/// ReplayHeader.cs

namespace ReplayRecorder.API {
    /// <summary>
    /// Represents a header data type.
    /// 
    /// Header records are triggered before any events or dynamics. A type may
    /// emit multiple records (for example, one per map surface) until all
    /// registered header types have emitted, including section end markers.
    /// They contain no time information and are written in any order.
    /// 
    /// All headers must be written before any events or dynamics can be written, providing
    /// a method to guarantee certain information is available prior any actual time-series data.
    /// </summary>
    public abstract class ReplayHeader {
        public virtual string? Debug => null;
        public abstract void Write(ByteBuffer buffer);
    }
}
