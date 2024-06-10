using Agents;
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
            [HarmonyPrefix]
            private static bool DoFireTargeting(ProjectileManager __instance, ProjectileManager.pFireTargeting data) {
                Agent comp;
                data.target.TryGet(out comp);
                Vector3 pos = data.position;
                Quaternion rot = Quaternion.LookRotation(data.forward);
                GameObject projectile = ProjectileManager.SpawnProjectileType(data.type, pos, rot);
                IProjectile component = projectile.GetComponent<IProjectile>();
                ProjectileTargeting targeting = projectile.GetComponent<ProjectileTargeting>();
                if (targeting != null) {
                    __instance.m_projectiles.Add(targeting);
                }
                component.OnFire(comp);

                Replay.Spawn(new rEnemyProjectile(projectile));

                return false;
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
