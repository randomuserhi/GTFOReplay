using UnityEngine;

namespace ReplayRecorder.API {
    public interface IReplayTransform {
        public byte dimensionIndex { get; }
        public Vector3 position { get; }
        public Quaternion rotation { get; }
    }
}
