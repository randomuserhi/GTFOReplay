﻿using System.Collections.Concurrent;
using System.Net;
using System.Net.Sockets;

namespace ReplayRecorder {
    internal class TCPServer : IDisposable {
        public delegate void OnAccept(EndPoint endpoint);
        public delegate void OnReceive(ArraySegment<byte> buffer, EndPoint endpoint);
        public delegate void OnDisconnect(EndPoint endpoint);
        public delegate void OnClose();

        private readonly int bufferSize;
        private Socket? socket;

        public OnAccept? onAccept = null;
        public OnReceive? onReceive = null;
        public OnDisconnect? onDisconnect = null;
        public OnClose? onClose = null;

        private class Connection : IDisposable {
            public enum State {
                waiting,
                reading
            }

            public Socket socket;
            public readonly EndPoint remoteEP;
            public byte[] recvBuffer;
            public byte[] sendBuffer;
            public byte[] messageBuffer;

            public SemaphoreSlim semaphoreSend = new SemaphoreSlim(1);
            public State state = State.waiting;
            public int messageSize = 0;
            public int bytesWritten = 0;

            public Connection(Socket socket, int bufferSize) {
                this.socket = socket;
                remoteEP = socket.RemoteEndPoint!;
                messageBuffer = new byte[bufferSize];
                recvBuffer = new byte[bufferSize];
                sendBuffer = new byte[bufferSize];
            }

            public void Dispose() {
                semaphoreSend.Dispose();
                socket.Dispose();
            }
        }
        private ConcurrentDictionary<EndPoint, Connection> acceptedConnections = new ConcurrentDictionary<EndPoint, Connection>();
        public ICollection<EndPoint> Connections {
            get => acceptedConnections.Keys;
        }

        public TCPServer(int bufferSize = 8192) {
            if (bufferSize < sizeof(int)) throw new ArgumentException("Buffer size cannot be smaller than a message header [sizeof(int)].");
            this.bufferSize = bufferSize;
        }

        private void Open() {
            if (socket != null) Dispose();
            socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            socket.SetSocketOption(SocketOptionLevel.IP, SocketOptionName.ReuseAddress, true);
        }

        public EndPoint Bind(EndPoint remoteEP, int backlog = 5) {
            Open();
            socket!.Bind(remoteEP);
            socket!.Listen(backlog);
            _ = Listen(); // NOTE(randomuserhi): Start listen loop, not sure if `Bind` should automatically start the listen loop
            return socket.LocalEndPoint!;
        }

        private async Task Listen() {
            if (socket == null) return;
            Socket incoming = await socket.AcceptAsync().ConfigureAwait(false);

            EndPoint? remoteEndPoint = incoming.RemoteEndPoint;
            if (remoteEndPoint != null) {
                Connection connection = new Connection(incoming, bufferSize);
                acceptedConnections.AddOrUpdate(remoteEndPoint, connection, (key, old) => { incoming.Dispose(); return old; });
                onAccept?.Invoke(remoteEndPoint);
                _ = ListenTo(connection);
            } else {
                incoming.Dispose();
            }

            _ = Listen(); // Start new listen task => async loop
        }

