using Player;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Snapshot;
using UnityEngine;

namespace ReplayRecorder.Core {
    [ReplayData("ReplayRecorder.Marker", "0.0.1")]
    public sealed class ReplayMarker : ReplayEvent {
        private readonly string label;
        private readonly ulong player;
        private readonly byte dimension;
        private readonly Vector3 position;

        private ReplayMarker(string label, PlayerAgent agent) {
            this.label = label;
            player = agent.Owner.Lookup;
            dimension = (byte)agent.DimensionIndex;
            position = agent.transform.position;
        }

        // Local recording only: no chat message or dependency on other players' mods.
        public static bool Add(string label) {
            if (SnapshotManager.instance?.Ready != true) return false;
            var agent = PlayerManager.GetLocalPlayerAgent();
            if (agent == null) return false;
            label = Utils.RemoveHTMLTags(label ?? "").Trim();
            if (label.Length == 0) label = "Marker";
            if (label.Length > 120) label = label.Substring(0, 120);
            if (!Replay.Trigger(new ReplayMarker(label, agent))) return false;
            SnapshotManager.instance.MarkerAdded();
            return true;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(label, buffer);
            BitHelper.WriteBytes(player, buffer);
            BitHelper.WriteBytes(dimension, buffer);
            BitHelper.WriteBytes(position, buffer);
        }
    }
}
