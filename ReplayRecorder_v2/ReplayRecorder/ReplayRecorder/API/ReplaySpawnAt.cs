using API;
using UnityEngine;

namespace ReplayRecorder.API {
    public abstract class ReplaySpawnAt : ReplaySpawn {
        public byte DimensionIndex { get; private set; }
        public Vector3 Position { get; private set; }
        public Quaternion Rotation { get; private set; }

        public ReplaySpawnAt(int id, eDimensionIndex dimensionIndex, Vector3 position, Quaternion rotation) : base(id) {
            DimensionIndex = (byte)dimensionIndex;
            Position = position;
            Rotation = rotation;
        }

        internal override void _Write(ByteBuffer buffer) {
            base._Write(buffer);

            BitHelper.WriteBytes(Position, buffer);
            if (float.IsNaN(Rotation.x) || float.IsNaN(Rotation.y) ||
                float.IsNaN(Rotation.z) || float.IsNaN(Rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(Rotation, buffer);
            BitHelper.WriteBytes(DimensionIndex, buffer);
        }
    }
}