        private async Task ListenTo(Connection connection) {
            try {
                Socket socket = connection.socket;
                int receivedBytes = await socket.ReceiveAsync(connection.recvBuffer, SocketFlags.None).ConfigureAwait(false);

                if (receivedBytes > 0) {
                    int bytesLeft = receivedBytes;
                    int bytesRead = 0;
                    do {
                        switch (connection.state) {
                        case Connection.State.waiting: {
                            connection.messageSize = BitHelper.ReadInt(connection.recvBuffer, ref bytesRead);
                            connection.bytesWritten = 0;

                            if (connection.messageSize > 0) {
                                connection.state = Connection.State.reading;
                            }
                            break;
                        }
                        case Connection.State.reading: {
                            int bytesToWrite = bytesLeft;
                            if (connection.bytesWritten + bytesLeft > connection.messageSize) {
                                bytesToWrite = connection.messageSize - connection.bytesWritten;
                            }
                            Array.Copy(connection.recvBuffer, bytesRead, connection.messageBuffer, connection.bytesWritten, bytesToWrite);
                            connection.bytesWritten += bytesToWrite;
                            bytesRead += bytesToWrite;

                            if (connection.bytesWritten == connection.messageSize) {
                                connection.state = Connection.State.waiting;
                                onReceive?.Invoke(new ArraySegment<byte>(connection.messageBuffer, 0, connection.messageSize), connection.remoteEP);
                            }
                            break;
                        }
                        }

                        bytesLeft = receivedBytes - bytesRead;
                    } while (bytesLeft > 0);

                    _ = ListenTo(connection); // Start new listen task => async loop
                } else {
                    Dispose(connection);
                    onDisconnect?.Invoke(connection.remoteEP);
                }
            } catch (ObjectDisposedException) {
                // NOTE(randomuserhi): Socket was disposed during ReceiveAsync
                Dispose(connection);
                onDisconnect?.Invoke(connection.remoteEP);
            }
        }

        private void Dispose(Connection connection) {
            acceptedConnections.Remove(connection.socket.RemoteEndPoint!, out _);
            connection.Dispose();
        }

        public async Task Send(ArraySegment<byte> data) {
            List<Task> tasks = new List<Task>();
            foreach (EndPoint remoteEP in acceptedConnections.Keys) {
                tasks.Add(SendTo(data, remoteEP));
            }
            await Task.WhenAll(tasks).ConfigureAwait(false);
        }

        public async Task RawSendTo(ArraySegment<byte> data, EndPoint remoteEP) {
            if (acceptedConnections.TryGetValue(remoteEP, out Connection? connection)) {
                await connection.semaphoreSend.WaitAsync().ConfigureAwait(false);
                try {
                    int sent = await connection.socket.SendAsync(data, SocketFlags.None).ConfigureAwait(false);
                    while (sent < data.Count) {
                        sent += await connection.socket.SendAsync(new ArraySegment<byte>(data.Array!, data.Offset + sent, data.Count - sent), SocketFlags.None).ConfigureAwait(false);
                    }
                } catch (SocketException) {
                    return;
                } finally {
                    connection.semaphoreSend.Release();
                }
            }
        }

        public async Task SendTo(ArraySegment<byte> data, EndPoint remoteEP) {
            if (acceptedConnections.TryGetValue(remoteEP, out Connection? connection)) {
                await connection.semaphoreSend.WaitAsync().ConfigureAwait(false);
                try {
                    if (data.Count > int.MaxValue) {
                        return; // TODO(randomuserhi): Throw exception...
                    }
                    int size = sizeof(int) + data.Count;
                    int capacity = connection.sendBuffer.Length;
                    while (capacity < size) {
                        capacity *= 2;
                    }
                    if (capacity > connection.sendBuffer.Length) {
                        connection.sendBuffer = new byte[capacity];
                    }
                    int index = 0;
                    BitHelper.WriteBytes(data.Count, connection.sendBuffer, ref index);
                    Array.Copy(data.Array!, data.Offset, connection.sendBuffer, index, data.Count);

                    int sent = await connection.socket.SendAsync(new ArraySegment<byte>(connection.sendBuffer, 0, size), SocketFlags.None).ConfigureAwait(false);
                    while (sent < size) {
                        sent += await connection.socket.SendAsync(new ArraySegment<byte>(connection.sendBuffer, sent, size - sent), SocketFlags.None).ConfigureAwait(false);
                    }
                } catch (SocketException) {
                    return;
                } finally {
                    connection.semaphoreSend.Release();
                }
            }
        }

        public void Disconnect() {
            Dispose();
        }

        public void DisconnectClients() {
            foreach (Connection? connection in acceptedConnections.Values) {
                connection.Dispose();
            }
            acceptedConnections.Clear();
        }

        public void Dispose() {
            if (socket == null) return;

            DisconnectClients();

            socket.Dispose();
            socket = null;

            onClose?.Invoke();
        }
    }
}
