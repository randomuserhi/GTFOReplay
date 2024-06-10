using AIGraph;
using HarmonyLib;
using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.StaticItems {
    internal class rTerminal {
        public readonly byte dimension;
        public readonly int id;

        private LG_ComputerTerminal terminal;

        public Vector3 position {
            get => terminal.m_position;
        }
        public Quaternion rotation {
            get => terminal.transform.rotation;
        }

        public rTerminal(byte dimension, LG_ComputerTerminal terminal) {
            id = terminal.GetInstanceID();
            this.dimension = dimension;
            this.terminal = terminal;
        }
    }

    [HarmonyPatch]
    [ReplayData("Vanilla.Map.Terminals", "0.0.1")]
    internal class rTerminals : ReplayHeader {
        [HarmonyPatch]
        private static class Patches {
            [HarmonyPatch(typeof(AIG_CourseNode), nameof(AIG_CourseNode.RegisterComputerTerminal))]
            [HarmonyPostfix]
            private static void Terminal_Setup(AIG_CourseNode __instance, LG_ComputerTerminal terminal) {
                terminals.Add(new rTerminal((byte)__instance.m_dimension.DimensionIndex, terminal));
            }
        }

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rTerminals());
        }

        [ReplayInit]
        private static void Init() {
            terminals.Clear();
        }

        internal static List<rTerminal> terminals = new List<rTerminal>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many ladders
            BitHelper.WriteBytes((ushort)terminals.Count, buffer);

            foreach (rTerminal terminal in terminals) {
                BitHelper.WriteBytes(terminal.id, buffer);
                BitHelper.WriteBytes(terminal.dimension, buffer);
                BitHelper.WriteBytes(terminal.position, buffer);
                BitHelper.WriteHalf(terminal.rotation, buffer);
            }
            terminals.Clear();
        }
    }
}
