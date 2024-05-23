using Gear;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;
using Vanilla.Specification;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Animation.MeleeSwing", "0.0.1")]
    internal class rMeleeSwing : Id {
        private bool charged = false;

        public rMeleeSwing(PlayerAgent player, bool charged = false) : base(player.GlobalID) {
            this.charged = charged;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteBytes(charged, buffer);
        }
    }

    [ReplayData("Vanilla.Player.Animation.MeleeShove", "0.0.1")]
    internal class rMeleeShove : Id {
        public rMeleeShove(PlayerAgent player) : base(player.GlobalID) {
        }
    }

    [ReplayData("Vanilla.Player.Animation.ConsumableThrow", "0.0.1")]
    internal class rConsumableThrow : Id {
        public rConsumableThrow(PlayerAgent player) : base(player.GlobalID) {
        }
    }

    [ReplayData("Vanilla.Player.Animation.Revive", "0.0.1")]
    internal class rRevive : Id {
        public rRevive(PlayerAgent player) : base(player.GlobalID) {
        }
    }

    [ReplayData("Vanilla.Player.Animation.Downed", "0.0.1")]
    internal class rDowned : Id {
        public rDowned(PlayerAgent player) : base(player.GlobalID) {
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Player.Animation", "0.0.1")]
    internal class rPlayerAnimation : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(PLOC_Downed), nameof(PLOC_Downed.OnPlayerRevived))]
            [HarmonyPrefix]
            private static void Prefix_OnPlayerRevived(PLOC_Downed __instance) {
                Replay.Trigger(new rRevive(__instance.m_owner));
            }

            [HarmonyPatch(typeof(PLOC_Downed), nameof(PLOC_Downed.CommonEnter))]
            [HarmonyPrefix]
            private static void Prefix_CommonEnter(PLOC_Downed __instance) {
                Replay.Trigger(new rDowned(__instance.m_owner));
            }

            [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.SendThrowStatus))]
            [HarmonyPrefix]
            private static void Prefix_SendThrowStatus(PlayerSync __instance, pPlayerThrowStatus.StatusEnum status, bool applyLocally) {
                if (applyLocally) return;

                HandleThrowState(__instance.m_agent, status);
            }

            [HarmonyPatch(typeof(PlayerInventorySynced), nameof(PlayerInventorySynced.SyncThrowState))]
            [HarmonyPrefix]
            private static void Prefix_SyncThrowState(PlayerInventorySynced __instance, pPlayerThrowStatus.StatusEnum status) {
                HandleThrowState(__instance.Owner, status);
            }

            private static void HandleThrowState(PlayerAgent player, pPlayerThrowStatus.StatusEnum status) {
                if (!Replay.TryGet(player.GlobalID, out rPlayerAnimation? _anim)) return;
                rPlayerAnimation anim = _anim!;

                switch (status) {
                case pPlayerThrowStatus.StatusEnum.Charging:
                    anim._chargingThrow = true;
                    break;
                case pPlayerThrowStatus.StatusEnum.Throw:
                    anim._chargingThrow = false;
                    Replay.Trigger(new rConsumableThrow(player));
                    break;
                }
            }

            [HarmonyPatch(typeof(MWS_ChargeUp), nameof(MWS_ChargeUp.Enter))]
            [HarmonyPostfix]
            private static void Postfix_MWS_ChargeUp(MWS_ChargeUp __instance) {
                if (!Replay.TryGet(__instance.m_weapon.Owner.GlobalID, out rPlayerAnimation? _anim)) return;
                rPlayerAnimation anim = _anim!;

                anim._chargingMelee = true;
            }

            [HarmonyPatch(typeof(MWS_ChargeUp), nameof(MWS_ChargeUp.Exit))]
            [HarmonyPostfix]
            private static void Postfix_ReceiveClassItemSync(MWS_ChargeUp __instance) {
                if (!Replay.TryGet(__instance.m_weapon.Owner.GlobalID, out rPlayerAnimation? _anim)) return;
                rPlayerAnimation anim = _anim!;

                anim._chargingMelee = false;
            }

            private static bool swingTrigger = false;
            [HarmonyPatch(typeof(MWS_AttackLight), nameof(MWS_AttackLight.Enter))]
            [HarmonyPostfix]
            private static void Postfix_MWS_AttackLight_Enter(MWS_AttackLight __instance) {
                swingTrigger = false;
            }
            [HarmonyPatch(typeof(MWS_AttackLight), nameof(MWS_AttackLight.UpdateStateInput))]
            [HarmonyPostfix]
            private static void Postfix_MWS_AttackLight(MWS_AttackLight __instance) {
                if (__instance.m_canCharge && __instance.m_weapon.FireButton) return;
                if (swingTrigger) return;
                Replay.Trigger(new rMeleeSwing(__instance.m_weapon.Owner));
                swingTrigger = true;
            }

            [HarmonyPatch(typeof(MWS_AttackHeavy), nameof(MWS_AttackHeavy.Enter))]
            [HarmonyPostfix]
            private static void Postfix_MWS_AttackHeavy(MWS_AttackHeavy __instance) {
                Replay.Trigger(new rMeleeSwing(__instance.m_weapon.Owner, true));
            }

            [HarmonyPatch(typeof(MeleeWeaponThirdPerson), nameof(MeleeWeaponThirdPerson.OnWield))]
            [HarmonyPrefix]
            private static void Prefix_ReceiveClassItemSync(MeleeWeaponThirdPerson __instance) {
                if (!Replay.TryGet(__instance.Owner.GlobalID, out rPlayerAnimation? _anim)) return;
                rPlayerAnimation anim = _anim!;

                anim._chargingMelee = false;
            }

            [HarmonyPatch(typeof(MeleeWeaponThirdPerson), nameof(MeleeWeaponThirdPerson.ReceiveClassItemSync))]
            [HarmonyPrefix]
            private static void Prefix_ReceiveClassItemSync(MeleeWeaponThirdPerson __instance, PlayerInventoryBase.pSimpleItemSyncData data) {
                if (!Replay.TryGet(__instance.Owner.GlobalID, out rPlayerAnimation? _anim)) return;
                rPlayerAnimation anim = _anim!;

                if (data.inFireMode) {
                    anim._chargingMelee = false;

                    if (__instance.m_inChargeAnim) {
                        Replay.Trigger(new rMeleeSwing(__instance.Owner, true));
                    } else {
                        Replay.Trigger(new rMeleeSwing(__instance.Owner));
                    }
                } else if (data.inAimMode) {
                    anim._chargingMelee = true;
                }
            }

            [HarmonyPatch(typeof(MWS_Push), nameof(MWS_Push.Enter))]
            [HarmonyPostfix]
            private static void Postfix_MWS_Push(MWS_Push __instance) {
                Replay.Trigger(new rMeleeShove(__instance.m_weapon.Owner));
            }

            [HarmonyPatch(typeof(PlayerInventorySynced), nameof(PlayerInventorySynced.SyncGenericInteract))]
            [HarmonyPrefix]
            private static void Prefix_SyncGenericInteract(PlayerInventorySynced __instance, pGenericInteractAnimation.TypeEnum type) {
                switch (type) {
                case pGenericInteractAnimation.TypeEnum.MeleeShove:
                    Replay.Trigger(new rMeleeShove(__instance.Owner));
                    break;
                }
            }
        }

        public PlayerAgent player;
        private Animator animator;

        private static byte compress(float value, float max) {
            value /= max;
            value = Mathf.Clamp(value, -1f, 1f);
            value = Mathf.Clamp01((value + 1.0f) / 2.0f);
            return (byte)(value * byte.MaxValue);
        }

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerAnimation>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerAnimation>(id));
                }
                return player != null;
            }
        }
        public override bool IsDirty {
            get {
                bool vel =
                    velFwd != compress(_velFwd, 10f) ||
                    velRight != compress(_velRight, 10f);

                bool crouch = this.crouch != (byte)(_crouch * byte.MaxValue);

                bool aim = targetLookDir != player.TargetLookDir;

                return
                    vel ||
                    crouch ||
                    aim ||
                    state != (byte)player.Locomotion.m_currentStateEnum ||
                    chargingMelee != _chargingMelee ||
                    chargingThrow != _chargingThrow ||
                    isReloading != _isReloading;
            }
        }

        private float _velFwd => animator.GetFloat("MoveBackwardForward");
        private byte velFwd;

        private float _velRight => animator.GetFloat("MoveLeftRight");
        private byte velRight;

        private float _crouch => animator.GetFloat("Crouch");
        private byte crouch;

        private Vector3 targetLookDir;

        private const long landAnimDuration = 867;
        private long landTriggered;
        private byte _state;
        private byte state;

        private bool _chargingMelee = false;
        private bool chargingMelee = false;

        private bool _chargingThrow = false;
        private bool chargingThrow = false;

        private bool _isReloading {
            get {
                if (player.Inventory == null) return false;
                if (player.Inventory.m_wieldedItem == null) return false;
                if (player.Inventory.m_wieldedItem.CanReload == false) return false;
                return player.Inventory.m_wieldedItem.IsReloading;
            }
        }
        private bool isReloading = false;

        private float _reloadTime {
            get {
                if (player.Inventory == null) return 0;
                if (player.Inventory.m_wieldedItem == null) return 0;
                if (player.Inventory.m_wieldedItem.CanReload == false) return 0;
                return player.Inventory.m_wieldedItem.ReloadTime;
            }
        }
        private float reloadTime;

        private ushort lastEquipped = 0;
        private ushort equipped {
            get {
                ItemEquippable? item = player.Inventory.WieldedItem;
                if (item != null) {
                    if (item.GearIDRange != null) {
                        return GTFOSpecification.GetGear(item.GearIDRange.PublicGearName);
                    } else if (item.ItemDataBlock != null) {
                        return GTFOSpecification.GetItem(item.ItemDataBlock.persistentID);
                    }
                }
                return 0;
            }
        }
        [ReplayTick]
        private void tick() {
            if (equipped != lastEquipped) {
                _chargingMelee = false;
                _chargingThrow = false;

                lastEquipped = equipped;
            }
        }

        public rPlayerAnimation(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
            animator = player.AnimatorBody;
        }

        public override void Write(ByteBuffer buffer) {
            velRight = compress(_velRight, 10f);
            velFwd = compress(_velFwd, 10f);

            BitHelper.WriteBytes(velRight, buffer);
            BitHelper.WriteBytes(velFwd, buffer);

            crouch = (byte)(_crouch * byte.MaxValue);

            BitHelper.WriteBytes(crouch, buffer);

            targetLookDir = player.TargetLookDir;

            BitHelper.WriteHalf(targetLookDir, buffer);

            if ((Raudy.Now - landTriggered > landAnimDuration) ||
                state != (byte)PlayerLocomotion.PLOC_State.Land ||
                player.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Jump ||
                player.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Fall) {
                state = (byte)player.Locomotion.m_currentStateEnum;
                if ((_state == (byte)PlayerLocomotion.PLOC_State.Jump || _state == (byte)PlayerLocomotion.PLOC_State.Fall) &&
                    state != (byte)PlayerLocomotion.PLOC_State.Jump && state != (byte)PlayerLocomotion.PLOC_State.Fall) {
                    landTriggered = Raudy.Now;
                    state = (byte)PlayerLocomotion.PLOC_State.Land;
                }
            }
            _state = state;

            BitHelper.WriteBytes(state, buffer);

            chargingMelee = _chargingMelee;

            BitHelper.WriteBytes(chargingMelee, buffer);

            chargingThrow = _chargingThrow;

            BitHelper.WriteBytes(chargingThrow, buffer);

            isReloading = _isReloading;

            BitHelper.WriteBytes(isReloading, buffer);

            reloadTime = _reloadTime;

            BitHelper.WriteHalf(reloadTime, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
