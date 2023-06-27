using API;
using HarmonyLib;
using UnityEngine;

namespace ReplayRecorder.Glue
{
    public static class Glue
    {
        private struct Projectile : SnapshotManager.ITransform
        {
            public GlueGunProjectile projectile;

            public bool active => projectile != null;
            public Vector3 position => projectile.transform.position;
            public Quaternion rotation => Quaternion.identity;
            public float scale => projectile.transform.localScale.x;

            public Projectile(GlueGunProjectile projectile)
            {
                this.projectile = projectile;
            }
        }

        public static HashSet<int> glue = new HashSet<int>();

        public static void SpawnGlue(GlueGunProjectile projectile)
        {
            if (SnapshotManager.instance == null)
            {
                APILogger.Error("Snapshot Manager instance was null, this should not happen.");
                return;
            }

            int instance = projectile.GetInstanceID();
            if (!glue.Contains(instance))
            {
                APILogger.Debug($"Glue spawned");

                glue.Add(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.SpawnGlue, new rInstance(instance));
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, new Projectile(projectile)));
            }
            else
            {
                APILogger.Debug($"Glue swapped");

                SnapshotManager.instance.mapOfDynamics[instance].transform = new Projectile(projectile);
            }
        }

        public static void DespawnGlue(GlueGunProjectile projectile)
        {
            int instance = projectile.GetInstanceID();
            if (glue.Contains(instance))
            {
                APILogger.Debug($"Destroyed Glue");

                glue.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnGlue, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
            }
        }
    }
}
