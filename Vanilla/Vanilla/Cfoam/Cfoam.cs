using API;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;
using Vanilla.Map;

namespace Vanilla.Cfoam {
    internal struct CfoamTransform : IReplayTransform {
        private GlueGunProjectile projectile;

        public bool active => projectile != null;
        private byte dimension;
        public byte dimensionIndex => dimension;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public CfoamTransform(GlueGunProjectile projectile, byte dimension) {
            this.projectile = projectile;
            this.dimension = dimension;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Cfoam", "0.0.1")]
    public class rCfoam : DynamicPosition {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.SpawnGlueGunProjectileIfNeeded))]
            [HarmonyPostfix]
            private static void SpawnGlueGunProjectile(ProjectileManager __instance, GlueGunProjectile __result) {
                if (!Replay.Active || __result == null) return;

                // Level-placed foam can spawn before any player agent exists.
                // The native spawn position owns its dimension, not the local viewer.
                byte dimension = (byte)Dimension.GetDimensionFromPos(__result.transform.position).DimensionIndex;

                int id = __result.GetInstanceID();
                if (Replay.Has<rCfoam>(id)) {
                    rCfoam old = Replay.Get<rCfoam>(id);
                    old.transform = new CfoamTransform(__result, old.transform.dimensionIndex);
                } else Replay.Spawn(new rCfoam(__result, dimension));
            }

            [HarmonyPatch(typeof(GlueGunProjectile), nameof(GlueGunProjectile.Update))]
            [HarmonyPostfix]
            private static void CheckGlueWithinBounds(GlueGunProjectile __instance) {
                if (!Replay.Active) return;
                if (__instance.m_landed || __instance.m_landedOnEnemy) return;

                int id = __instance.GetInstanceID();
                if (!Replay.Has<rCfoam>(id)) return;
                rCfoam foam = Replay.Get<rCfoam>(__instance.GetInstanceID());
                byte dim = foam.transform.dimensionIndex;
                if (!MapUtils.lowestPoint.ContainsKey(dim)) return;
                if (__instance.transform.position.y < MapUtils.lowestPoint[dim]) {
                    APILogger.Debug("Removed foam since it fell too far.");
                    Replay.Despawn(foam);
                }
            }

            [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoDestroyGlue))]
            [HarmonyPrefix]
            private static void DoDestroyGlue(ProjectileManager.pDestroyGlue data) {
                if (ProjectileManager.Current.m_glueGunProjectiles.ContainsKey(data.syncID)) {
                    GlueGunProjectile p = ProjectileManager.Current.m_glueGunProjectiles[data.syncID];
                    int id = p.GetInstanceID();
                    Replay.TryDespawn<rCfoam>(id);
                }
            }
        }

        private GlueGunProjectile projectile;

        public override bool IsDirty => base.IsDirty || oldScale != scale;

        private float scale => projectile.transform.localScale.x;
        private float oldScale = 0;

        public rCfoam(GlueGunProjectile projectile, byte dimension) : base(projectile.GetInstanceID(), new CfoamTransform(projectile, dimension)) {
            this.projectile = projectile;
        }

        public override void Write(ByteBuffer buffer) {
            base.Write(buffer);
            BitHelper.WriteHalf(scale, buffer);

            oldScale = scale;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteHalf(scale, buffer);

            oldScale = scale;
        }
    }
}
