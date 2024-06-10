using UnityEngine;

namespace ReplayRecorder.API {
    public interface IReplayTransform {
        public bool active { get; }
        public byte dimensionIndex { get; }
        public Vector3 position { get; }
        public Quaternion rotation { get; }
    }
}
