using Agents;
using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Animation.AttackWindup", "0.0.1")]
    internal class rAttackWindup : Id {
        private byte animIndex;
        private float duration;

        public rAttackWindup(EnemyAgent enemy, byte animIndex, float duration) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
            this.duration = duration;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
            BitHelper.WriteHalf(duration, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Animation", "0.0.1")]
    internal class rEnemyAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ES_EnemyAttackBase), nameof(ES_EnemyAttackBase.DoStartAttack))]
            [HarmonyPrefix]
            private static void Prefix_DoStartAttack(ES_EnemyAttackBase __instance, Vector3 pos, Vector3 attackTargetPosition, Agent targetAgent, int animIndex, AgentAbility abilityType, int abilityIndex) {
                Replay.Trigger(new rAttackWindup(__instance.m_enemyAgent, (byte)animIndex, __instance.m_attackWindupDuration));
            }
        }

        public EnemyAgent enemy;
        private Animator animator;

        private static byte compress(float value, float max) {
            value /= max;
            value = Mathf.Clamp(value, -1f, 1f);
            value = Mathf.Clamp01((value + 1.0f) / 2.0f);
            return (byte)(value * byte.MaxValue);
        }

        public override bool Active {
            get {
                if (enemy == null && Replay.Has<rEnemyAnimation>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyAnimation>(id));
                }
                return enemy != null;
            }
        }
        public override bool IsDirty {
            get {
                bool vel =
                    velFwd != compress(_velFwd, 10f) ||
                    velRight != compress(_velRight, 10f);

                return
                    vel ||
                    state != _state;
            }
        }

        private float _velFwd => enemy.Locomotion.PathMove.m_animFwd;
        private byte velFwd;

        private float _velRight => enemy.Locomotion.PathMove.m_animRight;
        private byte velRight;

        private byte _state => (byte)enemy.Locomotion.m_currentState.m_stateEnum;
        private byte state;

        public rEnemyAnimation(EnemyAgent enemy) : base(enemy.GlobalID) {
            this.enemy = enemy;
            animator = enemy.Anim;
        }

        public override void Write(ByteBuffer buffer) {
            velRight = compress(_velRight, 10f);
            velFwd = compress(_velFwd, 10f);

            BitHelper.WriteBytes(velRight, buffer);
            BitHelper.WriteBytes(velFwd, buffer);

            state = _state;

            BitHelper.WriteBytes(state, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
