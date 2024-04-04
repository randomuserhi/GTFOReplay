using API;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using Vanilla.Specification;

namespace Vanilla.Player {
    internal static class PlayerReplayManager {
        [ReplayOnHeaderCompletion]
        private static void Init() {
            players.Clear();

            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                Spawn(player);
            }
        }

        [ReplayTick]
        private static void Tick() {
            PlayerAgent[] agents = PlayerManager.PlayerAgentsInLevel.ToArray();
            foreach (rPlayer player in players.ToArray()) {
                if (!agents.Any(p => p.GlobalID == player.Id)) {
                    Despawn(player.agent);
                }
            }
            foreach (PlayerAgent player in agents) {
                if (!players.Any(p => p.Id == player.GlobalID)) {
                    Spawn(player);
                }
            }
        }

        private static List<rPlayer> players = new List<rPlayer>();

        public static void Spawn(PlayerAgent agent) {
            if (!Replay.Active) return;

            rPlayer? player = players.Find(p => p.Id == agent.GlobalID);
            if (player != null) {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                player.agent = agent;
                player.transform = new AgentTransform(agent);
                if (Replay.Has<rPlayerModel>(player.Id)) {
                    Replay.Get<rPlayerModel>(player.Id).player = player.agent;
                }
                if (Replay.Has<rPlayerBackpack>(player.Id)) {
                    Replay.Get<rPlayerBackpack>(player.Id).agent = player.agent;
                }
                if (Replay.Has<rPlayerStats>(player.Id)) {
                    Replay.Get<rPlayerStats>(player.Id).player = player.agent;
                }
                return;
            }

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            player = new rPlayer(agent);
            Replay.Spawn(player);
            Replay.Spawn(new rPlayerModel(agent));
            Replay.Spawn(new rPlayerBackpack(agent));
            Replay.Spawn(new rPlayerStats(agent));
            players.Add(player);
        }

        public static void Despawn(PlayerAgent agent) {
            if (!Replay.Active) return;
            if (!Replay.Has<rPlayer>(agent.GlobalID)) return;

            rPlayer? player = players.Find(p => p.Id == agent.GlobalID);
            if (player == null) {
                APILogger.Error($"(DespawnPlayer) Could not find player in managed list.");
                return;
            }

            APILogger.Debug($"{agent.Owner.NickName} has left.");
            Replay.Despawn(player);
            Replay.TryDespawn<rPlayerModel>(agent.GlobalID);
            Replay.TryDespawn<rPlayerBackpack>(agent.GlobalID);
            Replay.TryDespawn<rPlayerStats>(agent.GlobalID);
            players.Remove(player);
        }
    }

    [ReplayData("Vanilla.Player", "0.0.1")]
    internal class rPlayer : DynamicTransform {
        public PlayerAgent agent;

        private ushort lastEquipped = 0;
        private ushort equipped {
            get {
                ItemEquippable? item = agent.Inventory.WieldedItem;
                if (item != null) {
                    if (item.GearIDRange != null) {
                        return GTFOSpecification.GetGear(item.GearIDRange.PublicGearName);
                    } else if (item.ItemDataBlock != null) {
                        return GTFOSpecification.GetItem(item.ItemDataBlock.persistentID);
                    }
                }
                return 0;
            }
        }

        public override bool Active {
            get {
                if (agent == null && Replay.Has<rPlayer>(Id)) {
                    Replay.Despawn(Replay.Get<rPlayer>(Id));
                }
                return agent != null;
            }
        }
        public override bool IsDirty => base.IsDirty || equipped != lastEquipped;

        public rPlayer(PlayerAgent player) : base(player.GlobalID, new AgentTransform(player)) {
            agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(equipped, buffer);

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
