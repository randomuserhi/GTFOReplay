namespace ReplayRecorder.IO {
    // A congested native socket keeps exactly one copy of each packet in FIFO order.
    internal sealed class PacketSendQueue : IDisposable {
        private readonly object gate = new();
        private readonly Queue<byte[]> pending = new();
        private readonly Func<ArraySegment<byte>, bool> send;
        private readonly int maxBytes;
        private readonly int maxPackets;
        private int bytes;
        private bool closed;
        public PacketSendQueue(Func<ArraySegment<byte>, bool> send, int maxBytes = 8 * 1024 * 1024, int maxPackets = 256) {
            this.send = send;
            this.maxBytes = maxBytes;
            this.maxPackets = maxPackets;
        }
        public bool Send(ArraySegment<byte> packet) {
            lock (gate) {
                if (closed) return false;
                if (packet.Count <= 0 || packet.Count > 81920) throw new InvalidDataException("Invalid spectator packet length.");
                if (pending.Count == 0 && send(packet)) return true;
                if (pending.Count >= maxPackets || packet.Count > maxBytes - bytes) throw new IOException("Spectator send backlog exceeded its memory limit.");
                pending.Enqueue(packet.ToArray());
                bytes += packet.Count;
                return true;
            }
        }
        public void Flush() {
            lock (gate) {
                if (closed) return;
                // Bound work per network poll, even when the socket suddenly becomes writable.
                for (int i = 0; i < 32 && pending.TryPeek(out var packet); ++i) {
                    if (!send(packet)) break;
                    pending.Dequeue();
                    bytes -= packet.Length;
                }
            }
        }
        public void Dispose() {
            lock (gate) { closed = true; pending.Clear(); bytes = 0; }
        }
    }
}
