using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
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

        private PlayerAgent player;

        public override bool Active => player != null;
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

                return head != anim.GetBoneTransform(HumanBodyBones.Head).position ||

                arms ||

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

        public override void Write(ByteBuffer buffer) {
            Vector3 pos = player.transform.position;
            Animator anim = player.AnimatorBody;

            head = anim.GetBoneTransform(HumanBodyBones.Head).position;

            Vector3 offset = Vector3.zero;
            if (player.IsLocallyOwned && !player.Owner.IsBot) {
                LUArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftUpperArm).position;
                LLArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftLowerArm).position;
                LHand = player.AnimatorArms.GetBoneTransform(HumanBodyBones.LeftHand).position;

                RUArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightUpperArm).position;
                RLArm = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightLowerArm).position;
                RHand = player.AnimatorArms.GetBoneTransform(HumanBodyBones.RightHand).position;

                offset = (anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position + anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position) / 2 - (LUArm + RUArm) / 2;
                offset += player.transform.forward * 0.1f;
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

            BitHelper.WriteHalf(head - pos, buffer);

            BitHelper.WriteHalf(offset + LUArm - pos, buffer);
            BitHelper.WriteHalf(offset + LLArm - pos, buffer);
            BitHelper.WriteHalf(offset + LHand - pos, buffer);

            BitHelper.WriteHalf(offset + RUArm - pos, buffer);
            BitHelper.WriteHalf(offset + RLArm - pos, buffer);
            BitHelper.WriteHalf(offset + RHand - pos, buffer);

            BitHelper.WriteHalf(LULeg - pos, buffer);
            BitHelper.WriteHalf(LLLeg - pos, buffer);
            BitHelper.WriteHalf(LFoot - pos, buffer);

            BitHelper.WriteHalf(RULeg - pos, buffer);
            BitHelper.WriteHalf(RLLeg - pos, buffer);
            BitHelper.WriteHalf(RFoot - pos, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
