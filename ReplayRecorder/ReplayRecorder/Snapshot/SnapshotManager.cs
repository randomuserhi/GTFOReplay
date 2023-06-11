using API;
using UnityEngine;

namespace ReplayRecorder
{
    public abstract class GameplayEvent
    {
        public long timestamp;
    }

    // Manages saving a snapshot and delta snapshot every tick
    public class SnapshotManager : MonoBehaviour
    {
        public struct DynamicObject
        {
            public GameObject gameObject;
            private Vector3 oldPosition;
            private Quaternion oldRotation;
        }

        private static GameObject? obj = null;
        private static SnapshotManager? instance = null;

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
            // TODO(randomuserhi)

            // Flush event buffer
            events.Clear();
        }

        public static void Init()
        {
            obj = new GameObject();
            instance = obj.AddComponent<SnapshotManager>();
        }

        public static void Dispose()
        {
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
