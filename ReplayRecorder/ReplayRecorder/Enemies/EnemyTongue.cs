using API;
using UnityEngine;

namespace ReplayRecorder.Enemies
{
    public static partial class Enemy
    {
        // NOTE(randomuserhi): Used to ensure that the connecting tongue spline exists at the peak of each strike
        //                     (aka prevents low tick rate from missing tongue at peak length)
        public struct TongueEvent : ISerializable
        {
            public int instance;
            public Vector3[] spline;

            public TongueEvent(MovingEnemyTentacleBase tongue)
            {
                instance = tongue.GetInstanceID();
                spline = new Vector3[tongue.m_GPUSplineSegments.Length];
                for (int i = 0; i < spline.Length; ++i)
                {
                    spline[i] = tongue.m_GPUSplineSegments[i].pos;
                }
            }

            private const int SizeOfHeader = sizeof(int) + 1;
            private static byte[] buffer = new byte[SizeOfHeader];
            public void Serialize(FileStream fs)
            {
                int SizeOf = SizeOfHeader + BitHelper.SizeOfVector3 + (spline.Length - 1) * BitHelper.SizeOfHalfVector3;
                if (buffer.Length < SizeOf)
                    buffer = new byte[SizeOf];

                int index = 0;
                BitHelper.WriteBytes(instance, buffer, ref index);
                BitHelper.WriteBytes((byte)spline.Length, buffer, ref index);
                BitHelper.WriteBytes(spline[0], buffer, ref index);
                for (int i = 1; i < spline.Length; ++i)
                {
                    Vector3 diff = spline[i] - spline[i - 1];
                    BitHelper.WriteHalf(diff, buffer, ref index);
                }

                fs.Write(buffer, 0, SizeOf);
            }
        }

        private class Tongue : DynamicProperty
        {
            MovingEnemyTentacleBase tongue;

            public Tongue(int instance, MovingEnemyTentacleBase tongue) : base(Type.Tongue, instance)
            {
                this.tongue = tongue;
            }

            protected override bool IsSerializable()
            {
                return tongue != null && tongue.m_GPUSplineSegments.Length > 0;
            }

            private const int SizeOfHeader = sizeof(int) + BitHelper.SizeOfHalf + 1;
            private static byte[] buffer = new byte[SizeOfHeader];
            public override void Serialize(FileStream fs)
            {
                base.Serialize(fs);

                int SizeOf = SizeOfHeader + BitHelper.SizeOfVector3 + (tongue.m_GPUSplineSegments.Length - 1) * BitHelper.SizeOfHalfVector3;
                if (buffer.Length < SizeOf)
                    buffer = new byte[SizeOf];

                int index = 0;
                BitHelper.WriteBytes(instance, buffer, ref index);
                BitHelper.WriteHalf(tongue.TentacleRelLen, buffer, ref index);
                BitHelper.WriteBytes((byte)tongue.m_GPUSplineSegments.Length, buffer, ref index);
                BitHelper.WriteBytes(tongue.m_GPUSplineSegments[0].pos, buffer, ref index);
                for (int i = 1; i < tongue.m_GPUSplineSegments.Length; ++i)
                {
                    Vector3 diff = tongue.m_GPUSplineSegments[i].pos - tongue.m_GPUSplineSegments[i - 1].pos;
                    BitHelper.WriteHalf(diff, buffer, ref index);
                }

                fs.Write(buffer, 0, SizeOf);
            }
        }

        // Enemy agent => tongues
        public static Dictionary<int, HashSet<MovingEnemyTentacleBase>> tongueOwners = new Dictionary<int, HashSet<MovingEnemyTentacleBase>>();

        // tongue => enemy agent
        public static Dictionary<int, int> tongues = new Dictionary<int, int>();

        public static void OnTongueSpawn(int instance, int enemy, MovingEnemyTentacleBase tongue)
        {
            APILogger.Debug($"Visual tongue spawned.");

            tongues.Add(instance, enemy);
            SnapshotManager.AddEvent(GameplayEvent.Type.SpawnTongue, new rInstance(instance));
            SnapshotManager.AddDynamicProperty(new Tongue(instance, tongue));
        }

        public static void OnTongueDespawn(int instance)
        {
            if (tongues.ContainsKey(instance))
            {
                APILogger.Debug($"Visual tongue despawned.");

                tongues.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnTongue, new rInstance(instance));
                SnapshotManager.RemoveDynamicProperty(instance);
            }
        }
    }
}
