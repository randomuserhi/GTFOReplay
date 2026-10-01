using System.Buffers;
using System.Threading.Channels;

namespace ReplayRecorder.IO {
    // Owns queued bytes until the consumer finishes; callers may immediately reuse their buffer.
    internal sealed class BufferWriteQueue {
        private readonly Channel<(byte[] bytes, int length)> channel;
        private readonly Func<ReadOnlyMemory<byte>, Task> consume;
        private readonly long byteLimit;
        private readonly object gate = new();
        private long pendingBytes;
        private long writtenBytes;
        private bool completed;
        private Exception? error;
        private readonly Task worker;

        public long PendingBytes => Interlocked.Read(ref pendingBytes);
        public long WrittenBytes => Interlocked.Read(ref writtenBytes);
        public Exception? Error => Volatile.Read(ref error);

        public BufferWriteQueue(Func<ReadOnlyMemory<byte>, Task> consume, int capacity = 256, long byteLimit = 64 * 1024 * 1024) {
            this.consume = consume;
            this.byteLimit = byteLimit;
            channel = Channel.CreateBounded<(byte[], int)>(new BoundedChannelOptions(capacity) {
                SingleReader = true,
                FullMode = BoundedChannelFullMode.Wait
            });
            worker = Task.Run(Run);
        }

        // A full queue is an explicit failure, never a wait on the game thread or a dropped frame.
        public bool TryWrite(ReadOnlySpan<byte> bytes) {
            lock (gate) {
                if (completed || error != null) return false;
                if (bytes.Length > byteLimit - pendingBytes) return false;
                byte[] copy = ArrayPool<byte>.Shared.Rent(bytes.Length);
                bytes.CopyTo(copy);
                Interlocked.Add(ref pendingBytes, bytes.Length);
                if (channel.Writer.TryWrite((copy, bytes.Length))) return true;
                Interlocked.Add(ref pendingBytes, -bytes.Length);
                ArrayPool<byte>.Shared.Return(copy);
                return false;
            }
        }

        public Task CompleteAsync() {
            lock (gate) {
                completed = true;
                channel.Writer.TryComplete();
            }
            return worker;
        }

        private async Task Run() {
            try {
                await foreach (var frame in channel.Reader.ReadAllAsync().ConfigureAwait(false)) {
                    try {
                        await consume(frame.bytes.AsMemory(0, frame.length)).ConfigureAwait(false);
                        Interlocked.Add(ref writtenBytes, frame.length);
                    } finally {
                        Release(frame);
                    }
                }
            } catch (Exception ex) {
                lock (gate) {
                    error = ex;
                    completed = true;
                    channel.Writer.TryComplete(ex);
                    while (channel.Reader.TryRead(out var frame)) Release(frame);
                }
                throw;
            }
        }

        private void Release((byte[] bytes, int length) frame) {
            Interlocked.Add(ref pendingBytes, -frame.length);
            ArrayPool<byte>.Shared.Return(frame.bytes);
        }
    }
}
