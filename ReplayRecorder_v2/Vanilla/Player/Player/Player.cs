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

            _players.Clear();
            foreach (rPlayer player in players) {
                if (!agents.Any(p => p.GlobalID == player.id)) {
                    Despawn(player);
                } else {
                    _players.Add(player);
                }
            }
            List<rPlayer> temp = players;
            players = _players;
            _players = temp;

            foreach (PlayerAgent player in agents) {
                if (!players.Any(p => p.id == player.GlobalID)) {
                    Spawn(player);
                }
            }
        }

        private static List<rPlayer> players = new List<rPlayer>();
        private static List<rPlayer> _players = new List<rPlayer>();

        public static void Spawn(PlayerAgent agent) {
            if (!Replay.Ready) return;

            rPlayer? player = players.Find(p => p.id == agent.GlobalID);
            if (player != null) {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                player.agent = agent;
                player.transform = new AgentTransform(agent);
                if (Replay.TryGet<rPlayerModel>(player.id, out rPlayerModel? model)) {
                    model.player = player.agent;
                }
                if (Replay.TryGet<rPlayerBackpack>(player.id, out rPlayerBackpack? backpack)) {
                    backpack.agent = player.agent;
                }
                if (Replay.TryGet<rPlayerStats>(player.id, out rPlayerStats? stats)) {
                    stats.player = player.agent;
                }
                return;
            }

            // Remove any player of same SNET
            players.RemoveAll((player) => {
                bool match = player.agent == null || player.agent.Owner == null || player.agent.Owner.Lookup == agent.Owner.Lookup;
                if (match) {
                    Despawn(player);
                }
                return match;
            });

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            player = new rPlayer(agent);
            Replay.Spawn(player);
            Replay.Spawn(new rPlayerModel(agent));
            Replay.Spawn(new rPlayerBackpack(agent));
            Replay.Spawn(new rPlayerStats(agent));
            players.Add(player);
        }

        public static void Despawn(PlayerAgent agent) {
            if (!Replay.Ready) return;
            if (!Replay.Has<rPlayer>(agent.GlobalID)) return;

            APILogger.Debug($"{agent.Owner.NickName} has left.");

            // Remove any player of same SNET
            players.RemoveAll((player) => {
                bool match = player.agent == null || player.agent.Owner == null || player.agent.Owner.Lookup == agent.Owner.Lookup;
                if (match) {
                    Despawn(player);
                }
                return match;
            });
        }

        private static void Despawn(rPlayer player) {
            APILogger.Error(player.id);
            Replay.TryDespawn<rPlayerModel>(player.id);
            Replay.TryDespawn<rPlayerBackpack>(player.id);
            Replay.TryDespawn<rPlayerStats>(player.id);
            Replay.TryDespawn<rPlayer>(player.id);
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
                if (agent == null && Replay.Has<rPlayer>(id)) {
                    Replay.Despawn(Replay.Get<rPlayer>(id));
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
