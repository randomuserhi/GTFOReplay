using AIGraph;
using API;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using SNetwork;
using UnityEngine;
using Vanilla.Specification;

namespace Vanilla.Map.Items {
    [HarmonyPatch]
    [ReplayData("Vanilla.Map.Items", "0.0.1")]
    internal class rItem : ReplayDynamic {
        [HarmonyPatch]
        private class Patches {
            [HarmonyPatch(typeof(LG_PickupItem_Sync), nameof(LG_PickupItem_Sync.Setup))]
            [HarmonyPostfix]
            private static void Postfix_Setup(LG_PickupItem_Sync __instance) {
                Replay.Spawn(new rItem(__instance));
            }
        }

        private LG_PickupItem_Sync item;

        public override bool Active => item != null;
        public override bool IsDirty =>
            dimensionIndex != _dimensionIndex ||
            position != _position ||
            rotation != _rotation ||
            onGround != _onGround;

        private byte dimensionIndex {
            get {
                if (item.m_stateReplicator.State.placement.node.TryGet(out AIG_CourseNode node)) {
                    return (byte)node.m_dimension.DimensionIndex;
                } else {
                    return 0;
                }
            }
        }
        private byte _dimensionIndex = 0;
        private Vector3 position => item.m_stateReplicator.State.placement.position;
        private Vector3 _position;
        private Quaternion rotation => item.m_stateReplicator.State.placement.rotation;
        private Quaternion _rotation;
        private bool onGround => item.m_stateReplicator.State.status == ePickupItemStatus.PlacedInLevel;
        private bool _onGround;
        private byte player {
            get {
                if (item.m_stateReplicator.State.pPlayer.TryGetPlayer(out SNet_Player player)) {
                    return (byte)player.PlayerSlotIndex();
                }
                return byte.MaxValue;
            }
        }
        private byte _player = byte.MaxValue;

        public rItem(LG_PickupItem_Sync item) : base(item.m_stateReplicator.Replicator.Key) {
            this.item = item;
        }

        public override void Write(ByteBuffer buffer) {
            _dimensionIndex = dimensionIndex;
            _position = position;
            _rotation = rotation;
            _onGround = onGround;
            _player = player;

            BitHelper.WriteBytes(_dimensionIndex, buffer);
            BitHelper.WriteBytes(_position, buffer);
            BitHelper.WriteHalf(_rotation, buffer);
            BitHelper.WriteBytes(_onGround, buffer);
            BitHelper.WriteBytes(_player, buffer);

            // NOTE(randomuserhi): If item is not on ground and player slot is undefined (byte.MaxValue) then it means 
            //                     item was on a player / bot that has been disconnected from the game.
        }

        public override void Spawn(ByteBuffer buffer) {
            APILogger.Debug($"Spawned item - {GTFOSpecification.GetItem(item.item.ItemDataBlock.persistentID)}");

            Write(buffer);
            BitHelper.WriteBytes(GTFOSpecification.GetItem(item.item.ItemDataBlock.persistentID), buffer);
        }
    }
}
