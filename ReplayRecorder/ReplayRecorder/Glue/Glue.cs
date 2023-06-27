using API;
using HarmonyLib;
using UnityEngine;

namespace ReplayRecorder.Glue
{
    public static class Glue
    {
        private struct Projectile : SnapshotManager.ITransform
        {
            GlueGunProjectile projectile;

            public bool active => projectile != null;
            public Vector3 position => projectile.transform.position;
            public Quaternion rotation => Quaternion.identity;
            public float scale => projectile.m_radius;

            public Projectile(GlueGunProjectile projectile)
            {
                this.projectile = projectile;
            }
        }

        private static HashSet<int> glue = new HashSet<int>();

        public static void SpawnGlue(GlueGunProjectile projectile)
        {
            APILogger.Debug($"Glue spawned");

            int instance = projectile.GetInstanceID();
            if (!glue.Contains(instance))
            {
                glue.Add(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.SpawnGlue, new rInstance(instance));
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, new Projectile(projectile)));
            }
        }

        public static void DespawnGlue(GlueGunProjectile projectile)
        {
            APILogger.Debug($"Destroyed Glue");

            int instance = projectile.GetInstanceID();
            if (glue.Contains(instance))
            {
                glue.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnGlue, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
            }
        }
    }
}
