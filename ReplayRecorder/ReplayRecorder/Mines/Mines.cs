using API;
using SNetwork;
using UnityEngine;
using static Il2CppSystem.Globalization.CultureInfo;
using static ReplayRecorder.Map.Map;
using static UnityEngine.UI.GridLayoutGroup;

namespace ReplayRecorder.Mines
{
    public class rMine : ISerializable
    {
        public enum Type
        {
            Mine,
            Cfoam
        }

        public byte owner;
        public byte type;
        public int instance;
        public Vector3 position;
        public Quaternion rotation;
        public rMine(SNet_Player owner, int instance, Type type, Vector3 position, Quaternion rotation)
        {
            this.owner = (byte)owner.PlayerSlotIndex();
            this.instance = instance;
            this.type = (byte)type;
            this.position = position;
            this.rotation = rotation;
        }

        public const int SizeOf = 2 + sizeof(int) + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
        private static byte[] buffer = new byte[SizeOf];
        public void Serialize(FileStream fs)
        {
            int index = 0;
            BitHelper.WriteBytes(owner, buffer, ref index);
            BitHelper.WriteBytes(type, buffer, ref index);
            BitHelper.WriteBytes(instance, buffer, ref index);
            BitHelper.WriteBytes(position, buffer, ref index);
            BitHelper.WriteHalf(rotation, buffer, ref index);

            fs.Write(buffer);
        }
    }

    public class Mine
    {
        public struct rTripLine : ISerializable
        {
            public int instance;
            public float length;

            public rTripLine(int instance, float length)
            {
                this.instance = instance;
                this.length = length;
            }

            public const int SizeOf = sizeof(int) + BitHelper.SizeOfHalf;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                int index = 0;
                BitHelper.WriteBytes(instance, buffer, ref index);
                BitHelper.WriteHalf(length, buffer, ref index);

                fs.Write(buffer);
            }
        }

        public static Dictionary<int, rMine> mines = new Dictionary<int, rMine>();

        public static void TripLine(int instance, float length)
        {
            APILogger.Debug($"Mine instance length updated [{instance}]");
            SnapshotManager.AddEvent(GameplayEvent.Type.MineTripLine, new rTripLine(instance, length));
        }

        public static void SpawnMine(SNet_Player owner, int instance, rMine.Type type, Vector3 position, Quaternion rotation)
        {
            APILogger.Debug($"Mine instance spawned by {owner.NickName} - [{instance}]");
            rMine mine = new rMine(owner, instance, type, position, rotation);
            mines.Add(instance, mine);
            SnapshotManager.AddEvent(GameplayEvent.Type.SpawnMine, mine);
        }

        public static void DespawnMine(int instance)
        {
            APILogger.Debug($"Mine instance [{instance}] was despawned");
            SnapshotManager.AddEvent(GameplayEvent.Type.DespawnMine, new rInstance(instance));
            mines.Remove(instance);
        }

        public static void ExplodeMine(int instance)
        {
            APILogger.Debug($"Mine instance [{instance}] detonated");
            SnapshotManager.AddEvent(GameplayEvent.Type.ExplodeMine, new rInstance(instance));
            mines.Remove(instance);
        }

        public static void Reset()
        {
            mines.Clear();
        }
    }
}
