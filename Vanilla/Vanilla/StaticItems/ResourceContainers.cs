﻿using AIGraph;
using GameData;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.StaticItems {
    [ReplayData("Vanilla.Map.ResourceContainers.State", "0.0.1")]
    internal class rContainer : ReplayDynamic {
        private LG_ResourceContainer_Storage container;
        private LG_WeakResourceContainer core;
        private LG_ResourceContainer_Sync sync;

        public bool registered = true;
        public Identifier consumableType = Identifier.unknown;
        public eWeakLockType assignedLock = eWeakLockType.None;

        public bool isLocker;

        public byte dimension;
        public Vector3 position;
        public Quaternion rotation;
        public ushort serialNumber => (ushort)core.m_serialNumber;

        public rContainer(LG_ResourceContainer_Storage container, bool isLocker, byte dimension) : base(container.GetInstanceID()) {
            this.container = container;
            this.isLocker = isLocker;
            this.dimension = dimension;
            core = container.m_core.Cast<LG_WeakResourceContainer>();
            sync = core.m_sync.Cast<LG_ResourceContainer_Sync>();

            position = container.transform.position;
            rotation = container.transform.rotation;
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
            eWeakLockType type = eWeakLockType.None;
            if (core.m_weakLock != null) {
                switch (core.m_weakLock.Status) {
                case eWeakLockStatus.LockedMelee:
                    type = eWeakLockType.Melee;
                    break;
                case eWeakLockStatus.LockedHackable:
                    type = eWeakLockType.Hackable;
                    break;
                }
            }
            BitHelper.WriteBytes((byte)type, buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.ResourceContainers", "0.0.3")]
    internal class rContainers : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            private static void SetupContainer(AIG_CourseNode node, rContainer container) {
                container.dimension = (byte)node.m_dimension.DimensionIndex;
            }

            // NOTE(randomuserhi):
            //
            // Errors when mods use MTFO and include a blank Artifact datablock, `GameData_ArtifactDatablock_bin.json` as below:
            /*
                {
                    "Headers": [],
                    "Blocks": [],
                    "LastPersistentID": 17
                }
            */
            //
            // Fix this by not calling SpawnArtifact when no artifact blocks are available.
            [HarmonyPatch(typeof(LG_ResourceContainer_Storage), nameof(LG_ResourceContainer_Storage.SpawnArtifact))]
            [HarmonyPrefix]
            [HarmonyPriority(Priority.High)]
            private static bool OnSpawnArtifact(LG_ResourceContainer_Storage __instance, ResourceContainerSpawnData pack, Transform align, int randomSeed) {
                return ArtifactDataBlock.Wrapper.Blocks.Count > 0;
            }

            [HarmonyPatch(typeof(LG_ResourceContainerBuilder), nameof(LG_ResourceContainerBuilder.SetupFunctionGO))]
            [HarmonyPostfix]
            private static void OnBuild(LG_ResourceContainerBuilder __instance, LG_LayerType layer, GameObject GO) {
                if (__instance.m_function != ExpeditionFunction.ResourceContainerWeak) return;
                LG_WeakResourceContainer? comp = GO.GetComponentInChildren<LG_WeakResourceContainer>();
                if (comp == null) return;

                LG_ResourceContainer_Storage storage = comp.m_storage.Cast<LG_ResourceContainer_Storage>();
                int id = storage.GetInstanceID();
                if (!containers.ContainsKey(id)) {
                    containers.Add(id, new rContainer(storage, false, 0));
                }
                rContainer container = containers[id];

                container.assignedLock = (!(__instance.m_lockRandom < 0.5f)) ? eWeakLockType.Melee : eWeakLockType.Hackable;

                ConsumableDistributionDataBlock? consumableData = GameDataBlockBase<ConsumableDistributionDataBlock>.GetBlock(__instance.m_node.m_zone.m_settings.m_zoneData.ConsumableDistributionInZone);
                if (consumableData == null) return;
                UnityEngine.Random.InitState(__instance.m_randomSeed);

                float[] array = new float[consumableData.SpawnData.Count];
                for (int i = 0; i < consumableData.SpawnData.Count; i++) {
                    array[i] = consumableData.SpawnData[i].Weight;
                }
                BuilderWeightedRandom builderWeightedRandom = new BuilderWeightedRandom();
                builderWeightedRandom.Setup(array);
                container.consumableType = Identifier.Item(consumableData.SpawnData[builderWeightedRandom.GetRandomIndex(UnityEngine.Random.value)].ItemID);
            }

            [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterContainer))]
            [HarmonyPostfix]
            private static void ResourceContainer_Add(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
                int id = container.GetInstanceID();
                if (!containers.ContainsKey(id)) {
                    containers.Add(id, new rContainer(container, false, (byte)__instance.m_dimension.DimensionIndex));
                }
                SetupContainer(__instance, containers[id]);
            }

            [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.UnregisterContainer))]
            [HarmonyPostfix]
            private static void ResourceContainer_Remove(AIG_CourseNode __instance, LG_ResourceContainer_Storage container) {
                int id = container.GetInstanceID();
                if (!containers.ContainsKey(id)) {
                    containers.Add(id, new rContainer(container, false, (byte)__instance.m_dimension.DimensionIndex));
                }
                SetupContainer(__instance, containers[id]);
                containers[id].registered = false;
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
                BitHelper.WriteBytes(container.consumableType, buffer);
                BitHelper.WriteBytes(container.registered, buffer);
                BitHelper.WriteBytes((byte)container.assignedLock, buffer);
            }
        }
    }
}
