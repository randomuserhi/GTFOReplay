using API;
using Enemies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using UnityEngine;
using static UnityEngine.UIElements.UIRAtlasAllocator;

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
