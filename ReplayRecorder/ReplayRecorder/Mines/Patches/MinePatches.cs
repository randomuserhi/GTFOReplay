using API;
using HarmonyLib;
using Player;
using SNetwork;
using static Il2CppSystem.Globalization.CultureInfo;

namespace ReplayRecorder.Mines.Patches
{
    [HarmonyPatch]
    class MinePatches
    {
        private static rMine? currentMine = null;

        private static float prevLength;
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.FixedUpdate))]
        [HarmonyPrefix]
        private static void Prefix_TripLineUpdate(MineDeployerInstance __instance)
        {
            prevLength = __instance.m_lastDetectionRange;
        }
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.FixedUpdate))]
        [HarmonyPostfix]
        private static void Postfix_TripLineUpdate(MineDeployerInstance __instance)
        {
            if (prevLength != __instance.m_lastDetectionRange)
            {
                int instanceID = __instance.gameObject.GetInstanceID();

                if (Mine.mines.ContainsKey(instanceID))
                {
                    Mine.TripLine(instanceID, __instance.m_lastDetectionRange);
                }
                else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
            }
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void Spawn(MineDeployerInstance __instance, pItemSpawnData spawnData)
        {
            if (!SNet.IsMaster) return;

            int instanceID = __instance.gameObject.GetInstanceID();

            SNet_Player player;
            if (spawnData.owner.TryGetPlayer(out player))
            {
                APILogger.Debug($"Mine Spawn ID - {spawnData.itemData.itemID_gearCRC}");
                switch (spawnData.itemData.itemID_gearCRC)
                {
                    case 125: // Mine deployer mine
                        Mine.SpawnMine(player, instanceID, rMine.Type.Mine, spawnData.position, spawnData.rotation);
                        break;
                    case 139: // Consumable mine
                        Mine.SpawnMine(player, instanceID, rMine.Type.Mine, spawnData.position, spawnData.rotation);
                        break;
                    case 144: // Cfoam mine
                        Mine.SpawnMine(player, instanceID, rMine.Type.Cfoam, spawnData.position, spawnData.rotation);
                        break;
                }
            }
        }

        // NOTE(randomuserhi) => has a agent parameter to know who picked up the mine, may use in the future
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedPickup))]
        [HarmonyPrefix]
        private static void SyncedPickup(MineDeployerInstance __instance)
        {
            int instanceID = __instance.gameObject.GetInstanceID();

            Mine.DespawnMine(instanceID);
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPrefix]
        private static void Prefix_DoExplode(MineDeployerInstance_Detonate_Explosive __instance)
        {
            if (!SNet.IsMaster) return;

            int instanceID = __instance.gameObject.GetInstanceID();

            if (Mine.mines.ContainsKey(instanceID))
            {
                currentMine = Mine.mines[instanceID];
                Mine.ExplodeMine(instanceID);
            }
            else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPostfix]
        private static void Postfix_DoExplode()
        {
            currentMine = null;
        }
    }
}
