using API;
using HarmonyLib;
using Player;
using Agents;
using SNetwork;

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
            int instanceID = __instance.gameObject.GetInstanceID();

            SNet_Player player;
            if (spawnData.owner.TryGetPlayer(out player))
            {
                // NOTE(randomuserhi): Try with persistent_ID instead of itemID_gearCRC
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

        private static PlayerAgent? player = null;
        [HarmonyPatch(typeof(GenericDamageComponent), nameof(GenericDamageComponent.BulletDamage))]
        [HarmonyPrefix]
        private static void Prefix_BulletDamage(float dam, Agent sourceAgent)
        {
            player = sourceAgent.TryCast<PlayerAgent>();
        }
        [HarmonyPatch(typeof(GenericDamageComponent), nameof(GenericDamageComponent.BulletDamage))]
        [HarmonyPostfix]
        private static void Postfix_BulletDamage()
        {
            player = null;
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedTrigger))]
        [HarmonyPrefix]
        private static void Prefix_SyncedTrigger(MineDeployerInstance __instance)
        {
            int instanceID = __instance.gameObject.GetInstanceID();

            if (Mine.mines.ContainsKey(instanceID))
            {
                currentMine = Mine.mines[instanceID];
                if (player != null)
                {
                    APILogger.Debug($"Player triggered mine: {player.PlayerName}");
                    Mine.ExplodeMine(instanceID, (byte)player.PlayerSlotIndex);
                }
                else
                {
                    APILogger.Debug($"Mine triggered without player.");
                    Mine.ExplodeMine(instanceID, 255);
                }
            }
            else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedTrigger))]
        [HarmonyPostfix]
        private static void Postfix_SyncedTrigger()
        {
            currentMine = null;
        }
    }
}
