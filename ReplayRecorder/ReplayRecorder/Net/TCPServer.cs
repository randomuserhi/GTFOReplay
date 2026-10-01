using System.Buffers.Binary;
using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;
using ReplayRecorder.IO;
using ReplayRecorder.Steam;

namespace ReplayRecorder {
    internal class TCPServer : IDisposable {
        public delegate void OnAccept(EndPoint endpoint);
        public delegate void OnReceive(ArraySegment<byte> buffer, EndPoint endpoint);
        public delegate void OnDisconnect(EndPoint endpoint);
        public delegate void OnClose();
        public OnAccept? onAccept;
        public OnReceive? onReceive;
        public OnDisconnect? onDisconnect;
        public OnClose? onClose;
        private readonly int bufferSize;
        private Socket? socket;
        private readonly ConcurrentDictionary<EndPoint, Connection> acceptedConnections = new();
        public ICollection<EndPoint> Connections => acceptedConnections.Keys;

        private sealed class Connection {
            public readonly Socket socket;
            public readonly EndPoint endpoint;
            public readonly SemaphoreSlim sending = new(1);
            public int closed;
            public long pendingBytes;
            public int pendingMessages;
            public Connection(Socket socket) { this.socket = socket; endpoint = socket.RemoteEndPoint!; }
        }
        public TCPServer(int bufferSize = 8192) {
            if (bufferSize < 4 || bufferSize > 81920) throw new ArgumentOutOfRangeException(nameof(bufferSize));
            this.bufferSize = bufferSize;
        }
        public EndPoint Bind(EndPoint endpoint, int backlog = 5) {
            Dispose();
            var listener = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            try {
                listener.Bind(endpoint);
                listener.Listen(backlog);
                socket = listener;
                _ = Listen(listener);
                return listener.LocalEndPoint!;
            } catch { listener.Dispose(); throw; }
        }
        private async Task Listen(Socket listener) {
            try {
                while (ReferenceEquals(socket, listener)) {
                    var incoming = await listener.AcceptAsync().ConfigureAwait(false);
                    if (!ReferenceEquals(socket, listener)) { incoming.Dispose(); break; }
                    var conn = new Connection(incoming);
                    if (!acceptedConnections.TryAdd(conn.endpoint, conn)) { incoming.Dispose(); continue; }
                    try { onAccept?.Invoke(conn.endpoint); }
                    catch (Exception error) { SteamPacketIO.Report("TCP accept callback", error); Close(conn); continue; }
                    _ = Receive(conn);
                }
            } catch (Exception error) {
                if (ReferenceEquals(socket, listener)) {
                    SteamPacketIO.Report("TCP accept", error);
                    Dispose();
                }
            }
        }
        private async Task Receive(Connection conn) {
            var buffer = new byte[bufferSize];
            var framer = new MessageFramer(bufferSize);
            try {
                while (Volatile.Read(ref conn.closed) == 0) {
                    int count = await conn.socket.ReceiveAsync(buffer, SocketFlags.None).ConfigureAwait(false);
                    if (count == 0) { framer.Complete(); break; }
                    framer.Feed(buffer.AsSpan(0, count), data => onReceive?.Invoke(data, conn.endpoint));
                }
            } catch (Exception error) {
                if (Volatile.Read(ref conn.closed) == 0) SteamPacketIO.Report($"TCP receive/{conn.endpoint}", error);
            } finally { Close(conn); }
        }
        private void Close(Connection conn) {
            if (Interlocked.Exchange(ref conn.closed, 1) != 0) return;
            acceptedConnections.TryRemove(conn.endpoint, out _);
            conn.socket.Dispose();
            SteamPacketIO.Guard($"TCP disconnect/{conn.endpoint}", () => onDisconnect?.Invoke(conn.endpoint));
            // Pending sends still release this managed semaphore after socket disposal.
        }
        public Task Send(ArraySegment<byte> data) => Task.WhenAll(acceptedConnections.Keys.Select(endpoint => SendTo(data, endpoint)));
        public Task RawSendTo(ArraySegment<byte> data, EndPoint endpoint) => QueueSend(data, endpoint, false);
        public Task SendTo(ArraySegment<byte> data, EndPoint endpoint) => QueueSend(data, endpoint, true);
        private Task QueueSend(ArraySegment<byte> data, EndPoint endpoint, bool framed) {
            if (!acceptedConnections.TryGetValue(endpoint, out var conn) || Volatile.Read(ref conn.closed) != 0) return Task.CompletedTask;
            int length = data.Count + (framed ? 4 : 0);
            int messages = Interlocked.Increment(ref conn.pendingMessages);
            long pending = Interlocked.Add(ref conn.pendingBytes, length);
            if (data.Count <= 0 || data.Count > 81920 || messages > 128 || pending > 8 * 1024 * 1024) {
                Interlocked.Decrement(ref conn.pendingMessages);
                Interlocked.Add(ref conn.pendingBytes, -length);
                SteamPacketIO.Report($"TCP send/{endpoint}", new IOException("Viewer send exceeded the packet or backlog limit."));
                Close(conn);
                return Task.CompletedTask;
            }
            var owned = new byte[length];
            if (framed) BinaryPrimitives.WriteInt32LittleEndian(owned, data.Count);
            data.AsSpan().CopyTo(owned.AsSpan(framed ? 4 : 0));
            return SendOwned(conn, owned);
        }
        private async Task SendOwned(Connection conn, byte[] data) {
            await conn.sending.WaitAsync().ConfigureAwait(false);
            try {
                int offset = 0;
                while (offset < data.Length && Volatile.Read(ref conn.closed) == 0) {
                    int sent = await conn.socket.SendAsync(new ArraySegment<byte>(data, offset, data.Length - offset), SocketFlags.None).ConfigureAwait(false);
                    if (sent == 0) throw new EndOfStreamException("Viewer socket closed during send.");
                    offset += sent;
                }
            } catch (Exception error) {
                if (Volatile.Read(ref conn.closed) == 0) SteamPacketIO.Report($"TCP send/{conn.endpoint}", error);
                Close(conn);
            } finally {
                Interlocked.Add(ref conn.pendingBytes, -data.Length);
                Interlocked.Decrement(ref conn.pendingMessages);
                conn.sending.Release();
            }
        }
        public void Disconnect() => Dispose();
        public void DisconnectClients() { foreach (var conn in acceptedConnections.Values) Close(conn); }
        public void Dispose() {
            var listener = Interlocked.Exchange(ref socket, null);
            if (listener == null) return;
            listener.Dispose();
            DisconnectClients();
            SteamPacketIO.Guard("TCP closed", () => onClose?.Invoke());
        }
    }
}
