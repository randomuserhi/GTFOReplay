using Agents;
using API;
using HarmonyLib;
using Player;
using ReplayRecorder;
using ReplayRecorder.SNetUtils;
using SNetwork;
using Vanilla.Enemy.Detection;

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
                    Replay.Spawn(new rMine(owner, __instance, rMine.Type.ConsumableExplosive));
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
            if (!SNet.IsMaster) return;

            rMine mine = Replay.Get<rMine>(__instance.gameObject.GetInstanceID());

            if (player != null) {
                mine.shot = true;
                mine.trigger = player;
            } else if (SNetUtils.TryGetSender(__instance.m_itemActionPacket, out SNet_Player? sender)) {
                mine.shot = true;
                mine.trigger = sender.PlayerAgent.Cast<PlayerAgent>();
            }
        }

        private static void DetonateMine(int mineId) {
            rMine mine = Replay.Get<rMine>(mineId);

            APILogger.Debug($"shot: {mine.shot}");
            APILogger.Debug($"trigger: {mine.trigger.Owner.NickName}");

            NoiseTracker.TrackNextNoise(new NoiseInfo(mine.trigger));

            MineManager.currentDetonateEvent = new rMineDetonate(mineId, mine.trigger.GlobalID, mine.shot);
            Replay.Trigger(MineManager.currentDetonateEvent);
        }

        [HarmonyPatch(typeof(MineDeployerInstance_Detonate_Explosive), nameof(MineDeployerInstance_Detonate_Explosive.DoExplode))]
        [HarmonyPrefix]
        private static void Prefix_Detonate_Explosive(MineDeployerInstance_Detonate_Explosive __instance) {
            DetonateMine(__instance.gameObject.GetInstanceID());
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
