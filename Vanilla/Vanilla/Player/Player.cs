using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Player {
    internal static class PlayerManager {
        [ReplayOnPlayerSpawn]
        private static void Spawn(PlayerAgent agent) {
            rPlayer player = new rPlayer(agent);
            Replay.Spawn(player);
            Replay.Spawn(new rPlayerAnimation(agent));
            Replay.Spawn(new rPlayerBackpack(agent));
            Replay.Spawn(new rPlayerStats(agent));
        }

        [ReplayOnPlayerDespawn]
        private static void Despawn(int id) {
            Replay.TryDespawn<rPlayerAnimation>(id);
            Replay.TryDespawn<rPlayerBackpack>(id);
            Replay.TryDespawn<rPlayerStats>(id);
            Replay.TryDespawn<rPlayer>(id);
        }
    }

    [ReplayData("Vanilla.Player", "0.0.2")]
    public class rPlayer : DynamicTransform {
        public PlayerAgent agent;

        private Identifier lastEquipped = Identifier.unknown;
        private Identifier equipped {
            get {
                return Identifier.From(agent.Inventory.WieldedItem);
            }
        }

        private bool _flashlightEnabled => agent.Inventory != null ? agent.Inventory.FlashlightEnabled : false;
        private bool flashlightEnabled = false;

        private float _flashlightRange => agent.Inventory != null && agent.Inventory.FlashlightEnabled ? agent.Inventory.m_flashlight.range : 1000.0f;
        private float flashlightRange = 1000.0f;

        public override bool Active => agent != null && agent.Owner != null;
        public override bool IsDirty => base.IsDirty || equipped != lastEquipped || flashlightEnabled != _flashlightEnabled || flashlightRange != _flashlightRange;

        public rPlayer(PlayerAgent player) : base(player.GlobalID, new AgentTransform(player)) {
            agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            flashlightEnabled = _flashlightEnabled;
            flashlightRange = _flashlightRange;

            base.Write(buffer);
            BitHelper.WriteBytes(equipped, buffer);
            BitHelper.WriteBytes(flashlightEnabled, buffer);
            BitHelper.WriteHalf(flashlightRange, buffer);

            lastEquipped = equipped;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes(agent.Owner.Lookup, buffer);
            BitHelper.WriteBytes((byte)agent.PlayerSlotIndex, buffer);
            BitHelper.WriteBytes(agent.Owner.NickName, buffer);
        }
    }
}
