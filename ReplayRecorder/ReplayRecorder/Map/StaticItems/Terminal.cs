using LevelGeneration;
using UnityEngine;

namespace ReplayRecorder.Map {
    internal static partial class Map {
        public class rTerminal : ISerializable {
            public static byte _id = 0;

            public byte id = 0;

            private LG_ComputerTerminal terminal;

            public Vector3 position {
                get => terminal.m_position;
            }
            public Quaternion rotation {
                get => terminal.transform.rotation;
            }

            public rTerminal(LG_ComputerTerminal terminal) {
                id = _id++;
                this.terminal = terminal;
            }

            public const int SizeOf = 1 + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                /// Format:
                /// byte => type
                /// byte => size
                /// byte => healthMax
                /// position
                /// rotation

                int index = 0;
                BitHelper.WriteBytes(id, buffer, ref index);
                BitHelper.WriteBytes(position, buffer, ref index);
                BitHelper.WriteHalf(rotation, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static Dictionary<eDimensionIndex, List<rTerminal>> terminals = new Dictionary<eDimensionIndex, List<rTerminal>>();
    }
}
