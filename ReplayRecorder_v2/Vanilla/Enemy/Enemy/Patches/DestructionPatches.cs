﻿using Enemies;
using HarmonyLib;
using ReplayRecorder;

namespace Vanilla.Enemy.Patches {
    [HarmonyPatch]
    internal class DestructionPatches {
        [HarmonyPatch(typeof(EnemySync), nameof(EnemySync.OnSpawn))]
        [HarmonyPostfix]
        private static void OnSpawn(EnemySync __instance) {
            __instance.m_agent.m_headLimb.add_OnLimbDestroyed((Action)(() => {
                Replay.Trigger(new rLimbDestruction(__instance.m_agent, rLimbDestruction.Type.head));
            }));
        }
    }
}