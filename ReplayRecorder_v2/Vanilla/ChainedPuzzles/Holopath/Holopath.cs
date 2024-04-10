using ChainedPuzzles;
using ReplayRecorder;
using ReplayRecorder.API;
using ReplayRecorder.API.Attributes;
using UnityEngine;

namespace Vanilla.Holopath {
    public class HolopathTooLong : Exception {
        public HolopathTooLong(string message) : base(message) { }
    }

    [ReplayData("Vanilla.Holopath", "0.0.1")]
    internal class rHolopath : ReplayDynamic {
        private CP_Holopath_Spline holopath;
        public override bool Active => holopath != null;
        public override bool IsDirty => progress != oldProgress;

        private byte progress => (byte)(holopath.CurvyExtrusion.To * byte.MaxValue);
        private float oldProgress;

        private byte dimension;

        public rHolopath(CP_Holopath_Spline holopath, byte dimension) : base(holopath.GetInstanceID()) {
            this.holopath = holopath;
            this.dimension = dimension;
        }

        public override void Write(ByteBuffer buffer) {
            BitHelper.WriteBytes(progress, buffer);

            oldProgress = progress;
        }

        public override void Spawn(ByteBuffer buffer) {
            int size = holopath.CurvySpline.controlPoints.Count;
            if (size > byte.MaxValue) {
                throw new HolopathTooLong($"Holopath has too many segments: {size}.");
            }

            BitHelper.WriteBytes(dimension, buffer);
            BitHelper.WriteBytes((byte)size, buffer);
            BitHelper.WriteBytes(holopath.CurvySpline.controlPoints[0].transform.position, buffer);
            for (int i = 1; i < size; ++i) {
                Vector3 diff = holopath.CurvySpline.controlPoints[i].transform.position - holopath.CurvySpline.controlPoints[i - 1].transform.position;
                BitHelper.WriteHalf(diff, buffer);
            }
        }
    }
}
