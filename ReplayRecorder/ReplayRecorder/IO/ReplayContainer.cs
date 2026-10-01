using System.Buffers.Binary;
using System.IO.Compression;

namespace ReplayRecorder.IO {
    // GTRPLY03: independent Brotli blocks with logical byte offsets and CRC32.
    // The logical stream is also the live-view wire stream; assets are never embedded here.
    internal sealed class ReplayContainer {
        public static readonly byte[] Magic = System.Text.Encoding.ASCII.GetBytes("GTRPLY03");
        public const uint ChunkMagic = 0x334b4843; // CHK3
        public const int ChunkHeaderSize = 32;
        public const int MaxFrameSize = 64 * 1024 * 1024;
        public const int TargetBlockBytes = 1024 * 1024;
        public const int MaxDiagnosticsSize = 1024 * 1024;
        public const uint BlockDurationMs = 2000;
        private readonly Stream stream;
        private readonly MemoryStream pending = new();
        private readonly SemaphoreSlim gate = new(1, 1);
        private bool first = true;
        private bool completed;
        private bool diagnosticsWritten;
        private Exception? error;
        private uint blockStart;
        private uint lastTime;
        private long rawOffset;
        public long WrittenBytes => Interlocked.Read(ref rawOffset);
        public Exception? Error => Volatile.Read(ref error);
        public long PhysicalBytes { get; private set; }

        public ReplayContainer(Stream stream) { this.stream = stream; }

        public Task WriteFrame(ReadOnlyMemory<byte> frame) => Locked(async () => {
            if (diagnosticsWritten) throw new InvalidOperationException("Replay diagnostics already finalized capture.");
            if (frame.Length < (first ? 4 : 8) || frame.Length > MaxFrameSize) throw new InvalidDataException("Invalid replay frame size.");
            if (BinaryPrimitives.ReadInt32LittleEndian(frame.Span) != frame.Length - 4) throw new InvalidDataException("Replay frame length does not match its payload.");
            if (first) {
                await stream.WriteAsync(Magic).ConfigureAwait(false);
                PhysicalBytes += Magic.Length;
                await WriteBlock(frame, 0, 1).ConfigureAwait(false);
                first = false;
                return;
            }
            uint time = BinaryPrimitives.ReadUInt32LittleEndian(frame.Span.Slice(4));
            if (time < lastTime) throw new InvalidDataException("Replay timestamps are out of order.");
            // Large individual frames stay intact; ordinary buffering is bounded to 1 MiB.
            if (pending.Length + frame.Length > TargetBlockBytes) await FlushPending().ConfigureAwait(false);
            if (pending.Length == 0) blockStart = time;
            lastTime = time;
            if (frame.Length >= TargetBlockBytes) {
                await WriteBlock(frame, time, 0).ConfigureAwait(false);
                return;
            }
            pending.Write(frame.Span);
            if (pending.Length >= TargetBlockBytes || time - blockStart >= BlockDurationMs) await FlushPending().ConfigureAwait(false);
        });

        // A late spectator flushes after the disk queue reaches its requested prefix.
        // Serialize this with background writes so it cannot split or race a block.
        public Task Flush() => Locked(FlushPending);

        private async Task FlushPending() {
            if (pending.Length == 0) return;
            await WriteBlock(pending.GetBuffer().AsMemory(0, (int)pending.Length), lastTime, 0).ConfigureAwait(false);
            pending.SetLength(0);
        }

        private async Task WriteBlock(ReadOnlyMemory<byte> bytes, uint time, uint flags) {
            using var compressed = new MemoryStream();
            using (var encoder = new BrotliStream(compressed, CompressionLevel.Fastest, leaveOpen: true)) {
                await encoder.WriteAsync(bytes).ConfigureAwait(false);
            }
            byte[] header = Header((int)compressed.Length, bytes.Length, rawOffset, time, Crc32(bytes.Span), flags);
            await stream.WriteAsync(header).ConfigureAwait(false);
            await stream.WriteAsync(compressed.GetBuffer().AsMemory(0, (int)compressed.Length)).ConfigureAwait(false);
            await stream.FlushAsync().ConfigureAwait(false);
            if (flags != 4) Interlocked.Add(ref rawOffset, bytes.Length);
            PhysicalBytes += header.Length + compressed.Length;
        }

        // Metadata is outside the logical playback/live stream, including failed captures.
        public Task WriteDiagnostics(string report) => Locked(async () => {
            if (diagnosticsWritten) throw new InvalidOperationException("Replay diagnostics already written.");
            byte[] bytes = System.Text.Encoding.UTF8.GetBytes(report);
            if (bytes.Length > MaxDiagnosticsSize) throw new InvalidDataException("Recording diagnostics exceed 1 MiB.");
            using var json = System.Text.Json.JsonDocument.Parse(bytes);
            if (json.RootElement.ValueKind != System.Text.Json.JsonValueKind.Object) throw new InvalidDataException("Invalid recording diagnostics.");
            await FlushPending().ConfigureAwait(false);
            if (first) {
                await stream.WriteAsync(Magic).ConfigureAwait(false);
                PhysicalBytes += Magic.Length;
            }
            await WriteBlock(bytes, lastTime, 4).ConfigureAwait(false);
            diagnosticsWritten = true;
        });

        public Task Complete(uint time) => Locked(async () => {
            if (first) throw new InvalidDataException("Replay has no complete header.");
            if (time < lastTime) throw new InvalidDataException("Completion precedes the final replay tick.");
            await FlushPending().ConfigureAwait(false);
            await stream.WriteAsync(Header(0, 0, rawOffset, time, 0, 2)).ConfigureAwait(false);
            await stream.FlushAsync().ConfigureAwait(false);
            PhysicalBytes += ChunkHeaderSize;
            completed = true;
        });

