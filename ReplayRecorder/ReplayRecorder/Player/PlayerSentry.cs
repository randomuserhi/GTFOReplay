using API;
using SNetwork;
using UnityEngine;

namespace ReplayRecorder.Player
{
    public class rSentry : ISerializable, SnapshotManager.ITransform
    {
        public SentryGunInstance sentry;
        public int instance;
        public byte slot;
        private Vector3 pos;
        public SNet_Player player;

        public bool active => sentry.m_firing != null;
        public byte dimensionIndex => (byte)sentry.Owner.m_dimensionIndex;
        public Vector3 position => pos;
        public Quaternion rotation => Quaternion.LookRotation(sentry.m_firing.MuzzleAlign.forward);
        public float scale => 0;

        public rSentry(SNet_Player player, SentryGunInstance sentry, Vector3 pos)
        {
            this.player = player;
            this.sentry = sentry;
            instance = sentry.GetInstanceID();
            slot = (byte)player.PlayerSlotIndex();
            this.pos = pos;
        }

        public const int SizeOf = 1 + sizeof(int);
        private static byte[] buffer = new byte[SizeOf];
        public void Serialize(FileStream fs)
        {
            int index = 0;
            BitHelper.WriteBytes(slot, buffer, ref index);
            BitHelper.WriteBytes(instance, buffer, ref index);

            fs.Write(buffer);
        }
    }

    public static class PlayerSentry
    {
        // Flag to determine if next shot is performed by a sentry
        public static string? sentryName = null;
        public static bool sentryShot = false;

        public static Dictionary<ulong, rSentry> sentries = new Dictionary<ulong, rSentry>();
        private static Dictionary<int, rSentry> instances = new Dictionary<int, rSentry>();

        public static void SpawnSentry(SNet_Player player, SentryGunInstance sentry, Vector3 pos)
        {
            APILogger.Debug($"{player.NickName} spawned a sentry.");

            int instance = sentry.GetInstanceID();
            rSentry s = new rSentry(player, sentry, pos);
            sentries.Add(s.player.Lookup, s);
            instances.Add(instance, s);

            SnapshotManager.AddEvent(GameplayEvent.Type.SpawnSentry, s);
            SnapshotManager.AddDynamicObject(new SnapshotManager.DynamicObject(instance, s));
        }

        public static void DespawnSentry(SentryGunInstance sentry)
        {
            int instance = sentry.GetInstanceID();
            if (instances.ContainsKey(instance))
            {
                rSentry s = instances[instance];

                APILogger.Debug($"Sentry despawned by {s.player.NickName}.");

                sentries.Remove(s.player.Lookup);
                instances.Remove(instance);
                SnapshotManager.AddEvent(GameplayEvent.Type.DespawnSentry, new rInstance(instance));
                SnapshotManager.RemoveDynamicObject(instance);
            }
            else APILogger.Error("Sentry does not exist to despawn.");
        }

        public static void Reset()
        {
            instances.Clear();
            sentries.Clear();
        }
    }
}
