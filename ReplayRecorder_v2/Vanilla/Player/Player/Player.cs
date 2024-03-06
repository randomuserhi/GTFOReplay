using API;
using Player;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using SNetwork;

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
                SNet_Player owner = player.agent.Owner;
                if (!agents.Any(p => p.Owner.Lookup == owner.Lookup)) {
                    Despawn(player.agent);
                }
            }
            foreach (PlayerAgent player in agents) {
                if (!players.Any(p => p.agent.Owner.Lookup == player.Owner.Lookup)) {
                    Spawn(player);
                }
            }
        }

        private static List<rPlayer> players = new List<rPlayer>();

        public static void Spawn(PlayerAgent agent) {
            if (!Replay.Active) return;

            rPlayer? player = players.Find(p => p.agent.Owner.Lookup == agent.Owner.Lookup);
            if (player != null) {
                // Replace old elevator agent with agent in level
                APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} was replaced by spawned agent.");
                player.agent = agent;
                return;
            }

            APILogger.Debug($"(SpawnPlayer) {agent.Owner.NickName} has joined.");
            player = new rPlayer(agent);
            Replay.Spawn(player);
            players.Add(player);
        }

        public static void Despawn(PlayerAgent agent) {
            if (!Replay.Active) return;

            rPlayer? player = players.Find(p => p.agent.Owner.Lookup == agent.Owner.Lookup);
            if (player == null) {
                APILogger.Error($"(DespawnPlayer) Could not find player in managed list.");
                return;
            }

            APILogger.Debug($"{agent.Owner.NickName} has left.");
            Replay.Despawn(player);
            players.Remove(player);
        }
    }

    [ReplayData("Vanilla.Player", "0.0.1")]
    internal class rPlayer : DynamicTransform {
        public PlayerAgent agent;

        private byte prevState = 0;
        private byte state {
            get {
                switch (agent.Locomotion.m_currentStateEnum) {
                case PlayerLocomotion.PLOC_State.Crouch: return 1;
                case PlayerLocomotion.PLOC_State.Downed: return 2;
                case PlayerLocomotion.PLOC_State.Jump: return 3;
                case PlayerLocomotion.PLOC_State.Fall: return 3;
                default: return 0;
                }
            }
        }

        public override bool IsDirty => base.IsDirty || state != prevState;

        public rPlayer(PlayerAgent player) : base(player.GlobalID, new AgentTransform(player)) {
            agent = player;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(state, buffer);

            prevState = state;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes(agent.Owner.Lookup, buffer);
            BitHelper.WriteBytes((byte)agent.PlayerSlotIndex, buffer);
            BitHelper.WriteBytes(agent.Owner.NickName, buffer);
        }
    }
}
