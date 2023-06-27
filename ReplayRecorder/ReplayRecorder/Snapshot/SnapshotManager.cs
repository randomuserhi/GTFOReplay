using API;
using UnityEngine;

namespace ReplayRecorder
{
    public interface ISerializable
    {
        void Serialize(FileStream fs);
    }

    public struct rInstance : ISerializable
    {
        private int instance;

        public rInstance(int instance)
        { 
            this.instance = instance;
        }

        public const int SizeOf = sizeof(int);
        private static byte[] buffer = new byte[SizeOf];
        public void Serialize(FileStream fs)
        {
            int index = 0;
            BitHelper.WriteBytes(instance, buffer, ref index);
            fs.Write(buffer);
        }
    }

    public class GameplayEvent
    {
        public enum Type
        {
            AddPlayer,
            RemovePlayer,

            SpawnEnemy,
            DespawnEnemy,

            EnemyDead,
            EnemyChangeState,

            EnemyBulletDamage,
            EnemyMeleeDamage,
            EnemyMineDamage, // TODO(randomuserhi)

            PlayerDead,
            PlayerRevive,

            PlayerTongueDamage,
            PlayerMeleeDamage,
            PlayerPelletDamage,
            PlayerBulletDamage,
            PlayerMineDamage, // TODO(randomuserhi)
            PlayerFallDamage,

            PlayerPelletDodge,
            PlayerTongueDodge,

            PlayerWield,

            DoorChangeState,
            DoorDamage,

            SpawnMine,
            DespawnMine,
            ExplodeMine,
            MineTripLine,

            SpawnSentry,
            DespawnSentry,

            SpawnPellet,
            DespawnPellet,

            SpawnTongue,
            DespawnTongue,
            SetTongue,

            SpawnGlue,
            DespawnGlue
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

    public abstract class DynamicProperty : ISerializable
    {
        public enum Type
        {
            Tongue
        }
        public int instance;
        public Type type;
        public bool remove = false;
        public bool Serializable => !remove && IsSerializable();

        protected virtual bool IsSerializable()
        {
            return true;
        }

        public DynamicProperty(Type type, int instance)
        {
            this.type = type;
            this.instance = instance;
        }

        public virtual void Serialize(FileStream fs)
        {
            fs.WriteByte((byte)type);
        }
    }

    // Manages saving a snapshot and delta snapshot every tick
    public class SnapshotManager : MonoBehaviour
    {
        public struct rObject : ITransform
        {
            private GameObject go;
            public bool active => go != null;
            public Vector3 position => go.transform.position;
            public Quaternion rotation => go.transform.rotation;
            public float scale => 0;

            public rObject(GameObject go)
            {
                this.go = go;
            }
        }

        public interface ITransform
        {
            public bool active { get; }
            public Vector3 position { get; }
            public Quaternion rotation { get; }
            public float scale { get; }
        }

        public class DynamicObject
        {
            public bool remove = false;

            public ITransform transform;
            public readonly int instance;
            public Vector3 oldPosition = Vector3.zero;
            public Quaternion oldRotation = Quaternion.identity;
            public float oldScale = 0;

            public const float threshold = 50;

            public DynamicObject(int instance, ITransform transform)
            {
                this.instance = instance;
                this.transform = transform;
            }

            public bool Serializable => 
                remove == false && transform.active && 
                (transform.position != oldPosition ||
                 transform.rotation != oldRotation || 
                 transform.scale != oldScale);

