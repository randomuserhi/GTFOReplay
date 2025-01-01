using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.DynamicItems {
    internal struct ItemTransform : IReplayTransform {
        private Item item;

        public bool active => item != null;
        private byte dimension;
        public byte dimensionIndex => dimension;
        public Vector3 position => item.transform.position;
        public Quaternion rotation => item.transform.rotation;

        public ItemTransform(Item item, byte dimension) {
            this.item = item;
            this.dimension = dimension;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.DynamicItem", "0.0.1")]
    public class rDynamicItem : DynamicTransform {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(ItemReplicationManager), nameof(ItemReplicationManager.OnItemSpawn))]
            [HarmonyPostfix]
            private static void OnItemSpawn(ItemReplicationManager __instance, pItemSpawnData spawnData, ItemReplicator replicator) {
                if (!Replay.Active) return;

                Item item = replicator.Item;

                byte dimension = (byte)Dimension.GetDimensionFromPos(spawnData.position).DimensionIndex;
                Replay.Spawn(new rDynamicItem(item, Identifier.From(item), dimension));
            }
        }

        private Item item;
        private Identifier type;

        public override bool IsDirty => base.IsDirty;

        public rDynamicItem(Item item, Identifier type, byte dimension) : base(item.GetInstanceID(), new ItemTransform(item, dimension)) {
            this.item = item;
            this.type = type;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteBytes(type, buffer);
        }
    }
}
