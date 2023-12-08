using LevelGeneration;
using UnityEngine;

namespace ReplayRecorder.Map {
    internal static partial class Map {
        public class rContainer : ISerializable {
            public static byte _id = 0;

            public byte id = 0;

            private LG_ResourceContainer_Storage container;

            public int instance;
            public Vector3 position {
                get => container.transform.position;
            }
            public Quaternion rotation {
                get => container.transform.rotation;
            }

            public rContainer(LG_ResourceContainer_Storage container) {
                id = _id++;
                instance = container.GetInstanceID();
                this.container = container;
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

        // Dimension -> (container instance id -> rContainer)
        public static Dictionary<eDimensionIndex, Dictionary<int, rContainer>> containers = new Dictionary<eDimensionIndex, Dictionary<int, rContainer>>();
    }
}