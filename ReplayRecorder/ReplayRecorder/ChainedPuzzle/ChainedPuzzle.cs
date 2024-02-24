using API;
using ChainedPuzzles;
using UnityEngine;

namespace ReplayRecorder.ChainedPuzzle {
    internal partial class ChainedPuzzle {
        public struct Bioscan : SnapshotManager.ITransform {
            private CP_Bioscan_Core bioscan;

            public bool active => bioscan != null;
            public byte dimensionIndex => (byte)bioscan.m_courseNode.m_dimension.DimensionIndex;
            public Vector3 position => bioscan.transform.position;
            public Quaternion rotation => Quaternion.identity;
            public float scale => 0;

            public Bioscan(CP_Bioscan_Core bioscan) {
                this.bioscan = bioscan;
            }
        }

        private class ScanProgress : DynamicProperty {
            private CP_Bioscan_Core bioscan;
            private CP_Bioscan_Graphics graphics;
            private byte progress => (byte)(bioscan.m_sync.GetCurrentState().progress * byte.MaxValue);
            private byte oldProgress = 0;
            private byte r => (byte)(graphics.m_currentCol.r * byte.MaxValue);
            private byte g => (byte)(graphics.m_currentCol.g * byte.MaxValue);
            private byte b => (byte)(graphics.m_currentCol.b * byte.MaxValue);

            private byte oldR = 0;
            private byte oldG = 0;
            private byte oldB = 0;

            public ScanProgress(int instance, CP_Bioscan_Core bioscan) : base(Type.Scan, instance) {
                this.bioscan = bioscan;
                graphics = bioscan.m_graphics.TryCast<CP_Bioscan_Graphics>()!;
            }

            protected override bool IsSerializable() {
                return bioscan != null && (progress != oldProgress || r != oldR || g != oldG || b != oldB);
            }

            private const int SizeOfHeader = 4;
            private static byte[] buffer = new byte[SizeOfHeader];
            public override void Serialize(FileStream fs) {
                base.Serialize(fs);

                int index = 0;
                BitHelper.WriteBytes(progress, buffer, ref index);
                BitHelper.WriteBytes(r, buffer, ref index);
                BitHelper.WriteBytes(g, buffer, ref index);
                BitHelper.WriteBytes(b, buffer, ref index);

                oldProgress = progress;
                oldR = r;
                oldG = g;
                oldB = b;

                fs.Write(buffer);
            }
        }

        private struct rScanCircle : ISerializable {
            private int instance;
            private float radius;
            private ScanFlags flags;

            [Flags]
            private enum ScanFlags {
                FullTeam = 0b1,
                Checkpoint = 0b10,
                Moving = 0b100,
                Extraction = 0b1000,
                Alarm = 0b10000,
                ReduceWhenNoPlayer = 0b100000,

                None = 0b0
            }

            public rScanCircle(int instance, CP_Bioscan_Core bioscan, CP_PlayerScanner pscanner) {
                this.instance = instance;
                radius = pscanner.m_scanRadius;
                flags = ScanFlags.None;
                if (pscanner.m_playerRequirement == PlayerRequirement.All) {
                    flags |= ScanFlags.FullTeam;
                }
                if (bioscan.Owner.IsCheckpointScanner) {
                    flags |= ScanFlags.Checkpoint;
                }
                if (bioscan.IsMovable) {
                    flags |= ScanFlags.Moving;
                }
                if (bioscan.IsExitPuzzle) {
                    flags |= ScanFlags.Extraction;
                }
                if (bioscan.HasAlarm) {
                    flags |= ScanFlags.Alarm;
                }
                if (pscanner.ReduceWhenNoPlayer) {
                    flags |= ScanFlags.ReduceWhenNoPlayer;
                }
            }

            public const int SizeOf = sizeof(int) + BitHelper.SizeOfHalf + 1;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(instance, buffer, ref index);
                BitHelper.WriteHalf(radius, buffer, ref index);
                BitHelper.WriteBytes((byte)flags, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static HashSet<int> scanCircles = new HashSet<int>();
        public static Dictionary<int, byte> splineDimensions = new Dictionary<int, byte>();

        public static void RegisterSplineDimension(int instance, byte dimension) {
            if (!splineDimensions.ContainsKey(instance)) {
                splineDimensions.Add(instance, dimension);
            }
        }

        public static void SpawnScanCircle(CP_Bioscan_Core bioscan) {
            int instance = bioscan.GetInstanceID();
            if (!scanCircles.Contains(instance)) {
                CP_PlayerScanner? pscanner = bioscan.m_playerScanner.TryCast<CP_PlayerScanner>();
                if (pscanner != null) {
                    APILogger.Debug($"Spawn scan circle. [{instance}]");
                    scanCircles.Add(instance);
                    SnapshotManager.AddEvent(GameplayEvent.Type.SpawnScanCircle, new rScanCircle(instance, bioscan, pscanner));
                    SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, new Bioscan(bioscan)));
                    SnapshotManager.AddDynamicProperty(new ScanProgress(instance, bioscan));
                } else {
                    APILogger.Error("Unable to find pscanner component for bioscan.");
                }
            }
        }

        public static void DespawnScanCircle(int instance) {
            if (scanCircles.Contains(instance)) {
                APILogger.Debug($"Despawn scan circle. [{instance}]");
                scanCircles.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnScanCircle, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
                SnapshotManager.RemoveDynamicProperty(instance);
            }
        }

        public static void Reset() {
            scanCircles.Clear();
            holopaths.Clear();
            splineDimensions.Clear();
        }
    }
}
