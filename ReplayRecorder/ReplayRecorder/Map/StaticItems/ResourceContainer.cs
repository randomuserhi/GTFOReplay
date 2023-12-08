using LevelGeneration;
using UnityEngine;

namespace ReplayRecorder.Map {
    internal static partial class Map {
        public class rContainer : ISerializable {
            public static byte _id = 0;

            public byte id = 0;

            private LG_ResourceContainer_Storage container;

            public Vector3 position;
            public Quaternion rotation;

            public rContainer(LG_ResourceContainer_Storage container) {
                id = _id++;
                this.container = container;
                position = container.transform.position;
                rotation = container.transform.rotation;
            }

            public const int SizeOf = 1 + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(id, buffer, ref index);

                BitHelper.WriteBytes(position, buffer, ref index);
                BitHelper.WriteHalf(rotation, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static Dictionary<eDimensionIndex, List<rContainer>> containers = new Dictionary<eDimensionIndex, List<rContainer>>();
    }
}