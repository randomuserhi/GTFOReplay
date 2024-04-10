using Enemies;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;
using Vanilla.Enemy.BepInEx;
using Vanilla.Enemy.Patches;

namespace Vanilla.Enemy {
    [ReplayData("Vanilla.Enemy.Model", "0.0.1")]
    internal class rEnemyModel : ReplayDynamic {
        private static Dictionary<ushort, long> leeway = new Dictionary<ushort, long>();
        [ReplayInit]
        private static void Init() {
            leeway.Clear();
            Replay.Configure<rEnemyModel>(ConfigManager.AnimationTickRate, ConfigManager.MaxWritesPerTick);
        }

        public override void Despawn(ByteBuffer buffer) {
            base.Despawn(buffer);
            leeway.Remove(enemy.GlobalID);
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

        private Transform T_head;

        private Transform T_LUArm;
        private Transform T_LLArm;
        private Transform T_LHand;

        private Transform T_RUArm;
        private Transform T_RLArm;
        private Transform T_RHand;

        private Transform T_LULeg;
        private Transform T_LLLeg;
        private Transform T_LFoot;

        private Transform T_RULeg;
        private Transform T_RLLeg;
        private Transform T_RFoot;

        public override bool Active => enemy != null;

        public override bool IsDirty {
            get {
                bool hasLeeway = leeway.ContainsKey(enemy.GlobalID);

                bool isScreaming = false;
                bool isLocomotion = false;
                switch (enemy.Locomotion.m_currentState.m_stateEnum) {
                case ES_StateEnum.Jump:
                case ES_StateEnum.JumpDissolve:
                case ES_StateEnum.StandStill:
                case ES_StateEnum.ClimbLadder:
                case ES_StateEnum.PathMove: isLocomotion = true; break;
                case ES_StateEnum.Scream:
                case ES_StateEnum.ScoutScream: isScreaming = true; break;
                }

                bool canAnimate = true;
                if (ConfigManager.NoLocomotionAnimation && isLocomotion) canAnimate = false;
                if (!isScreaming && !EnemyModelPatches.aggressiveInRange.Contains(enemy.GlobalID) && !enemy.MovingCuller.IsShown) canAnimate = false;

                if (canAnimate) {
                    if (!hasLeeway) leeway.Add(enemy.GlobalID, Raudy.Now);
                    leeway[enemy.GlobalID] = Raudy.Now;
                }

                if (!canAnimate && (!hasLeeway || (Raudy.Now - leeway[enemy.GlobalID] > ConfigManager.AnimationLeeWay))) return false;

                return head != T_head.position ||

                LUArm != T_LUArm.position ||
                LLArm != T_LLArm.position ||
                LHand != T_LHand.position ||

                RUArm != T_RUArm.position ||
                RLArm != T_RLArm.position ||
                RHand != T_RHand.position ||

                LULeg != T_LULeg.position ||
                LLLeg != T_LLLeg.position ||
                LFoot != T_LFoot.position ||

                RULeg != T_RULeg.position ||
                RLLeg != T_RLLeg.position ||
                RFoot != T_RFoot.position;
            }
        }

        public rEnemyModel(EnemyAgent enemy) : base(enemy.GlobalID) {
            this.enemy = enemy;
            Animator anim = enemy.Anim;

            T_head = anim.GetBoneTransform(HumanBodyBones.Head);

            T_LUArm = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm);
            T_LLArm = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm);
            T_LHand = anim.GetBoneTransform(HumanBodyBones.LeftHand);

            T_RUArm = anim.GetBoneTransform(HumanBodyBones.RightUpperArm);
            T_RLArm = anim.GetBoneTransform(HumanBodyBones.RightLowerArm);
            T_RHand = anim.GetBoneTransform(HumanBodyBones.RightHand);

            T_LULeg = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg);
            T_LLLeg = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg);
            T_LFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot);

            T_RULeg = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg);
            T_RLLeg = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg);
            T_RFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot);
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

            head = T_head.position;

            LUArm = T_LUArm.position;
            LLArm = T_LLArm.position;
            LHand = T_LHand.position;

            RUArm = T_RUArm.position;
            RLArm = T_RLArm.position;
            RHand = T_RHand.position;

            LULeg = T_LULeg.position;
            LLLeg = T_LLLeg.position;
            LFoot = T_LFoot.position;

            RULeg = T_RULeg.position;
            RLLeg = T_RLLeg.position;
            RFoot = T_RFoot.position;

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
