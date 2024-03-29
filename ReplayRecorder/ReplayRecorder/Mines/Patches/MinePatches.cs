﻿using Agents;
using API;
using HarmonyLib;
using Player;
using SNetwork;
using static MineDeployerInstance;

namespace ReplayRecorder.Mines.Patches {
    [HarmonyPatch]
    class MinePatches {
        public static rMine? currentMine = null;

        private static float prevLength;
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.FixedUpdate))]
        [HarmonyPrefix]
        private static void Prefix_TripLineUpdate(MineDeployerInstance __instance) {
            prevLength = __instance.m_lastDetectionRange;
        }
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.FixedUpdate))]
        [HarmonyPostfix]
        private static void Postfix_TripLineUpdate(MineDeployerInstance __instance) {
            if (prevLength != __instance.m_lastDetectionRange) {
                int instanceID = __instance.gameObject.GetInstanceID();

                if (Mine.mines.ContainsKey(instanceID)) {
                    Mine.TripLine(instanceID, __instance.m_lastDetectionRange);
                } else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
            }
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.OnSyncTripLineUpdate))]
        [HarmonyPrefix]
        private static void Prefix_TripLineSyncUpdate(MineDeployerInstance __instance, pTripLineUpdate data) {
            if (data.lineLength != __instance.m_detection.DetectionRange) {
                int instanceID = __instance.gameObject.GetInstanceID();

                if (Mine.mines.ContainsKey(instanceID)) {
                    Mine.TripLine(instanceID, data.lineLength);
                } else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
            }
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void Spawn(MineDeployerInstance __instance, pItemSpawnData spawnData) {
            int instanceID = __instance.gameObject.GetInstanceID();

            SNet_Player player;
            if (spawnData.owner.TryGetPlayer(out player)) {
                // NOTE(randomuserhi): Try with persistent_ID instead of itemID_gearCRC
                APILogger.Debug($"Mine Spawn ID - {spawnData.itemData.itemID_gearCRC}");
                switch (spawnData.itemData.itemID_gearCRC) {
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
        private static void SyncedPickup(MineDeployerInstance __instance) {
            int instanceID = __instance.gameObject.GetInstanceID();

            Mine.DespawnMine(instanceID);
        }

        public static PlayerAgent? player = null;
        [HarmonyPatch(typeof(GenericDamageComponent), nameof(GenericDamageComponent.BulletDamage))]
        [HarmonyPrefix]
        private static void Prefix_BulletDamage(float dam, Agent sourceAgent) {
            player = sourceAgent.TryCast<PlayerAgent>();
        }
        [HarmonyPatch(typeof(GenericDamageComponent), nameof(GenericDamageComponent.BulletDamage))]
        [HarmonyPostfix]
        private static void Postfix_BulletDamage() {
            player = null;
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedTrigger))]
        [HarmonyPrefix]
        private static void Prefix_SyncedTrigger(MineDeployerInstance __instance) {
            int instanceID = __instance.gameObject.GetInstanceID();

            if (Mine.mines.ContainsKey(instanceID)) {
                currentMine = Mine.mines[instanceID];
                if (player != null) {
                    APILogger.Debug($"Player triggered mine: {player.PlayerName}");
                    Mine.ExplodeMine(instanceID, (byte)player.PlayerSlotIndex);
                    return;
                }

                // Attempt to get player from packet
                if (SNet.Replication.TryGetLastSender(out SNet_Player sender)) {
                    byte slot = (byte)sender.PlayerSlotIndex();
                    if (currentMine.owner != slot) {
                        APILogger.Debug($"Player triggered mine: {sender.NickName}");
                        Mine.ExplodeMine(instanceID, slot);
                        return;
                    }
                } else {
                    APILogger.Warn($"Failed to get the last packet sender for synced mine trigger.");
                }

                APILogger.Debug($"Mine triggered without player.");
                Mine.ExplodeMine(instanceID, 255);
                return;
            } else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedTrigger))]
        [HarmonyPostfix]
        private static void Postfix_SyncedTrigger() {
            currentMine = null;
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPrefix]
        private static void Prefix_Detonate_Explosive(MineDeployerInstance_Detonate_Explosive __instance) {
            if (!SNet.IsMaster) return;
            int instanceID = __instance.gameObject.GetInstanceID();

            if (Mine.mines.ContainsKey(instanceID)) {
                currentMine = Mine.mines[instanceID];
            } else APILogger.Error($"Mine did not exist in catalogue, this should not happen.");
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPostfix]
        private static void Postfix_Detonate_Explosive(MineDeployerInstance_Detonate_Explosive __instance) {
            if (!SNet.IsMaster) return;
            currentMine = null;
            Mine.DespawnMine(__instance.gameObject.GetInstanceID());
        }
    }
}
