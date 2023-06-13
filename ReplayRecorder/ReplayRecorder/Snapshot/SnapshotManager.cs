using API;
using UnityEngine;

namespace ReplayRecorder
{
    public interface ISerializable
    {
        void Serialize(FileStream fs);
    }

    public class Dynamic : ISerializable
    {
        public enum Type
        {
            Player
        }

        public Type type;
        public ISerializable? detail;

        public Dynamic(Type type, ISerializable? detail)
        {
            this.type = type;
            this.detail = detail;
        }

        public void Serialize(FileStream fs)
        {
            fs.WriteByte((byte)type);
            if (detail != null) detail.Serialize(fs);
        }
    }

    public class GameplayEvent
    {
        public enum Type
        {
            AddPlayer,
            RemovePlayer
        }

        public long timestamp;
        public Type type;
        public ISerializable? detail;

        public GameplayEvent(long timestamp, Type type, ISerializable? detail)
        {
            this.timestamp = timestamp;
            this.type = type;
            this.detail = detail;
        }
    }

    // Manages saving a snapshot and delta snapshot every tick
    public class SnapshotManager : MonoBehaviour
    {
        public class DynamicObject
        {
            public bool remove = false;

            public readonly GameObject gameObject;
            public readonly int instanceID;
            private Vector3 oldPosition;

            public const float threshold = 50;

            public const int SizeOf = 1 + sizeof(int) + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion;
            public const int SizeOfHalf = 1 + sizeof(int) + BitHelper.SizeOfHalfVector3 + BitHelper.SizeOfHalfQuaternion;
            private static byte[] buffer = new byte[SizeOf];

            public DynamicObject(int instanceID, GameObject gameObject)
            {
                this.instanceID = instanceID;
                this.gameObject = gameObject;
            }

            public void Serialize(FileStream fs, bool force = false)
            {
                /// Format:
                /// byte => absolute or relative position
                /// int => instance ID of object (not necessarily the gameobject)
                /// Vector3(Half) => full precision / half precision based on absolute or relative position
                /// Quaternion(Half) => rotation

                // Don't serialize if object doesn't move
                if (!force && gameObject.transform.position == oldPosition)
                    return;

                int index = 0;

                // If object has moved too far, write absolute position
                if (force || (gameObject.transform.position - oldPosition).sqrMagnitude > threshold * threshold)
                {
                    BitHelper.WriteBytes((byte)(1), buffer, ref index);
                    BitHelper.WriteBytes(instanceID, buffer, ref index);
                    BitHelper.WriteBytes(gameObject.transform.position, buffer, ref index);
                    BitHelper.WriteHalf(gameObject.transform.rotation, buffer, ref index);

                    oldPosition = gameObject.transform.position;

                    fs.Write(buffer, 0, SizeOf);
                }
                // If object has not moved too far, write relative to last absolute position
                else
                {
                    BitHelper.WriteBytes((byte)(0), buffer, ref index);
                    BitHelper.WriteBytes(instanceID, buffer, ref index);
                    BitHelper.WriteHalf(gameObject.transform.position - oldPosition, buffer, ref index);
                    BitHelper.WriteHalf(gameObject.transform.rotation, buffer, ref index);

                    fs.Write(buffer, 0, SizeOfHalf);
                }
            }
        }

        private static GameObject? obj = null;
        private static SnapshotManager? instance = null;

        public static FileStream? fs = null;
        public static bool active = false;

        private const float tickRate = 1 / 20;
        private float timer = 0;
        private long start = 0;
        public long Now => Raudy.Now - start;
        private long Prev = 0;

        // List of events to add on next tick
        private List<GameplayEvent> events = new List<GameplayEvent>(100);

        // Object positions to track
        private List<DynamicObject> _dynamic = new List<DynamicObject>(100);
        private List<DynamicObject> dynamic = new List<DynamicObject>(100);
        private Dictionary<int, DynamicObject> mapOfDynamics = new Dictionary<int, DynamicObject>();

        private void FixedUpdate()
        {
            timer += Time.deltaTime;
            if (timer > tickRate)
            {
                Tick();
            }
        }

        public static void AddEvent(GameplayEvent.Type type, ISerializable? e)
        {
            if (instance == null)
            {
                APILogger.Error("Tried to add an event before snapshotmanager was ready.");
                return;
            }
            instance.events.Add(new GameplayEvent(instance.Now, type, e));
        }

        public static void AddDynamicObject(DynamicObject obj)
        {
            if (instance == null)
            {
                APILogger.Error("Tried to add a dynamic object before snapshotmanager was ready.");
                return;
            }
            instance.dynamic.Add(obj);
            instance.mapOfDynamics.Add(obj.instanceID, obj);
        }

        public static void RemoveDynamicObject(int instanceID)
        {
            if (instance == null)
            {
                APILogger.Error("Tried to remove a dynamic object before snapshotmanager was ready.");
                return;
            }
            if (!instance.mapOfDynamics.ContainsKey(instanceID)) return;
            instance.mapOfDynamics[instanceID].remove = true;
            instance.mapOfDynamics.Remove(instanceID);
        }

        public static void RemoveDynamicObject(DynamicObject obj)
        {
            RemoveDynamicObject(obj.instanceID);
        }

        public static Action? OnTick;

        private static byte[] buffer = new byte[sizeof(uint)];
        private void Tick() 
        {
            if (fs == null) return;

            // Trigger pre-tick processes
            OnTick?.Invoke();

            // Tick header
            int index = 0;
            long _Now = Now;
            BitHelper.WriteBytes((uint)_Now, buffer, ref index);
            fs.Write(buffer, 0, sizeof(uint));

            // Serialize events
            index = 0;
            BitHelper.WriteBytes((ushort)events.Count, buffer, ref index);
            fs.Write(buffer, 0, sizeof(ushort));
            for (int i = 0; i < events.Count; ++i)
            {
                GameplayEvent e = events[i];

                // Event header
                index = 0;
                BitHelper.WriteBytes((byte)e.type, buffer, ref index);
                BitHelper.WriteBytes((ushort)(e.timestamp - Prev), buffer, ref index);
                fs.Write(buffer, 0, 1 + sizeof(ushort));

                if (e.detail != null) e.detail.Serialize(fs);
            }

            // Serialize dynamic objects
            index = 0;
            BitHelper.WriteBytes((ushort)dynamic.Count, buffer, ref index);
            fs.Write(buffer, 0, sizeof(ushort));
            _dynamic.Clear();
            for (int i = 0; i < dynamic.Count; i++) 
            {
                DynamicObject obj = dynamic[i];

                obj.Serialize(fs);
                if (!obj.remove) _dynamic.Add(obj);
            }
            List<DynamicObject> temp = dynamic;
            dynamic = _dynamic;
            _dynamic = temp;

            // Flush file stream
            fs.Flush();

            // Flush event buffer
            events.Clear();

            // set previous time
            Prev = _Now;
        }

        public static void Init()
        {
            obj = new GameObject();
            instance = obj.AddComponent<SnapshotManager>();

            instance.start = Raudy.Now;
            instance.Prev = 0;
            active = true;

            if (fs == null)
                APILogger.Error("Filestream was not started yet, this should not happen.");
        }

        public static void Dispose()
        {
            active = false;

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
