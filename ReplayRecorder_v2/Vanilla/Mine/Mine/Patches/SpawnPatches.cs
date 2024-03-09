using Agents;
using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using SNetwork;

namespace Vanilla.Mine.Patches {
    [HarmonyPatch]
    internal static class SpawnPatches {
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.OnSpawn))]
        [HarmonyPostfix]
        private static void Spawn(MineDeployerInstance __instance, pItemSpawnData spawnData) {
            SNet_Player player;
            if (spawnData.owner.TryGetPlayer(out player)) {
                PlayerAgent owner = player.PlayerAgent.Cast<PlayerAgent>();
                APILogger.Debug($"Mine Spawn ID - {spawnData.itemData.itemID_gearCRC}");
                switch (spawnData.itemData.itemID_gearCRC) {
                case 125: // Mine deployer mine
                    Replay.Spawn(new rMine(owner, __instance, rMine.Type.Explosive));
                    break;
                case 139: // Consumable mine
                    Replay.Spawn(new rMine(owner, __instance, rMine.Type.Explosive));
                    break;
                case 144: // Cfoam mine
                    Replay.Spawn(new rMine(owner, __instance, rMine.Type.Cfoam));
                    break;
                }
            }
        }

        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedPickup))]
        [HarmonyPrefix]
        private static void SyncedPickup(MineDeployerInstance __instance) {
            Replay.Despawn(Replay.Get<rMine>(__instance.gameObject.GetInstanceID()));
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
            if (player != null) {
                APILogger.Debug($"Player triggered mine: {player.PlayerName}");
                Replay.Trigger(new rMineDetonate(__instance, player.GlobalID, true));
                return;
            }

            rMine mine = Replay.Get<rMine>(__instance.gameObject.GetInstanceID());

            // Attempt to get player from packet
            if (SNet.Replication.TryGetLastSender(out SNet_Player sender)) {
                APILogger.Debug($"Player triggered mine: {sender.NickName}");
                Replay.Trigger(new rMineDetonate(__instance, sender.PlayerAgent.Cast<PlayerAgent>().GlobalID, true));
                return;
            } else {
                APILogger.Warn($"Failed to get the last packet sender for synced mine trigger.");
            }

            APILogger.Debug($"Mine triggered without player.");
            Replay.Trigger(new rMineDetonate(__instance, mine.owner.GlobalID));
            return;
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPostfix]
        private static void Postfix_Detonate_Explosive(MineDeployerInstance_Detonate_Explosive __instance) {
            Replay.Despawn(Replay.Get<rMine>(__instance.gameObject.GetInstanceID()));
        }
    }
}
