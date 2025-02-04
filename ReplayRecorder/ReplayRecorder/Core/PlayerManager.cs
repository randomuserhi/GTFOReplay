using API;
using HarmonyLib;
using Player;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;

namespace ReplayRecorder.Core {
    [HarmonyPatch]
    public static class ReplayPlayerManager {
        private static ByteBuffer pingPacket = new ByteBuffer();
        static ReplayPlayerManager() {
            BitHelper.WriteBytes((byte)0, pingPacket);

            SNetUtils.SNetUtils.OnReceive += Receive;
        }

        private static void Receive(ArraySegment<byte> packet, ulong from) {
            int index = 0;
            byte messageId = BitHelper.ReadByte(packet, ref index);
            if (messageId != 0) return;

            rPlayer? player = players.FirstOrDefault((p) => p != null && p.snet == from, null);
            if (player?.agent?.Owner == null) {
                APILogger.Warn($"Received packet from player with snet '{from}', but no player was found.");
                return;
            }

            playersWithReplayMod.RemoveAll((Il2CppSystem.Predicate<SNet_Player>)((p) => p.Lookup == player.snet));
            playersWithReplayMod.Add(player.agent.Owner);

            APILogger.Warn($"player with snet '{from}' has replay mod.");

            player._hasReplayMod = true;
        }

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
                if (player.agent == null || player.agent.Owner == null || !agents.Any(p => p.GlobalID == player.id)) {
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

        public static Il2CppSystem.Collections.Generic.List<SNet_Player> playersWithReplayMod = new Il2CppSystem.Collections.Generic.List<SNet_Player>();

        private static List<rPlayer> players = new List<rPlayer>();
        private static List<rPlayer> _players = new List<rPlayer>();

        public static Action<PlayerAgent>? OnPlayerSpawn;
        public static Action<int>? OnPlayerDespawn;

        private static void Spawn(PlayerAgent agent) {
            if (!Replay.Ready) return;

            // Remove any player of same SNET
            RemoveAll(agent);

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            rPlayer player = new rPlayer(agent);

            if (agent.Owner.Lookup == SNet.LocalPlayer.Lookup) {
                player._hasReplayMod = true;
            } else {
                SNetUtils.SNetUtils._playerBuff.Clear();
                SNetUtils.SNetUtils._playerBuff.Add(agent.Owner);
                SNetUtils.SNetUtils.SendBytes(pingPacket.Array, SNetUtils.SNetUtils._playerBuff);
            }

            Replay.Spawn(player);
            players.Add(player);

            OnPlayerSpawn?.Invoke(player.agent);
        }

        private static void Despawn(PlayerAgent agent) {
            if (!Replay.Ready) return;
            if (!Replay.Has<rPlayer>(agent.GlobalID)) return;

            RemoveAll(agent);
        }

        private static void RemoveAll(PlayerAgent agent) {
            players.RemoveAll((player) => {
                bool match = player.agent == null || player.agent.Owner == null || player.snet == agent.Owner.Lookup;
                if (match) {
                    Despawn(player);
                }
                return match;
            });
        }

        private static void Despawn(rPlayer player) {
            APILogger.Debug($"Despawned player {player.name}.");

            Replay.TryDespawn<rPlayer>(player.id);
            playersWithReplayMod.RemoveAll((Il2CppSystem.Predicate<SNet_Player>)((p) => p == null || p.Lookup == player.snet));

            OnPlayerDespawn?.Invoke(player.id);
        }

        [ReplayData("ReplayRecorder.Player", "0.0.1")]
        internal class rPlayer : ReplayDynamic {
            public PlayerAgent agent;
            public ulong snet;
            public string name;

            private bool hasReplayMod = false;
            public bool _hasReplayMod = false;

            private bool isMaster = false;
            private bool _isMaster => SNet.Master.Lookup == snet;

            public override bool Active => agent != null && agent.Owner != null;
            public override bool IsDirty => hasReplayMod != _hasReplayMod || isMaster != _isMaster;

            public rPlayer(PlayerAgent player) : base(player.GlobalID) {
                snet = player.Owner.Lookup;
                name = player.Owner.NickName;
                agent = player;
            }

            public override void Write(ByteBuffer buffer) {
                hasReplayMod = _hasReplayMod;
                isMaster = _isMaster;

                BitHelper.WriteBytes(hasReplayMod, buffer);
                BitHelper.WriteBytes(isMaster, buffer);
            }

            public override void Spawn(ByteBuffer buffer) {
                BitHelper.WriteBytes(agent.Owner.Lookup, buffer);
                BitHelper.WriteBytes(agent.Owner.NickName, buffer);
            }
        }
    }
}
