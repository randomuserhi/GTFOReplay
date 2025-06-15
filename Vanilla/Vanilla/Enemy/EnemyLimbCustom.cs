using Enemies;
using HarmonyLib;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Enemy {
    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.LimbCustom", "0.0.2")]
    public class rLimbCustom : ReplayDynamic {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
            [HarmonyPostfix]
            private static void OnSpawn(EnemySync __instance, pEnemySpawnData spawnData) {
                foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                    Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                    if (limbCustom != null) {
                        Bone bone = default;
                        Transform? boneTransform = GetBone(limbCustom, ref bone);
                        Replay.Spawn(new rLimbCustom(limbCustom, bone));
                    }
                }
            }
            [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnDespawn))]
            [HarmonyPostfix]
            private static void OnDespawn(EnemySync __instance) {
                foreach (Dam_EnemyDamageLimb limb in __instance.m_damage.DamageLimbs) {
                    Dam_EnemyDamageLimb_Custom? limbCustom = limb.TryCast<Dam_EnemyDamageLimb_Custom>();
                    if (limbCustom != null) {
                        Replay.TryDespawn<rLimbCustom>(limbCustom.GetInstanceID());
                    }
                }
            }
            [HarmonyPatch(typeof(Dam_EnemyDamageLimb_Custom), nameof(Dam_EnemyDamageLimb_Custom.DestroyLimb))]
            [HarmonyPostfix]
            private static void OnDestroy(Dam_EnemyDamageLimb_Custom __instance) {
                Replay.TryDespawn<rLimbCustom>(__instance.GetInstanceID());
            }
        }

        public enum Bone {
            Hip,

            LeftUpperLeg,
            LeftLowerLeg,
            LeftFoot,

            RightUpperLeg,
            RightLowerLeg,
            RightFoot,

            Spine0,
            Spine1,
            Spine2,

            LeftShoulder,
            LeftUpperArm,
            LeftLowerArm,
            LeftHand,

            RightShoulder,
            RightUpperArm,
            RightLowerArm,
            RightHand,

            Neck,
            Head
        }

        public static Transform? GetBone(Dam_EnemyDamageLimb_Custom limb, ref Bone bone) {
            Transform current = limb.transform;
            while (current.parent != null) {
                switch (current.parent.name.Trim().ToLower()) {
                case "head":
                    bone = Bone.Head;
                    return current.parent;
                case "neck":
                    bone = Bone.Neck;
                    return current.parent;
                case "leftshoulder":
                    bone = Bone.LeftShoulder;
                    return current.parent;
                case "leftupperarm":
                    bone = Bone.LeftUpperArm;
                    return current.parent;
                case "leftlowerarm":
                    bone = Bone.LeftLowerArm;
                    return current.parent;
                case "lefthand":
                    bone = Bone.LeftHand;
                    return current.parent;
                case "rightshoulder":
                    bone = Bone.RightShoulder;
                    return current.parent;
                case "rightupperarm":
                    bone = Bone.RightUpperArm;
                    return current.parent;
                case "rightlowerarm":
                    bone = Bone.RightLowerArm;
                    return current.parent;
                case "righthand":
                    bone = Bone.RightHand;
                    return current.parent;
                case "spine1":
                    bone = Bone.Spine0;
                    return current.parent;
                case "spine2":
                    bone = Bone.Spine1;
                    return current.parent;
                case "spine3":
                    bone = Bone.Spine2;
                    return current.parent;
                case "chest":
                    bone = Bone.Spine2;
                    return current.parent;
                case "spine":
                    bone = Bone.Spine0;
                    return current.parent;
                case "hip":
                    bone = Bone.Hip;
                    return current.parent;
                case "leftupperleg":
                    bone = Bone.LeftUpperLeg;
                    return current.parent;
                case "leftLowerleg":
                    bone = Bone.LeftLowerLeg;
                    return current.parent;
                case "leftFoot":
                    bone = Bone.LeftFoot;
                    return current.parent;
                case "rightupperleg":
                    bone = Bone.RightUpperLeg;
                    return current.parent;
                case "rightLowerleg":
                    bone = Bone.RightLowerLeg;
                    return current.parent;
                case "rightFoot":
                    bone = Bone.RightFoot;
                    return current.parent;
                }

                current = current.parent;
            }

            return current.parent;
        }

        private Dam_EnemyDamageLimb_Custom limb;
        private Collider col;
        private Bone bone;

        private Vector3 offset {
            get {
                Vector3 offset = limb.m_base.Owner.transform.InverseTransformDirection(limb.transform.position - limb.m_base.Owner.transform.position);
                offset.x /= limb.m_base.Owner.transform.lossyScale.x;
                offset.y /= limb.m_base.Owner.transform.lossyScale.y;
                offset.z /= limb.m_base.Owner.transform.lossyScale.z;
                return offset;
            }
        }

        private float scale {
            get {
                return Mathf.Max(
                    limb.transform.lossyScale.x / limb.m_base.Owner.transform.lossyScale.x,
                    limb.transform.lossyScale.y / limb.m_base.Owner.transform.lossyScale.y,
                    limb.transform.lossyScale.z / limb.m_base.Owner.transform.lossyScale.z
                );
            }
        }

        public override bool Active => limb != null;

        public override bool IsDirty => col.enabled != oldEnabled;
        private bool oldEnabled = true;

        public rLimbCustom(Dam_EnemyDamageLimb_Custom limb, Bone bone) : base(limb.GetInstanceID()) {
            this.limb = limb;
            col = limb.GetComponent<Collider>();
            this.bone = bone;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(col.enabled, buffer);
            oldEnabled = col.enabled;
        }

        public override void Spawn(ByteBuffer buffer) {
            BitHelper.WriteBytes(limb.m_base.Owner.GlobalID, buffer);
            BitHelper.WriteBytes((byte)bone, buffer);
            BitHelper.WriteHalf(offset, buffer);
            BitHelper.WriteHalf(scale, buffer);
        }
    }
}