        private async Task Locked(Func<Task> action) {
            await gate.WaitAsync().ConfigureAwait(false);
            try {
                if (error != null) throw new IOException("Replay container write failed.", error);
                if (completed) throw new InvalidOperationException("Replay container is complete.");
                try { await action().ConfigureAwait(false); }
                catch (Exception ex) { error = ex; throw; }
            } finally { gate.Release(); }
        }

        private static byte[] Header(int compressedLength, int rawLength, long offset, uint time, uint crc, uint flags) {
            var header = new byte[ChunkHeaderSize];
            BinaryPrimitives.WriteUInt32LittleEndian(header, ChunkMagic);
            BinaryPrimitives.WriteInt32LittleEndian(header.AsSpan(4), compressedLength);
            BinaryPrimitives.WriteInt32LittleEndian(header.AsSpan(8), rawLength);
            BinaryPrimitives.WriteInt64LittleEndian(header.AsSpan(12), offset);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(20), time);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(24), crc);
            BinaryPrimitives.WriteUInt32LittleEndian(header.AsSpan(28), flags);
            return header;
        }

        // Used for late live spectators: stream blocks ending at frame boundaries instead of allocating the whole run.
        public static async Task ReadPrefix(Stream source, long length, Func<ReadOnlyMemory<byte>, Task> consume) {
            if (length < 0) throw new ArgumentOutOfRangeException(nameof(length));
            var magic = new byte[Magic.Length];
            await ReadExactly(source, magic).ConfigureAwait(false);
            if (!magic.SequenceEqual(Magic)) throw new InvalidDataException("Unknown replay container.");
            long offset = 0;
            uint previousTime = 0;
            var header = new byte[ChunkHeaderSize];
            while (offset < length) {
                await ReadExactly(source, header).ConfigureAwait(false);
                int encodedSize = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(4));
                int size = BinaryPrimitives.ReadInt32LittleEndian(header.AsSpan(8));
                if (BinaryPrimitives.ReadUInt32LittleEndian(header) != ChunkMagic ||
                    size < 4 || size > MaxFrameSize || encodedSize <= 0 || encodedSize > MaxFrameSize + 1048576 ||
                    BinaryPrimitives.ReadInt64LittleEndian(header.AsSpan(12)) != offset ||
                    BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(28)) != (offset == 0 ? 1u : 0u)) {
                    throw new InvalidDataException("Invalid replay chunk.");
                }
                var encoded = new byte[encodedSize];
                await ReadExactly(source, encoded).ConfigureAwait(false);
                using var decoder = new BrotliStream(new MemoryStream(encoded), CompressionMode.Decompress);
                var bytes = new byte[size];
                await ReadExactly(decoder, bytes).ConfigureAwait(false);
                if (decoder.ReadByte() != -1 || Crc32(bytes) != BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(24))) {
                    throw new InvalidDataException("Replay chunk checksum failed.");
                }
                uint time = ValidateBlock(bytes, offset == 0, previousTime);
                if (time != BinaryPrimitives.ReadUInt32LittleEndian(header.AsSpan(20))) throw new InvalidDataException("Replay chunk timestamp mismatch.");
                // The requested spectator prefix may end on a frame inside this block.
                int take = checked((int)Math.Min(size, length - offset));
                if (take < size) ValidateBlock(bytes.AsSpan(0, take), offset == 0, previousTime);
                await consume(bytes.AsMemory(0, take)).ConfigureAwait(false);
                previousTime = time;
                offset += size;
            }
        }

        private static uint ValidateBlock(ReadOnlySpan<byte> bytes, bool header, uint previousTime) {
            int position = 0;
            while (position < bytes.Length) {
                if (bytes.Length - position < (header ? 4 : 8)) throw new InvalidDataException("Truncated replay frame.");
                int length = BinaryPrimitives.ReadInt32LittleEndian(bytes.Slice(position));
                if (length < (header ? 0 : 4) || length > bytes.Length - position - 4) throw new InvalidDataException("Invalid replay frame length.");
                if (!header) {
                    uint time = BinaryPrimitives.ReadUInt32LittleEndian(bytes.Slice(position + 4));
                    if (time < previousTime) throw new InvalidDataException("Replay timestamps are out of order.");
                    previousTime = time;
                }
                position += length + 4;
                if (header && position != bytes.Length) throw new InvalidDataException("Header block contains multiple frames.");
            }
            return header ? 0 : previousTime;
        }

        private static async Task ReadExactly(Stream source, Memory<byte> bytes) {
            int offset = 0;
            while (offset < bytes.Length) {
                int read = await source.ReadAsync(bytes.Slice(offset)).ConfigureAwait(false);
                if (read == 0) throw new EndOfStreamException("Incomplete replay chunk.");
                offset += read;
            }
        }

        private static readonly uint[] crcTable = Enumerable.Range(0, 256).Select(i => {
            uint crc = (uint)i;
            for (int bit = 0; bit < 8; ++bit) crc = (crc >> 1) ^ ((crc & 1) == 0 ? 0 : 0xedb88320u);
            return crc;
        }).ToArray();

        public static uint Crc32(ReadOnlySpan<byte> bytes) {
            uint crc = uint.MaxValue;
            foreach (byte value in bytes) crc = crcTable[(crc ^ value) & 255] ^ (crc >> 8);
            return ~crc;
        }
    }
}
