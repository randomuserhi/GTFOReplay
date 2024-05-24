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

        public rAttackWindup(EnemyAgent enemy, byte animIndex) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.Hitreact", "0.0.1")]
    internal class rHitreact : Id {
        public enum Direction {
            Forward,
            Backward,
            Left,
            Right,
        }

        public enum Type {
            Light,
            Heavy,
        }

        private byte animIndex;
        private Direction direction;
        private Type type;

        public rHitreact(EnemyAgent enemy, byte animIndex, Type type, Direction direction) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
            this.direction = direction;
            this.type = type;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
            BitHelper.WriteBytes((byte)direction, buffer);
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.Melee", "0.0.1")]
    internal class rMelee : Id {
        private byte animIndex;
        private Type type;

        public enum Type {
            foward,
            backward,
        }

        public rMelee(EnemyAgent enemy, byte animIndex, Type type) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
            this.type = type;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.Jump", "0.0.1")]
    internal class rJump : Id {
        private byte animIndex;

        public rJump(EnemyAgent enemy, byte animIndex) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.Heartbeat", "0.0.1")]
    internal class rHeartbeat : Id {
        private byte animIndex;

        public rHeartbeat(EnemyAgent enemy, byte animIndex) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.Wakeup", "0.0.1")]
    internal class rWakeup : Id {
        private byte animIndex;
        private bool turn;

        public rWakeup(EnemyAgent enemy, byte animIndex, bool turn) : base(enemy.GlobalID) {
            this.animIndex = animIndex;
            this.turn = turn;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(animIndex, buffer);
            BitHelper.WriteBytes(turn, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Animation", "0.0.1")]
    internal class rEnemyAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.DoWakeup))]
            [HarmonyPrefix]
            private static void Prefix_Wakeup(ES_HibernateWakeUp __instance) {
                Replay.Trigger(new rWakeup(__instance.m_enemyAgent, (byte)__instance.m_animationIndex, __instance.m_isTurn));
            }

            [HarmonyPatch(typeof(ES_Hibernate), nameof(ES_Hibernate.StartBeat))]
            [HarmonyPrefix]
            private static void Prefix_StartBeat(ES_Hibernate __instance, float strength, bool doAnim) {
                if (doAnim && __instance.m_lastHeartbeatAnim < Clock.Time) {
                    Replay.Trigger(new rHeartbeat(__instance.m_enemyAgent, (byte)__instance.m_currentHeartBeatIndex));
                }
            }

            [HarmonyPatch(typeof(ES_Jump), nameof(ES_Jump.DoStartJump))]
            [HarmonyPrefix]
            private static void Prefix_DoStartJump(ES_Jump __instance) {
                Replay.Trigger(new rJump(__instance.m_enemyAgent, 0));
            }

            [HarmonyPatch(typeof(ES_Jump), nameof(ES_Jump.UpdateJump))]
            [HarmonyPrefix]
            private static void Prefix_UpdateJump(ES_Jump __instance) {
                switch (__instance.m_state) {
                case ESJumpState.InAir:
                    if (__instance.m_jumpMoveTimeRel + Clock.Delta * __instance.m_jumpMoveSpeed < 1f) {
                        break;
                    }
                    Replay.Trigger(new rJump(__instance.m_enemyAgent, 1));
                    break;
                }
            }

            [HarmonyPatch(typeof(ES_Hitreact), nameof(ES_Hitreact.DoHitReact))]
            [HarmonyPrefix]
            private static void Prefix_DoHitReact(ES_Hitreact __instance, int index, ES_HitreactType hitreactType, ImpactDirection impactDirection, float deathDelay, bool propagated, Vector3 damagePos, Vector3 source) {
                rHitreact.Type type;
                rHitreact.Direction direction;
                switch (hitreactType) {
                case ES_HitreactType.Heavy: type = rHitreact.Type.Heavy; break;
                case ES_HitreactType.Light: type = rHitreact.Type.Light; break;
                default: return;
                }

                switch (impactDirection) {
                case ImpactDirection.Front: direction = rHitreact.Direction.Forward; break;
                case ImpactDirection.Back: direction = rHitreact.Direction.Backward; break;
                case ImpactDirection.Left: direction = rHitreact.Direction.Left; break;
                case ImpactDirection.Right: direction = rHitreact.Direction.Right; break;
                default: return;
                }
                Replay.Trigger(new rHitreact(__instance.m_enemyAgent, (byte)index, type, direction));
            }

            [HarmonyPatch(typeof(ES_StrikerMelee), nameof(ES_StrikerMelee.DoStartMeleeAttack))]
            [HarmonyPrefix]
            private static void Prefix_DoStartMeleeAttack(ES_EnemyAttackBase __instance, int animIndex, bool fwdAttack) {
                Replay.Trigger(new rMelee(__instance.m_enemyAgent, (byte)animIndex, fwdAttack ? rMelee.Type.foward : rMelee.Type.backward));
            }

            [HarmonyPatch(typeof(ES_EnemyAttackBase), nameof(ES_EnemyAttackBase.DoStartAttack))]
            [HarmonyPrefix]
            private static void Prefix_DoStartAttack(ES_EnemyAttackBase __instance, Vector3 pos, Vector3 attackTargetPosition, Agent targetAgent, int animIndex, AgentAbility abilityType, int abilityIndex) {
                Replay.Trigger(new rAttackWindup(__instance.m_enemyAgent, (byte)animIndex));
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
                UpdateVelocity();

                bool vel =
                    velFwd != compress(_velFwd, 10f) ||
                    velRight != compress(_velRight, 10f);

                return
                    vel ||
                    up != _up ||
                    state != _state ||
                    detect != _detect;
            }
        }

        private Vector3 lastPosition;
        private Vector3 velocity;

        private void UpdateVelocity() {
            Vector3 v = enemy.transform.position - lastPosition;
            v /= Replay.tickRate;
            lastPosition = enemy.transform.position;

            velocity.z = Vector3.Dot(enemy.transform.forward, v);
            velocity.x = Vector3.Dot(enemy.transform.right, v);
        }

        private float _velFwd => velocity.z;
        private byte velFwd;

        private float _velRight => velocity.x;
        private byte velRight;

        private byte _state => (byte)enemy.Locomotion.m_currentState.m_stateEnum;
        private byte state;

        private bool _up => enemy.Locomotion.ClimbLadder.m_goingUp;
        private bool up;

        private byte _detect => (byte)(Mathf.Clamp01(enemy.Locomotion.Hibernate.m_detectionCurrent) * byte.MaxValue);
        private byte detect;

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

            up = _up;

            BitHelper.WriteBytes(up, buffer);

            detect = _detect;

            BitHelper.WriteBytes(detect, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            lastPosition = enemy.transform.position;
            UpdateVelocity();

            Write(buffer);
        }
    }
}
