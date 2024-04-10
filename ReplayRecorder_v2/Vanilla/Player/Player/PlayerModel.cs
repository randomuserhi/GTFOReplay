using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using System.Text;
using UnityEngine;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Model", "0.0.1")]
    internal class rPlayerModel : ReplayDynamic {
        [ReplayInit]
        private static void Init() {
            Replay.Configure<rPlayerModel>(2);
        }

        public static bool isValid(PlayerAgent player) {
            Animator anim = player.AnimatorBody;
            try {
                return anim.GetBoneTransform(HumanBodyBones.Head) != null &&

                    anim.GetBoneTransform(HumanBodyBones.LeftUpperArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftLowerArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftHand) != null &&

                    anim.GetBoneTransform(HumanBodyBones.RightUpperArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightLowerArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightHand) != null &&

                    anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftFoot) != null &&

                    anim.GetBoneTransform(HumanBodyBones.RightUpperLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightLowerLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightFoot) != null;
            } catch {
                return false;
            }
        }

        private PlayerAgent _player = default!;
        public PlayerAgent player {
            get => _player;
            set {
                _player = value;
                Animator anim = _player.AnimatorBody;

                T_head = anim.GetBoneTransform(HumanBodyBones.Head);
                T_back = anim.GetBoneTransform(HumanBodyBones.Chest);

                if (_player.IsLocallyOwned && !_player.Owner.IsBot) {
                    T_LUArm = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftUpperArm);
                    T_LLArm = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftLowerArm);
                    T_LHand = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftHand);

                    T_RUArm = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightUpperArm);
                    T_RLArm = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightLowerArm);
                    T_RHand = _player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightHand);
                } else {
                    T_LUArm = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm);
                    T_LLArm = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm);
                    T_LHand = anim.GetBoneTransform(HumanBodyBones.LeftHand);

                    T_RUArm = anim.GetBoneTransform(HumanBodyBones.RightUpperArm);
                    T_RLArm = anim.GetBoneTransform(HumanBodyBones.RightLowerArm);
                    T_RHand = anim.GetBoneTransform(HumanBodyBones.RightHand);
                }

                T_LULeg = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg);
                T_LLLeg = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg);
                T_LFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot);

                T_RULeg = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg);
                T_RLLeg = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg);
                T_RFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot);
            }
        }

        // https://stackoverflow.com/questions/60701187/avoid-cs8618-warning-when-initializing-mutable-non-nullable-property-with-argume
        private Transform T_head = default!;

        private Transform T_back = default!;

        private Transform T_LUArm = default!;
        private Transform T_LLArm = default!;
        private Transform T_LHand = default!;

        private Transform T_RUArm = default!;
        private Transform T_RLArm = default!;
        private Transform T_RHand = default!;

        private Transform T_LULeg = default!;
        private Transform T_LLLeg = default!;
        private Transform T_LFoot = default!;

        private Transform T_RULeg = default!;
        private Transform T_RLLeg = default!;
        private Transform T_RFoot = default!;

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerModel>(id)) {
                    Replay.Despawn(Replay.Get<rPlayerModel>(id));
                }
                return player != null;
            }
        }
        public override bool IsDirty {
            get {
                bool arms =
                        LUArm != T_LUArm.position ||
                        LLArm != T_LLArm.position ||
                        LHand != T_LHand.position ||

                        RUArm != T_RUArm.position ||
                        RLArm != T_RLArm.position ||
                        RHand != T_RHand.position;

                bool back = backpackPos != T_back.position || backpackRot != T_back.rotation;

                bool wielded = false;
                bool fold = false;
                ItemEquippable? wieldedItem = player.Inventory.WieldedItem;
                if (wieldedItem != null) {
                    Transform transform = GetWieldedTransform(wieldedItem);
                    wielded = wieldedPos != transform.position || wieldedRot != transform.rotation;

                    Transform? foldTransform = GetFoldTransform(wieldedItem);
                    fold = foldTransform != null && foldRot != foldTransform.rotation;
                }

                return head != T_head.position ||

                arms || back || wielded || fold ||

                LULeg != T_LULeg.position ||
                LLLeg != T_LLLeg.position ||
                LFoot != T_LFoot.position ||

                RULeg != T_RULeg.position ||
                RLLeg != T_RLLeg.position ||
                RFoot != T_RFoot.position;
            }
        }

        public rPlayerModel(PlayerAgent player) : base(player.GlobalID) {
            this.player = player;
        }

        private Vector3 head;

        private Vector3 LUArm;
        private Vector3 LLArm;
        private Vector3 LHand;

        private Vector3 RUArm;
        private Vector3 RLArm;
        private Vector3 RHand;

        private Vector3 LULeg;
        private Vector3 LLLeg;
        private Vector3 LFoot;

        private Vector3 RULeg;
        private Vector3 RLLeg;
        private Vector3 RFoot;

        private Vector3 backpackPos;
        private Quaternion backpackRot;

        private Vector3 wieldedPos;
        private Quaternion wieldedRot;
        private Quaternion foldRot; // for revolvers

        private static string DebugObject(GameObject go, StringBuilder? sb = null, int depth = 0) {
            if (sb == null) sb = new StringBuilder();
            sb.Append('\t', depth);
            sb.Append(go.name + "\n");
            for (int i = 0; i < go.transform.childCount; ++i) {
                DebugObject(go.transform.GetChild(i).gameObject, sb, depth + 1);
            }
            return sb.ToString();
        }

        private static Transform GetWieldedTransform(ItemEquippable item) {
            //APILogger.Debug(DebugObject(item.gameObject));
            if (item.GearPartHolder != null) {
                return item.GearPartHolder.transform;
            } else {
                return item.transform;
            }
        }
        private static Transform? FindTransformByName(Transform parent, string target) {
            for (int i = 0; i < parent.childCount; ++i) {
                Transform child = parent.GetChild(i);
                if (child.name.Contains(target)) return child;
                else {
                    Transform? nested = FindTransformByName(child, target);
                    if (nested != null) return nested;
                }
            }
            return null;
        }
        private static Transform? GetFoldTransform(ItemEquippable item) {
            if (item.GearPartHolder != null) {
                Transform? revolver = FindTransformByName(item.GearPartHolder.transform, "Fold");
                if (revolver != null) return revolver;
                Transform? sawedOff = FindTransformByName(item.GearPartHolder.transform, "BreakPoint");
                if (sawedOff != null) return sawedOff;
            }
            return null;
        }

        public override void Write(ByteBuffer buffer) {
            Vector3 pos = player.transform.position;
            Animator anim = player.AnimatorBody;

            ItemEquippable? wieldedItem = player.Inventory.WieldedItem;

            head = T_head.position;

            LULeg = T_LULeg.position;
            LLLeg = T_LLLeg.position;
            LFoot = T_LFoot.position;

            RULeg = T_RULeg.position;
            RLLeg = T_RLLeg.position;
            RFoot = T_RFoot.position;

            LUArm = T_LUArm.position;
            LLArm = T_LLArm.position;
            LHand = T_LHand.position;

            RUArm = T_RUArm.position;
            RLArm = T_RLArm.position;
            RHand = T_RHand.position;

            Vector3 displacement = Vector3.zero;
            Vector3 offset = Vector3.zero;
            Vector3 handOffset = Vector3.zero;
            Vector3 lowerOffset = Vector3.zero;
            Vector3 lowerLegOffset = Vector3.zero;
            Vector3 upperLegOffset = Vector3.zero;
            Vector3 footOffset = Vector3.zero;
            if (player.IsLocallyOwned && !player.Owner.IsBot) {
                offset = (anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position + anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position) / 2 - (LUArm + RUArm) / 2;
                offset += player.transform.forward * 0.1f;

                if (wieldedItem != null && !wieldedItem.IsWeapon && !wieldedItem.CanReload) {
                } else {
                    lowerOffset = Vector3.down * 0.1f;
                    lowerOffset -= player.transform.forward * 0.15f;
                    handOffset = Vector3.down * 0.2f;
                }

                if (player.Alive) {
                    if (player.Locomotion.m_currentStateEnum == PlayerLocomotion.PLOC_State.Crouch) {
                        displacement += Vector3.down * 0.2f;

                        upperLegOffset = Vector3.up * 0.1f;
                    } else {
                        displacement += Vector3.down * 0.45f;
                    }
                    lowerLegOffset = Vector3.up * 0.1f;
                    footOffset = Vector3.up * 0.2f;
                }

                Vector3 footCenter = (LFoot + RFoot) / 2.0f;
                footCenter.y = 0;
                Vector3 posFlat = pos;
                posFlat.y = 0;
                displacement += (posFlat - footCenter);
            }

            Vector3 height = Vector3.down * 0.2f;
            BitHelper.WriteHalf(displacement + height + head - pos, buffer);

            BitHelper.WriteHalf(displacement + height + offset + LUArm - pos, buffer);
            BitHelper.WriteHalf(displacement + height + offset + lowerOffset + LLArm - pos, buffer);
            BitHelper.WriteHalf(displacement + height + offset + handOffset + LHand - pos, buffer);

            BitHelper.WriteHalf(displacement + height + offset + RUArm - pos, buffer);
            BitHelper.WriteHalf(displacement + height + offset + lowerOffset + RLArm - pos, buffer);
            BitHelper.WriteHalf(displacement + height + offset + handOffset + RHand - pos, buffer);

            BitHelper.WriteHalf(displacement + upperLegOffset + LULeg - pos, buffer);
            BitHelper.WriteHalf(displacement + lowerLegOffset + LLLeg - pos, buffer);
            BitHelper.WriteHalf(displacement + footOffset + LFoot - pos, buffer);

            BitHelper.WriteHalf(displacement + upperLegOffset + RULeg - pos, buffer);
            BitHelper.WriteHalf(displacement + lowerLegOffset + RLLeg - pos, buffer);
            BitHelper.WriteHalf(displacement + footOffset + RFoot - pos, buffer);

            backpackPos = T_back.position;
            backpackRot = T_back.rotation;

            BitHelper.WriteHalf(displacement + height + backpackPos - pos, buffer);
            BitHelper.WriteHalf(backpackRot, buffer);

            if (wieldedItem != null) {
                Transform transform = GetWieldedTransform(wieldedItem);
                wieldedPos = transform.position;
                wieldedRot = transform.rotation;

                Transform? fold = GetFoldTransform(wieldedItem);
                if (fold != null) {
                    foldRot = fold.localRotation;
                } else {
                    foldRot = Quaternion.identity;
                }
            }
            BitHelper.WriteHalf(displacement + height + offset + handOffset + wieldedPos - pos, buffer);
            BitHelper.WriteHalf(wieldedRot, buffer);
            BitHelper.WriteHalf(foldRot, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
