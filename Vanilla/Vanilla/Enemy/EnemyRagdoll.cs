using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    internal static class EnemyRagdollManager {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(EnemyBehaviour), nameof(EnemyBehaviour.ChangeState), new Type[] { typeof(EB_States) })]
            [HarmonyPrefix]
            private static void Behaviour_ChangeState(EnemyBehaviour __instance, EB_States state) {
                if (__instance.m_currentStateName != state && state == EB_States.Dead) {
                    Spawn(__instance.m_ai.m_enemyAgent);
                    return;
                }
            }
        }

        public static void Spawn(EnemyAgent enemy) {
            if (!Replay.Active) return;
            if (!RagdollPartManager.isValid(enemy)) return;

            RagdollPartManager ragdoll = new(enemy);
            Replay.Spawn(new rEnemyRagdoll(enemy, ragdoll));
        }

        public static void Despawn(EnemyAgent enemy) {
            if (!Replay.Active) return;

            Replay.TryDespawn<rEnemyRagdoll>(enemy.GlobalID);
        }

        [ReplayOnElevatorStop]
        private static void Init() {
            Replay.Configure<rEnemyRagdoll>(2);
        }
    }

    public class RagdollPartManager {
        public static bool isValid(EnemyAgent enemy) {
            Animator anim = enemy.Anim;
            try {
                return anim.GetBoneTransform(HumanBodyBones.Head) != null &&
                    anim.GetBoneTransform(HumanBodyBones.Neck) != null &&

                    anim.GetBoneTransform(HumanBodyBones.LeftShoulder) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftUpperArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftLowerArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftHand) != null &&

                    anim.GetBoneTransform(HumanBodyBones.RightShoulder) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightUpperArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightLowerArm) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightHand) != null &&

                    anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.LeftFoot) != null &&

                    anim.GetBoneTransform(HumanBodyBones.RightUpperLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightLowerLeg) != null &&
                    anim.GetBoneTransform(HumanBodyBones.RightFoot) != null &&

                    anim.GetBoneTransform(HumanBodyBones.Hips) &&
                    anim.GetBoneTransform(HumanBodyBones.Spine);
            } catch {
                return false;
            }
        }

        public Transform hip;
        public Transform spine1;

        public Transform leftUpperLeg;
        public Transform leftLowerLeg;
        public Transform leftFoot;

        public Transform rightUpperLeg;
        public Transform rightLowerLeg;
        public Transform rightFoot;

        public Transform leftShoulder;
        public Transform leftUpperArm;
        public Transform leftLowerArm;
        public Transform leftHand;

        public Transform rightShoulder;
        public Transform rightUpperArm;
        public Transform rightLowerArm;
        public Transform rightHand;

        public Transform neck;
        public Transform head;

        public RagdollPartManager(EnemyAgent enemy) {
            Animator anim = enemy.Anim;

            hip = anim.GetBoneTransform(HumanBodyBones.Hips);

            leftUpperLeg = anim.GetBoneTransform(HumanBodyBones.LeftUpperLeg);
            leftLowerLeg = anim.GetBoneTransform(HumanBodyBones.LeftLowerLeg);
            leftFoot = anim.GetBoneTransform(HumanBodyBones.LeftFoot);

            rightUpperLeg = anim.GetBoneTransform(HumanBodyBones.RightUpperLeg);
            rightLowerLeg = anim.GetBoneTransform(HumanBodyBones.RightLowerLeg);
            rightFoot = anim.GetBoneTransform(HumanBodyBones.RightFoot);

            spine1 = anim.GetBoneTransform(HumanBodyBones.Spine);

            leftShoulder = anim.GetBoneTransform(HumanBodyBones.LeftShoulder);
            leftUpperArm = anim.GetBoneTransform(HumanBodyBones.LeftUpperArm);
            leftLowerArm = anim.GetBoneTransform(HumanBodyBones.LeftLowerArm);
            leftHand = anim.GetBoneTransform(HumanBodyBones.LeftHand);

            rightShoulder = anim.GetBoneTransform(HumanBodyBones.RightShoulder);
            rightUpperArm = anim.GetBoneTransform(HumanBodyBones.RightUpperArm);
            rightLowerArm = anim.GetBoneTransform(HumanBodyBones.RightLowerArm);
            rightHand = anim.GetBoneTransform(HumanBodyBones.RightHand);

            neck = anim.GetBoneTransform(HumanBodyBones.Neck);
            head = anim.GetBoneTransform(HumanBodyBones.Head);
        }
    }

    public struct RagdollTransform : IReplayTransform {
        private EnemyAgent agent;
        private RagdollPartManager ragdoll;

        public bool active => agent != null;

        public byte dimensionIndex => (byte)agent.m_dimensionIndex;

        public Vector3 position => ragdoll.hip.transform.position;

        public Quaternion rotation => Quaternion.identity;

        public RagdollTransform(EnemyAgent agent, RagdollPartManager ragdoll) {
            this.agent = agent;
            this.ragdoll = ragdoll;
        }
    }

    [ReplayData("Vanilla.Enemy.Ragdoll", "0.0.1")]
    public class rEnemyRagdoll : DynamicTransform {
        public EnemyAgent agent;
        public RagdollPartManager ragdoll;

        public rEnemyRagdoll(EnemyAgent agent, RagdollPartManager ragdoll) : base(agent.GlobalID, new RagdollTransform(agent, ragdoll)) {
            this.agent = agent;
            this.ragdoll = ragdoll;
        }

        public override bool Active => agent != null;

        public override bool IsDirty =>
            ragdoll.hip.transform.position != hip ||
            ragdoll.spine1.transform.position != spine1 ||
            ragdoll.leftUpperLeg.transform.position != leftUpperLeg ||
            ragdoll.leftLowerLeg.transform.position != leftLowerLeg ||
            ragdoll.leftFoot.transform.position != leftFoot ||
            ragdoll.rightUpperLeg.transform.position != rightUpperLeg ||
            ragdoll.rightLowerLeg.transform.position != rightLowerLeg ||
            ragdoll.rightFoot.transform.position != rightFoot ||
            ragdoll.leftShoulder.transform.position != leftShoulder ||
            ragdoll.leftUpperArm.transform.position != leftUpperArm ||
            ragdoll.leftLowerArm.transform.position != leftLowerArm ||
            ragdoll.leftHand.transform.position != leftHand ||
            ragdoll.rightShoulder.transform.position != rightShoulder ||
            ragdoll.rightUpperArm.transform.position != rightUpperArm ||
            ragdoll.rightLowerArm.transform.position != rightLowerArm ||
            ragdoll.rightHand.transform.position != rightHand ||
            ragdoll.neck.transform.position != neck ||
            ragdoll.head.transform.position != head;

        private Vector3 hip;

        private Vector3 leftUpperLeg;
        private Vector3 leftLowerLeg;
        private Vector3 leftFoot;

        private Vector3 rightUpperLeg;
        private Vector3 rightLowerLeg;
        private Vector3 rightFoot;

        private Vector3 spine1;

        private Vector3 leftShoulder;
        private Vector3 leftUpperArm;
        private Vector3 leftLowerArm;
        private Vector3 leftHand;

        private Vector3 rightShoulder;
        private Vector3 rightUpperArm;
        private Vector3 rightLowerArm;
        private Vector3 rightHand;

        private Vector3 neck;
        private Vector3 head;

        private void WriteAvatar(ByteBuffer buffer) {
            leftUpperLeg = ragdoll.leftUpperLeg.transform.position;
            leftLowerLeg = ragdoll.leftLowerLeg.transform.position;
            leftFoot = ragdoll.leftFoot.transform.position;

            rightUpperLeg = ragdoll.rightUpperLeg.transform.position;
            rightLowerLeg = ragdoll.rightLowerLeg.transform.position;
            rightFoot = ragdoll.rightFoot.transform.position;

            spine1 = ragdoll.spine1.transform.position;

            leftShoulder = ragdoll.leftShoulder.transform.position;
            leftUpperArm = ragdoll.leftUpperArm.transform.position;
            leftLowerArm = ragdoll.leftLowerArm.transform.position;
            leftHand = ragdoll.leftHand.transform.position;

            rightShoulder = ragdoll.rightShoulder.transform.position;
            rightUpperArm = ragdoll.rightUpperArm.transform.position;
            rightLowerArm = ragdoll.rightLowerArm.transform.position;
            rightHand = ragdoll.rightHand.transform.position;

            neck = ragdoll.neck.transform.position;
            head = ragdoll.neck.transform.position;

            BitHelper.WriteHalf(hip, buffer);

            BitHelper.WriteHalf(leftUpperLeg, buffer);
            BitHelper.WriteHalf(leftLowerLeg, buffer);
            BitHelper.WriteHalf(leftFoot, buffer);

            BitHelper.WriteHalf(rightUpperLeg, buffer);
            BitHelper.WriteHalf(rightLowerLeg, buffer);
            BitHelper.WriteHalf(rightFoot, buffer);

            BitHelper.WriteHalf(spine1, buffer);

            BitHelper.WriteHalf(leftShoulder, buffer);
            BitHelper.WriteHalf(leftUpperArm, buffer);
            BitHelper.WriteHalf(leftLowerArm, buffer);
            BitHelper.WriteHalf(leftHand, buffer);

            BitHelper.WriteHalf(rightShoulder, buffer);
            BitHelper.WriteHalf(rightUpperArm, buffer);
            BitHelper.WriteHalf(rightLowerArm, buffer);
            BitHelper.WriteHalf(rightHand, buffer);

            BitHelper.WriteHalf(neck, buffer);
            BitHelper.WriteHalf(head, buffer);
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            WriteAvatar(buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes((ushort)agent.Locomotion.AnimHandleName, buffer);
            BitHelper.WriteHalf(agent.SizeMultiplier, buffer);
            BitHelper.WriteBytes(Identifier.From(agent), buffer);
            BitHelper.WriteHalf(agent.Damage.HealthMax, buffer);
            WriteAvatar(buffer);
        }
    }
}
