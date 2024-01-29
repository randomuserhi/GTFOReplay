using API;
using Enemies;
using UnityEngine;

namespace ReplayRecorder.Enemies {
    internal static class EnemyTendrils {
        internal class rTendril : ISerializable {
            private int owner;
            private int tendril;

            public rTendril(EnemyAgent owner, ScoutAntenna tendril) {
                this.owner = owner.GetInstanceID();
                this.tendril = tendril.GetInstanceID();
            }

            public const int SizeOf = sizeof(int) * 2;
            private byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs) {
                int index = 0;
                BitHelper.WriteBytes(owner, buffer, ref index);
                BitHelper.WriteBytes(tendril, buffer, ref index);
                fs.Write(buffer);
            }
        }

        // NOTE(randomuserhi): Should really be a dynamic property instead of lazily using ITransform
        //                     sizeof(ITransform) is much larger thanks to 7 extra bytes from rotation which isn't needed
        //                     dynamic property would fix this.
        private struct Tendril : SnapshotManager.ITransform {
            private ScoutAntenna tendril;

            public bool active => tendril != null;
            public byte dimensionIndex => (byte)tendril.m_detection.m_owner.DimensionIndex;
            public Vector3 position => tendril.m_currentPos;
            public Quaternion rotation => Quaternion.identity;
            public float scale => tendril.m_state == ScoutAntenna.eTendrilState.MovingInDetect ? 1f : 0f; // NOTE(randomuserhi): abuse extra scale property to declare detection

            public Tendril(ScoutAntenna tendril) {
                this.tendril = tendril;
            }
        }

        private static HashSet<int> tendrils = new HashSet<int>();

        public static void SpawnTendril(int instance, ScoutAntenna tendril, EnemyAgent owner) {
            if (!tendrils.Contains(instance)) {
                tendrils.Add(instance);
                APILogger.Debug($"Tendril spawned [{instance}].");
                SnapshotManager.AddEvent(GameplayEvent.Type.SpawnTendril, new rTendril(owner, tendril));
                SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, new Tendril(tendril)));
            }
        }

        public static void DespawnTendril(int instance) {
            if (tendrils.Contains(instance)) {
                tendrils.Remove(instance);
                APILogger.Debug($"Tendril despawned [{instance}].");
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnTendril, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
            }
        }
    }
}
