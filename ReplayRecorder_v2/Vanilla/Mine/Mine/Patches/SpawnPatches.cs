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
            // NOTE(randomuserhi): Fairly sure throws an exception with mine when owner leaves lobby :(
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

        // TODO(randomuserhi): Test if this is accurate on client
        [HarmonyPatch(typeof(MineDeployerInstance), nameof(MineDeployerInstance.SyncedTrigger))]
        [HarmonyPrefix]
        private static void Prefix_SyncedTrigger(MineDeployerInstance __instance) {
            rMine mine = Replay.Get<rMine>(__instance.gameObject.GetInstanceID());

            if (player != null) {
                APILogger.Debug($"Player triggered mine: {player.PlayerName}");
                MineManager.currentDetonateEvent = new rMineDetonate(__instance, mine.owner.GlobalID);
                Replay.Trigger(MineManager.currentDetonateEvent);
                return;
            }

            // Attempt to get player from packet
            if (SNet.Replication.TryGetLastSender(out SNet_Player sender)) {
                APILogger.Debug($"Player triggered mine: {sender.NickName}");
                MineManager.currentDetonateEvent = new rMineDetonate(__instance, sender.PlayerAgent.Cast<PlayerAgent>().GlobalID, true);
                Replay.Trigger(MineManager.currentDetonateEvent);
                return;
            } else {
                APILogger.Warn($"Failed to get the last packet sender for synced mine trigger.");
            }

            APILogger.Debug($"Mine triggered without player.");
            MineManager.currentDetonateEvent = new rMineDetonate(__instance, mine.owner.GlobalID);
            Replay.Trigger(MineManager.currentDetonateEvent);
            return;
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPostfix]
        private static void Postfix_Detonate_Explosive(MineDeployerInstance_Detonate_Explosive __instance) {
            MineManager.currentDetonateEvent = null;
            Replay.Despawn(Replay.Get<rMine>(__instance.gameObject.GetInstanceID()));
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Glue), nameof(MineDeployerInstance_Detonate_Glue.DoExplode))]
        [HarmonyPostfix]
        private static void Postfix_Detonate_Glue(MineDeployerInstance_Detonate_Explosive __instance) {
            MineManager.currentDetonateEvent = null;
            Replay.Despawn(Replay.Get<rMine>(__instance.gameObject.GetInstanceID()));
        }
    }
}
