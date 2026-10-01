using BepInEx.Unity.IL2CPP;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;

namespace ReplayRecorder.Core {
    [ReplayData("ReplayRecorder.Session", "0.0.1")]
    internal sealed class SessionData : ReplayHeader {
        [ReplayInit]
        private static void Init() => Replay.Trigger(new SessionData());

        public override void Write(ByteBuffer buffer) {
            var session = SnapshotManager.instance!;
            BitHelper.WriteBytes(session.SessionId, buffer);
            BitHelper.WriteBytes(session.StartedUtc, buffer);
            BitHelper.WriteBytes(session.Expedition, buffer);
            BitHelper.WriteBytes(session.LevelName, buffer);
            BitHelper.WriteBytes(session.RundownName, buffer);
            BitHelper.WriteBytes(UnityEngine.Application.version, buffer);
            // These are sampling policies, not a guarantee of complete world visibility.
            BitHelper.WriteBytes((byte)10, buffer);
            BitHelper.WriteBytes((byte)20, buffer);
            var plugins = IL2CPPChainloader.Instance.Plugins.Values.OrderBy(p => p.Metadata.GUID).ToArray();
            BitHelper.WriteBytes(checked((ushort)plugins.Length), buffer);
            foreach (var plugin in plugins) {
                BitHelper.WriteBytes(plugin.Metadata.GUID, buffer);
                BitHelper.WriteBytes(plugin.Metadata.Version.ToString(), buffer);
            }
        }
    }
}
