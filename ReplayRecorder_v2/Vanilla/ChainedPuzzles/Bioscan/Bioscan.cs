using ChainedPuzzles;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using ReplayRecorder.Core;
using UnityEngine;

namespace Vanilla.Bioscan {
    internal struct BioscanTransform : IReplayTransform {
        private CP_Bioscan_Core bioscan;

        public bool active => bioscan != null;
        public byte dimensionIndex => (byte)bioscan.m_courseNode.m_dimension.DimensionIndex;
        public Vector3 position => bioscan.transform.position;
        public Quaternion rotation => Quaternion.identity;

        public BioscanTransform(CP_Bioscan_Core bioscan) {
            this.bioscan = bioscan;
        }
    }

    [ReplayData("Vanilla.Bioscan", "0.0.1")]
    internal class rBioscan : DynamicPosition {
        private CP_Bioscan_Core bioscan;

        private float radius;

        public rBioscan(CP_Bioscan_Core bioscan, float radius) : base(bioscan.GetInstanceID(), new BioscanTransform(bioscan)) {
            this.bioscan = bioscan;
            this.radius = radius;
        }

        public override void Spawn(ByteBuffer buffer) {
            base.Spawn(buffer);
            BitHelper.WriteHalf(radius, buffer);
        }
    }

    [ReplayData("Vanilla.Bioscan.Status", "0.0.1")]
    internal class rBioscanStatus : ReplayDynamic {
        private CP_Bioscan_Core bioscan;
        private CP_Bioscan_Graphics graphics;

        public override bool Active => bioscan != null;
        public override bool IsDirty {
            get {
                return progress != oldProgress ||
                    r != oldR || g != oldG || b != oldB;
            }
        }

        private byte progress => (byte)(bioscan.m_sync.GetCurrentState().progress * byte.MaxValue);
        private byte oldProgress = 0;
        private byte r => (byte)(graphics.m_currentCol.r * byte.MaxValue);
        private byte g => (byte)(graphics.m_currentCol.g * byte.MaxValue);
        private byte b => (byte)(graphics.m_currentCol.b * byte.MaxValue);

        private byte oldR = 0;
        private byte oldG = 0;
        private byte oldB = 0;

        public rBioscanStatus(CP_Bioscan_Core bioscan) : base(bioscan.GetInstanceID()) {
            this.bioscan = bioscan;
            graphics = bioscan.m_graphics.TryCast<CP_Bioscan_Graphics>()!;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(progress, buffer);
            BitHelper.WriteBytes(r, buffer);
            BitHelper.WriteBytes(g, buffer);
            BitHelper.WriteBytes(b, buffer);

            oldProgress = progress;
            oldR = r;
            oldG = g;
            oldB = b;
        }

        public override void Spawn(ByteBuffer buffer) {
            Write(buffer);
        }
    }
}
