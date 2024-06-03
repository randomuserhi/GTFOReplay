using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Map.Generators {
    [ReplayData("Vanilla.Map.Generators.State", "0.0.1")]
    internal class rGenerator : ReplayDynamic {
        public LG_PowerGenerator_Core core;

        public Vector3 position => core.transform.position;
        public Quaternion rotation => core.transform.rotation;
        public byte dimensionIndex => (byte)core.SpawnNode.m_dimension.DimensionIndex;

        public override bool Active => core != null;
        public override bool IsDirty => _powered != powered;

        private bool powered => core.m_stateReplicator.State.status == ePowerGeneratorStatus.Powered;
        private bool _powered = false;

        public rGenerator(LG_PowerGenerator_Core generator) : base(generator.GetInstanceID()) {
            core = generator;
        }

        public override void Write(ByteBuffer buffer) {
            _powered = powered;

            BitHelper.WriteBytes(_powered, buffer);
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.Generators", "0.0.1")]
    internal class rGenerators : ReplayHeader {
        [HarmonyPatch]
        private class Patches {
            [HarmonyPatch(typeof(LG_PowerGenerator_Core), nameof(LG_PowerGenerator_Core.Setup))]
            [HarmonyPostfix]
            private static void Setup(LG_PowerGenerator_Core __instance) {
                rGenerator gen = new rGenerator(__instance);
                generators.Add(gen.id, gen);
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rGenerators());

            foreach (rGenerator generator in generators.Values) {
                if (!generator.core.m_powerCellInteraction.Cast<LG_GenericCarryItemInteractionTarget>().isActiveAndEnabled)
                    continue;
                Replay.Spawn(generator);
            }

            generators.Clear();
        }

        [ReplayInit]
        private static void Init() {
            generators.Clear();
        }

        internal static Dictionary<int, rGenerator> generators = new Dictionary<int, rGenerator>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many containers
            BitHelper.WriteBytes((ushort)generators.Count, buffer);

            foreach (rGenerator generator in generators.Values) {
                BitHelper.WriteBytes(generator.id, buffer);
                BitHelper.WriteBytes(generator.dimensionIndex, buffer);
                BitHelper.WriteBytes(generator.position, buffer);
                BitHelper.WriteHalf(generator.rotation, buffer);
            }
        }
    }
}
