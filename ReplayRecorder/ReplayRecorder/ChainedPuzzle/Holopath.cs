using API;
using ChainedPuzzles;
using UnityEngine;

namespace ReplayRecorder.ChainedPuzzle {
    internal partial class ChainedPuzzle {
        public struct HolopathEvent : ISerializable {
            public int instance;
            public byte dimensionIndex;
            public Vector3[] spline;

            public HolopathEvent(CP_Holopath_Spline holopath) {
                instance = holopath.GetInstanceID();
                spline = new Vector3[holopath.CurvySpline.controlPoints.Count];
                for (int i = 0; i < holopath.CurvySpline.controlPoints.Count; ++i) {
                    spline[i] = holopath.CurvySpline.controlPoints[i].transform.position;
                }

                CP_Bioscan_Core core = holopath.GetComponent<CP_Bioscan_Core>();
                if (core != null) {
                    dimensionIndex = (byte)core.m_courseNode.m_dimension.DimensionIndex;
                } else {
                    dimensionIndex = 0;
                    APILogger.Error("Unable to get bioscan core for holopath.");
                }
            }

            private const int SizeOfHeader = sizeof(int) + 2;
            private static byte[] buffer = new byte[SizeOfHeader];
            public void Serialize(FileStream fs) {
                int SizeOf = SizeOfHeader + BitHelper.SizeOfVector3 + (spline.Length - 1) * BitHelper.SizeOfHalfVector3;
                if (buffer.Length < SizeOf)
                    buffer = new byte[SizeOf];

                int index = 0;
                BitHelper.WriteBytes(instance, buffer, ref index);
                BitHelper.WriteBytes(dimensionIndex, buffer, ref index);
                BitHelper.WriteBytes((byte)spline.Length, buffer, ref index);
                BitHelper.WriteBytes(spline[0], buffer, ref index);
                for (int i = 1; i < spline.Length; ++i) {
                    Vector3 diff = spline[i] - spline[i - 1];
                    BitHelper.WriteHalf(diff, buffer, ref index);
                }

                fs.Write(buffer, 0, SizeOf);
            }
        }

        private class Holopath : DynamicProperty {
            CP_Holopath_Spline holopath;
            private byte progress => (byte)(holopath.CurvyExtrusion.To * byte.MaxValue);
            private float oldProgress;

            public Holopath(int instance, CP_Holopath_Spline holopath) : base(Type.Holopath, instance) {
                this.holopath = holopath;
                oldProgress = 0;
            }

            protected override bool IsSerializable() {
                return holopath != null && progress != oldProgress;
            }

            private const int SizeOfHeader = 1;
            private static byte[] buffer = new byte[SizeOfHeader];
            public override void Serialize(FileStream fs) {
                base.Serialize(fs);

                int index = 0;
                BitHelper.WriteBytes(progress, buffer, ref index);

                oldProgress = progress;

                fs.Write(buffer);
            }
        }

        private static HashSet<int> holopaths = new HashSet<int>();

        public static void SpawnHolopath(CP_Holopath_Spline holopath) {
            int instance = holopath.GetInstanceID();
            if (!holopaths.Contains(instance)) {
                APILogger.Debug($"Spawned holopath. [{instance}]");
                holopaths.Add(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.SpawnHolopath, new HolopathEvent(holopath));
                SnapshotManager.AddDynamicProperty(new Holopath(instance, holopath));
            }
        }

        public static void DespawnHolopath(int instance) {
            if (holopaths.Contains(instance)) {
                APILogger.Debug($"Removed holopath. [{instance}]");
                holopaths.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnHolopath, new rInstance(instance));
                SnapshotManager.RemoveDynamicProperty(instance);
            }
        }
    }
}
