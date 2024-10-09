using HarmonyLib;

namespace Vanilla.Chat {
    [HarmonyPatch]
    internal class Chat {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(PUI_GameEventLog), nameof(PUI_GameEventLog.AddLogItem))]
            [HarmonyPrefix]
            private static void ReceivedMessage() {
            }
        }
    }
}
