using System.Buffers.Binary;

namespace ReplayRecorder.IO {
    internal sealed class MessageFramer {
        private readonly byte[] header = new byte[4];
        private readonly int limit;
        private byte[]? message;
        private int headerBytes;
        private int messageBytes;
        public MessageFramer(int limit) { this.limit = limit; }
        public void Feed(ReadOnlySpan<byte> bytes, Action<ArraySegment<byte>> receive) {
            while (!bytes.IsEmpty) {
                if (message == null) {
                    int count = Math.Min(4 - headerBytes, bytes.Length);
                    bytes[..count].CopyTo(header.AsSpan(headerBytes));
                    bytes = bytes[count..]; headerBytes += count;
                    if (headerBytes < 4) continue;
                    int length = BinaryPrimitives.ReadInt32LittleEndian(header);
                    if (length <= 0 || length > limit) throw new InvalidDataException($"Viewer message length {length} is outside 1..{limit}.");
                    message = new byte[length]; messageBytes = 0; headerBytes = 0;
                }
                int copied = Math.Min(message.Length - messageBytes, bytes.Length);
                bytes[..copied].CopyTo(message.AsSpan(messageBytes));
                bytes = bytes[copied..]; messageBytes += copied;
                if (messageBytes == message.Length) {
                    var complete = message;
                    message = null; messageBytes = 0;
                    receive(complete); // Ownership transfers to the callback; queued consumers can retain it.
                }
            }
        }
        public void Complete() {
            if (headerBytes != 0 || message != null) throw new EndOfStreamException("Viewer disconnected during a message.");
        }
    }
}
