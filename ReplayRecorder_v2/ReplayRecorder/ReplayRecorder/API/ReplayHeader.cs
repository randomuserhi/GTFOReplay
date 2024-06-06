/// ReplayHeader.cs

namespace ReplayRecorder.API {
    /// <summary>
    /// Represents a header data type.
    /// 
    /// Header data types are triggered once prior any events or dynamics. 
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