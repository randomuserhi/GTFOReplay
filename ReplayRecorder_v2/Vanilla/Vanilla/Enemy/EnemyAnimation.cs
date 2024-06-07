using Agents;
using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using SNetwork;
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

    [ReplayData("Vanilla.Enemy.Animation.PouncerGrab", "0.0.1")]
    internal class rPouncerGrab : Id {

        public rPouncerGrab(EnemyAgent enemy) : base(enemy.GlobalID) {

        }
    }

    [ReplayData("Vanilla.Enemy.Animation.PouncerSpit", "0.0.1")]
    internal class rPouncerSpit : Id {

        public rPouncerSpit(EnemyAgent enemy) : base(enemy.GlobalID) {

        }
    }

    [ReplayData("Vanilla.Enemy.Animation.ScoutScream", "0.0.1")]
    internal class rScoutScream : Id {
        private bool start;

        public rScoutScream(EnemyAgent enemy, bool start) : base(enemy.GlobalID) {
            this.start = start;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(start, buffer);
        }
    }

    [ReplayData("Vanilla.Enemy.Animation.BigFlyerCharge", "0.0.1")]
    internal class rBigFlyerCharge : Id {
        private float charge;

        public rBigFlyerCharge(EnemyAgent enemy, float chargeDuration) : base(enemy.GlobalID) {
            charge = chargeDuration;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteHalf(charge, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Animation", "0.0.1")]
    internal class rEnemyAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            // NOTE(randomuserhi): Since all events rely on animation being spawned, make sure that is spawned prior to triggering anything.
            private static void Trigger(Id e) {
                if (Replay.Has<rEnemyAnimation>(e.id)) Replay.Trigger(e);
            }

            [HarmonyPatch(typeof(EB_InCombat_ChargedAttack_Flyer), nameof(EB_InCombat_ChargedAttack_Flyer.SetAI))]
            [HarmonyPostfix]
            private static void Postfix_BigFlyerAttack_Client(EB_InCombat_ChargedAttack_Flyer __instance) {
                if (SNet.IsMaster) return;
                if (!__instance.m_ai.m_enemyAgent.Alive) return;

                Il2CppSystem.Action<pEB_FlyerAttackVisualInfoSignal>? previous = __instance.m_attackVisualsPacket.ReceiveAction;
                __instance.m_attackVisualsPacket.ReceiveAction = (Action<pEB_FlyerAttackVisualInfoSignal>)((packet) => {
                    Trigger(new rBigFlyerCharge(__instance.m_ai.m_enemyAgent, packet.ChargeDuration));
                    previous?.Invoke(packet);
                });
            }

            [HarmonyPatch(typeof(EB_InCombat_ChargedAttack_Flyer), nameof(EB_InCombat_ChargedAttack_Flyer.CommonEnter))]
            [HarmonyPostfix]
            private static void Postfix_BigFlyerAttack_Host(EB_InCombat_ChargedAttack_Flyer __instance) {
                if (!SNet.IsMaster) return;
                if (!__instance.m_ai.m_enemyAgent.Alive) return;

                Trigger(new rBigFlyerCharge(__instance.m_ai.m_enemyAgent, __instance.m_CharageDuration));
            }

            [HarmonyPatch(typeof(ES_ScoutDetection), nameof(ES_ScoutDetection.CommonEnter))]
            [HarmonyPostfix]
            private static void Postfix_ScoutDetection_Enter(ES_ScoutScream __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

                Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, true));
            }

            [HarmonyPatch(typeof(ES_ScoutDetection), nameof(ES_ScoutDetection.CommonExit))]
            [HarmonyPostfix]
            private static void Postfix_ScoutDetection_Exit(ES_ScoutScream __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

                Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, false));
            }

            [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
            [HarmonyPrefix]
            private static void Prefix_ScoutScream(ES_ScoutScream __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

                switch (__instance.m_state) {
                case ES_ScoutScream.ScoutScreamState.Setup:
                    Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, true));
                    break;
                case ES_ScoutScream.ScoutScreamState.Chargeup:
                    if (!(__instance.m_stateDoneTimer < Clock.Time)) {
                        break;
                    }
                    Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, false));
                    break;
                }
            }

            [HarmonyPatch(typeof(PouncerBehaviour), nameof(PouncerBehaviour.ForceChangeAnimationState))]
            [HarmonyPostfix]
            private static void Postfix_Pouncer_Host(PouncerBehaviour __instance, int animationState) {
                if (!SNet.IsMaster) return;
                if (!__instance.m_ai.m_enemyAgent.Alive) return;

                if (animationState == PouncerBehaviour.PO_ConsumeStart) {
                    Trigger(new rPouncerGrab(__instance.m_ai.m_enemyAgent));
                } else if (animationState == PouncerBehaviour.PO_SpitOut) {
                    Trigger(new rPouncerSpit(__instance.m_ai.m_enemyAgent));
                }
            }

            // NOTE(randomuserhi): The above code probably runs on client as well, so can remove this
            [HarmonyPatch(typeof(PouncerBehaviour), nameof(PouncerBehaviour.OnAnimationStateChangePacketReceived))]
            [HarmonyPostfix]
            private static void Postfix_Pouncer_Client(PouncerBehaviour __instance, pEB_AnimationStateChanagePacket data) {
                if (SNet.IsMaster) return;
                if (!__instance.m_ai.m_enemyAgent.Alive) return;

                if (data.AnimationState == PouncerBehaviour.PO_ConsumeStart) {
                    Replay.Trigger(new rPouncerGrab(__instance.m_ai.m_enemyAgent));
                } else if (data.AnimationState == PouncerBehaviour.PO_SpitOut) {
                    Replay.Trigger(new rPouncerSpit(__instance.m_ai.m_enemyAgent));
                }
            }

            [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.DoWakeup))]
            [HarmonyPostfix]
            private static void Postfix_Wakeup(ES_HibernateWakeUp __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

                Replay.Trigger(new rWakeup(__instance.m_enemyAgent, (byte)__instance.m_animationIndex, __instance.m_isTurn));
            }

            [HarmonyPatch(typeof(ES_Hibernate), nameof(ES_Hibernate.StartBeat))]
            [HarmonyPrefix]
            private static void Prefix_StartBeat(ES_Hibernate __instance, float strength, bool doAnim) {
                if (!__instance.m_enemyAgent.Alive) return;

                if (doAnim && __instance.m_lastHeartbeatAnim < Clock.Time) {
                    Replay.Trigger(new rHeartbeat(__instance.m_enemyAgent, (byte)__instance.m_currentHeartBeatIndex));
                }

                // The game doesn't reset the animation clock if the enemy is culled, so we do it manually when culled.
                if (!__instance.m_enemyAgent.MovingCuller.IsShown) {
                    __instance.m_lastHeartbeatAnim = Clock.Time + 1f;
                    __instance.m_currentHeartBeatIndex++;
                    if (__instance.m_currentHeartBeatIndex == __instance.m_heartBeatIndexMax) {
                        __instance.m_currentHeartBeatIndex = 0;
                    }
                }
            }

            [HarmonyPatch(typeof(ES_Jump), nameof(ES_Jump.DoStartJump))]
            [HarmonyPrefix]
            private static void Prefix_DoStartJump(ES_Jump __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

                Replay.Trigger(new rJump(__instance.m_enemyAgent, 0));
            }

            [HarmonyPatch(typeof(ES_Jump), nameof(ES_Jump.UpdateJump))]
            [HarmonyPrefix]
            private static void Prefix_UpdateJump(ES_Jump __instance) {
                if (!__instance.m_enemyAgent.Alive) return;

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
                if (!__instance.m_enemyAgent.Alive) return;

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
            private static void Prefix_DoStartMeleeAttack(ES_StrikerMelee __instance, int animIndex, bool fwdAttack) {
                if (!__instance.m_enemyAgent.Alive) return;

                Replay.Trigger(new rMelee(__instance.m_enemyAgent, (byte)animIndex, fwdAttack ? rMelee.Type.foward : rMelee.Type.backward));
            }

            [HarmonyPatch(typeof(ES_EnemyAttackBase), nameof(ES_EnemyAttackBase.DoStartAttack))]
            [HarmonyPrefix]
            private static void Prefix_DoStartAttack(ES_EnemyAttackBase __instance, Vector3 pos, Vector3 attackTargetPosition, Agent targetAgent, int animIndex, AgentAbility abilityType, int abilityIndex) {
                if (!__instance.m_enemyAgent.Alive) return;

                Replay.Trigger(new rAttackWindup(__instance.m_enemyAgent, (byte)animIndex));
            }
        }

        public EnemyAgent enemy;

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
                    velRight != compress(_velRight, 10f) ||
                    velUp != compress(_velUp, 10f);

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

            velocity.x = Vector3.Dot(enemy.transform.right, v);
            velocity.y = Vector3.Dot(enemy.transform.up, v);
            velocity.z = Vector3.Dot(enemy.transform.forward, v);
        }

        private float _velFwd => velocity.z;
        private byte velFwd;

        private float _velRight => velocity.x;
        private byte velRight;

        private float _velUp => velocity.y;
        private byte velUp;

        private byte _state => (byte)enemy.Locomotion.m_currentState.m_stateEnum;
        private byte state;

        private bool _up => enemy.Locomotion.ClimbLadder.m_goingUp;
        private bool up;

        private byte _detect => (byte)(Mathf.Clamp01(enemy.Locomotion.Hibernate.m_detectionCurrent) * byte.MaxValue);
        private byte detect;

        public rEnemyAnimation(EnemyAgent enemy) : base(enemy.GlobalID) {
            this.enemy = enemy;
        }

        public override void Write(ByteBuffer buffer) {
            velRight = compress(_velRight, 10f);
            velUp = compress(_velUp, 10f);
            velFwd = compress(_velFwd, 10f);

            BitHelper.WriteBytes(velRight, buffer);
            BitHelper.WriteBytes(velUp, buffer);
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
