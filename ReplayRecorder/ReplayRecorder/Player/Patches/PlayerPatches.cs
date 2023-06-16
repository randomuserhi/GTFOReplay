using Agents;
using API;
using HarmonyLib;
using Player;
using static Agents.AgentReplicatedActions;

namespace ReplayRecorder.Player.Patches
{
    [HarmonyPatch]
    class PlayerPatches
    {
        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(PlayerSync __instance)
        {
            if (!SnapshotManager.active) return;
            Player.SpawnPlayer(__instance.m_agent);
        }

        [HarmonyPatch(typeof(PlayerSync), nameof(PlayerSync.OnDespawn))]
        [HarmonyPostfix]
        private static void OnDespawn(PlayerSync __instance)
        {
            if (!SnapshotManager.active) return;
            Player.DespawnPlayer(__instance.m_agent);
        }

        [HarmonyPatch(typeof(Dam_PlayerDamageBase), nameof(Dam_PlayerDamageBase.ReceiveSetDead))]
        [HarmonyPostfix]
        private static void OnPlayerDead(Dam_PlayerDamageBase __instance, pSetDeadData data)
        {
            if (!SnapshotManager.active) return;
            Player.OnPlayerDead(__instance.Owner);
        }

        [HarmonyPatch(typeof(AgentReplicatedActions), nameof(AgentReplicatedActions.DoPlayerRevive))]
        [HarmonyPostfix]
        private static void DoPlayerRevive(pPlayerReviveAction data)
        {
            if (data.TargetPlayer.TryGet(out PlayerAgent t) && !t.Alive)
            {
                if (data.SourcePlayer.TryGet(out PlayerAgent s))
                {
                    Player.OnPlayerRevive(t, s);
                    APILogger.Debug($"{t.Owner.NickName} was revived by {s.Owner.NickName}");
                }
                else APILogger.Debug($"Unable to get source player, this should not happen.");
            }
        }
    }
}
