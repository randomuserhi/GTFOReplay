using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Model", "0.0.1")]
    internal class rEnemyModel : ReplayDynamic {
        public static int tick = 0;
        [ReplayTick]
        private static void Update() {
            tick = (tick + 1) % 2;
        }

        public static bool isValid(EnemyAgent enemy) {
            Animator anim = enemy.Anim;
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

        private EnemyAgent enemy;

        public override bool Active => enemy != null;
        public override int Id => enemy.GlobalID;
        public override bool IsDirty {
            get {
                if (tick != 0) return false;

                Animator anim = enemy.Anim;
                return head != anim.GetBoneTransform(HumanBodyBones.Head).position ||

                LUArm != anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position ||
                LLArm != anim.GetBoneTransform(HumanBodyBones.LeftLowerArm).position ||
                LHand != anim.GetBoneTransform(HumanBodyBones.LeftHand).position ||

                RUArm != anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position ||
                RLArm != anim.GetBoneTransform(HumanBodyBones.RightLowerArm).position ||
                RHand != anim.GetBoneTransform(HumanBodyBones.RightHand).position ||

                LULeg != anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg).position ||
                LLLeg != anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg).position ||
                LFoot != anim.GetBoneTransform(HumanBodyBones.LeftFoot).position ||

                RULeg != anim.GetBoneTransform(HumanBodyBones.RightUpperLeg).position ||
                RLLeg != anim.GetBoneTransform(HumanBodyBones.RightLowerLeg).position ||
                RFoot != anim.GetBoneTransform(HumanBodyBones.RightFoot).position;
            }
        }

        public rEnemyModel(EnemyAgent enemy) {
            this.enemy = enemy;
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
            Vector3 pos = enemy.transform.position;
            Animator anim = enemy.Anim;

            head = anim.GetBoneTransform(HumanBodyBones.Head).position;

            LUArm = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm).position;
            LLArm = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm).position;
            LHand = anim.GetBoneTransform(HumanBodyBones.LeftHand).position;

            RUArm = anim.GetBoneTransform(HumanBodyBones.RightUpperArm).position;
            RLArm = anim.GetBoneTransform(HumanBodyBones.RightLowerArm).position;
            RHand = anim.GetBoneTransform(HumanBodyBones.RightHand).position;

            LULeg = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg).position;
            LLLeg = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg).position;
            LFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot).position;

            RULeg = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg).position;
            RLLeg = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg).position;
            RFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot).position;

            BitHelper.WriteHalf(head - pos, buffer);

            BitHelper.WriteHalf(LUArm - pos, buffer);
            BitHelper.WriteHalf(LLArm - pos, buffer);
            BitHelper.WriteHalf(LHand - pos, buffer);

            BitHelper.WriteHalf(RUArm - pos, buffer);
            BitHelper.WriteHalf(RLArm - pos, buffer);
            BitHelper.WriteHalf(RHand - pos, buffer);

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
