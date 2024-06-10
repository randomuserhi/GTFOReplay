using Agents;
using Enemies;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Stats", "0.0.1")]
    [HarmonyPatch]
    public class rEnemyStats : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {

            [HarmonyPatch(typeof(EnemyAI), nameof(EnemyAI.Target), MethodType.Setter)]
            [HarmonyPrefix]
            private static void Prefix_SetTarget(EnemyAI __instance, AgentTarget value) {
                //if (__instance.m_mode != AgentMode.Agressive) return;
                if (value == null) return;
                if (__instance.m_target != null && value.m_agent.GlobalID == __instance.m_target.m_agent.GlobalID) return;

                PlayerAgent? player = value.m_agent.TryCast<PlayerAgent>();
                if (player != null) {
                    if (Replay.Has<rEnemyStats>(__instance.m_enemyAgent.GlobalID)) {
                        Replay.Get<rEnemyStats>(__instance.m_enemyAgent.GlobalID).target = player;
                    }
                }
            }
        }

        public EnemyAgent agent;

        public override bool Active => agent != null;
        public override bool IsDirty => lastTagged != tagged;

        private bool lastTagged = false;
        private bool tagged => agent.IsTagged;

        public rEnemyStats(EnemyAgent enemy) : base(enemy.GlobalID) {
            this.agent = enemy;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(tagged, buffer);

            lastTagged = tagged;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }

        public PlayerAgent? target;
    }
}
