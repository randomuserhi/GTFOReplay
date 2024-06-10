using AIGraph;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.StaticItems {
    [ReplayData("Vanilla.Map.ResourceContainers.State", "0.0.1")]
    internal class rContainer : ReplayDynamic {
        private enum LockType {
            None,
            Melee,
            Hackable
        }

        private LG_ResourceContainer_Storage container;
        private LG_WeakResourceContainer core;
        private LG_ResourceContainer_Sync sync;

        public bool isLocker;

        public byte dimension;
        public Vector3 position => container.transform.position;
        public Quaternion rotation => container.transform.rotation;
        public ushort serialNumber => (ushort)core.m_serialNumber;

        public rContainer(LG_ResourceContainer_Storage container, bool isLocker, byte dimension) : base(container.GetInstanceID()) {
            this.container = container;
            this.isLocker = isLocker;
            this.dimension = dimension;
            core = container.m_core.Cast<LG_WeakResourceContainer>();
            sync = core.m_sync.Cast<LG_ResourceContainer_Sync>();
        }

        public override bool Active => core != null;
        public override bool IsDirty => _closed != closed;

        private bool closed => sync.m_stateReplicator.State.status != eResourceContainerStatus.Open;
        private bool _closed = true;

        private bool weaklock => core.m_weakLock != null && core.m_weakLock.Status == eWeakLockStatus.LockedMelee;
        private bool hacklock => core.m_weakLock != null && core.m_weakLock.Status == eWeakLockStatus.LockedHackable;

        public override void Write(ByteBuffer buffer) {
            _closed = closed;

            BitHelper.WriteBytes(_closed, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
            LockType type = LockType.None;
            if (core.m_weakLock != null) {
                switch (core.m_weakLock.Status) {
                case eWeakLockStatus.LockedMelee:
                    type = LockType.Melee;
                    break;
                case eWeakLockStatus.LockedHackable:
                    type = LockType.Hackable;
                    break;
                }
            }
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.ResourceContainers", "0.0.1")]
    internal class rContainers : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterContainer))]
            [HarmonyPostfix]
            private static void ResourceContainer_Add(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
                int id = container.GetInstanceID();
                if (!containers.ContainsKey(id)) {
                    containers.Add(id, new rContainer(container, false, (byte)__instance.m_dimension.DimensionIndex));
                }
                containers[id].dimension = (byte)__instance.m_dimension.DimensionIndex;
            }

            [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.UnregisterContainer))]
            [HarmonyPostfix]
            private static void ResourceContainer_Remove(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
                containers.Remove(container.GetInstanceID());
            }

            [HarmonyPatch(typeof(LG_ResourceContainer_Storage), nameof(LG_ResourceContainer_Storage.Setup))]
            [HarmonyPostfix]
            private static void Resource_Setup(LG_ResourceContainer_Storage __instance, iLG_ResourceContainer_Core core, bool isLocker) {
                int id = __instance.GetInstanceID();
                if (!containers.ContainsKey(id)) {
                    containers.Add(id, new rContainer(__instance, false, 0));
                }
                containers[id].isLocker = isLocker;
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rContainers());

            foreach (rContainer container in containers.Values) {
                Replay.Spawn(container);
            }

            containers.Clear();
        }

        [ReplayInit]
        private static void Init() {
            containers.Clear();
        }

        internal static Dictionary<int, rContainer> containers = new Dictionary<int, rContainer>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many containers
            BitHelper.WriteBytes((ushort)containers.Count, buffer);

            foreach (rContainer container in containers.Values) {
                BitHelper.WriteBytes(container.id, buffer);
                BitHelper.WriteBytes(container.dimension, buffer);
                BitHelper.WriteBytes(container.position, buffer);
                BitHelper.WriteHalf(container.rotation, buffer);
                BitHelper.WriteBytes(container.serialNumber, buffer);
                BitHelper.WriteBytes(container.isLocker, buffer);
            }
        }
    }
}
