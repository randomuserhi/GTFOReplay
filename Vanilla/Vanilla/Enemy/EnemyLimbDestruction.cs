using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.LimbDestruction", "0.0.1")]
    public class rLimbDestruction : Id {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
            [HarmonyPostfix]
            private static void OnSpawn(EnemySync __instance) {
                if (__instance.m_agent.m_headLimb == null) return;
                __instance.m_agent.m_headLimb.add_OnLimbDestroyed((Action)(() => {
                    if (__instance.m_agent.Alive) Replay.Trigger(new rLimbDestruction(__instance.m_agent, rLimbDestruction.Type.head));
                }));
            }
        }

        public enum Type {
            head
        }

        private Type type;

        public rLimbDestruction(EnemyAgent agent, Type type) : base(agent.GlobalID) {
            this.type = type;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }
}
