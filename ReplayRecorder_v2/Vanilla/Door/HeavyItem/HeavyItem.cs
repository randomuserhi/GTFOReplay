using HarmonyLib;
using LevelGeneration;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;

namespace Vanilla.Map.HeavyItem {

    // TODO(randomuserhi): Test cells placed into generators...

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.HeavyItem", "0.0.1")]
    internal class rHeavyItem : ReplayDynamic {
        [HarmonyPatch]
        private class Patches {

        }

        private LG_PickupItem_Sync item;

        public override bool Active => item != null;
        public override bool IsDirty => true;

        public rHeavyItem(LG_PickupItem_Sync item) : base(item.m_stateReplicator.Replicator.Key) {
            this.item = item;
        }
    }
}