            public const int SizeOf = 1 + sizeof(int) + BitHelper.SizeOfVector3 + BitHelper.SizeOfHalfQuaternion + BitHelper.SizeOfHalf;
            public const int SizeOfHalf = 1 + sizeof(int) + BitHelper.SizeOfHalfVector3 + BitHelper.SizeOfHalfQuaternion + BitHelper.SizeOfHalf;
            private static byte[] buffer = new byte[SizeOf];
            public void Serialize(FileStream fs)
            {
                /// Format:
                /// byte => absolute or relative position
                /// int => instance ID of object (not necessarily the gameobject)
                /// Vector3(Half) => full precision / half precision based on absolute or relative position
                /// Quaternion(Half) => rotation
                
                // TODO(randomuserhi): If rotation doesn't change just write a single byte 0b1000
                //                     since the most significant bit doesnt matter to the quaternion.
                //                     Then in reader, just check the first byte, if the most significant is
                //                     1 (0b1000) then the rotation hasn't changed. If it is not, then its the
                //                     original first byte from the quaternion bytes: 0b00xx where xx is the number
                //                     0,1,2,3 for which component was missing.

                int index = 0;

                // If object has moved too far, write absolute position
                if ((transform.position - oldPosition).sqrMagnitude > threshold * threshold)
                {
                    BitHelper.WriteBytes((byte)(1), buffer, ref index);
                    BitHelper.WriteBytes(instance, buffer, ref index);
                    BitHelper.WriteBytes(transform.position, buffer, ref index);
                    BitHelper.WriteHalf(transform.rotation, buffer, ref index);
                    BitHelper.WriteHalf(transform.scale, buffer, ref index);

                    fs.Write(buffer, 0, SizeOf);
                }
                // If object has not moved too far, write relative to last absolute position
                else
                {
                    BitHelper.WriteBytes((byte)(0), buffer, ref index);
                    BitHelper.WriteBytes(instance, buffer, ref index);
                    BitHelper.WriteHalf(transform.position - oldPosition, buffer, ref index);
                    BitHelper.WriteHalf(transform.rotation, buffer, ref index);
                    BitHelper.WriteHalf(transform.scale, buffer, ref index);

                    fs.Write(buffer, 0, SizeOfHalf);
                }

                oldPosition = transform.position;
                oldRotation = transform.rotation;
                oldScale = transform.scale;
            }
        }

        private static GameObject? obj = null;
        public static SnapshotManager? instance = null;

        public static FileStream? fs = null;
        public static bool active = false;

        private float tickRate = 1f / 5f;
        private float timer = 0;
        private long start = 0;
        public long Now => Raudy.Now - start;

        // List of events to add on next tick
        private List<GameplayEvent> events = new List<GameplayEvent>(100);

        // Object positions to track
        private List<DynamicObject> _dynamic = new List<DynamicObject>(100);
        private List<DynamicObject> dynamic = new List<DynamicObject>(100);
        public Dictionary<int, DynamicObject> mapOfDynamics = new Dictionary<int, DynamicObject>();

        // Dynamic properties to track
        private List<DynamicProperty> _dynamicProp = new List<DynamicProperty>(100);
        private List<DynamicProperty> dynamicProp = new List<DynamicProperty>(100);
        public Dictionary<int, DynamicProperty> mapOfDynamicProps = new Dictionary<int, DynamicProperty>();

