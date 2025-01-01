using DanosStatTracker.Data;
using ReplayRecorder.API.Attributes;
using SNetwork;
using Vanilla.Player;

namespace DanosStatTracker.Hooks {
    internal class PositionTracking {
        [ReplayHook(typeof(rPlayer), false)]
        private static void PlayerHook(long timestamp, rPlayer player) {
            if (!SNet.IsMaster) return;
            if (DanosStaticStore.currentRunDownDataStore == null) return;

            timestamp /= 1000; // Convert timestamp to seconds.

            var positionalData = new DanosPositionalDataTransfer {
                x = player.transform.position.x,
                z = player.transform.position.z,
                Timestamp = timestamp,
                sid = (long)player.agent.Owner.Lookup,
                Name = player.agent.PlayerName
            };

            DanosStaticStore.currentRunDownDataStore.AddPositionalData(positionalData);
        }
    }
}
