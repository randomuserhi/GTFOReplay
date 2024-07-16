using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.DynamicItems {
    internal struct FogSphereTransform : IReplayTransform {
        private FogRepeller_Sphere sphere;

        public bool active => sphere != null;
        private byte dimension;
        public byte dimensionIndex => dimension;
        public Vector3 position => sphere.transform.position;
        public Quaternion rotation => sphere.transform.rotation;

        public FogSphereTransform(FogRepeller_Sphere sphere, byte dimension) {
            this.sphere = sphere;
            this.dimension = dimension;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.FogSphere", "0.0.1")]
    internal class rFogSphere : DynamicPosition {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(FogRepeller_Sphere), nameof(FogRepeller_Sphere.StartRepelling))]
            [HarmonyPostfix]
            private static void SpawnFogSphere(FogRepeller_Sphere __instance) {
                int id = __instance.GetInstanceID();
                if (Replay.Has<rFogSphere>(id)) {
                    rFogSphere old = Replay.Get<rFogSphere>(id);
                    old.transform = new FogSphereTransform(__instance, old.transform.dimensionIndex);
                } else Replay.Spawn(new rFogSphere(__instance, (byte)Dimension.GetDimensionFromPos(__instance.transform.position).DimensionIndex));
            }

            [HarmonyPatch(typeof(FogRepeller_Sphere), nameof(FogRepeller_Sphere.OnDestroy))]
            [HarmonyPrefix]
            private static void OnDestroy(FogRepeller_Sphere __instance) {
                Replay.TryDespawn<rFogSphere>(__instance.GetInstanceID());
            }
        }

        private FogRepeller_Sphere sphere;

        public override bool IsDirty => base.IsDirty || _range != range;

        private float range => sphere.m_currentRange;
        private float _range = 0;

        public rFogSphere(FogRepeller_Sphere sphere, byte dimension) : base(sphere.GetInstanceID(), new FogSphereTransform(sphere, dimension)) {
            this.sphere = sphere;
        }

        private void _Write(ByteBuffer buffer) {
            BitHelper.WriteHalf(range, buffer);

            _range = range;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            _Write(buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            _Write(buffer);
        }
    }
}
