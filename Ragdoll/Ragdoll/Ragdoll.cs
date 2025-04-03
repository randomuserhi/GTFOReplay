using API;
using Player;
using RagdollMode;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace ReplayRecorder.EWC {

    [ReplayData("RagdollMode.Ragdoll", "0.0.1")]
    internal class rRagdoll : ReplayDynamic {
        internal static class Hooks {
            [ReplayOnPlayerSpawn]
            private static void Spawn(PlayerAgent agent) {
                RagdollLogic? ragdoll = agent.GetComponent<RagdollLogic>();
                if (ragdoll == null) {
                    APILogger.Error("Could not get RagdollLogic component!");
                    return;
                }
                Replay.Spawn(new rRagdoll(agent, ragdoll));
            }

            [ReplayOnPlayerDespawn]
            private static void Despawn(int id) {
                Replay.TryDespawn<rRagdoll>(id);
            }
        }

        RagdollLogic ragdoll;

        public override bool Active => ragdoll != null;

        public override bool IsDirty =>
            enabled != ragdoll.ragdollEnabled || (ragdoll.ragdollEnabled == true &&
            (hip.rotation != hipRot ||
            leftUpperLeg.rotation != leftUpperLegRot ||
            leftLowerLeg.rotation != leftLowerLegRot ||
            leftFoot.rotation != leftFootRot ||
            rightUpperLeg.rotation != rightUpperLegRot ||
            rightLowerLeg.rotation != rightLowerLegRot ||
            rightFoot.rotation != rightFootRot ||
            spine0.rotation != spine0Rot ||
            spine1.rotation != spine1Rot ||
            spine2.rotation != spine2Rot ||
            leftShoulder.rotation != leftShoulderRot ||
            leftUpperArm.rotation != leftUpperArmRot ||
            leftLowerArm.rotation != leftLowerArmRot ||
            leftHand.rotation != leftHandRot ||
            rightShoulder.rotation != rightShoulderRot ||
            rightUpperArm.rotation != rightUpperArmRot ||
            rightLowerArm.rotation != rightLowerArmRot ||
            rightHand.rotation != rightHandRot ||
            neck.rotation != neckRot ||
            head.rotation != headRot));

        private Transform hip;

        private Transform leftUpperLeg;
        private Transform leftLowerLeg;
        private Transform leftFoot;

        private Transform rightUpperLeg;
        private Transform rightLowerLeg;
        private Transform rightFoot;

        private Transform spine0;
        private Transform spine1;
        private Transform spine2;

        private Transform leftShoulder;
        private Transform leftUpperArm;
        private Transform leftLowerArm;
        private Transform leftHand;

        private Transform rightShoulder;
        private Transform rightUpperArm;
        private Transform rightLowerArm;
        private Transform rightHand;

        private Transform neck;
        private Transform head;

        private Quaternion hipRot;

        private Quaternion leftUpperLegRot;
        private Quaternion leftLowerLegRot;
        private Quaternion leftFootRot;

        private Quaternion rightUpperLegRot;
        private Quaternion rightLowerLegRot;
        private Quaternion rightFootRot;

        private Quaternion spine0Rot;
        private Quaternion spine1Rot;
        private Quaternion spine2Rot;

        private Quaternion leftShoulderRot;
        private Quaternion leftUpperArmRot;
        private Quaternion leftLowerArmRot;
        private Quaternion leftHandRot;

        private Quaternion rightShoulderRot;
        private Quaternion rightUpperArmRot;
        private Quaternion rightLowerArmRot;
        private Quaternion rightHandRot;

        private Quaternion neckRot;
        private Quaternion headRot;

        private bool enabled = false;

        public rRagdoll(PlayerAgent agent, RagdollLogic ragdoll) : base(agent.GlobalID) {
            this.ragdoll = ragdoll;

            Transform playerRig = agent.PlayerSyncModel.transform.Find("PlayerCharacter_rig");

            hip = playerRig.Find("Root/Hip");

            leftUpperLeg = playerRig.Find("Root/Hip/LeftUpperLeg");
            leftLowerLeg = playerRig.Find("Root/Hip/LeftUpperLeg/LeftLowerLeg");
            leftFoot = playerRig.Find("Root/Hip/LeftUpperLeg/LeftLowerLeg/LeftFoot");

            rightUpperLeg = playerRig.Find("Root/Hip/RightUpperLeg");
            rightLowerLeg = playerRig.Find("Root/Hip/RightUpperLeg/RightLowerLeg");
            rightFoot = playerRig.Find("Root/Hip/RightUpperLeg/RightLowerLeg/RightFoot");

            spine0 = playerRig.Find("Root/Hip/Spine1");
            spine1 = playerRig.Find("Root/Hip/Spine1/Spine2");
            spine2 = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3");

            leftShoulder = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/LeftShoulder");
            leftUpperArm = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/LeftShoulder/LeftUpperArm");
            leftLowerArm = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/LeftShoulder/LeftUpperArm/LeftLowerArm");
            leftHand = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/LeftShoulder/LeftUpperArm/LeftLowerArm/LeftHand");

            rightShoulder = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/RightShoulder");
            rightUpperArm = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/RightShoulder/RightUpperArm");
            rightLowerArm = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/RightShoulder/RightUpperArm/RightLowerArm");
            rightHand = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/RightShoulder/RightUpperArm/RightLowerArm/RightHand");

            neck = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/Neck");
            head = playerRig.Find("Root/Hip/Spine1/Spine2/Spine3/Neck/Head");
        }

        public override void Write(ByteBuffer buffer) {
            enabled = ragdoll.ragdollEnabled;
            BitHelper.WriteBytes(enabled, buffer);

            if (enabled) {
                hipRot = hip.transform.localRotation;

                leftUpperLegRot = leftUpperLeg.transform.localRotation;
                leftLowerLegRot = leftLowerLeg.transform.localRotation;
                leftFootRot = leftFoot.transform.localRotation;

                rightUpperLegRot = rightUpperLeg.transform.localRotation;
                rightLowerLegRot = rightLowerLeg.transform.localRotation;
                rightFootRot = rightFoot.transform.localRotation;

                spine0Rot = spine0.transform.localRotation;
                spine1Rot = spine1.transform.localRotation;
                spine2Rot = spine2.transform.localRotation;

                leftShoulderRot = leftShoulder.transform.localRotation;
                leftUpperArmRot = leftUpperArm.transform.localRotation;
                leftLowerArmRot = leftLowerArm.transform.localRotation;
                leftHandRot = leftHand.transform.localRotation;

                rightShoulderRot = rightShoulder.transform.localRotation;
                rightUpperArmRot = rightUpperArm.transform.localRotation;
                rightLowerArmRot = rightLowerArm.transform.localRotation;
                rightHandRot = rightHand.transform.localRotation;

                neckRot = neck.transform.localRotation;
                headRot = head.transform.localRotation;

                BitHelper.WriteHalf(hipRot, buffer);

                BitHelper.WriteHalf(leftUpperLegRot, buffer);
                BitHelper.WriteHalf(leftLowerLegRot, buffer);
                BitHelper.WriteHalf(leftFootRot, buffer);

                BitHelper.WriteHalf(rightUpperLegRot, buffer);
                BitHelper.WriteHalf(rightLowerLegRot, buffer);
                BitHelper.WriteHalf(rightFootRot, buffer);

                BitHelper.WriteHalf(spine0Rot, buffer);
                BitHelper.WriteHalf(spine1Rot, buffer);
                BitHelper.WriteHalf(spine2Rot, buffer);

                BitHelper.WriteHalf(leftShoulderRot, buffer);
                BitHelper.WriteHalf(leftUpperArmRot, buffer);
                BitHelper.WriteHalf(leftLowerArmRot, buffer);
                BitHelper.WriteHalf(leftHandRot, buffer);

                BitHelper.WriteHalf(rightShoulderRot, buffer);
                BitHelper.WriteHalf(rightUpperArmRot, buffer);
                BitHelper.WriteHalf(rightLowerArmRot, buffer);
                BitHelper.WriteHalf(rightHandRot, buffer);

                BitHelper.WriteHalf(neckRot, buffer);
                BitHelper.WriteHalf(headRot, buffer);
            }
        }
    }
}
