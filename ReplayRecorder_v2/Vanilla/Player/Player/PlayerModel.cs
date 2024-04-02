using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using System.Text;
using UnityEngine;

namespace Vanilla.Player {
    [ReplayData("Vanilla.Player.Model", "0.0.1")]
    internal class rPlayerModel : ReplayDynamic {
        public static int tick = 0;
        [ReplayTick]
        private static void Update() {
            tick = (tick + 1) % 2;
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

        public PlayerAgent player;

        public override bool Active {
            get {
                if (player == null && Replay.Has<rPlayerModel>(Id)) {
                    Replay.Despawn(Replay.Get<rPlayerModel>(Id));
                }
                return player != null;
            }
        }
        public override int Id => player.GlobalID;
        public override bool IsDirty {
            get {
                if (tick != 0) return false;

                Animator anim = player.AnimatorBody;

                bool arms;
                if (player.IsLocallyOwned && !player.Owner.IsBot) {
                    arms =
                        LUArm != player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftUpperArm).position ||
                        LLArm != player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftLowerArm).position ||
                        LHand != player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftHand).position ||

                        RUArm != player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightUpperArm).position ||
                        RLArm != player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightLowerArm).position ||
                        RHand != player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightHand).position;
                } else {
                    arms =
                        LUArm != anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position ||
                        LLArm != anim.GetBoneTransform(HumanBodyBones.LeftLowerArm).position ||
                        LHand != anim.GetBoneTransform(HumanBodyBones.LeftHand).position ||

                        RUArm != anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position ||
                        RLArm != anim.GetBoneTransform(HumanBodyBones.RightLowerArm).position ||
                        RHand != anim.GetBoneTransform(HumanBodyBones.RightHand).position;
                }

                bool wielded = false;
                bool fold = false;
                ItemEquippable? wieldedItem = player.Inventory.WieldedItem;
                if (wieldedItem != null) {
                    Transform transform = GetWieldedTransform(wieldedItem);
                    wielded = wieldedPos != transform.position || wieldedRot != transform.rotation;

                    Transform? foldTransform = GetFoldTransform(wieldedItem);
                    fold = foldTransform != null && foldRot != foldTransform.rotation;
                }

                return head != anim.GetBoneTransform(HumanBodyBones.Head).position ||

                arms || wielded || fold ||

                LULeg != anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg).position ||
                LLLeg != anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg).position ||
                LFoot != anim.GetBoneTransform(HumanBodyBones.LeftFoot).position ||

                RULeg != anim.GetBoneTransform(HumanBodyBones.RightUpperLeg).position ||
                RLLeg != anim.GetBoneTransform(HumanBodyBones.RightLowerLeg).position ||
                RFoot != anim.GetBoneTransform(HumanBodyBones.RightFoot).position;
            }
        }

        public rPlayerModel(PlayerAgent player) {
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

            head = anim.GetBoneTransform(HumanBodyBones.Head).position;

            Vector3 displacement = Vector3.zero;
            Vector3 offset = Vector3.zero;
            Vector3 handOffset = Vector3.zero;
            Vector3 lowerOffset = Vector3.zero;
            if (player.IsLocallyOwned && !player.Owner.IsBot) {
                LUArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftUpperArm).position;
                LLArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftLowerArm).position;
                LHand = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftHand).position;

                RUArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightUpperArm).position;
                RLArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightLowerArm).position;
                RHand = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightHand).position;

                offset = (anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position + anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position) / 2 - (LUArm + RUArm) / 2;
                offset += player.transform.forward * 0.1f;

                if (wieldedItem != null && !wieldedItem.IsWeapon && !wieldedItem.CanReload) {
                } else {
                    lowerOffset = Vector3.down * 0.1f;
                    lowerOffset -= player.transform.forward * 0.15f;
                    handOffset = Vector3.down * 0.2f;
                }

                if (player.Alive) {
                    displacement += Vector3.down * 0.2f;
                }
            } else {
                LUArm = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position;
                LLArm = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm).position;
                LHand = anim.GetBoneTransform(HumanBodyBones.LeftHand).position;

                RUArm = anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position;
                RLArm = anim.GetBoneTransform(HumanBodyBones.RightLowerArm).position;
                RHand = anim.GetBoneTransform(HumanBodyBones.RightHand).position;
            }

            LULeg = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg).position;
            LLLeg = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg).position;
            LFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot).position;

            RULeg = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg).position;
            RLLeg = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg).position;
            RFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot).position;

            BitHelper.WriteHalf(displacement * 2 + head - pos, buffer);

            BitHelper.WriteHalf(displacement * 2 + offset + LUArm - pos, buffer);
            BitHelper.WriteHalf(displacement * 2 + offset + lowerOffset + LLArm - pos, buffer);
            BitHelper.WriteHalf(displacement * 2 + offset + handOffset + LHand - pos, buffer);

            BitHelper.WriteHalf(displacement * 2 + offset + RUArm - pos, buffer);
            BitHelper.WriteHalf(displacement * 2 + offset + lowerOffset + RLArm - pos, buffer);
            BitHelper.WriteHalf(displacement * 2 + offset + handOffset + RHand - pos, buffer);

            BitHelper.WriteHalf(displacement + LULeg - pos, buffer);
            BitHelper.WriteHalf(displacement + LLLeg - pos, buffer);
            BitHelper.WriteHalf(displacement + LFoot - pos, buffer);

            BitHelper.WriteHalf(displacement + RULeg - pos, buffer);
            BitHelper.WriteHalf(displacement + RLLeg - pos, buffer);
            BitHelper.WriteHalf(displacement + RFoot - pos, buffer);

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
            BitHelper.WriteHalf(displacement * 2 + offset + handOffset + wieldedPos - pos, buffer);
            BitHelper.WriteHalf(wieldedRot, buffer);
            BitHelper.WriteHalf(foldRot, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
