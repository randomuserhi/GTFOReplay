using UnityEngine;

namespace ReplayRecorder.Map {
    internal static partial class Map {
        public class rLadder : ISerializable {
            public static byte _id = 0;

            private LG_Ladder ladder;

            public byte id = 0;
            public Vector3 top {
                get => ladder.m_ladderTop;
            }
            public float height {
                get => ladder.m_height;
            }
            public Quaternion rotation {
                get => ladder.gameObject.transform.rotation;
            }

            public rLadder(LG_Ladder ladder) {
                id = _id++;
                this.ladder = ladder;
            }

            public const int SizeOf = 1 + BitHelper.SizeOfHalf + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
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
                BitHelper.WriteBytes(top, buffer, ref index);
                BitHelper.WriteHalf(height, buffer, ref index);
                BitHelper.WriteHalf(rotation, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static Dictionary<eDimensionIndex, List<rLadder>> ladders = new Dictionary<eDimensionIndex, List<rLadder>>();
    }
}