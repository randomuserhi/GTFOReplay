using Il2CppInterop.Runtime.Attributes;
using ReplayRecorder.Core;
using System.Runtime.CompilerServices;

namespace ReplayRecorder {
    public static class RNet {
        [MethodImpl(MethodImplOptions.NoInlining)]
        internal static void Init() { }

        static RNet() {
            SNetUtils.SNetUtils.OnReceive += Receive;
        }

        private class EventInfo {
            public string name;
            public Action<ulong, ArraySegment<byte>>? onReceive;
            public byte[] header;

            public EventInfo(string name, byte[] header, Action<ulong, ArraySegment<byte>>? onReceive = null) {
                this.name = name;
                this.header = header;
                this.onReceive = onReceive;
            }
        }

        private static Dictionary<string, EventInfo> eventMap = new Dictionary<string, EventInfo>();

        [HideFromIl2Cpp]
        private static void Receive(ArraySegment<byte> packet, ulong from) {
            int index = 0;
            byte messageId = BitHelper.ReadByte(packet, ref index);
            if (messageId != 1) return;

            string eventName = BitHelper.ReadString(packet, ref index);
            if (!eventMap.ContainsKey(eventName)) return;

            int payloadSize = BitHelper.ReadInt(packet, ref index);

            eventMap[eventName].onReceive?.Invoke(from, new ArraySegment<byte>(packet.Array!, packet.Offset + index, payloadSize));
        }

        [HideFromIl2Cpp]
        public static void Register(string eventName, Action<ulong, ArraySegment<byte>> callback) {
            if (!eventMap.ContainsKey(eventName)) {
                ByteBuffer header = new ByteBuffer();
                BitHelper.WriteBytes((byte)1, header);
                BitHelper.WriteBytes(eventName, header);
                byte[] headerBytes = new byte[header.Count];
                Array.Copy(header.Array.Array!, header.Array.Offset, headerBytes, 0, header.Count);

                eventMap.Add(eventName, new EventInfo(eventName, headerBytes, callback));
            } else {
                eventMap[eventName].onReceive += callback;
            }
        }

        [HideFromIl2Cpp]
        public static void Trigger(string eventName, ByteBuffer bytes) {
            Trigger(eventName, bytes.Array);
        }

        [HideFromIl2Cpp]
        public static void Trigger(string eventName, ArraySegment<byte> bytes) {
            if (!eventMap.ContainsKey(eventName)) throw new Exception($"Event '{eventName}' does not exist.");
            EventInfo info = eventMap[eventName];

            int packetSize = info.header.Length + sizeof(int) + bytes.Count;

            byte[] packet = new byte[packetSize];
            Array.Copy(info.header, packet, info.header.Length);

            int index = info.header.Length;
            BitHelper.WriteBytes(bytes, packet, ref index);

            SNetUtils.SNetUtils.SendBytes(packet, ReplayPlayerManager.playersWithReplayMod);
        }
    }
}
