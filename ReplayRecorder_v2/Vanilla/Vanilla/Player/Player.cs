using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Player {
    [HarmonyPatch]
    internal static class PlayerReplayManager {
        [HarmonyPatch]
        private static class SpawningPatches {
            [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnSpawn))]
            [HarmonyPostfix]
            private static void OnSpawn(PlayerSync __instance) {
                Spawn(__instance.m_agent);
            }

            [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnDespawn))]
            [HarmonyPostfix]
            private static void OnDespawn(PlayerSync __instance) {
                Despawn(__instance.m_agent);
            }
        }

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

        private static void Spawn(PlayerAgent agent) {
            if (!Replay.Ready) return;

            // Remove any player of same SNET
            RemoveAll(agent);

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            rPlayer player = new rPlayer(agent);
            Replay.Spawn(player);
            Replay.Spawn(new rPlayerAnimation(agent));
            Replay.Spawn(new rPlayerBackpack(agent));
            Replay.Spawn(new rPlayerStats(agent));
            players.Add(player);
        }

        private static void Despawn(PlayerAgent agent) {
            if (!Replay.Ready) return;
            if (!Replay.Has<rPlayer>(agent.GlobalID)) return;

            APILogger.Debug($"{agent.Owner.NickName} has left.");

            RemoveAll(agent);
        }

        private static void RemoveAll(PlayerAgent agent) {
            players.RemoveAll((player) => {
                bool match = player.agent == null || player.agent.Owner == null || player.agent.Owner.Lookup == agent.Owner.Lookup;
                if (match) {
                    Despawn(player);
                }
                return match;
            });
        }

        private static void Despawn(rPlayer player) {
            Replay.TryDespawn<rPlayerAnimation>(player.id);
            Replay.TryDespawn<rPlayerBackpack>(player.id);
            Replay.TryDespawn<rPlayerStats>(player.id);
            Replay.TryDespawn<rPlayer>(player.id);
        }
    }

    [ReplayData("Vanilla.Player", "0.0.1")]
    internal class rPlayer : DynamicTransform {
        public PlayerAgent agent;

        private Identifier lastEquipped = Identifier.unknown;
        private Identifier equipped {
            get {
                return Identifier.From(agent.Inventory.WieldedItem);
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
