using Agents;
using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using static Agents.AgentReplicatedActions;

namespace Vanilla.StatTracker {
    [HarmonyPatch]
    [ReplayData("Vanilla.StatTracker.Revive", "0.0.1")]
    internal class rRevive : ReplayEvent {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(AgentReplicatedActions), nameof(AgentReplicatedActions.DoPlayerRevive))]
            [HarmonyPostfix]
            public static void DoPlayerRevive(pPlayerReviveAction data) {
                if (data.TargetPlayer.TryGet(out PlayerAgent target) && !target.Alive) {
                    if (data.SourcePlayer.TryGet(out PlayerAgent source)) {
                        APILogger.Debug($"Player {target.Owner.NickName} was revived by {source.Owner.NickName}.");
                        Replay.Trigger(new rRevive(target, source));
                    }
                }
            }
        }

        private ushort source;
        private ushort target;

        public rRevive(PlayerAgent target, PlayerAgent source) {
            this.source = source.GlobalID;
            this.target = target.GlobalID;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(source, buffer);
            BitHelper.WriteBytes(target, buffer);
        }
    }
}
