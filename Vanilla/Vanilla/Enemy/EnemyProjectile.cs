using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Enemy {
    internal struct ProjectileTransform : IReplayTransform {
        private GameObject projectile;
        private byte dimension;

        public byte dimensionIndex => dimension;
        public bool active => projectile != null;
        public Vector3 position => projectile.transform.position;
        public Quaternion rotation => projectile.transform.rotation;

        public ProjectileTransform(GameObject projectile) {
            this.projectile = projectile;
            dimension = (byte)PlayerManager.GetLocalPlayerAgent().m_dimensionIndex;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Enemy.Projectile", "0.0.1")]
    internal class rEnemyProjectile : DynamicTransform {
        [HarmonyPatch]
        internal static class EnemyProjectilePatches {
            [HarmonyPatch(typeof(ProjectileManager), nameof(ProjectileManager.DoFireTargeting))]
            [HarmonyPostfix]
            private static void DoFireTargeting(ProjectileManager __instance, ProjectileManager.pFireTargeting data) {
                GameObject projectile = ProjectileManager.s_tempGO;
                if (projectile == null) return;

                Replay.Spawn(new rEnemyProjectile(projectile));
            }

            [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.OnDestroy))]
            [HarmonyPrefix]
            private static void OnDestroy(ProjectileBase __instance) {
                Replay.Despawn(Replay.Get<rEnemyProjectile>(__instance.gameObject.GetInstanceID()));
            }

            [HarmonyPatch(typeof(ProjectileBase), nameof(ProjectileBase.Collision))]
            [HarmonyPrefix]
            private static void OnCollision(ProjectileBase __instance) {
                Replay.Despawn(Replay.Get<rEnemyProjectile>(__instance.gameObject.GetInstanceID()));
            }
        }

        public rEnemyProjectile(GameObject projectile) : base(projectile.GetInstanceID(), new ProjectileTransform(projectile)) {
        }
    }
}
