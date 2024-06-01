using LevelGeneration;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Map.ResourceContainers {
    [ReplayData("Vanilla.Map.ResourceContainers.State", "0.0.1")]
    internal class rContainer : ReplayDynamic {
        public LG_ResourceContainer_Storage container;

        public bool isLocker;

        public byte dimension;
        public Vector3 position => container.transform.position;
        public Quaternion rotation => container.transform.rotation;

        public rContainer(LG_ResourceContainer_Storage container, bool isLocker, byte dimension) : base(container.GetInstanceID()) {
            this.container = container;
            this.isLocker = isLocker;
            this.dimension = dimension;
        }

        public override bool Active => throw new NotImplementedException();
        public override bool IsDirty => throw new NotImplementedException();
    }

    [ReplayData("Vanilla.Map.ResourceContainers", "0.0.1")]
    internal class rContainers : ReplayHeader {

        [ReplayOnElevatorStop]
        private static void Trigger() {
            Replay.Trigger(new rContainers());

            foreach (rContainer container in containers.Values) {
                Replay.Spawn(container);
            }
        }

        [ReplayInit]
        private static void Init() {
            containers.Clear();
        }

        internal static Dictionary<int, rContainer> containers = new Dictionary<int, rContainer>();

        public override void Write(ByteBuffer buffer) {
            // TODO(randomuserhi): Throw error on too many containers
            BitHelper.WriteBytes((ushort)containers.Count, buffer);

            foreach (rContainer container in containers.Values) {
                BitHelper.WriteBytes(container.id, buffer);
                BitHelper.WriteBytes(container.dimension, buffer);
                BitHelper.WriteBytes(container.position, buffer);
                BitHelper.WriteHalf(container.rotation, buffer);
                BitHelper.WriteBytes(container.isLocker, buffer);
            }
            containers.Clear();
        }
    }
}
