using API;
using UnityEngine;

namespace ReplayRecorder
{
    interface ISerializable
    {
        void Serialize(FileStream fs);
    }

    // TODO(randomuserhi): add an interface for serializable objects or something

    public abstract class GameplayEvent
    {
        public long timestamp;
    }

    // Manages saving a snapshot and delta snapshot every tick
    public class SnapshotManager : MonoBehaviour
    {
        public struct DynamicObject
        {
            public readonly GameObject gameObject;
            public readonly int instanceID;
            private Vector3 oldPosition;
            private Quaternion oldRotation;

            public const int SizeOf = sizeof(int) + BitHelper.SizeOfHalfVector3 + BitHelper.SizeOfHalfQuaternion;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs, bool force = false)
            {
                // Don't serialize if object doesn't move
                if (!force && gameObject.transform.position == oldPosition && gameObject.transform.rotation == oldRotation)
                    return;

                int index = 0;

                BitHelper.WriteHalf(instanceID, buffer, ref index);
                BitHelper.WriteHalf(gameObject.transform.position, buffer, ref index);
                BitHelper.WriteHalf(gameObject.transform.rotation, buffer, ref index);

                oldPosition = gameObject.transform.position;
                oldRotation = gameObject.transform.rotation;

                fs.Write(buffer);
            }
        }

        private static GameObject? obj = null;
        private static SnapshotManager? instance = null;

        public static FileStream? fs = null;

        private const float tickRate = 1 / 20;
        private float timer = 0;

        // List of events to add on next tick
        private List<GameplayEvent> events = new List<GameplayEvent>(100);
        
        // Object positions to track
        private List<DynamicObject> dynamic = new List<DynamicObject>(100);

        private void FixedUpdate()
        {
            timer += Time.deltaTime;
            if (timer > tickRate)
            {
                Tick();
            }
        }

        private void Tick() 
        {
            if (fs == null) return;

            // Serialize dynamic objects
            for (int i = 0; i < dynamic.Count; i++) 
            {
                dynamic[i].Serialize(fs);
            }

            // TODO(randomuserhi): Serialize events

            // Flush file stream
            fs.Flush();

            // Flush event buffer
            events.Clear();
        }

        public static void Init()
        {
            obj = new GameObject();
            instance = obj.AddComponent<SnapshotManager>();

            if (fs == null)
                APILogger.Error("Filestream was not started yet, this should not happen.");
        }

        public static void Dispose()
        {
            if (fs == null) APILogger.Warn("Filestream was never started, this should not happen.");
            else fs.Dispose();

            if (obj == null) 
            {
                APILogger.Debug($"Snapshot manager has already been destroyed!");
                return;
            }

            APILogger.Debug($"Disposing snapshot manager...");
            
            instance = null;
            GameObject.Destroy(obj);
            obj = null;
        }
    }
}
