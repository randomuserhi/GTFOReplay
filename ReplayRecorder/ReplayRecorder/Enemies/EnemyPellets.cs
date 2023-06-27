using API;
using Enemies;
using UnityEngine;

namespace ReplayRecorder.Enemies
{
    public class EnemyPellet
    {
        public EnemyAgent owner;
        public int instance;
        public GameObject projectile;
        public bool markForRemoval;
        public long timestamp;

        public EnemyPellet(EnemyAgent agent, GameObject proj)
        {
            owner = agent;
            instance = agent.GetInstanceID();
            projectile = proj;
            markForRemoval = false;
            timestamp = 0;
        }
    }

    public static partial class Enemy
    {
        public static Dictionary<int, EnemyPellet> pellets = new Dictionary<int, EnemyPellet>();

        private struct Pellet : SnapshotManager.ITransform
        {
            ProjectileTargeting targeting;

            public bool active => targeting != null;
            public Vector3 position => targeting.m_myPos;
            public Quaternion rotation => Quaternion.LookRotation(targeting.m_myFwd);
            public float scale => 0;

            public Pellet(ProjectileTargeting targeting)
            {
                this.targeting = targeting;
            }
        }

        public static void OnPelletSpawn(GameObject projectile, ProjectileTargeting targeting)
        {
            APILogger.Debug($"Visual pellet spawned.");

            int instance = projectile.GetInstanceID();
            SnapshotManager.AddEvent(GameplayEvent.Type.SpawnPellet, new rInstance(instance));
            SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, new Pellet(targeting)));
        }

        public static void OnPelletDespawn(int instance)
        {
            if (pellets.ContainsKey(instance) && !pellets[instance].markForRemoval)
            {
                APILogger.Debug($"Visual pellet despawned.");

                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnPellet, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
            }
        }

        public static void RegisterPellet(EnemyAgent agent, GameObject projectile)
        {
            APILogger.Debug($"Projectile shot by {agent.GetInstanceID()}");
            pellets.Add(projectile.GetInstanceID(), new EnemyPellet(agent, projectile));
        }

        public static void UnregisterPellet(int instance)
        {
            long now = ((DateTimeOffset)DateTime.Now).ToUnixTimeMilliseconds();

            if (pellets.ContainsKey(instance))
            {
                pellets[instance].markForRemoval = true;
                pellets[instance].timestamp = now;
            }

            int[] keys = pellets.Keys.ToArray();
            foreach (int id in keys)
            {
                if (pellets[id].markForRemoval && now - pellets[id].timestamp > ConfigManager.PelletLingerTime)
                {
                    pellets.Remove(id);
                    APILogger.Debug($"Projectile successfully removed.");
                }
            }
        }
    }
}
