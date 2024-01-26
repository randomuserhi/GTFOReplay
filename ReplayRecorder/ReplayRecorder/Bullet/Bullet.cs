using API;
using UnityEngine;

namespace ReplayRecorder.Bullets {
    internal class rBullet : ISerializable {
        private byte dimension;
        private Vector3 start;
        private Vector3 end;
        private float damage;
        private bool hit;
        private byte slot;

        public rBullet(byte owner, float damage, byte dimension, Vector3 start, Vector3 end, bool hit) {
            this.slot = owner;
            this.start = start;
            this.end = end;
            this.damage = damage;
            this.dimension = dimension;
            this.hit = hit;
        }

        public const int SizeOf = 3 + BitHelper.SizeOfHalf + BitHelper.SizeOfHalfVector3 * 2;
        private byte[] buffer = new byte[SizeOf];
        public void Serialize(FileStream fs) {
            int index = 0;
            BitHelper.WriteBytes(slot, buffer, ref index);
            BitHelper.WriteHalf(damage, buffer, ref index);
            BitHelper.WriteBytes(hit ? (byte)1 : (byte)0, buffer, ref index);
            BitHelper.WriteBytes(dimension, buffer, ref index);
            // NOTE(randomuserhi): Probably better to get source agent (or sentry) and return the difference between source position and shot position then can send
            //                     Half precision instead of full
            BitHelper.WriteHalf(start, buffer, ref index);
            BitHelper.WriteHalf(end, buffer, ref index);
            fs.Write(buffer);
        }
    }

    internal class Bullet {
        public static void OnBulletShot(byte owner, float damage, byte dimensionIndex, Vector3 start, Vector3 end, bool hit) {
            APILogger.Debug($"Bullet shot {damage} ({dimensionIndex}) [{start.x}, {start.y}, {end.z}] -> [{end.x}, {end.y}, {end.z}]");
            SnapshotManager.AddEvent(GameplayEvent.Type.BulletShot, new rBullet(owner, damage, dimensionIndex, start, end, hit));
        }
    }
}
