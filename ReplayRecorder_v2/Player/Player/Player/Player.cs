using API;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Player {
    internal static class PlayerReplayManager {
        [ReplayOnHeaderCompletion]
        private static void Init() {
            players.Clear();

            foreach (PlayerAgent player in PlayerManager.PlayerAgentsInLevel) {
                Spawn(player);
            }
        }

        private static List<rPlayer> players = new List<rPlayer>();

        public static void Spawn(PlayerAgent agent) {
            rPlayer? player = players.Find(p => p.agent.Owner.Lookup == agent.Owner.Lookup);
            if (player != null) {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                player.agent = agent;
                return;
            }

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            player = new rPlayer(agent);
            Replay.Trigger(new rPlayerSpawn(player.agent));
            Replay.Spawn(player, agent.DimensionIndex, agent.transform.position, agent.transform.rotation);
            players.Add(player);
        }

        public static void Despawn(PlayerAgent agent) {
            rPlayer? player = players.Find(p => p.agent.Owner.Lookup == agent.Owner.Lookup);
            if (player == null) {
                APILogger.Error($"(DespawnPlayer) Could not find player in managed list.");
                return;
            }

            APILogger.Debug($"{agent.Owner.NickName} has left.");
            Replay.Trigger(new rPlayerDespawn(player.agent));
            Replay.Despawn(player);
            players.Remove(player);
        }
    }

    [ReplayData("Vanilla.Player.Spawn", "0.0.1")]
    internal class rPlayerSpawn : ReplayEvent {
        private PlayerAgent player;

        public rPlayerSpawn(PlayerAgent player) {
            this.player = player;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(player.Owner.Lookup, buffer);
            BitHelper.WriteBytes(player.GlobalID, buffer);
            BitHelper.WriteBytes((byte)player.PlayerSlotIndex, buffer);
            BitHelper.WriteBytes(player.Owner.NickName, buffer);
        }
    }

    [ReplayData("Vanilla.Player.Despawn", "0.0.1")]
    internal class rPlayerDespawn : ReplayEvent {
        private PlayerAgent player;

        public rPlayerDespawn(PlayerAgent player) {
            this.player = player;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(player.Owner.Lookup, buffer);
            BitHelper.WriteBytes(player.GlobalID, buffer);
        }
    }

    [ReplayData("Vanilla.Player", "0.0.1")]
    internal class rPlayer : DynamicTransform {
        public PlayerAgent agent;

        public rPlayer(PlayerAgent player) : base(player.GlobalID, new AgentTransform(player)) {
            agent = player;
        }
    }
}
