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

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Animation", "0.0.1")]
    internal class rEnemyAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ES_ScoutDetection), nameof(ES_ScoutDetection.CommonEnter))]
            [HarmonyPostfix]
            private static void Postfix_ScoutDetection_Enter(ES_ScoutScream __instance) {
                Replay.Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, true));
            }

            [HarmonyPatch(typeof(ES_ScoutDetection), nameof(ES_ScoutDetection.CommonExit))]
            [HarmonyPostfix]
            private static void Postfix_ScoutDetection_Exit(ES_ScoutScream __instance) {
                Replay.Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, false));
            }

            [HarmonyPatch(typeof(ES_ScoutScream), nameof(ES_ScoutScream.CommonUpdate))]
            [HarmonyPrefix]
            private static void Prefix_ScoutScream(ES_ScoutScream __instance) {
                switch (__instance.m_state) {
                case ES_ScoutScream.ScoutScreamState.Setup:
                    Replay.Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, true));
                    break;
                case ES_ScoutScream.ScoutScreamState.Chargeup:
                    if (!(__instance.m_stateDoneTimer < Clock.Time)) {
                        break;
                    }
                    Replay.Trigger(new rScoutScream(__instance.m_ai.m_enemyAgent, false));
                    break;
                }
            }

            [HarmonyPatch(typeof(PouncerBehaviour), nameof(PouncerBehaviour.ForceChangeAnimationState))]
            [HarmonyPostfix]
            private static void Postfix_Pouncer_Host(PouncerBehaviour __instance, int animationState) {
                if (!SNet.IsMaster) return;

                if (animationState == PouncerBehaviour.PO_ConsumeStart) {
                    Replay.Trigger(new rPouncerGrab(__instance.m_ai.m_enemyAgent));
                } else if (animationState == PouncerBehaviour.PO_SpitOut) {
                    Replay.Trigger(new rPouncerSpit(__instance.m_ai.m_enemyAgent));
                }
            }

            // NOTE(randomuserhi): The above code probably runs on client as well, so can remove this
            [HarmonyPatch(typeof(PouncerBehaviour), nameof(PouncerBehaviour.OnAnimationStateChangePacketReceived))]
            [HarmonyPostfix]
            private static void Postfix_Pouncer_Client(PouncerBehaviour __instance, pEB_AnimationStateChanagePacket data) {
                if (SNet.IsMaster) return;

                if (data.AnimationState == PouncerBehaviour.PO_ConsumeStart) {
                    Replay.Trigger(new rPouncerGrab(__instance.m_ai.m_enemyAgent));
                } else if (data.AnimationState == PouncerBehaviour.PO_SpitOut) {
                    Replay.Trigger(new rPouncerSpit(__instance.m_ai.m_enemyAgent));
                }
            }

            [HarmonyPatch(typeof(ES_HibernateWakeUp), nameof(ES_HibernateWakeUp.DoWakeup))]
            [HarmonyPostfix]
            private static void Postfix_Wakeup(ES_HibernateWakeUp __instance) {
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
            private static void Prefix_DoStartMeleeAttack(ES_StrikerMelee __instance, int animIndex, bool fwdAttack) {
                Replay.Trigger(new rMelee(__instance.m_enemyAgent, (byte)animIndex, fwdAttack ? rMelee.Type.foward : rMelee.Type.backward));
            }

            [HarmonyPatch(typeof(ES_EnemyAttackBase), nameof(ES_EnemyAttackBase.DoStartAttack))]
            [HarmonyPrefix]
            private static void Prefix_DoStartAttack(ES_EnemyAttackBase __instance, Vector3 pos, Vector3 attackTargetPosition, Agent targetAgent, int animIndex, AgentAbility abilityType, int abilityIndex) {
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

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Tendril", "0.0.1")]
    internal class rEnemyTendril : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.DetailUpdate))]
            [HarmonyPostfix]
            private static void Postfix_Update(ScoutAntenna __instance) {
                int id = __instance.GetInstanceID();
                if (Replay.Has<rEnemyTendril>(id)) return;

                if (__instance.m_detection != null && __instance.m_detection.State != eDetectionState.Idle) {
                    Replay.Spawn(new rEnemyTendril(__instance));
                }
            }

            [HarmonyPatch(typeof(ScoutAntenna), nameof(ScoutAntenna.Remove))]
            [HarmonyPostfix]
            private static void Postfix_Remove(ScoutAntenna __instance) {
                int id = __instance.GetInstanceID();
                if (Replay.Has<rEnemyTendril>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyTendril>(id));
                }
            }
        }

        private ScoutAntenna tendril;
        private EnemyAgent owner;
        private Vector3 relPos => tendril.m_currentPos - owner.transform.position;
        private Vector3 _relPos;

        private Vector3 sourcePos => tendril.m_sourcePos - owner.transform.position;
        private Vector3 _sourcePos;

        private bool detect => tendril.m_state == ScoutAntenna.eTendrilState.MovingInDetect;
        private bool _detect = false;

        public override bool Active {
            get {
                if (tendril == null && Replay.Has<rEnemyTendril>(id)) {
                    Replay.Despawn(Replay.Get<rEnemyTendril>(id));
                }
                return tendril != null;
            }
        }

        public override bool IsDirty {
            get {
                return _relPos != relPos || _sourcePos != sourcePos;
            }
        }

        public rEnemyTendril(ScoutAntenna tendril) : base(tendril.GetInstanceID()) {
            owner = tendril.m_detection.m_owner;
            this.tendril = tendril;
        }

        public override void Write(ByteBuffer buffer) {
            _sourcePos = sourcePos;

            BitHelper.WriteHalf(_sourcePos, buffer);

            _relPos = relPos;

            BitHelper.WriteHalf(_relPos, buffer);

            _detect = detect;

            BitHelper.WriteBytes(_detect, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
            BitHelper.WriteBytes(owner.GlobalID, buffer);
        }
    }
}
