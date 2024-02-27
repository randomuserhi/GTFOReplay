using API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace ReplayRecorder.API {
    [ReplayData("ReplayRecorder.SpawnAt", "0.0.1")]
    public class ReplaySpawnAt : ReplaySpawn {
        protected byte dimensionIndex;
        protected Vector3 position;
        protected Quaternion rotation;

        public override string? Debug => $"{Id} - [{dimensionIndex}] ({position.x}, {position.y}, {position.z}) ({rotation.x}, {rotation.y}, {rotation.z}, {rotation.w})";

        public ReplaySpawnAt(int id, eDimensionIndex dimensionIndex, Vector3 position, Quaternion rotation) : base(id) {
            this.dimensionIndex = (byte)dimensionIndex;
            this.position = position;
            this.rotation = rotation;
        }

        internal override void _Write(ByteBuffer buffer) {
            base._Write(buffer);

            BitHelper.WriteBytes(position, buffer);
            if (float.IsNaN(rotation.x) || float.IsNaN(rotation.y) ||
                float.IsNaN(rotation.z) || float.IsNaN(rotation.w)) {
                BitHelper.WriteHalf(Quaternion.identity, buffer);
                APILogger.Warn("Dynamic rotation had NaN component.");
            } else BitHelper.WriteHalf(rotation, buffer);
            BitHelper.WriteBytes(dimensionIndex, buffer);
        }
    }
}