        private void Update()
        {
            if (!active) return;

            float rate;
            // Change tick rate based on state:
            switch (DramaManager.CurrentStateEnum)
            {
                case DRAMA_State.Encounter:
                case DRAMA_State.Survival:
                case DRAMA_State.IntentionalCombat:
                case DRAMA_State.Combat:
                    rate = 1f / 20f;
                    break;
                default:
                    rate = 1f / 5f;
                    break;
            }
            if (tickRate != rate)
            {
                timer = 0;
                tickRate = rate;
            }

            timer += Time.deltaTime;
            if (timer > tickRate)
            {
                timer = 0;
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
            instance.mapOfDynamics.Add(obj.instance, obj);
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
            RemoveDynamicObject(obj.instance);
        }

        public static void AddDynamicProperty(DynamicProperty obj)
        {
            if (instance == null)
            {
                APILogger.Error("Tried to add a dynamic property before snapshotmanager was ready.");
                return;
            }
            instance.dynamicProp.Add(obj);
            instance.mapOfDynamicProps.Add(obj.instance, obj);
        }

        public static void RemoveDynamicProperty(int instanceID)
        {
            if (instance == null)
            {
                APILogger.Error("Tried to remove a dynamic property before snapshotmanager was ready.");
                return;
            }
            if (!instance.mapOfDynamicProps.ContainsKey(instanceID)) return;
            instance.mapOfDynamicProps[instanceID].remove = true;
            instance.mapOfDynamicProps.Remove(instanceID);
        }

        public static void RemoveDynamicProperty(DynamicProperty obj)
        {
            RemoveDynamicProperty(obj.instance);
        }

        public static Action? OnTick;

        private static byte[] buffer = new byte[sizeof(uint)];
        private void Tick() 
        {
            if (!active || fs == null) return;

            // Trigger pre-tick processes
            OnTick?.Invoke();
            
            /*foreach (var d in dynamic)
            {
                APILogger.Debug($"{d.instanceID} : {d.transform.position != d.oldPosition} {d.transform.rotation != d.oldRotation}");
            }*/

            // Check if this tick needs to be done
            // - are there any dynamics to serialize?
            // - are there any dynamic properties to serialize?
            // - are there any events to serialize?
            int nSerializable = (ushort)dynamic.Where(d => d.Serializable).Count();
            int nSerializableProps = (ushort)dynamicProp.Where(d => d.Serializable).Count();
            if (nSerializableProps == 0 && nSerializable == 0 && events.Count == 0)
                return;

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
                BitHelper.WriteBytes((ushort)(_Now - e.timestamp), buffer, ref index);
                fs.Write(buffer, 0, 1 + sizeof(ushort));

                if (e.detail != null) e.detail.Serialize(fs);
            }

            // Serialize dynamic objects
            index = 0;
            int serialized = 0;
            BitHelper.WriteBytes(nSerializable, buffer, ref index);
            fs.Write(buffer, 0, sizeof(ushort));
            _dynamic.Clear();
            for (int i = 0; i < dynamic.Count; i++) 
            {
                DynamicObject obj = dynamic[i];

                if (obj.Serializable) 
                {
                    ++serialized;
                    obj.Serialize(fs); 
                }
                if (!obj.remove) _dynamic.Add(obj);
            }
            if (serialized != nSerializable) APILogger.Error($"Number of serialized and nSerializable don't match: {serialized} {nSerializable}");
            List<DynamicObject> dyn = dynamic;
            dynamic = _dynamic;
            _dynamic = dyn;

            // Serialize dynamic properties
            index = 0;
            serialized = 0;
            BitHelper.WriteBytes(nSerializableProps, buffer, ref index);
            fs.Write(buffer, 0, sizeof(ushort));
            _dynamicProp.Clear();
            for (int i = 0; i < dynamicProp.Count; i++)
            {
                DynamicProperty obj = dynamicProp[i];

                if (obj.Serializable)
                {
                    ++serialized;
                    obj.Serialize(fs);
                }
                if (!obj.remove) _dynamicProp.Add(obj);
            }
            if (serialized != nSerializableProps) APILogger.Error($"Number of serialized and nSerializableProps don't match: {serialized} {nSerializableProps}");
            List<DynamicProperty> dynProp = dynamicProp;
            dynamicProp = _dynamicProp;
            _dynamicProp = dynProp;

            // Flush file stream
            fs.Flush();

            // Flush event buffer
            events.Clear();
        }

        // Called once on plugin load
        public static void Setup()
        {
            OnTick += Player.Player.OnTick;
        }

        // Called after map has loaded
        public static void Init()
        {
            if (instance != null)
            {
                APILogger.Error("Instance has already started, this should not happen");
                return;
            }

            active = true;

            obj = new GameObject();
            instance = obj.AddComponent<SnapshotManager>();

            instance.start = Raudy.Now;

            fs = new FileStream("./replay.gtfo", FileMode.Create, FileAccess.Write);

            // Initialize other components
            Player.Player.Init();
        }

        public static void Dispose()
        {
            active = false;

            if (fs == null) APILogger.Warn("Filestream was never started, this should not happen.");
            else
            {
                fs.Dispose();
                fs = null;
            }

            // Send report => TODO(randomuserhi): rewrite
            Network.SendReplay(File.ReadAllBytes("replay.gtfo"));

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
