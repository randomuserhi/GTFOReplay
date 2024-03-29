﻿using HarmonyLib;

namespace ReplayRecorder.Enemies.Patches {
    [HarmonyPatch]
    internal class EnemyTonguePatches {

        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DoAttack))]
        [HarmonyPostfix]
        private static void DoAttack(MovingEnemyTentacleBase __instance) {
            int key = __instance.m_owner.GetInstanceID();
            int instance = __instance.GetInstanceID();
            if (!Enemy.tongueOwners.ContainsKey(key))
                Enemy.tongueOwners.Add(key, new HashSet<MovingEnemyTentacleBase>());
            Enemy.tongueOwners[key].Add(__instance);
            Enemy.OnTongueSpawn(instance, key, __instance);
        }

        // Allow Enemy.Dead to remove tongue
        public static void RemoveTongue(int instance) {
            if (Enemy.tongueOwners.ContainsKey(instance)) {
                foreach (MovingEnemyTentacleBase tongue in Enemy.tongueOwners[instance])
                    Enemy.OnTongueDespawn(tongue.GetInstanceID());
                Enemy.tongueOwners.Remove(instance);
            }
        }

        // The current issue is updating spline positions since I'd have to send all
        // spline positions each tick which is a lot of data in order to make this look correct
        // Currently I just use a trail and watch the position of the tip, but that results in retraction looking
        // dodgy.
        [HarmonyPatch(typeof(MovingEnemyTentacleBase), nameof(MovingEnemyTentacleBase.DeAllocateGPUCurvy))]
        [HarmonyPostfix]
        private static void Deallocate(MovingEnemyTentacleBase __instance) {
            int instance = __instance.GetInstanceID();
            if (Enemy.tongues.ContainsKey(instance) && Enemy.tongueOwners.ContainsKey(Enemy.tongues[instance]))
                Enemy.tongueOwners[Enemy.tongues[instance]].Remove(__instance);
            Enemy.OnTongueDespawn(instance);

        }
    }
}
